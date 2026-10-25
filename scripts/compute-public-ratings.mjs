// Builds roman-sites-backend/src/main/resources/seed/public-ratings.sql: a 1-5 star "public"
// rating for every seeded site, from open data about how notable and visited it is.
//
// Signals per site (all free, no API keys):
//   - English Wikipedia page views over the last 12 months (how many people look it up)
//   - number of Wikipedia language editions covering it (Wikidata sitelinks)
//   - UNESCO World Heritage status, directly or as part of a listed site (Wikidata P1435 / P361)
// Small or obscure sites (a minor fort, a single tomb) score low on all three.
//
// Stars are an even split: sites are ranked by score and cut into five equal groups.
//
// Usage (from the repo root):  node scripts/compute-public-ratings.mjs

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SEED_DIR, USER_AGENT, readSites, resolveCurated, sparql, whereSite } from './lib/sites.mjs';

const OUT_FILE = join(SEED_DIR, 'public-ratings.sql');
const WORLD_HERITAGE_SITE = 'Q9259';

// Weights for the combined score (each signal is standardised first).
const WEIGHTS = { pageviews: 0.6, sitelinks: 0.4 };
const UNESCO_BONUS = 0.75; // in standard deviations


async function fetchWikidataSignals(sites) {
  const qids = [...new Set(sites.map((s) => s.qid).filter(Boolean))];
  const info = new Map();
  for (let i = 0; i < qids.length; i += 200) {
    const batch = qids.slice(i, i + 200).map((q) => `wd:${q}`).join(' ');
    const rows = await sparql(`
      SELECT ?item ?links ?title ?unesco WHERE {
        VALUES ?item { ${batch} }
        ?item wikibase:sitelinks ?links .
        OPTIONAL { ?a schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?title }
        BIND(EXISTS { { ?item wdt:P1435 wd:${WORLD_HERITAGE_SITE} } UNION { ?item wdt:P361 ?whole . ?whole wdt:P1435 wd:${WORLD_HERITAGE_SITE} } } AS ?unesco)
      }`);
    for (const r of rows) {
      info.set(r.item.value.split('/').pop(), {
        sitelinks: parseInt(r.links.value, 10),
        enwikiTitle: r.title?.value ?? null,
        unesco: r.unesco.value === 'true',
      });
    }
    process.stdout.write(`  wikidata ${Math.min(i + 200, qids.length)}/${qids.length}\r`);
  }
  console.log();
  return info;
}

// ---------- Wikipedia page views ----------

function lastTwelveMonths() {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)); // last day of previous month
  const start = new Date(Date.UTC(end.getUTCFullYear() - 1, end.getUTCMonth() + 1, 1));
  const fmt = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');
  return [fmt(start), fmt(end)];
}

async function fetchPageviews(titles) {
  const [start, end] = lastTwelveMonths();
  const views = new Map();
  const queue = [...titles];
  let done = 0;
  const worker = async () => {
    while (queue.length) {
      const title = queue.shift();
      const url =
        'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/' +
        `${encodeURIComponent(title.replace(/ /g, '_'))}/monthly/${start}/${end}`;
      try {
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        const total = res.ok ? (await res.json()).items.reduce((sum, it) => sum + it.views, 0) : 0;
        views.set(title, total);
      } catch {
        views.set(title, 0);
      }
      if (++done % 50 === 0) process.stdout.write(`  pageviews ${done}/${titles.length}\r`);
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  console.log(`  pageviews ${done}/${titles.length} (${start}-${end})`);
  return views;
}

// ---------- scoring ----------

function standardise(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length) || 1;
  return values.map((v) => (v - mean) / sd);
}

async function main() {
  const sites = await readSites();
  console.log(`Read ${sites.length} sites (${sites.filter((s) => s.curated).length} hand-picked)`);

  await resolveCurated(sites);
  const info = await fetchWikidataSignals(sites);
  const titles = [...new Set([...info.values()].map((i) => i.enwikiTitle).filter(Boolean))];
  const views = await fetchPageviews(titles);

  for (const s of sites) {
    const i = (s.qid && info.get(s.qid)) || { sitelinks: 0, enwikiTitle: null, unesco: false };
    s.sitelinks = i.sitelinks;
    s.unesco = i.unesco;
    s.pageviews = i.enwikiTitle ? views.get(i.enwikiTitle) ?? 0 : 0;
  }

  // Both signals are heavily skewed (the Colosseum gets ~1000x a minor fort), so compare on a log scale.
  const zViews = standardise(sites.map((s) => Math.log10(1 + s.pageviews)));
  const zLinks = standardise(sites.map((s) => Math.log10(1 + s.sitelinks)));
  sites.forEach((s, k) => {
    s.score = WEIGHTS.pageviews * zViews[k] + WEIGHTS.sitelinks * zLinks[k] + (s.unesco ? UNESCO_BONUS : 0);
  });

  // Even split: rank, then cut into five equal groups (lowest fifth = 1 star).
  const ranked = [...sites].sort((a, b) => a.score - b.score);
  ranked.forEach((s, rank) => (s.stars = 1 + Math.floor((rank * 5) / ranked.length)));

  const lines = sites.map((s) => `UPDATE ancient_sites SET public_rating = ${s.stars} WHERE ${whereSite(s)};`);
  const header =
    `-- Generated by scripts/compute-public-ratings.mjs on ${new Date().toISOString().slice(0, 10)}. Do not edit by hand.\n` +
    `-- Stars from English Wikipedia page views (12 months), Wikipedia language coverage and UNESCO status;\n` +
    `-- an even split of all sites into five groups. Runs on every start, so it is safe to regenerate.\n`;
  await writeFile(OUT_FILE, header + lines.join('\n') + '\n', 'utf8');

  const byStars = [1, 2, 3, 4, 5].map((n) => sites.filter((s) => s.stars === n).length);
  console.log(`Wrote ${sites.length} ratings to ${OUT_FILE}`);
  console.log(`  stars 1-5: ${byStars.join(' / ')}; UNESCO: ${sites.filter((s) => s.unesco).length}`);
  const show = (list) => list.map((s) => `${s.name} (${s.pageviews.toLocaleString()} views)`).join(' | ');
  console.log('  top 12:   ', show(ranked.slice(-12).reverse()));
  console.log('  bottom 12:', show(ranked.slice(0, 12)));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

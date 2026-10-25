// Shared helpers for the seed scripts: read the seeded sites, resolve Wikidata ids for the
// hand-picked ones, and talk to Wikidata politely.

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SEED_DIR = join(ROOT, 'roman-sites-backend/src/main/resources/seed');
export const USER_AGENT = 'roman-buildings-seed/0.1 (learning project; https://github.com/marvinljw/roman-buildings)';

const S = "'((?:[^']|'')*)'";
const unquote = (s) => s.replace(/''/g, "'");
export const sqlStr = (s) => `'${String(s).replace(/'/g, "''")}'`;

// Every seeded site: { name, lat, lon, qid (null for unresolved hand-picked ones), curated }.
export async function readSites() {
  const curatedSql = await readFile(join(SEED_DIR, 'curated-sites.sql'), 'utf8');
  const curatedRe = new RegExp(`\\(DEFAULT, '\\w+', ${S}, ${S}, ([-\\d.]+), ([-\\d.]+), ${S}`, 'g');
  const curated = [...curatedSql.matchAll(curatedRe)].map((m) => ({
    name: unquote(m[5]), lat: +m[3], lon: +m[4], qid: null, curated: true,
  }));

  const wikidataSql = await readFile(join(SEED_DIR, 'wikidata-sites.sql'), 'utf8');
  const wikidataRe = new RegExp(`\\('\\w+', ?${S}, ${S}, ([-\\d.]+), ([-\\d.]+), ${S}, ${S}, (?:-?\\d+|NULL), '(Q\\d+)'\\)`, 'g');
  const imported = [...wikidataSql.matchAll(wikidataRe)].map((m) => ({
    name: unquote(m[5]), lat: +m[3], lon: +m[4], qid: m[7], curated: false,
  }));

  return [...curated, ...imported];
}

// SQL WHERE clause that finds a site's row in ancient_sites.
export const whereSite = (s) =>
  s.curated ? `wikidata_id IS NULL AND name = ${sqlStr(s.name)}` : `wikidata_id = ${sqlStr(s.qid)}`;

export async function sparql(query) {
  for (let attempt = 1; ; attempt++) {
    let problem;
    try {
      const res = await fetch('https://query.wikidata.org/sparql', {
        method: 'POST',
        headers: {
          Accept: 'application/sparql-results+json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT,
        },
        body: new URLSearchParams({ query }),
      });
      if (res.ok) return (await res.json()).results.bindings;
      problem = `${res.status}: ${(await res.text()).slice(0, 300)}`;
      if (![429, 500, 502, 503, 504].includes(res.status)) attempt = Infinity;
    } catch (err) {
      // Wikidata drops the connection when a query runs too long or it is busy.
      problem = err.cause?.code ?? err.message;
    }
    if (attempt >= 3) throw new Error(`Wikidata ${problem}`);
    await new Promise((r) => setTimeout(r, 5000 * attempt));
  }
}

// Query a MediaWiki action API (Wikipedia, Commons) as JSON. POST, because 50 long file titles
// make a URL too long for a GET; retries on rate limits and dropped connections.
export async function mediawiki(host, params) {
  const body = new URLSearchParams({ format: 'json', formatversion: '2', ...params });
  for (let attempt = 1; ; attempt++) {
    let problem;
    let waitSeconds = 5 * 2 ** (attempt - 1); // 5, 10, 20, 40, 80 s
    try {
      const res = await fetch(`https://${host}/w/api.php`, {
        method: 'POST',
        headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const text = await res.text();
      if (res.ok && text.startsWith('{')) return JSON.parse(text);
      problem = `${res.status}: ${text.slice(0, 200)}`;
      const retryAfter = parseInt(res.headers.get('retry-after') ?? '', 10);
      if (retryAfter > 0) waitSeconds = Math.max(waitSeconds, retryAfter);
    } catch (err) {
      problem = err.cause?.code ?? err.message;
    }
    if (attempt >= 6) throw new Error(`${host} ${problem}`);
    console.warn(`  ${host}: ${problem.slice(0, 40)}... waiting ${waitSeconds}s`);
    await new Promise((r) => setTimeout(r, waitSeconds * 1000));
  }
}

export function km(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

// Hand-picked sites whose names differ from their Wikidata/Wikipedia names.
const CURATED_QIDS = {
  'Pyramid of Giza': 'Q37200', // Great Pyramid of Giza
  'Karnak Temple': 'Q522862',
  'Temple of Apollo Epicurius': 'Q464923', // Bassae
  'Mortuary Temple of Hatshepsut': 'Q660692',
  'Dendera Temple Complex': 'Q735254',
  'Byrsa Hill': 'Q1018648',
};

// The hand-picked sites have no Wikidata id: match each by English label (or Wikipedia
// title) and keep the candidate nearest to its coordinates, within 10 km.
export async function resolveCurated(sites) {
  for (const s of sites) if (!s.qid && CURATED_QIDS[s.name]) s.qid = CURATED_QIDS[s.name];
  const curated = sites.filter((s) => !s.qid);
  if (curated.length === 0) return;
  const names = curated.map((s) => `"${s.name.replace(/"/g, '\\"')}"@en`).join(' ');
  const rows = await sparql(`
    SELECT ?name ?item ?coord WHERE {
      VALUES ?name { ${names} }
      { ?item rdfs:label ?name } UNION { ?a schema:name ?name ; schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> }
      ?item wdt:P625 ?coord .
    }`);
  for (const s of curated) {
    let best = null;
    for (const r of rows.filter((r) => r.name.value === s.name)) {
      const m = /Point\(([-\d.eE]+) ([-\d.eE]+)\)/.exec(r.coord.value);
      if (!m) continue;
      const d = km(s, { lon: +m[1], lat: +m[2] });
      if (d < 10 && (!best || d < best.d)) best = { d, qid: r.item.value.split('/').pop() };
    }
    s.qid = best?.qid ?? null;
    if (!s.qid) console.warn(`  could not match hand-picked site "${s.name}"`);
  }
}

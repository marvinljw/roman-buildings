// Builds roman-sites-backend/src/main/resources/seed/site-photos.sql: the best real photo for
// every seeded site, with its photographer credit and licence.
//
// Wikidata's main image (P18) is often not a photo of the place: a map, a floor plan, a 3D
// reconstruction, a museum model, a coin or an old engraving. So for each site we gather several
// candidates and score them on Wikimedia Commons metadata:
//   candidates: Wikidata P18 and P8592 (aerial view), the lead image of the site's article on the
//               English, Italian, German, French, Spanish and Greek Wikipedias, and photos in the
//               site's own Commons category (P373)
//   rejected:   non-JPEG files, anything smaller than 640x400, and files whose name or Commons
//               categories mark them as maps, plans, drawings, renders, models, coins, artworks, ...
//               (a physically rebuilt gate is fine; a reconstruction drawing is not)
//   preferred:  Commons Featured / Quality / Valued images, landscape shape, higher resolution
// Sites where nothing passes get no image, and the app shows a clean placeholder instead.
//
// Usage (from the repo root):  node scripts/pick-site-photos.mjs [--refresh]

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { ROOT, SEED_DIR, mediawiki, readSites, resolveCurated, sparql, sqlStr, whereSite } from './lib/sites.mjs';

const OUT_FILE = join(SEED_DIR, 'site-photos.sql');
const CACHE_FILE = join(ROOT, 'scripts/.cache/photo-candidates.json');
const WIKIS = ['en', 'it', 'de', 'fr', 'es', 'el'];
const THUMB_WIDTH = 800;
const MIN_WIDTH = 640; // the card is 300px wide, so this is still sharp on most screens
const MIN_HEIGHT = 400;
const CATEGORY_FILES = 40; // photos to consider from each site's Commons category

// Matched against the file name and its Commons categories (case-insensitive).
const NOT_A_PHOTO = new RegExp([
  'map', 'karte', 'mapa', 'carte', 'χάρτης', 'plan\\b', 'plans\\b', 'planta', 'grundriss', 'pianta', 'floor ?plan', 'site plan',
  'diagram', 'schema', 'layout', 'drawing', 'dessin', 'zeichnung', 'disegno', 'sketch', 'illustration',
  'engraving', 'gravure', 'kupferstich', 'stich\\b', 'etching', 'lithograph', 'woodcut', 'veduta', 'vedute', 'piranesi',
  'painting', 'gemälde', 'watercolou?r', 'aquarell', 'fresco',
  'reconstitution', 'restitution', 'render', '3d', 'cgi', 'computer.generated', 'virtual',
  'model\\b', 'models\\b', 'modell', 'maquette', 'modellino', 'plastico',
  'coin', 'münze', 'moneta', 'tetradrachm', 'denarius', 'stamp\\b', 'postage', 'banknote', 'postcard',
  'museum', 'statue', 'bust\\b', 'sculpture', 'relief\\b', 'inscription', 'papyrus', 'manuscript', 'mosaic',
  'logo', 'coat of arms', 'flag\\b', 'icon\\b', 'svg', 'screenshot', 'poster', 'book', 'page\\b',
  '1[5-8]\\d\\d\\b', // dated old prints such as "1784 Bocage Map"
].join('|'), 'i');

// Commons categories that describe what the file itself is. "Reconstruction" alone is allowed:
// at many forts it is a real rebuilt gate or barracks; only drawn/rendered/modelled ones are out.
const NOT_A_PHOTO_CATEGORY = new RegExp([
  '\\bmaps?\\b', '\\bplans?\\b', 'diagrams?', 'drawings?', 'illustrations?', 'engravings?', 'etchings?', 'lithographs?',
  'paintings?', 'watercolou?rs?', 'frescos?', 'reconstruction drawings?', 'digital reconstructions?', 'renderings?',
  '\\b3D\\b', 'computer.generated', 'architectural models?', 'scale models?', '\\bmodels? of\\b', 'maquettes?',
  '\\bcoins?\\b', 'tetradrachms?', 'drachms?', 'denarii', 'reliefs?\\b', 'sculptures?', 'statues?', '\\bbusts?\\b',
  'mosaics?', 'inscriptions?', 'artworks?', 'papyri', 'manuscripts?', 'postcards?', 'stamps of', 'museum objects?',
  'objects in', 'collections? of', 'exhibits?',
].join('|'), 'i');

const QUALITY = [
  { re: /^Featured pictures/i, bonus: 4 },
  { re: /^Quality images/i, bonus: 3 },
  { re: /^Valued images/i, bonus: 2 },
];

const stripHtml = (html) =>
  (html ?? '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ').trim();

const fileTitle = (name) => 'File:' + decodeURIComponent(name).replace(/_/g, ' ');

// ---------- gather candidates ----------

async function wikidataCandidates(sites) {
  const qids = [...new Set(sites.map((s) => s.qid).filter(Boolean))];
  const byQid = new Map(qids.map((q) => [q, { files: [], titles: {}, commonsCategory: null }]));
  const wikiFilters = WIKIS.map((w) => `<https://${w}.wikipedia.org/>`).join(' ');
  const BATCH = 100;
  for (let i = 0; i < qids.length; i += BATCH) {
    const batch = qids.slice(i, i + BATCH).map((q) => `wd:${q}`).join(' ');
    // Two small queries rather than one UNION, which Wikidata tends to cut off.
    const images = await sparql(`SELECT ?item ?img WHERE { VALUES ?item { ${batch} } ?item wdt:P18|wdt:P8592 ?img }`);
    const categories = await sparql(`SELECT ?item ?cat WHERE { VALUES ?item { ${batch} } ?item wdt:P373 ?cat }`);
    const articles = await sparql(`
      SELECT ?item ?wiki ?title WHERE {
        VALUES ?item { ${batch} } VALUES ?wiki { ${wikiFilters} }
        ?a schema:about ?item ; schema:isPartOf ?wiki ; schema:name ?title
      }`);
    for (const r of images) {
      const entry = byQid.get(r.item.value.split('/').pop());
      entry.files.push({ title: fileTitle(r.img.value.split('/').pop()), source: 'wikidata' });
    }
    for (const r of articles) {
      byQid.get(r.item.value.split('/').pop()).titles[r.wiki.value.match(/\/\/(\w+)\./)[1]] = r.title.value;
    }
    for (const r of categories) byQid.get(r.item.value.split('/').pop()).commonsCategory = r.cat.value;
    process.stdout.write(`  wikidata ${Math.min(i + BATCH, qids.length)}/${qids.length}\r`);
  }
  console.log();
  return byQid;
}

// Lead image of each article, as chosen by that Wikipedia's PageImages extension.
async function leadImages(byQid) {
  for (const wiki of WIKIS) {
    const pairs = [...byQid.entries()].filter(([, e]) => e.titles[wiki]);
    for (let i = 0; i < pairs.length; i += 50) {
      const batch = pairs.slice(i, i + 50);
      const data = await mediawiki(`${wiki}.wikipedia.org`, {
        action: 'query', prop: 'pageimages', piprop: 'name', pilicense: 'free', redirects: '1',
        titles: batch.map(([, e]) => e.titles[wiki]).join('|'),
      });
      const resolved = new Map();
      for (const r of [...(data.query?.normalized ?? []), ...(data.query?.redirects ?? [])]) resolved.set(r.from, r.to);
      const imageByTitle = new Map((data.query?.pages ?? []).filter((p) => p.pageimage).map((p) => [p.title, p.pageimage]));
      for (const [, e] of batch) {
        let t = e.titles[wiki];
        while (resolved.has(t)) t = resolved.get(t);
        const img = imageByTitle.get(t);
        if (img) e.files.push({ title: fileTitle(img), source: `${wiki}wiki` });
      }
    }
    console.log(`  lead images from ${wiki}.wikipedia: ${pairs.length} articles`);
  }
}

// ---------- Commons metadata ----------

// Categories come from extmetadata rather than prop=categories, whose 500-per-request cap
// silently truncates the list when asking about 50 files at once.
// No iiurlwidth: asking Commons to render thumbnail URLs is what gets us rate-limited.
// Special:FilePath with ?width= gives the same resized image.
const IMAGE_INFO = {
  prop: 'imageinfo',
  iiprop: 'url|size|mime|extmetadata',
  iiextmetadatafilter: 'Artist|LicenseShortName|Credit|Categories',
};

const thumbUrl = (fileTitle) =>
  'https://commons.wikimedia.org/wiki/Special:FilePath/' +
  encodeURIComponent(fileTitle.replace(/^File:/, '').replace(/ /g, '_')) + `?width=${THUMB_WIDTH}`;

const parseImageInfo = (page) => {
  const ii = page?.imageinfo?.[0];
  if (!ii) return null;
  const ext = ii.extmetadata ?? {};
  return {
    title: page.title,
    mime: ii.mime, width: ii.width, height: ii.height,
    thumb: thumbUrl(page.title),
    page: ii.descriptionurl,
    artist: stripHtml(ext.Artist?.value) || stripHtml(ext.Credit?.value),
    license: ext.LicenseShortName?.value ?? '',
    categories: (ext.Categories?.value ?? '').split('|').filter(Boolean),
  };
};

async function commonsInfo(titles, info) {
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    const data = await mediawiki('commons.wikimedia.org', {
      action: 'query', redirects: '1', ...IMAGE_INFO, titles: batch.join('|'),
    });
    const resolved = new Map();
    for (const r of [...(data.query?.normalized ?? []), ...(data.query?.redirects ?? [])]) resolved.set(r.from, r.to);
    const pages = new Map((data.query?.pages ?? []).map((p) => [p.title, p]));
    for (const t of batch) {
      let key = t;
      while (resolved.has(key)) key = resolved.get(key);
      const meta = parseImageInfo(pages.get(key));
      if (meta) info.set(t, meta);
    }
    process.stdout.write(`  commons ${Math.min(i + 50, titles.length)}/${titles.length}\r`);
  }
  console.log();
}

// Photos in each site's own Commons category, fetched together with their metadata.
async function categoryPhotos(byQid, info) {
  // One at a time, with a pause: Commons rate-limits bursts of these requests.
  const entries = [...byQid.values()].filter((e) => e.commonsCategory);
  let done = 0;
  for (const e of entries) {
    const data = await mediawiki('commons.wikimedia.org', {
      action: 'query', generator: 'categorymembers', gcmtype: 'file', gcmlimit: String(CATEGORY_FILES),
      gcmtitle: `Category:${e.commonsCategory}`, ...IMAGE_INFO,
    });
    for (const p of data.query?.pages ?? []) {
      const meta = parseImageInfo(p);
      if (!meta) continue;
      info.set(p.title, meta);
      e.files.push({ title: p.title, source: 'category' });
    }
    if (++done % 50 === 0) process.stdout.write(`  commons categories ${done}/${entries.length}\r`);
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`  commons categories ${done}/${entries.length}`);
}

// ---------- scoring ----------

// Words too common to tell sites apart ("Temple of X", "Roman fort").
const GENERIC_WORDS = new Set(('aqua temple roman ancient great small little greek egyptian byzantine theatre theater ' +
  'amphitheatre amphitheater fort fortress castle castra castrum church basilica monastery villa bridge baths thermae ' +
  'pyramid tomb tombs city town site sanctuary palace gate wall walls arch column forum agora stoa museum saint santa ' +
  'san the and della del de di la le les des von der').split(' '));

const distinctiveWords = (text) =>
  (text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !GENERIC_WORDS.has(w));

// A site's Commons category also holds finds, museum objects and neighbouring monuments, so a photo
// from it must either name the site in its file name or be one Commons reviewers rated highly.
function categoryPhotoFits(meta, site, commonsCategory) {
  if (QUALITY.some((q) => meta.categories.some((c) => q.re.test(c)))) return true;
  const fileWords = new Set(distinctiveWords(meta.title));
  const siteWords = [...distinctiveWords(site.name), ...distinctiveWords(commonsCategory)];
  return siteWords.some((w) => fileWords.has(w));
}

function score(file, meta) {
  if (!meta) return null;
  if (meta.mime !== 'image/jpeg') return null;
  if (meta.width < MIN_WIDTH || meta.height < MIN_HEIGHT) return null;
  if (NOT_A_PHOTO.test(meta.title)) return null;
  if (meta.categories.some((c) => NOT_A_PHOTO_CATEGORY.test(c))) return null;

  let s = 0;
  if (meta.width < 1000) s -= 1; // usable, but prefer sharper
  for (const q of QUALITY) if (meta.categories.some((c) => q.re.test(c))) s += q.bonus;
  const ratio = meta.width / meta.height;
  if (ratio < 1) s -= 2; // portrait crops badly in a wide card
  else if (ratio > 2.4) s -= 1; // panoramas lose most of the picture
  s += Math.min(2, Math.log2(meta.width / MIN_WIDTH)); // up to +2 for 2560px+
  // Images someone chose to represent the site beat a random photo from its category.
  if (file.source === 'enwiki') s += 1.5;
  else if (file.source === 'wikidata') s += 1;
  else if (file.source !== 'category') s += 0.75; // other Wikipedias
  return s;
}

async function main() {
  const sites = await readSites();
  console.log(`Read ${sites.length} sites`);
  await resolveCurated(sites);

  // Fetching takes ~25 minutes, so the raw candidates are cached; pass --refresh to fetch again.
  let byQid;
  let meta;
  const cached = !process.argv.includes('--refresh') && (await readFile(CACHE_FILE, 'utf8').catch(() => null));
  if (cached) {
    const data = JSON.parse(cached);
    byQid = new Map(data.byQid);
    meta = new Map(data.meta);
    console.log(`  using cached candidates from ${data.fetched} (${CACHE_FILE}); --refresh to fetch again`);
  } else {
    byQid = await wikidataCandidates(sites);
    await leadImages(byQid);
    meta = new Map();
    const chosenTitles = [...new Set([...byQid.values()].flatMap((e) => e.files.map((f) => f.title)))];
    console.log(`  ${chosenTitles.length} chosen images (Wikidata + Wikipedia lead images)`);
    await commonsInfo(chosenTitles, meta);
    await categoryPhotos(byQid, meta);
    await mkdir(dirname(CACHE_FILE), { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify({ fetched: new Date().toISOString(), byQid: [...byQid], meta: [...meta] }));
  }

  let withPhoto = 0;
  const bySource = {};
  const lines = [];
  for (const s of sites) {
    const entry = s.qid ? byQid.get(s.qid) : null;
    let best = null;
    for (const f of entry?.files ?? []) {
      const m = meta.get(f.title);
      if (m && f.source === 'category' && !categoryPhotoFits(m, s, entry.commonsCategory)) continue;
      const sc = score(f, m);
      if (sc !== null && (!best || sc > best.score)) best = { score: sc, meta: m, source: f.source };
    }
    if (best) {
      withPhoto++;
      const credit = [best.meta.artist, best.meta.license].filter(Boolean).join(' · ').slice(0, 300);
      lines.push(
        `UPDATE ancient_sites SET image_url = ${sqlStr(best.meta.thumb)}, image_credit = ${sqlStr(credit)}, ` +
        `image_source_url = ${sqlStr(best.meta.page)} WHERE ${whereSite(s)};`);
      bySource[best.source] = (bySource[best.source] ?? 0) + 1;
    } else {
      lines.push(`UPDATE ancient_sites SET image_url = NULL, image_credit = NULL, image_source_url = NULL WHERE ${whereSite(s)};`);
    }
  }

  const header =
    `-- Generated by scripts/pick-site-photos.mjs on ${new Date().toISOString().slice(0, 10)}. Do not edit by hand.\n` +
    `-- Best real photo per site from Wikimedia Commons, with credit and licence. Runs on every start.\n`;
  await writeFile(OUT_FILE, header + lines.join('\n') + '\n', 'utf8');
  console.log(`Wrote ${OUT_FILE}`);
  console.log(`  ${withPhoto} sites have a photo, ${sites.length - withPhoto} get the placeholder`);
  console.log(`  photo came from: ${Object.entries(bySource).map(([k, v]) => `${k} ${v}`).join(', ')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

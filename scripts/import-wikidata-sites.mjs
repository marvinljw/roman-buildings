// Builds roman-sites-backend/src/main/resources/seed/wikidata-sites.sql from Wikidata.
//
// Every site comes with real coordinates (P625), a Commons photo (P18) and a country (P17).
// Worldwide picks need an English Wikipedia article; a second pass adds more European sites
// that are covered by at least MIN_EUROPE_SITELINKS Wikipedias in any language. Sites are ranked by how many Wikipedia language
// editions cover them, so the best-known buildings make the cut first.
//
// Usage (from the repo root):  node scripts/import-wikidata-sites.mjs

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SEED_DIR = join(ROOT, 'roman-sites-backend/src/main/resources/seed');
const OUT_FILE = join(SEED_DIR, 'wikidata-sites.sql');
const CURATED_FILE = join(SEED_DIR, 'curated-sites.sql');

const ENDPOINT = 'https://query.wikidata.org/sparql';
const USER_AGENT = 'roman-buildings-seed/0.1 (learning project; https://github.com/marvinljw/roman-buildings)';

// Each civilization is matched by culture (P2596), building type (P31) and/or
// architectural style (P149). maxYear drops later buildings in that style (e.g. Neo-Byzantine churches).
const CIVILIZATIONS = [
  {
    civ: 'EGYPTIAN', limit: 110, europeLimit: 0,
    cultures: ['Q11768'], // Ancient Egypt
    classes: ['Q855747', 'Q175582', 'Q180927'], // Egyptian temple, Egyptian pyramid, mastaba
  },
  {
    civ: 'GREEK', limit: 130, europeLimit: 160,
    cultures: ['Q11772', 'Q181264', 'Q428995', 'Q4246634'], // Ancient Greece, Mycenaean, Hellenistic, Ancient Greek culture
    classes: ['Q267596', 'Q327328', 'Q69391739'], // Greek temple, stoa, Greek colony
  },
  {
    civ: 'ROMAN', limit: 220, europeLimit: 420,
    cultures: ['Q1747689', 'Q1200427', 'Q2277', 'Q120754777', 'Q17167'], // Ancient Rome & variants
    classes: [
      'Q7362268', // Roman amphitheatre
      'Q19757', // Roman theatre
      'Q867143', // Roman temple
      'Q918230', // Roman villa
      'Q88205', // castrum (Roman fort)
      'Q13218676', // Roman aqueduct
      'Q1223230', // Roman bridge
      'Q6581615', // thermae
      'Q2202509', // Roman city
    ],
  },
  {
    civ: 'BYZANTINE', limit: 90, europeLimit: 120,
    cultures: ['Q12544', 'Q3678788'], // Byzantine Empire, Byzantine civilization
    styles: ['Q47591'], // Byzantine architecture
    maxYear: 1453,
  },
  {
    civ: 'CARTHAGINIAN', limit: 40, europeLimit: 40,
    cultures: ['Q2429397'], // Ancient Carthage (very few items are tagged)
    // ...so the Punic world is filled in from well-known English Wikipedia articles.
    enwikiTitles: [
      'Motya', 'Tharros', 'Nora, Sardinia', 'Monte Sirai', 'Sulci', 'Puig des Molins',
      'Ports of Carthage', 'Lilybaeum', 'Solunto', 'Kerkouane', 'Utica, Tunisia', 'Byrsa',
      'Tophet of Salammbô', 'Carthage', 'Antas Temple', 'Hadrumetum', 'Lixus (ancient city)',
      'Sa Caleta Phoenician Settlement', 'Leptis Magna', 'Sabratha',
    ],
  },
];

// Things tagged with an ancient culture that are not places you can stand at.
const NOT_SITES = [
  'Q5', // human
  'Q465299', // archaeological culture
  'Q1620908', // historical region
  'Q82794', // geographic region
  'Q18608583', // recurring sporting event
  'Q1190554', // occurrence
  'Q860861', // sculpture
  'Q179700', // statue
  'Q241045', // bust
  'Q245117', // relief sculpture
  'Q133067', // mosaic
  'Q3305213', // painting
];

// Royal tombs in the Valley of the Kings are catalogued as KV1..KV64; one pin for the valley is enough.
const isCatalogueNumber = (name) => /^[KW]V\d+$/.test(name);

// Wikidata often records a later rebuild as the inception (e.g. the Roman Baths in Bath: 1897).
const LATEST_PLAUSIBLE_YEAR = { ROMAN: 640, GREEK: 640, EGYPTIAN: 640, CARTHAGINIAN: 640, BYZANTINE: 1453 };

async function sparql(query) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/sparql-results+json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
      },
      body: new URLSearchParams({ query }),
    });
    if (res.ok) return (await res.json()).results.bindings;
    if (attempt >= 3 || ![429, 500, 502, 503, 504].includes(res.status)) {
      throw new Error(`Wikidata ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    await new Promise((r) => setTimeout(r, 5000 * attempt));
  }
}

const values = (ids) => ids.map((id) => `wd:${id}`).join(' ');

const MIN_EUROPE_SITELINKS = 3;

// Worldwide: must have an English Wikipedia article. Europe pass: in a European country
// (P30 continent = Europe) and covered by a few Wikipedias in any language.
const NOTABILITY = {
  world: '?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> .',
  europe: `?item wdt:P17 ?eu . ?eu wdt:P30 wd:Q46 . FILTER(?links >= ${MIN_EUROPE_SITELINKS})`,
};

// Turkey counts as a European country in Wikidata, but only Istanbul and Thrace are in Europe.
const inEurope = (s) => s.country !== 'Turkey' || (s.lon < 29.95 && s.lat > 40.4);

function buildQuery(match, scope) {
  return `
SELECT ?item ?itemLabel ?desc ?coord ?img ?countryLabel ?inception ?links WHERE {
  ${match}
  ?item wdt:P625 ?coord ; wdt:P18 ?img ; wikibase:sitelinks ?links .
  ${NOTABILITY[scope]}
  FILTER NOT EXISTS { ?item wdt:P195 [] }  # museum objects
  FILTER NOT EXISTS { ?item wdt:P1082 [] } # living towns: their pin is the modern centre, not the ruins
  FILTER NOT EXISTS { VALUES ?notASite { ${values(NOT_SITES)} } ?item wdt:P31 ?notASite . }
  OPTIONAL { ?item schema:description ?desc FILTER(lang(?desc) = 'en') }
  # Only present-day countries; "Roman Empire" is not useful on a modern map.
  OPTIONAL { ?item wdt:P17 ?country . ?country wdt:P31 wd:Q3624078 . FILTER NOT EXISTS { ?country wdt:P576 [] } }
  OPTIONAL { ?item wdt:P571 ?inception }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`;
}

// WDQS writes dates as XSD 1.1, where year 0 is 1 BC. The app stores 447 BC as -447.
function toYear(literal) {
  const m = /^(-?)(\d+)-/.exec(literal ?? '');
  if (!m) return null;
  const y = parseInt(m[2], 10);
  return m[1] ? -y - 1 : y === 0 ? -1 : y;
}

function parsePoint(wkt) {
  const m = /Point\(([-\d.eE]+) ([-\d.eE]+)\)/.exec(wkt);
  return m ? { lon: parseFloat(m[1]), lat: parseFloat(m[2]) } : null;
}

function commonsThumb(filePathUrl) {
  return filePathUrl.replace(/^http:/, 'https:') + '?width=640';
}

function describe(desc, civ, country) {
  const civName = { ROMAN: 'Roman', GREEK: 'Greek', EGYPTIAN: 'Egyptian', CARTHAGINIAN: 'Punic', BYZANTINE: 'Byzantine' }[civ];
  let text = (desc ?? '').trim() || `Ancient ${civName} site in ${country}`;
  text = text[0].toUpperCase() + text.slice(1);
  return /[.!?]$/.test(text) ? text : text + '.';
}

// Collapse the one-row-per-value SPARQL result into one record per item.
function collect(rows, civ, maxYear) {
  const byId = new Map();
  for (const r of rows) {
    const id = r.item.value.split('/').pop();
    const point = parsePoint(r.coord.value);
    if (!point || r.itemLabel.value === id || isCatalogueNumber(r.itemLabel.value)) continue;
    let site = byId.get(id);
    if (!site) {
      site = {
        id, civ,
        name: r.itemLabel.value,
        description: r.desc?.value,
        lat: point.lat, lon: point.lon,
        imageUrl: commonsThumb(r.img.value),
        country: r.countryLabel?.value ?? null,
        year: null,
        links: parseInt(r.links.value, 10),
      };
      byId.set(id, site);
    }
    const year = toYear(r.inception?.value);
    if (year !== null && (site.year === null || year < site.year)) site.year = year;
    if (!site.country && r.countryLabel) site.country = r.countryLabel.value;
  }
  for (const site of byId.values()) {
    if (site.year !== null && site.year > LATEST_PLAUSIBLE_YEAR[civ] && !maxYear) site.year = null;
  }
  const sites = [...byId.values()];
  return maxYear ? sites.filter((s) => s.year !== null && s.year <= maxYear) : sites;
}

async function fetchCivilization(c, scope) {
  const parts = [];
  if (c.cultures) parts.push(['culture', `VALUES ?v { ${values(c.cultures)} } ?item wdt:P2596 ?v .`]);
  if (c.classes) parts.push(['type', `VALUES ?v { ${values(c.classes)} } ?item wdt:P31 ?v .`]);
  if (c.styles) parts.push(['style', `VALUES ?v { ${values(c.styles)} } ?item wdt:P149 ?v .`]);
  if (c.enwikiTitles) {
    const titles = c.enwikiTitles.map((t) => `"${t.replace(/"/g, '\\"')}"@en`).join(' ');
    parts.push(['enwiki', `VALUES ?title { ${titles} } ?a schema:name ?title ; schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> .`]);
  }

  const merged = new Map();
  for (const [kind, match] of parts) {
    const rows = await sparql(buildQuery(match, scope));
    // Style matches must have a known early date; culture/type matches need not.
    const sites = collect(rows, c.civ, kind === 'style' ? c.maxYear : undefined);
    console.log(`  ${c.civ.padEnd(12)} ${scope.padEnd(6)} by ${kind.padEnd(7)} ${String(sites.length).padStart(4)} sites`);
    for (const s of sites) if (!merged.has(s.id)) merged.set(s.id, s);
  }
  return [...merged.values()];
}

// Distance in km, used to skip sites that duplicate the hand-curated list.
function km(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

async function readCurated() {
  const sql = await readFile(CURATED_FILE, 'utf8');
  const rowRe = /\(DEFAULT, '\w+', '(?:[^']|'')*', '(?:[^']|'')*', ([-\d.]+), ([-\d.]+), '((?:[^']|'')*)'/g;
  return [...sql.matchAll(rowRe)].map((m) => ({ lat: +m[1], lon: +m[2], name: m[3].replace(/''/g, "'") }));
}

// Fills in a present-day country from coordinates (OpenStreetMap Nominatim, max 1 request/second).
async function reverseGeocodeCountry(site) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=3&accept-language=en&lat=${site.lat}&lon=${site.lon}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  await new Promise((r) => setTimeout(r, 1100));
  if (!res.ok) return null;
  return (await res.json()).address?.country ?? null;
}

const sqlStr = (s) => `'${String(s).replace(/'/g, "''")}'`;

async function main() {
  const curated = await readCurated();
  const taken = new Set();
  const chosen = [];

  // The same building is sometimes two items (e.g. a bridge and its rebuild); keep the first.
  const isDuplicate = (s) =>
    curated.some((k) => k.name === s.name || km(k, s) < 0.3) ||
    chosen.some((k) => km(k, s) < 0.05);

  const pick = (candidates, limit) => {
    let kept = 0;
    for (const s of candidates.sort((a, b) => b.links - a.links)) {
      if (kept >= limit) break;
      if (taken.has(s.id) || isDuplicate(s)) continue;
      taken.add(s.id);
      chosen.push(s);
      kept++;
    }
    return kept;
  };

  for (const c of CIVILIZATIONS) {
    console.log(`Fetching ${c.civ}...`);
    const world = pick(await fetchCivilization(c, 'world'), c.limit);
    const europe = c.europeLimit
      ? pick((await fetchCivilization(c, 'europe')).filter(inEurope), c.europeLimit)
      : 0;
    console.log(`  ${c.civ.padEnd(12)} kept ${world} worldwide + ${europe} more in Europe`);
  }

  const missing = chosen.filter((s) => !s.country);
  console.log(`Looking up the country of ${missing.length} sites from their coordinates...`);
  for (const s of missing) s.country = (await reverseGeocodeCountry(s)) ?? 'Unknown';

  const header =
    `-- Generated by scripts/import-wikidata-sites.mjs on ${new Date().toISOString().slice(0, 10)}. Do not edit by hand.\n` +
    `-- Data from Wikidata (CC0); images from Wikimedia Commons (see each file page for its licence).\n` +
    `-- MERGE on wikidata_id so this runs on every start: new sites are added, existing rows keep their ids (and visits).\n`;
  const chunks = [];
  for (let i = 0; i < chosen.length; i += 50) {
    const rows = chosen.slice(i, i + 50).map((s) =>
      `('${s.civ}',${sqlStr(describe(s.description, s.civ, s.country))}, ${sqlStr(s.imageUrl)}, ` +
      `${s.lat.toFixed(6)}, ${s.lon.toFixed(6)}, ${sqlStr(s.name)}, ${sqlStr(s.country)}, ${s.year ?? 'NULL'}, ${sqlStr(s.id)})`);
    chunks.push(
      'MERGE INTO ancient_sites (civilization, description, image_url, latitude, longitude, name, country, year_built, wikidata_id) KEY (wikidata_id) VALUES\n' +
      rows.join(',\n') + ';\n');
  }

  await mkdir(SEED_DIR, { recursive: true });
  await writeFile(OUT_FILE, header + chunks.join('\n'), 'utf8');
  console.log(`Wrote ${chosen.length} sites to ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

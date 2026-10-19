// v57 harvest: films in their own words. For each language, Wikidata lists films whose original
// language (P364) is that language and that have a page on that language's Wikiquote; only
// well-known films are kept (25+ Wikimedia sitelinks), and none with English among its original
// languages, since Wikiquote's lines for those are the dub. Each page's lines are read in that wiki's
// own layout: Italian "*line ('''Speaker''')", French {{citation|...}} under a speaker heading,
// German „…“, Spanish «…», bullets otherwise. Up to two lines per film. Writes world-data.json (CC BY-SA, from those Wikiquotes).
import fs from 'fs';
import { wait, clean } from './wq.mjs';
const LANGS = [['fr', 'Q150', 'French'], ['it', 'Q652', 'Italian'], ['de', 'Q188', 'German'], ['es', 'Q1321', 'Spanish'], ['ko', 'Q9176', 'Korean'], ['ja', 'Q5287', 'Japanese']];
const UA = { 'user-agent': 'quotestreak-harvest/1 (trommatic@icloud.com)', accept: 'application/sparql-results+json' };
const sparql = async (q) => { for (let i = 0; i < 4; i++) { try { const r = await fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q), { headers: UA }); if (r.ok) return (await r.json()).results.bindings; } catch {} await wait(3000 * (i + 1)); } return []; };
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));
const SKIPHEAD = /^(les citations|citations?|dialogues?|répliques?|zitate|dialoge|frasi|citas|diálogos|incipit|explicit|voir aussi|liens|bibliographie|note|altri progetti|weblinks|enlaces|référence|tagline|slogan|taglines?|cast|interpreti|filminfo|sonstiges|altro)/i;

export function extract(lang, wt, title) {
  const out = [], words = title.toLowerCase().split(/\W+/).filter(w => w.length >= 4);
  const keep = (t) => t && t.length >= 25 && t.length <= 170 && !/[\[\]{}|<>=]/.test(t) && !words.some(w => t.toLowerCase().includes(w)) && (t.match(/\p{L}/gu) || []).length >= 15;
  if (lang === 'fr') {
    const heads = [...wt.matchAll(/^={2,4}\s*(.+?)\s*={2,4}\s*$/gm)];
    for (const m of wt.matchAll(/\{\{citation\s*\|\s*(?:citation\s*=\s*)?([\s\S]*?)\}\}/gi)) {
      const h = heads.filter(x => x.index < m.index).at(-1), ht = h && clean(h[1]);
      const t = clean(m[1].replace(/<\/?poem>/g, ' ').replace(/\n/g, ' ')).replace(/^["«“]\s*|\s*["»”]$/g, '');
      if (keep(t)) out.push({ quote: t, character: ht && !SKIPHEAD.test(ht) && ht.length <= 30 && !/\d/.test(ht) ? ht : null });
    }
    return out;
  }
  let heading = null;
  for (const raw of wt.split('\n')) {
    const h = raw.match(/^={2,4}\s*(.+?)\s*={2,4}\s*$/);
    if (h) { const t = clean(h[1]); heading = SKIPHEAD.test(t) || t.length > 30 || /\d/.test(t) ? null : t; continue; }
    if (lang === 'it') {
      const m = raw.match(/^\*\s*(.+?)\s*\('''(.+?)'''\)/);
      if (m) { const t = clean(m[1]).replace(/^["«“]|["»”]$/g, ''); if (keep(t)) out.push({ quote: t, character: clean(m[2]) }); }
    } else if (lang === 'fr') {
      const m = raw.match(/\{\{citation\s*\|\s*(?:citation\s*=\s*)?(.+?)\}\}/i);
      if (m) { const t = clean(m[1].replace(/<\/?poem>/g, '')).replace(/^["«“]\s*|\s*["»”]$/g, ''); if (keep(t)) out.push({ quote: t, character: heading }); }
    } else {
      // Only lines in quotation marks: bare bullets on these wikis are cast lists and credits.
      const q = raw.match(/„(.+?)“|«(.+?)»/);
      if (!q) continue;
      const t = clean(q[1] || q[2]);
      if (keep(t)) out.push({ quote: t, character: heading });
    }
  }
  return out;
}

if (process.argv[1].endsWith('harvest-world.mjs')) {
  const world = [];
  for (const [code, lang, name] of LANGS) {
    const films = await sparql(`SELECT ?film ?page ?en ?year ?links WHERE {
      ?film wdt:P31 wd:Q11424; wdt:P364 wd:${lang}; wikibase:sitelinks ?links. FILTER(?links >= 25)
      FILTER NOT EXISTS { ?film wdt:P364 wd:Q1860 }   # an English original means these lines are a dub
      ?q schema:about ?film; schema:isPartOf <https://${code}.wikiquote.org/>; schema:name ?page.
      OPTIONAL { ?film wdt:P577 ?date. BIND(YEAR(?date) AS ?year) } OPTIONAL { ?film rdfs:label ?en FILTER(LANG(?en) = "en") }
    }`);
    const byPage = new Map();
    for (const f of films) { const p = f.page.value; const y = +(f.year?.value || 0); if (!byPage.has(p) || (y && y < byPage.get(p).year)) byPage.set(p, { page: p, en: f.en?.value || p, year: y, links: +f.links.value }); }
    let kept = 0;
    for (const batch of chunk([...byPage.keys()], 50)) {
      const r = await fetch(`https://${code}.wikiquote.org/w/api.php?` + new URLSearchParams({ action: 'query', prop: 'revisions', rvprop: 'content', rvslots: 'main', format: 'json', formatversion: '2', titles: batch.join('|') }), { headers: UA }).catch(() => null);
      const pages = r?.ok ? (await r.json()).query?.pages || [] : [];
      for (const p of pages) {
        const f = byPage.get(p.title), wt = p.revisions?.[0]?.slots?.main?.content;
        if (!f || !wt) continue;
        const title = p.title.replace(/\s*\((film[^)]*|película[^)]*|Film[^)]*)\)$/i, '');
        const lines = extract(code, wt, title).slice(0, 2);
        for (const l of lines) world.push({ lang: name, code, quote: l.quote, character: l.character || null, answer: title, english: f.en !== title ? f.en.replace(/\s*\((film|\d{4} film)\)$/i, '') : null, year: f.year || null, source: `https://${code}.wikiquote.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}` });
        if (lines.length) kept++;
      }
      await wait(500);
    }
    console.log(name, byPage.size, 'famous films with a page,', kept, 'with lines');
  }
  fs.writeFileSync(new URL('../world-data.json', import.meta.url), JSON.stringify(world, null, 1) + '\n');
  console.log(world.length, 'lines');
}

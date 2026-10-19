// v5 harvest: real lines from Wikiquote film pages, nothing typed from memory.
// For each year it takes the films with the longest quote pages (a fair popularity proxy),
// pulls up to PER dialogue lines each with the speaker, and the genre from Wikipedia's own
// categories. Writes scripts/harvest.json (candidates); scripts/merge-harvest.mjs builds the bank.
// Run: node scripts/harvest-wikiquote.mjs [fromYear] [toYear]   (sequential, polite, resumable)
import fs from 'fs';
const [FROM, TO] = [+process.argv[2] || 1930, +process.argv[3] || 2024];
const TOP = 9, PER = 2, OUT = new URL('./harvest.json', import.meta.url).pathname;
const UA = { 'user-agent': 'quotestreak-harvest/1 (trommatic@icloud.com)' };
const wait = (ms) => new Promise(r => setTimeout(r, ms));
async function api(host, params) {
  const u = `https://${host}/w/api.php?format=json&formatversion=2&` + new URLSearchParams(params);
  for (let i = 0; i < 4; i++) {
    try { const r = await fetch(u, { headers: UA }); if (r.ok) return await r.json(); } catch {}
    await wait(1500 * (i + 1));
  }
  return null;
}
const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const SKIP = /^(dialogue|quotes?|taglines?|cast|see also|external links|about|characters?|plot|sequel|misc|trivia|references|opening|ending|credits|other|tagline|and|main)\b/i;
const clean = (s) => s.replace(/<ref[^>]*>.*?<\/ref>/g, '').replace(/<[^>]+>/g, ' ').replace(/\{\{[^}]*\}\}/g, '')
  .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1').replace(/'{2,}/g, '').replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&hellip;/g, '…').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
function genreOf(cats, year) {
  const c = cats.join(' ').toLowerCase();
  if (/science fiction|sci-fi/.test(c)) return 'scifi';
  if (/comedy/.test(c)) return 'comedy';
  if (/action|adventure|thriller|war |western|superhero|crime|horror|spy/.test(c)) return 'action';
  if (year < 1970 && /drama|romance|musical/.test(c)) return 'classic';
  if (/drama|romance|biograph|musical/.test(c)) return year < 1970 ? 'classic' : 'drama';
  return null;
}
function lines(wt, title) {
  const out = []; let who = null;
  const name = title.replace(/\s*\(.*\)$/, '').toLowerCase();
  for (const raw of wt.split('\n')) {
    const h = raw.match(/^={2,4}\s*(.+?)\s*={2,4}\s*$/);
    if (h) { const t = clean(h[1]); who = SKIP.test(t) || t.length > 40 ? null : t; continue; }
    const m = raw.match(/^\*\s+(.+)/);
    if (!m) continue;
    let t = clean(m[1]), speaker = who;
    const p = t.match(/^([A-Z][A-Za-z.' -]{1,30}):\s+(.+)/);
    if (p) { speaker = p[1]; t = p[2]; }
    if (!speaker || t.length < 28 || t.length > 150 || /\[|\]|\{\{|\|/.test(t) || /^\(|\)$/.test(t)) continue;
    if (t.toLowerCase().includes(name) || (t.match(/[a-z]/g) || []).length < 20) continue;
    if (/^[A-Z][A-Za-z .'-]+:\s/.test(t)) continue; // a multi-speaker exchange squashed onto one line
    out.push({ quote: t.replace(/^["“]|["”]$/g, ''), character: speaker });
  }
  return out;
}
for (let year = FROM; year <= TO; year++) {
  if (done[year]) continue;
  // Older films sit in "<year> American films"; newer ones in "<year> films". Take both.
  const pagesBy = new Map();
  for (const c of [`${year} films`, `${year} American films`]) {
    const cat = await api('en.wikiquote.org', { action: 'query', generator: 'categorymembers', gcmtitle: `Category:${c}`, gcmnamespace: 0, gcmlimit: 500, prop: 'info' });
    if (!cat) { console.log(year, 'api failed, will retry on rerun'); process.exit(1); }
    for (const pg of cat.query?.pages || []) pagesBy.set(pg.title, pg);
  }
  const pages = [...pagesBy.values()].sort((a, b) => b.length - a.length).slice(0, TOP);
  const rows = [];
  for (const pg of pages) {
    const wq = await api('en.wikiquote.org', { action: 'parse', page: pg.title, prop: 'wikitext' });
    const wt = wq?.parse?.wikitext; if (!wt) continue;
    const link = wt.match(/\[\[w:([^|\]]+)/);
    let genre = null;
    if (link) {
      const wp = await api('en.wikipedia.org', { action: 'query', titles: link[1], prop: 'categories', cllimit: 100, redirects: 1 });
      genre = genreOf((wp?.query?.pages?.[0]?.categories || []).map(c => c.title), year);
    }
    const title = pg.title.replace(/\s*\(\d{4} film\)|\s*\(film\)/, '');
    const seen = new Set(), picks = [];
    for (const l of lines(wt, title)) if (!seen.has(l.character) && picks.length < PER) { seen.add(l.character); picks.push(l); }
    if (picks.length && genre) rows.push({ answer: title, year, genre, source: `https://en.wikiquote.org/wiki/${encodeURIComponent(pg.title.replace(/ /g, '_'))}`, lines: picks });
    await wait(120);
  }
  done[year] = rows;
  fs.writeFileSync(OUT, JSON.stringify(done));
  console.log(year, pages.length, 'pages', rows.length, 'films', rows.reduce((n, r) => n + r.lines.length, 0), 'lines');
}

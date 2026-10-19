// v100: the extended bank. Every film page in Wikiquote's year categories (1930 on), not just the
// longest nine, up to four lines each from different speakers, with the new-release filters (no slurs,
// f-words or stage directions) and Wikipedia's categories for the genre. Titles already in the core
// bank are skipped. Resumable: writes scripts/harvest-more.json after each year.
// node scripts/harvest-more.mjs [from] [to]; then node scripts/merge-more.mjs
import fs from 'fs';
import { api, lines, wait } from './wq.mjs';
import { usable, genreOf } from './harvest-recent.mjs';
const OUT = new URL('./harvest-more.json', import.meta.url).pathname;
const [FROM, TO] = [+process.argv[2] || 1930, +process.argv[3] || new Date().getUTCFullYear()];
const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const core = new Set(JSON.parse(fs.readFileSync(new URL('../quotes.json', import.meta.url), 'utf8')).map(q => q.answer.toLowerCase()));
const taken = new Set([...core, ...Object.values(done).flat().map(r => r.answer.toLowerCase())]);
for (let year = FROM; year <= TO; year++) {
  if (done[year]) continue;
  const pages = new Map();
  for (const c of [`${year} films`, `${year} American films`, `${year} British films`]) {
    let cont = {};
    do {
      const d = await api('en.wikiquote.org', { action: 'query', list: 'categorymembers', cmtitle: `Category:${c}`, cmnamespace: 0, cmlimit: 500, ...cont });
      for (const m of d?.query?.categorymembers || []) pages.set(m.title, m);
      cont = d?.continue ? { cmcontinue: d.continue.cmcontinue } : null;
    } while (cont);
  }
  const rows = [];
  // Four pages in flight at once: polite for read-only API calls, and a modern year has hundreds.
  const queue = [...pages.keys()];
  await Promise.all(Array.from({ length: 4 }, async () => { for (let title0; (title0 = queue.shift());) await one(title0); }));
  async function one(title0) {
    const title = title0.replace(/\s*\(\d{4} film\)|\s*\(film\)/, '');
    if (taken.has(title.toLowerCase())) return;
    const wq = await api('en.wikiquote.org', { action: 'parse', page: title0, prop: 'wikitext' });
    const wt = wq?.parse?.wikitext;
    if (!wt) return;
    const seen = new Set(), picks = [];
    for (const l of lines(wt, title)) if (usable(l.quote) && !seen.has(l.character) && picks.length < 4) { seen.add(l.character); picks.push(l); }
    if (!picks.length) return;
    const link = wt.match(/\[\[w:([^|\]]+)/);
    const wp = link && await api('en.wikipedia.org', { action: 'query', titles: link[1], prop: 'categories', cllimit: 100, redirects: 1 });
    const genre = genreOf((wp?.query?.pages?.[0]?.categories || []).map(c => c.title));
    if (!genre || taken.has(title.toLowerCase())) return;
    taken.add(title.toLowerCase());
    rows.push({ answer: title, year, genre: year < 1970 && genre === 'drama' ? 'classic' : genre, source: `https://en.wikiquote.org/wiki/${encodeURIComponent(title0.replace(/ /g, '_'))}`, lines: picks });
    await wait(60);
  }
  done[year] = rows;
  fs.writeFileSync(OUT, JSON.stringify(done));
  console.log(year, pages.size, 'pages', rows.length, 'films', Object.values(done).flat().reduce((n, r) => n + r.lines.length, 0), 'lines so far');
}

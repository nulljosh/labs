// v100: the extended bank's TV and games, the companion to harvest-more.mjs. TV from Wikiquote's
// "<decade> American sitcoms / drama TV shows / animated TV shows", games from "<year> video games",
// every page, up to four lines each from different speakers, same filters. Titles already in the core
// bank or the film harvest are skipped. Resumable: writes scripts/harvest-more-tv.json per category.
import fs from 'fs';
import { api, lines, wait } from './wq.mjs';
import { usable } from './harvest-recent.mjs';
const OUT = new URL('./harvest-more-tv.json', import.meta.url).pathname;
const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const core = JSON.parse(fs.readFileSync(new URL('../quotes.json', import.meta.url), 'utf8')).map(q => q.answer.toLowerCase());
const films = fs.existsSync(new URL('./harvest-more.json', import.meta.url)) ? Object.values(JSON.parse(fs.readFileSync(new URL('./harvest-more.json', import.meta.url), 'utf8'))).flat().map(r => r.answer.toLowerCase()) : [];
const taken = new Set([...core, ...films, ...Object.values(done).flat().map(r => r.answer.toLowerCase())]);
const JOBS = [
  ...['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'].flatMap(d => [['animated TV shows', 'cartoon'], ['sitcoms', 'sitcom'], ['drama TV shows', 'tvdrama']]
    .map(([cat, genre]) => ({ key: `${d} ${cat}`, cat: `${d} American ${cat}`, type: 'tv', genre }))),
  ...Array.from({ length: 2026 - 1980 + 1 }, (_, i) => 1980 + i).map(y => ({ key: `${y} games`, cat: `${y} video games`, type: 'game', genre: 'game', year: y })),
];
for (const job of JOBS) {
  if (done[job.key]) continue;
  const pages = [];
  let cont = {};
  do {
    const d = await api('en.wikiquote.org', { action: 'query', list: 'categorymembers', cmtitle: `Category:${job.cat}`, cmnamespace: 0, cmlimit: 500, ...cont });
    pages.push(...(d?.query?.categorymembers || []).map(m => m.title));
    cont = d?.continue ? { cmcontinue: d.continue.cmcontinue } : null;
  } while (cont);
  const rows = [];
  const queue = [...pages];
  await Promise.all(Array.from({ length: 4 }, async () => { for (let page; (page = queue.shift());) await one(page); }));
  async function one(page) {
    const title = page.replace(/\s*\((?:\d{4} )?(?:TV series|video game|film|American TV series|British TV series)\)$/, '');
    if (taken.has(title.toLowerCase()) || /\(season|\/Season|, season/i.test(page)) return;
    const wq = await api('en.wikiquote.org', { action: 'parse', page, prop: 'wikitext' });
    const wt = wq?.parse?.wikitext;
    if (!wt) return;
    const seen = new Set(), picks = [];
    for (const l of lines(wt, title)) if (usable(l.quote) && !seen.has(l.character) && picks.length < 4) { seen.add(l.character); picks.push(l); }
    if (!picks.length || taken.has(title.toLowerCase())) return;
    taken.add(title.toLowerCase());
    rows.push({ answer: title, type: job.type, genre: job.genre, ...(job.year ? { year: job.year } : {}), source: `https://en.wikiquote.org/wiki/${encodeURIComponent(page.replace(/ /g, '_'))}`, lines: picks });
    await wait(60);
  }
  done[job.key] = rows;
  fs.writeFileSync(OUT, JSON.stringify(done));
  console.log(job.key, pages.length, 'pages', rows.length, 'titles', Object.values(done).flat().reduce((n, r) => n + r.lines.length, 0), 'lines so far');
}

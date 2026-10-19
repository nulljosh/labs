// v100: deepen the titles the core bank already has. Each core title's Wikiquote page usually holds far
// more lines than the one or two the first harvests took; this takes up to four more, from speakers the
// bank doesn't already use for that title, with the same filters. They go to the extended bank, so the
// core (and the Daily) is untouched. Resumable: writes scripts/harvest-deepen.json as it goes.
// Round 2 (node scripts/harvest-deepen.mjs 2): every title in either bank, repeat speakers allowed,
// never a line either bank already has; writes harvest-deepen2.json.
import fs from 'fs';
import { api, lines, wait } from './wq.mjs';
import { usable } from './harvest-recent.mjs';
const ROUND2 = process.argv[2] === '2';
const OUT = new URL(ROUND2 ? './harvest-deepen2.json' : './harvest-deepen.json', import.meta.url).pathname;
const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const core = JSON.parse(fs.readFileSync(new URL('../quotes.json', import.meta.url), 'utf8'));
const more = ROUND2 && fs.existsSync(new URL('../quotes-more.json', import.meta.url)) ? JSON.parse(fs.readFileSync(new URL('../quotes-more.json', import.meta.url), 'utf8')) : [];
const have = new Set([...core, ...more].map(q => q.quote));
const titles = new Map();
for (const q of [...core, ...more]) {
  if (!q.source?.includes('wikiquote.org/wiki/') || !['movie', 'tv', 'game'].includes(q.type)) continue;
  const t = titles.get(q.source) || titles.set(q.source, { answer: q.answer, type: q.type, genre: q.genre, year: q.year, source: q.source, speakers: new Set() }).get(q.source);
  if (q.character) t.speakers.add(q.character);
}
const queue = [...titles.values()].filter(t => !(t.source in done));
let n = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  for (let t; (t = queue.shift());) {
    const page = decodeURIComponent(t.source.split('/wiki/')[1]).replace(/_/g, ' ');
    const d = await api('en.wikiquote.org', { action: 'parse', page, prop: 'wikitext', redirects: 1 });
    const picks = [];
    for (const l of lines(d?.parse?.wikitext || '', t.answer)) {
      if (picks.length >= 4) break;
      if (!usable(l.quote) || have.has(l.quote) || (!ROUND2 && t.speakers.has(l.character))) continue;
      t.speakers.add(l.character); have.add(l.quote); picks.push(l);
    }
    done[t.source] = picks.length ? { answer: t.answer, type: t.type, genre: t.genre, ...(t.year ? { year: t.year } : {}), source: t.source, lines: picks } : null;
    if (++n % 50 === 0) { fs.writeFileSync(OUT, JSON.stringify(done)); console.log(n, 'titles,', Object.values(done).filter(Boolean).reduce((s, r) => s + r.lines.length, 0), 'lines'); }
    await wait(60);
  }
}));
fs.writeFileSync(OUT, JSON.stringify(done));
console.log('done:', Object.values(done).filter(Boolean).reduce((s, r) => s + r.lines.length, 0), 'lines from', titles.size, 'titles');

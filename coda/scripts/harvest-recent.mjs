// v73 New releases: lines from this year's and last year's films on Wikiquote, kept in recent.json
// rather than the bank so adding them never reshuffles the Daily. Films come from the year
// categories, longest quote pages first; two lines each, from different speakers; wrong answers are
// other recent films. Rerun any week to pick up new pages: node scripts/harvest-recent.mjs
import fs from 'fs';
import { api, lines, wait } from './wq.mjs';
const OUT = new URL('../recent.json', import.meta.url).pathname;
const NOW = new Date().getUTCFullYear(), TOP = 60, PER = 2;
const bank = new Set(JSON.parse(fs.readFileSync(new URL('../quotes.json', import.meta.url), 'utf8')).map(q => q.answer.toLowerCase()));
// The bank is for a general audience: no slurs, no f-words, no stage directions or plot summary.
export const ROUGH = /\b(nigg\w*|fag\w*|cunt\w*|retard\w*|\w*fuck\w*|spic|chink\w*|kike\w*|auschwitz|holocaust)\b/i;
export const usable = (t) => !ROUGH.test(t) && !/["“”]/.test(t);
export function genreOf(cats) {
  const c = cats.join(' ').toLowerCase();
  if (/science fiction|sci-fi/.test(c)) return 'scifi';
  if (/animated|animation/.test(c)) return 'cartoon';
  if (/comedy/.test(c)) return 'comedy';
  if (/action|adventure|thriller|war |western|superhero|crime|horror|spy/.test(c)) return 'action';
  if (/drama|romance|biograph|musical/.test(c)) return 'drama';
  return null;
}

if (process.argv[1]?.endsWith('harvest-recent.mjs')) {
  const films = [];
  for (const year of [NOW - 1, NOW]) {
    const pages = new Map();
    for (const c of [`${year} films`, `${year} American films`]) {
      const cat = await api('en.wikiquote.org', { action: 'query', generator: 'categorymembers', gcmtitle: `Category:${c}`, gcmnamespace: 0, gcmlimit: 500, prop: 'info' });
      for (const pg of cat?.query?.pages || []) pages.set(pg.title, pg);
    }
    for (const pg of [...pages.values()].sort((a, b) => b.length - a.length).slice(0, TOP)) {
      const title = pg.title.replace(/\s*\(\d{4} film\)|\s*\(film\)/, '');
      if (bank.has(title.toLowerCase())) continue;
      const wq = await api('en.wikiquote.org', { action: 'parse', page: pg.title, prop: 'wikitext' });
      const wt = wq?.parse?.wikitext;
      if (!wt) continue;
      const link = wt.match(/\[\[w:([^|\]]+)/);
      const wp = link && await api('en.wikipedia.org', { action: 'query', titles: link[1], prop: 'categories', cllimit: 100, redirects: 1 });
      const genre = genreOf((wp?.query?.pages?.[0]?.categories || []).map(c => c.title));
      const seen = new Set(), picks = [];
      for (const l of lines(wt, title)) if (usable(l.quote) && !seen.has(l.character) && picks.length < PER) { seen.add(l.character); picks.push(l); }
      if (genre && picks.length) films.push({ answer: title, year, genre, source: `https://en.wikiquote.org/wiki/${encodeURIComponent(pg.title.replace(/ /g, '_'))}`, picks });
      await wait(120);
    }
    console.log(year, films.length, 'films so far');
  }
  const titles = films.map(f => f.answer);
  const out = films.flatMap(f => f.picks.map(l => {
    const others = titles.filter(t => t !== f.answer).sort(() => Math.random() - 0.5).slice(0, 3);
    return { quote: l.quote, year: f.year, options: [f.answer, ...others].sort(() => Math.random() - 0.5), genre: f.genre, answer: f.answer, type: 'movie', character: l.character, source: f.source };
  }));
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log(out.length, 'lines from', films.length, 'films');
}

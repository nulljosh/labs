// v77 Anime: real lines from Wikiquote's anime pages (Category:Anime and Studio Ghibli films), two per
// title from different speakers, with the same filters as the new-release harvest. Film or series and
// the year come from the title's Wikipedia categories ("1988 anime films", "2006 anime television
// series debuts"); films without a year are left out, since every bank film needs one. Wrong answers
// are other anime titles. Appends to every bank copy; titles already in the bank are skipped.
import fs from 'fs';
import { api, lines, wait } from './wq.mjs';
import { usable } from './harvest-recent.mjs';
const BANKS = ['../quotes.json', '../ios/Quotable/Resources/quotes.json', '../macos/Quotable/Resources/quotes.json'].map(p => new URL(p, import.meta.url).pathname);
export const titleOf = (page) => page.replace(/\s*\((?:anime|manga|\d{4} film|film|TV series|\d{4} TV series)\)$/, '');
export function kind(cats) {
  const c = cats.join(' | ');
  const film = /anime films|animated feature films|animated films/i.test(c);
  const y = c.match(/Category:(\d{4}) (?:anime films|animated films|films|anime television series debuts|television series debuts)/);
  return { type: film ? 'movie' : 'tv', year: y ? +y[1] : null };
}

if (process.argv[1]?.endsWith('harvest-anime.mjs')) {
  const bank = JSON.parse(fs.readFileSync(BANKS[0], 'utf8'));
  const have = new Set(bank.map(q => q.answer.toLowerCase())), quotes = new Set(bank.map(q => q.quote));
  const pages = new Set();
  for (const c of ['Anime', 'Studio Ghibli films']) {
    const d = await api('en.wikiquote.org', { action: 'query', list: 'categorymembers', cmtitle: `Category:${c}`, cmnamespace: 0, cmlimit: 500 });
    for (const m of d?.query?.categorymembers || []) pages.add(m.title);
  }
  const titles = [];
  for (const page of pages) {
    const title = titleOf(page);
    if (have.has(title.toLowerCase())) continue;
    const wq = await api('en.wikiquote.org', { action: 'parse', page, prop: 'wikitext' });
    const wt = wq?.parse?.wikitext;
    if (!wt) continue;
    const link = wt.match(/\[\[w:([^|\]]+)/);
    const wp = link && await api('en.wikipedia.org', { action: 'query', titles: link[1], prop: 'categories', cllimit: 500, redirects: 1 });
    const k = kind((wp?.query?.pages?.[0]?.categories || []).map(c => c.title));
    if (k.type === 'movie' && !k.year) continue;
    const seen = new Set(), picks = [];
    for (const l of lines(wt, title)) if (usable(l.quote) && !quotes.has(l.quote) && !seen.has(l.character) && picks.length < 2) { seen.add(l.character); picks.push(l); }
    if (picks.length) titles.push({ title, ...k, source: `https://en.wikiquote.org/wiki/${encodeURIComponent(page.replace(/ /g, '_'))}`, picks });
    await wait(120);
  }
  const names = titles.map(t => t.title);
  const fresh = titles.flatMap(t => t.picks.map(l => ({
    quote: l.quote, ...(t.year ? { year: t.year } : {}),
    options: [t.title, ...names.filter(n => n !== t.title).sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5),
    genre: 'anime', prompt: 'Name the anime from the quote.', answer: t.title, type: t.type, character: l.character, source: t.source,
  })));
  for (const p of BANKS) fs.writeFileSync(p, JSON.stringify([...JSON.parse(fs.readFileSync(p, 'utf8')), ...fresh], null, 2) + '\n');
  console.log(fresh.length, 'lines from', titles.length, 'titles of', pages.size, 'pages');
}

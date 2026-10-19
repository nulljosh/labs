// v100: build quotes-more.json, the extended bank, from harvest-more.json (films) and harvest-more-tv.json. Each line keeps its
// character and its Wikiquote page; wrong answers are three other titles of the same type and genre from either
// bank, picked from a seeded walk so a rerun gives the same file. A line already in either bank is
// skipped. The core bank (quotes.json) is never touched, so the Daily never reshuffles.
import fs from 'fs';
const here = (p) => new URL(p, import.meta.url).pathname;
const core = JSON.parse(fs.readFileSync(here('../quotes.json'), 'utf8'));
const harvest = JSON.parse(fs.readFileSync(here('./harvest-more.json'), 'utf8'));
const read = (f) => fs.existsSync(here(f)) ? Object.values(JSON.parse(fs.readFileSync(here(f), 'utf8'))).filter(Boolean) : [];
const deep = [...read('./harvest-deepen.json'), ...read('./harvest-deepen2.json')];
const tv = fs.existsSync(here('./harvest-more-tv.json')) ? JSON.parse(fs.readFileSync(here('./harvest-more-tv.json'), 'utf8')) : {};
let seed = 100;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
// Rows are films by default; TV and game rows carry their own type. Wrong answers share type and genre,
// so an animated show never gets film titles as options.
// Not lines: cast rows ("Actor as Role"), fragments that start mid-sentence, a speaker label left on,
// scraps under 25 characters, SHOUTING, and drawn-out noises ("Aaaahhhh"). Same rules as clean-bank.mjs, applied on every rebuild.
const CAST = /^[A-Z][\w.'’ ]{2,40} (as|-|–|—) [A-Z]/;
export const junk = (t) => (CAST.test(t) && !/[.!?]['”"]?$/.test(t)) || /^[a-z…]/.test(t) || /^[A-Z][\w.'’ ]{1,25}: /.test(t)
  || t.length < 25 || /([a-z])\1{3,}/i.test(t) || (t.match(/[A-Z]/g) || []).length > (t.match(/[a-z]/g) || []).length;
export function build(core, films) {
  const titles = {}, k = (type, genre) => `${type}|${genre}`;
  for (const q of core) if (q.type !== 'music') (titles[k(q.type, q.genre)] ||= new Set()).add(q.answer);
  for (const f of films) (titles[k(f.type || 'movie', f.genre)] ||= new Set()).add(f.answer);
  const seen = new Set(core.map(q => q.quote)), out = [];
  for (const f of films) for (const l of f.lines) {
    // A line that says its own title gives the answer away.
    const stem = f.answer.replace(/[:(].*/, '').trim().toLowerCase();
    if (seen.has(l.quote) || junk(l.quote) || (stem.length > 4 && l.quote.toLowerCase().includes(stem))) continue;
    seen.add(l.quote);
    const pool = [...titles[k(f.type || 'movie', f.genre)]].filter(t => t !== f.answer), wrong = [];
    while (wrong.length < 3 && pool.length) wrong.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    if (wrong.length < 3) continue;
    const options = [f.answer, ...wrong].sort(() => rnd() - 0.5);
    out.push({ quote: l.quote, ...(f.year ? { year: f.year } : {}), options, genre: f.genre, ...(f.genre === 'anime' ? { prompt: 'Name the anime from the quote.' } : {}), answer: f.answer, type: f.type || 'movie', character: l.character, source: f.source });
  }
  return out;
}
if (process.argv[1]?.endsWith('merge-more.mjs')) {
  const more = build(core, [...Object.values(harvest).flat(), ...Object.values(tv).flat(), ...deep]);
  fs.writeFileSync(here('../quotes-more.json'), JSON.stringify(more, null, 1) + '\n');
  console.log(more.length, 'lines in quotes-more.json;', core.length + more.length, 'in all');
}

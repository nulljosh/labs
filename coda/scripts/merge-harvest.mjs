// Fold scripts/harvest.json (real Wikiquote lines) into quotes.json. Existing entries stay as
// they are; a harvested film already in the bank is skipped. Each new line carries its
// character and the Wikiquote page it came from. Distractors are other titles in the same
// genre, picked from a seeded walk so a rerun gives the same bank. Run: node scripts/merge-harvest.mjs [target] [harvest file]
// (harvest-tv.json for v6 TV; its rows carry type: 'tv')
import fs from 'fs';
const dir = new URL('.', import.meta.url).pathname;
const bank = JSON.parse(fs.readFileSync(dir + '../quotes.json', 'utf8'));
const harvest = JSON.parse(fs.readFileSync(dir + (process.argv[3] || 'harvest.json'), 'utf8'));
const TARGET = +process.argv[2] || 1000;
let seed = 7;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const have = new Set(bank.map(q => q.answer.toLowerCase())), quotes = new Set(bank.map(q => q.quote));
const fresh = Object.values(harvest).flat().filter(f => !have.has(f.answer.toLowerCase()));
const titlesBy = {};
for (const q of bank) if (q.type !== 'music') (titlesBy[q.genre] ||= new Set()).add(q.answer);
for (const f of fresh) (titlesBy[f.genre] ||= new Set()).add(f.answer);
const pick = (genre, answer) => {
  const pool = [...titlesBy[genre]].filter(t => t !== answer);
  const out = [];
  while (out.length < 3 && pool.length) out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  return out;
};
const rows = [];
for (const f of fresh) for (const l of f.lines) {
  if (quotes.has(l.quote)) continue;
  quotes.add(l.quote);
  const opts = pick(f.genre, f.answer);
  if (opts.length < 3) continue;
  const options = [...opts, f.answer].sort(() => rnd() - 0.5);
  rows.push({ quote: l.quote, year: f.year, options, genre: f.genre, answer: f.answer, type: f.type || 'movie', character: l.character, source: f.source });
}
const room = Math.max(0, TARGET - bank.length);
const keep = rows.sort(() => rnd() - 0.5).slice(0, room);
fs.writeFileSync(dir + '../quotes.json', JSON.stringify([...bank, ...keep], null, 2) + '\n');
console.log(`bank ${bank.length} + ${keep.length} new (of ${rows.length} candidates) = ${bank.length + keep.length}`);

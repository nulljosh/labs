// v72: fold approved player submissions into every bank copy. Lines already in the bank are skipped,
// so running it twice is harmless. The genre comes from another line with the same answer, else a
// default for the type; wrong answers are three other answers of the same type. Check the diff, run
// verify-bank.mjs, then commit. With JAYBULB_TOKEN (the owner's session) set, merged lines leave the list.
import fs from 'fs';
const API = 'https://api.jaybulb.com/rpc/';
const BANKS = ['../quotes.json', '../ios/Quotable/Resources/quotes.json', '../macos/Quotable/Resources/quotes.json'].map(p => new URL(p, import.meta.url).pathname);
const DEFAULT = { movie: 'drama', tv: 'tvdrama', game: 'game', music: 'pop', book: 'book' };
const call = (fn, body = {}) => fetch(API + fn, { method: 'POST', headers: { 'content-type': 'application/json', ...(process.env.JAYBULB_TOKEN ? { authorization: `Bearer ${process.env.JAYBULB_TOKEN}` } : {}) }, body: JSON.stringify(body) }).then(r => r.json());

export function entry(s, bank, rand = Math.random) {
  const same = bank.find(q => q.answer === s.answer);
  const others = [...new Set(bank.filter(q => q.type === s.type && q.answer !== s.answer).map(q => q.answer))];
  const wrong = [];
  while (wrong.length < 3 && others.length) wrong.push(others.splice(Math.floor(rand() * others.length), 1)[0]);
  const options = [s.answer, ...wrong].sort(() => rand() - 0.5);
  return { quote: s.quote, ...(s.year ? { year: s.year } : {}), options, genre: same?.genre || DEFAULT[s.type], answer: s.answer, type: s.type,
    ...(s.who ? { character: s.who } : {}), ...(s.source ? { source: s.source } : {}), ...(same?.art ? { art: same.art } : {}) };
}

if (process.argv[1]?.endsWith('pull-submissions.mjs')) {
  const approved = await call('quotestreak_approved_quotes');
  if (!Array.isArray(approved)) throw new Error(JSON.stringify(approved));
  const bank = JSON.parse(fs.readFileSync(BANKS[0], 'utf8'));
  const have = new Set(bank.map(q => q.quote));
  const fresh = approved.filter(s => !have.has(s.quote)).map(s => entry(s, bank));
  for (const p of BANKS) {
    const b = JSON.parse(fs.readFileSync(p, 'utf8'));
    fs.writeFileSync(p, JSON.stringify([...b, ...fresh], null, 2) + '\n');
  }
  console.log(fresh.length, 'lines added of', approved.length, 'approved');
  if (process.env.JAYBULB_TOKEN) for (const s of approved) await call('quotestreak_moderate_quote', { id: s.id, action: 'merged' });
}

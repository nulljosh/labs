// Adds harvest-ratings.json to quotes.json and the iOS and Mac copies as `rating` (MPA, ESRB, or
// "children's" for TV).
import fs from 'fs';
const found = JSON.parse(fs.readFileSync(new URL('./harvest-ratings.json', import.meta.url)));
for (const rel of ['../quotes.json', '../ios/Quotable/Resources/quotes.json', '../macos/Quotable/Resources/quotes.json']) {
  const url = new URL(rel, import.meta.url), raw = fs.readFileSync(url, 'utf8'), bank = JSON.parse(raw);
  let n = 0;
  for (const q of bank) { const r = found[`${q.type}|${q.answer}|${q.year || ''}`]; if (r) { q.rating = r; n++; } }
  fs.writeFileSync(url, JSON.stringify(bank, null, raw.startsWith('[\n  ') ? 2 : undefined) + (raw.endsWith('\n') ? '\n' : ''));
  console.log(rel, n, 'rated');
}

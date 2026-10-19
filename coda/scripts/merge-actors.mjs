// Adds harvest-actors.json's { quote: actor } to quotes.json and the iOS and Mac copies, as `actor`.
import fs from 'fs';
const found = JSON.parse(fs.readFileSync(new URL('./harvest-actors.json', import.meta.url)));
for (const rel of ['../quotes.json', '../ios/Quotable/Resources/quotes.json', '../macos/Quotable/Resources/quotes.json']) {
  const url = new URL(rel, import.meta.url), raw = fs.readFileSync(url, 'utf8'), bank = JSON.parse(raw);
  let n = 0;
  for (const q of bank) if (found[q.quote]) { q.actor = found[q.quote]; n++; }
  fs.writeFileSync(url, JSON.stringify(bank, null, raw.startsWith('[\n  ') ? 2 : undefined) + (raw.endsWith('\n') ? '\n' : ''));
  console.log(rel, n, 'actors');
}

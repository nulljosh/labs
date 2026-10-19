// Adds harvest-directors.json to quotes.json and the iOS and Mac copies as `director`. Several
// directors are named together only when they share a surname (the Coens, the Wachowskis);
// otherwise the first listed, since Wikidata also lists uncredited directors after the credited one.
import fs from 'fs';
const found = JSON.parse(fs.readFileSync(new URL('./harvest-directors.json', import.meta.url)));
const name = (list) => {
  const last = (n) => n.split(' ').at(-1);
  if (list.length > 1 && list.every(n => last(n) === last(list[0]))) return list.slice(0, -1).join(', ') + ' and ' + list.at(-1);
  return list[0];
};
for (const rel of ['../quotes.json', '../ios/Quotable/Resources/quotes.json', '../macos/Quotable/Resources/quotes.json']) {
  const url = new URL(rel, import.meta.url), raw = fs.readFileSync(url, 'utf8'), bank = JSON.parse(raw);
  let n = 0;
  for (const q of bank) { const d = q.type === 'movie' && found[`${q.answer}|${q.year}`]; if (d) { q.director = name(d); n++; } }
  fs.writeFileSync(url, JSON.stringify(bank, null, raw.startsWith('[\n  ') ? 2 : undefined) + (raw.endsWith('\n') ? '\n' : ''));
  console.log(rel, n, 'directors');
}

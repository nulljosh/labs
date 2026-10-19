// v60 clean-up: harvested entries that aren't lines. Cast-list rows ("Actor as Role", "Actor - Role"),
// fragments that start mid-sentence, two-speaker exchanges and item descriptions are removed;
// a leading "Speaker: " or trailing "~ Narrator" is stripped. Run on the root bank and both copies.
import fs from 'fs';
const CAST = /^[A-Z][\w.'’ ]{2,40} (as|-|–|—) [A-Z]/;
const isCast = (s) => CAST.test(s) && !/[.!?]['”"]?$/.test(s) && !/[,;!?.]/.test(s.split(/ (?:as|-|–|—) /)[0]) && s.split(/ (?:as|-|–|—) /)[0].split(' ').length <= 4 && !/^(As|Just|If|When|And|But)\b/.test(s);
const DROP = (q) => isCast(q.quote) || (q.source && /^[a-z]/.test(q.quote)) || /^(\w+): ".*" \w[\w ]*: "/.test(q.quote)
  || /^(Painter|Beenade): /.test(q.quote) || /^Warning: If you're not a cartoon/.test(q.quote);
const strip = (s) => s.replace(/^(Snake|Yuna|Spy): /, '').replace(/\s*~ Narrator$/, '');
for (const rel of ['../quotes.json', '../ios/Quotable/Resources/quotes.json', '../macos/Quotable/Resources/quotes.json']) {
  const url = new URL(rel, import.meta.url), raw = fs.readFileSync(url, 'utf8'), bank = JSON.parse(raw);
  const kept = bank.filter(q => !DROP(q)).map(q => ({ ...q, quote: strip(q.quote) }));
  fs.writeFileSync(url, JSON.stringify(kept, null, raw.startsWith('[\n  ') ? 2 : undefined) + (raw.endsWith('\n') ? '\n' : ''));
  console.log(rel, bank.length - kept.length, 'removed,', kept.length, 'left');
}

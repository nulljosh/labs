// Adds harvest-music.json to quotes.json and the iOS and Mac copies: `song`, `album`, `albums`
// (other studio albums by the artist, the wrong answers) and `year`, so songs join Name the year
// and the decade filter too.
import fs from 'fs';
const found = JSON.parse(fs.readFileSync(new URL('./harvest-music.json', import.meta.url)));
for (const rel of ['../quotes.json', '../ios/Quotable/Resources/quotes.json', '../macos/Quotable/Resources/quotes.json']) {
  const url = new URL(rel, import.meta.url), raw = fs.readFileSync(url, 'utf8'), bank = JSON.parse(raw);
  let n = 0;
  for (const q of bank) {
    const m = q.type === 'music' && found[q.quote];
    if (m) { Object.assign(q, { song: m.song, album: m.album, albums: m.otherAlbums, year: m.year }); n++; }
  }
  fs.writeFileSync(url, JSON.stringify(bank, null, raw.startsWith('[\n  ') ? 2 : undefined) + (raw.endsWith('\n') ? '\n' : ''));
  console.log(rel, n, 'songs');
}

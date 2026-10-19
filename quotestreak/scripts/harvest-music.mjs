// v55 harvest: the song, album and year behind each music line. The song names below are given by
// hand (they are the famous songs the lyrics come from); each is confirmed on Wikidata, where the
// song item must have the line's artist as performer (P175). The album is the song's "part of"
// (P361) album and the year its earliest publication date (P577). Up to twelve other studio albums by
// the same artist (studio albums only: P31 or P7937 studio album) come along as wrong answers. Lines Wikidata can't confirm get nothing.
// (Apple's catalog was tried first: too many compilations with wrong dates.)
// Writes scripts/harvest-music.json as { quote: { song, album, year, otherAlbums } }.
import fs from 'fs';
import { wait } from './wq.mjs';
const SONGS = ['Bohemian Rhapsody', 'I Want to Hold Your Hand', 'The Sound of Silence', "Sweet Child O' Mine", 'We Will Rock You', 'Is There Anybody Out There?', 'Smells Like Teen Spirit', "Livin' on a Prayer", "Don't Stop Believin'", "(I Can't Get No) Satisfaction",
  'Billie Jean', 'Beat It', 'Like a Virgin', 'I Want It That Way', 'Oops!...I Did It Again', 'Since U Been Gone', 'Baby', 'I Knew You Were Trouble', 'Shake It Off', 'Roar',
  'Umbrella', 'Single Ladies (Put a Ring on It)', 'Poker Face', 'Uptown Funk', "Can't Stop the Feeling!", 'Rap God', 'Juicy', 'California Love', 'The Fresh Prince of Bel-Air', 'The Real Slim Shady',
  'Started from the Bottom', 'Hey Ya!', 'Gold Digger', 'No Church in the Wild', '99 Problems', "Ain't No Sunshine", "What's Going On", 'I Will Always Love You', 'Respect', "I'm Every Woman",
  'No Scrubs', 'Say My Name', 'Crazy in Love', 'Jolene', '9 to 5', 'Take Me Home, Country Roads', 'The Gambler', 'Ring of Fire', 'Friends in Low Places', 'God Bless the U.S.A.',
  'Born to Run', 'Hungry Heart', 'Hotel California', 'Take It Easy', 'Stairway to Heaven', 'Black Dog', 'Highway to Hell', 'You Shook Me All Night Long', 'Bad Moon Rising', 'Proud Mary',
  "Free Fallin'", 'Refugee', 'Dreams', 'Dreams', 'Piano Man', "We Didn't Start the Fire", 'Jump', 'Sweet Home Alabama', 'Free Bird', "Mammas Don't Let Your Babies Grow Up to Be Cowboys",
  'On the Road Again', "Rockin' in the Free World", 'My My, Hey Hey (Out of the Blue)', 'Like a Rolling Stone', "Blowin' in the Wind", 'Night Moves', 'Old Time Rock & Roll', 'I Walk the Line', 'The Gambler', '9 to 5',
  'Sweet Dreams (Are Made of This)', 'We Built This City', "Don't Stop Believin'", "Livin' on a Prayer", 'I Want to Know What Love Is', 'Another One Bites the Dust', "Free Fallin'", 'Vienna', 'Carry On Wayward Son', 'More Than a Feeling',
  'Cum On Feel the Noize', "We're Not Gonna Take It", 'Sweet Home Alabama', "Sweet Child O' Mine"];
const bank = JSON.parse(fs.readFileSync(new URL('../quotes.json', import.meta.url)));
const music = bank.filter(q => q.type === 'music');
if (music.length !== SONGS.length) throw new Error(`${music.length} music lines but ${SONGS.length} songs`);
const OUT = new URL('./harvest-music.json', import.meta.url).pathname;
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, 'and').replace(/^the /, '').replace(/[^a-z0-9]/g, '');
async function sparql(q) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q), { headers: { 'user-agent': 'quotestreak-harvest/1 (trommatic@icloud.com)', accept: 'application/sparql-results+json' } });
      if (r.ok) return (await r.json()).results.bindings;
    } catch {}
    await wait(3000 * (i + 1));
  }
  return [];
}
const v = (b, k) => b[k]?.value;
const id = (u) => u?.split('/').pop();
// Wikipedia's song infobox: the album it's from and the year it came out, only when the infobox's
// artist field names the line's artist.
async function infobox(song, artist) {
  for (const title of [`${song} (${artist} song)`, `${song} (song)`, song]) {
    const r = await fetch('https://en.wikipedia.org/w/api.php?format=json&formatversion=2&action=parse&prop=wikitext&redirects=1&page=' + encodeURIComponent(title), { headers: { 'user-agent': 'quotestreak-harvest/1 (trommatic@icloud.com)' } }).catch(() => null);
    const wt = r?.ok ? (await r.json()).parse?.wikitext : null;
    await wait(300);
    const box = wt?.match(/\{\{\s*Infobox (?:song|single)([\s\S]*?)\n\}\}/i)?.[1];
    if (!box) continue;
    const field = (k) => box.match(new RegExp(`\\|[ \\t]*${k}[ \\t]*=[ \\t]*(.*)`, 'i'))?.[1] || '';
    const plain = (x) => x.replace(/<ref[\s\S]*?(<\/ref>|\/>)/g, '').replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1').replace(/''+/g, '').replace(/\{\{[^}]*\}\}/g, '').trim();
    if (!norm(plain(field('artist'))).includes(norm(artist))) continue;
    // The first album linked: an infobox can name two ("A and B"), and the first is the original.
    const link = field('album').match(/\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/);
    const album = (link ? (link[2] || link[1]) : plain(field('album'))).replace(/\s*\((?:album|[^)]*album)\)$/i, '').trim();
    let year = +(field('released').match(/\b(19|20)\d\d\b/) || [])[0];
    if (link) year = Math.min(year || 9999, await albumYear(link[1]) || 9999);   // the album can predate the single
    if (album && !/[|=]/.test(album) && year < 9999) return { album, year };
  }
  return {};
}
async function albumYear(title) {
  const r = await fetch('https://en.wikipedia.org/w/api.php?format=json&formatversion=2&action=parse&prop=wikitext&redirects=1&page=' + encodeURIComponent(title), { headers: { 'user-agent': 'quotestreak-harvest/1 (trommatic@icloud.com)' } }).catch(() => null);
  const wt = r?.ok ? (await r.json()).parse?.wikitext : null;
  await wait(300);
  return +(wt?.match(/\|[ \t]*released[ \t]*=[ \t]*(.*)/i)?.[1].match(/\b(19|20)\d\d\b/) || [])[0] || 0;
}
async function artistItem(name) {
  const rows = await sparql(`SELECT ?a WHERE { SERVICE wikibase:mwapi { bd:serviceParam wikibase:api "EntitySearch"; wikibase:endpoint "www.wikidata.org"; mwapi:search ${JSON.stringify(name)}; mwapi:language "en". ?a wikibase:apiOutputItem mwapi:item. } ?x wdt:P175 ?a. } LIMIT 1`);
  return id(v(rows[0] || {}, 'a'));
}
const out = {};
for (const [i, q] of music.entries()) {
  const song = SONGS[i];
  const rows = await sparql(`SELECT ?song ?artist ?artistLabel ?album ?albumLabel ?date ?adate WHERE {
    SERVICE wikibase:mwapi { bd:serviceParam wikibase:api "EntitySearch"; wikibase:endpoint "www.wikidata.org"; mwapi:search ${JSON.stringify(song)}; mwapi:language "en". ?song wikibase:apiOutputItem mwapi:item. }
    ?song wdt:P175 ?artist. ?artist rdfs:label ?artistLabel FILTER(LANG(?artistLabel) = "en")
    OPTIONAL { ?song wdt:P361 ?album. ?album wdt:P31/wdt:P279* wd:Q482994. ?album rdfs:label ?albumLabel FILTER(LANG(?albumLabel) = "en") OPTIONAL { ?album wdt:P577 ?adate } }
    OPTIONAL { ?song wdt:P577 ?date }
  } LIMIT 200`);
  await wait(800);
  const mine = rows.filter(r => norm(v(r, 'artistLabel')).includes(norm(q.answer)) || norm(q.answer).includes(norm(v(r, 'artistLabel'))));
  const withAlbum = mine.filter(r => v(r, 'albumLabel') && !/live|greatest|hits|best of|collection/i.test(v(r, 'albumLabel')));
  const years = mine.flatMap(r => [v(r, 'date'), v(r, 'adate')]).map(d => +(d || '').slice(0, 4)).filter(y => y > 1900);
  let album = withAlbum.length && years.length ? v(withAlbum[0], 'albumLabel') : null, year = album ? Math.min(...years) : null, via = 'wikidata';
  if (!album) ({ album, year } = await infobox(song, q.answer)), via = 'wikipedia';
  if (!album || !year) { console.log('unconfirmed:', q.answer, '-', song); continue; }
  const artist = id(v(mine[0] || {}, 'artist')) || await artistItem(q.answer);
  const others = artist ? await sparql(`SELECT DISTINCT ?l WHERE { ?a wdt:P175 wd:${artist}; rdfs:label ?l. { ?a wdt:P31 wd:Q208569 } UNION { ?a wdt:P7937 wd:Q208569 } FILTER(LANG(?l) = "en") }`) : [];
  await wait(800);
  const otherAlbums = [...new Set(others.map(r => v(r, 'l')).filter(l => norm(l) !== norm(album) && !/live|greatest|hits|best of|collection|anthology|essential|deluxe|edition|bootleg|unplugged|remix|tour|concert|making of|sessions|singles|demo|vol\.|volume|exclusive|collector|video|behind|soundtrack|christmas|covering|icon\b|\d{4}[-–]\d{4}/i.test(l)))].slice(0, 12);
  out[q.quote] = { song, album, year, otherAlbums };
  console.log(`${q.answer} | ${song} | ${album} | ${year} | ${otherAlbums.length} others | ${via}`);
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(music.length, 'lines', Object.keys(out).length, 'confirmed');

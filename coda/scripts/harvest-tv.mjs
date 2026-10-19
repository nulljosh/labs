// v6 harvest: real TV lines from Wikiquote, nothing typed from memory. Shows come from
// Wikiquote's "<decade> American sitcoms / drama TV shows / animated TV shows" categories,
// ranked by a year of English Wikipedia pageviews so the famous ones win. A quote is a
// standalone one-line exchange (":'''Name''': line" with no reply), which is how Wikiquote
// sets a memorable single line. Big shows split into season pages; up to 4 are read.
// Writes scripts/harvest-tv.json; scripts/merge-harvest.mjs folds it into the bank.
import fs from 'fs';
const OUT = new URL('./harvest-tv.json', import.meta.url).pathname;
const TOP = 10, PER = 2, SEASONS = 4;
const UA = { 'user-agent': 'quotestreak-harvest/1 (trommatic@icloud.com)' };
const wait = (ms) => new Promise(r => setTimeout(r, ms));
async function get(u) {
  for (let i = 0; i < 4; i++) {
    try { const r = await fetch(u, { headers: UA }); if (r.ok) return await r.json(); if (r.status === 404) return null; } catch {}
    await wait(1500 * (i + 1));
  }
  return null;
}
const api = (host, p) => get(`https://${host}/w/api.php?format=json&formatversion=2&` + new URLSearchParams(p));
const clean = (s) => s.replace(/<ref[^>]*>.*?<\/ref>/g, '').replace(/<[^>]+>/g, ' ').replace(/\{\{[^}]*\}\}/g, '')
  .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1').replace(/'{2,}/g, '').replace(/\[[^\]]*\]/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&hellip;/g, '…')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const DIALOGUE = /^:+\s*'''(.+?)'''\s*:?\s*(.+)$/;
function lines(wt, show) {
  const out = [], name = show.toLowerCase();
  const blocks = wt.split(/\n\s*\n|<hr[^>]*>|\n(?==)/);
  for (const b of blocks) {
    const ls = b.split('\n').filter(l => /^[:*]/.test(l));
    if (ls.length !== 1) continue;
    const m = ls[0].match(DIALOGUE);
    if (!m) continue;
    const who = clean(m[1]).replace(/:$/, ''), t = clean(m[2]).replace(/^:\s*/, '');
    if (!who || who.length > 30 || /[\[\]{}|]/.test(t) || t.length < 28 || t.length > 150) continue;
    if (t.toLowerCase().includes(name) || (t.match(/[a-z]/g) || []).length < 20) continue;
    out.push({ quote: t, character: who });
  }
  return out;
}
async function views(title) {
  const t = encodeURIComponent(title.replace(/ /g, '_'));
  const d = await get(`https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${t}/monthly/2025010100/2025123100`);
  return (d?.items || []).reduce((n, i) => n + i.views, 0);
}
// Famous shows by name (the lines still come off each show's own Wikiquote page). The
// category walk below then adds the most-viewed shows this list missed.
const FAMOUS = {
  sitcom: ['Seinfeld', 'Friends', 'The Office (American TV series)', 'Parks and Recreation', 'Cheers', 'Frasier', 'How I Met Your Mother', 'The Big Bang Theory', 'Arrested Development', 'Brooklyn Nine-Nine', 'Scrubs', '30 Rock', 'Curb Your Enthusiasm', 'Modern Family', 'It\'s Always Sunny in Philadelphia', 'The Fresh Prince of Bel-Air', 'Happy Days', 'M*A*S*H (TV series)', 'I Love Lucy', 'The Golden Girls', 'Community (TV series)', 'Ted Lasso', 'Schitt\'s Creek', 'Fawlty Towers', 'Blackadder', 'The IT Crowd', 'Malcolm in the Middle', 'That \'70s Show', 'Everybody Loves Raymond', 'Married... with Children'],
  tvdrama: ['Breaking Bad', 'The Sopranos', 'The Wire', 'Mad Men', 'Game of Thrones', 'Lost (TV series)', 'The West Wing', 'Star Trek', 'Star Trek: The Next Generation', 'The X-Files', 'Twin Peaks', 'Buffy the Vampire Slayer', 'Better Call Saul', 'Succession (TV series)', 'Stranger Things', 'House (TV series)', 'Doctor Who', 'Firefly (TV series)', 'Battlestar Galactica (2004 TV series)', 'The Twilight Zone (1959 TV series)', 'Sherlock (TV series)', 'Deadwood', 'The Walking Dead (TV series)', 'Dexter (TV series)', 'Boardwalk Empire', 'True Detective', 'Westworld (TV series)', 'Downton Abbey', 'Peaky Blinders (TV series)', 'Yellowstone (American TV series)'],
  cartoon: ['The Simpsons', 'Futurama', 'Family Guy', 'South Park', 'SpongeBob SquarePants', 'Rick and Morty', 'BoJack Horseman', 'Avatar: The Last Airbender', 'King of the Hill', 'Bob\'s Burgers', 'Archer (TV series)', 'Batman: The Animated Series', 'Animaniacs', 'The Flintstones', 'The Jetsons', 'Looney Tunes', 'Gravity Falls', 'Adventure Time', 'Phineas and Ferb', 'The Ren & Stimpy Show', 'Beavis and Butt-head', 'Dexter\'s Laboratory', 'The Powerpuff Girls', 'Invader Zim', 'Scooby-Doo, Where Are You!', 'Hey Arnold!', 'Rugrats', 'Teenage Mutant Ninja Turtles (1987 TV series)', 'X-Men: The Animated Series', 'Steven Universe'],
};
const KINDS = [['animated TV shows', 'cartoon'], ['sitcoms', 'sitcom'], ['drama TV shows', 'tvdrama']];
const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const taken = new Set(Object.values(done).flat().map(r => r.answer));
for (const [genre, titles] of Object.entries(FAMOUS)) {
  const key = `famous ${genre}`;
  if (done[key]) continue;
  done[key] = [];
  for (const title of titles) {
    const wq = await api('en.wikiquote.org', { action: 'parse', page: title, prop: 'wikitext', redirects: 1 });
    if (wq?.parse?.wikitext) await take({ title: wq.parse.title, wt: wq.parse.wikitext }, genre, done[key]);
  }
  fs.writeFileSync(OUT, JSON.stringify(done));
  console.log(key, titles.length, 'shows', done[key].length, 'kept', done[key].reduce((n, r) => n + r.lines.length, 0), 'lines');
}
for (const decade of ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s']) for (const [cat, genre] of KINDS) {
  const key = `${decade} ${cat}`;
  if (done[key]) continue;
  const c = await api('en.wikiquote.org', { action: 'query', list: 'categorymembers', cmtitle: `Category:${decade} American ${cat}`, cmnamespace: 0, cmlimit: 500 });
  if (!c) { console.log(key, 'api failed, rerun to resume'); process.exit(1); }
  const shows = [];
  for (const m of c.query?.categorymembers || []) {
    if (taken.has(m.title.replace(/\s*\(.*\)$/, ''))) continue;
    const wq = await api('en.wikiquote.org', { action: 'parse', page: m.title, prop: 'wikitext' });
    const wt = wq?.parse?.wikitext; if (!wt) continue;
    const wp = (wt.match(/\[\[w:([^|\]]+)/) || [])[1];
    shows.push({ title: m.title, wt, wp, views: wp ? await views(wp) : 0 });
  }
  done[key] = [];
  for (const s of shows.sort((a, b) => b.views - a.views).slice(0, TOP)) await take(s, genre, done[key]);
  fs.writeFileSync(OUT, JSON.stringify(done));
  console.log(key, shows.length, 'shows', done[key].length, 'kept', done[key].reduce((n, r) => n + r.lines.length, 0), 'lines');
}

async function take(s, genre, rows) {
  {
    const answer = s.title.replace(/\s*\(.*\)$/, '');
    const year = +((s.wt.replace(/\[\[File:[^\n]*/g, '').match(/\b(19[4-9]\d|20[0-2]\d)\b/) || [])[1]) || null;
    let found = lines(s.wt, answer);
    const seasons = [...new Set([...s.wt.matchAll(/\[\[([^|\]]+\((?:season|series) \d+\))/gi)].map(m => m[1]))].slice(0, SEASONS);
    for (const p of seasons) {
      const sp = await api('en.wikiquote.org', { action: 'parse', page: p, prop: 'wikitext' });
      if (sp?.parse?.wikitext) found = found.concat(lines(sp.parse.wikitext, answer));
      await wait(100);
    }
    const seen = new Set(), picks = [];
    const titleWords = answer.toLowerCase().split(/\W+/).filter(w => w.length >= 4);
    const good = found.filter(l => !titleWords.some(w => l.quote.toLowerCase().includes(w)) && l.quote.length >= 40 && l.quote.length <= 130);
    for (const l of good.sort((a, b) => Math.abs(a.quote.length - 80) - Math.abs(b.quote.length - 80)))
      if (!seen.has(l.character) && picks.length < PER) { seen.add(l.character); picks.push(l); }
    if (picks.length && year) { rows.push({ answer, year, genre, type: 'tv', source: `https://en.wikiquote.org/wiki/${encodeURIComponent(s.title.replace(/ /g, '_'))}`, lines: picks }); taken.add(answer); }
  }
}

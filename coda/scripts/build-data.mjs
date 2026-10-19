// v80 Open data: writes the bank's open parts to dist/data/ at build time, so they never drift from
// quotes.json. lines.json holds only text we may pass on: Wikiquote lines (CC BY-SA 4.0, each with
// its page as attribution) and Project Gutenberg first lines (public domain). Song lyrics and the
// unsourced hand-seeded film lines stay out. titles.json holds facts about every title (year, type,
// genre, director, actor, rating, seasons, album), drawn from Wikidata, which is CC0.
// Run by scripts/build-site.sh; node scripts/build-data.mjs [outDir] to run it alone.
import fs from 'fs';
const here = (p) => new URL(p, import.meta.url).pathname;
const bank = [...JSON.parse(fs.readFileSync(here('../quotes.json'), 'utf8')), ...JSON.parse(fs.readFileSync(here('../quotes-more.json'), 'utf8'))];   // v100: both banks

export function openLines(bank) {
  return bank.filter(q => q.type !== 'music' && /^https:\/\/(en\.wikiquote\.org|www\.gutenberg\.org)\//.test(q.source || ''))
    .map(q => ({ quote: q.quote, title: q.answer, type: q.type, year: q.year, character: q.character, source: q.source,
      license: q.source.includes('gutenberg.org') ? 'Public domain' : 'CC BY-SA 4.0' }));
}
export function titles(bank) {
  const by = new Map();
  for (const q of bank) {
    const key = `${q.type}|${q.answer}|${q.year || ''}`;
    const t = by.get(key) || { title: q.answer, type: q.type, year: q.year, genre: q.genre, lines: 0 };
    t.lines++;
    for (const k of ['director', 'rating', 'seasons', 'album', 'albums']) if (q[k] && !t[k]) t[k] = q[k];
    if (q.actor) (t.actors ||= []).includes(q.actor) || t.actors.push(q.actor);
    by.set(key, t);
  }
  return [...by.values()];
}

if (process.argv[1]?.endsWith('build-data.mjs')) {
  const out = process.argv[2] || here('../dist/data');
  fs.mkdirSync(out, { recursive: true });
  const lines = openLines(bank), facts = titles(bank);
  const manifest = {
    name: 'Coda open data', updated: new Date().toISOString().slice(0, 10), about: 'https://coda.jaybulb.com/play',
    files: {
      'lines.json': { count: lines.length, license: 'CC BY-SA 4.0 for Wikiquote lines (credit the source page on each line); public domain for Project Gutenberg first lines' },
      'titles.json': { count: facts.length, license: 'CC0 1.0: facts about each title, mostly from Wikidata' },
    },
    left_out: 'Song lyrics and film lines without a published source; the game plays them, but they are not ours to license.',
  };
  fs.writeFileSync(`${out}/index.json`, JSON.stringify(manifest, null, 1) + '\n');
  fs.writeFileSync(`${out}/lines.json`, JSON.stringify(lines) + '\n');
  fs.writeFileSync(`${out}/titles.json`, JSON.stringify(facts) + '\n');
  console.log(lines.length, 'open lines,', facts.length, 'titles');
}

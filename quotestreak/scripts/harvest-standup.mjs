// v78 Stand-up: one-liners from comics' Wikiquote pages, three each. Takes top-level "* line" entries
// (the "** source" lines under them are skipped), bolded lines first since Wikiquote bolds the famous
// ones, 30 to 150 characters, no f-words or slurs, and never a line that names the comic.
// Writes standup.json as [{ quote, answer, source }] for the Stand-up shelf in shelves.js.
import fs from 'fs';
import { api, clean, wait } from './wq.mjs';
import { usable } from './harvest-recent.mjs';
const OUT = new URL('../standup.json', import.meta.url).pathname;
const COMICS = ['George Carlin', 'Richard Pryor', 'Mitch Hedberg', 'Steven Wright', 'Rodney Dangerfield', 'Joan Rivers', 'Robin Williams',
  'Jerry Seinfeld', 'Chris Rock', 'Dave Chappelle', 'Bill Hicks', 'Norm Macdonald', 'Demetri Martin', 'Jim Gaffigan', 'John Mulaney',
  'Ricky Gervais', 'Bill Burr', 'Ali Wong', 'Phyllis Diller', 'Lenny Bruce', 'Eddie Izzard', 'Jimmy Carr', 'Tig Notaro', 'Bo Burnham', 'Ellen DeGeneres'];
export function oneLiners(wt, name) {
  const last = name.split(' ').pop().toLowerCase();
  const out = [];
  for (const raw of wt.split('\n')) {
    const m = raw.match(/^\*\s*(?!\*)(.+)/);
    if (!m) continue;
    const bold = /^'''/.test(m[1].trim());
    const t = clean(m[1]).replace(/^["“]|["”]$/g, '');
    if (t.length < 30 || t.length > 150 || !usable(t) || t.toLowerCase().includes(last) || /^\(|https?:/.test(t)) continue;
    out.push({ t, bold });
  }
  return [...out.filter(o => o.bold), ...out.filter(o => !o.bold)].map(o => o.t);
}

if (process.argv[1]?.endsWith('harvest-standup.mjs')) {
  const rows = [];
  for (const name of COMICS) {
    const d = await api('en.wikiquote.org', { action: 'parse', page: name, prop: 'wikitext', redirects: 1 });
    const picks = oneLiners(d?.parse?.wikitext || '', name).slice(0, 3);
    for (const quote of picks) rows.push({ quote, answer: name, source: `https://en.wikiquote.org/wiki/${encodeURIComponent((d.parse.title).replace(/ /g, '_'))}` });
    console.log(name, picks.length);
    await wait(150);
  }
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 1) + '\n');
  console.log(rows.length, 'lines');
}

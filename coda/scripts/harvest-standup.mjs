// v78 Stand-up: prints candidate one-liners from comics' Wikiquote pages for hand-picking; the picks
// live in shelves.js (STANDUP). Takes top-level "* line" entries (the "** source" lines under them are
// skipped), bolded lines first since Wikiquote bolds the famous ones, 30 to 150 characters, no
// f-words or slurs, and never a line that names the comic. Automatic picks were too often interview
// answers or crude, so a person chooses.
import { api, clean, wait } from './wq.mjs';
import { usable } from './harvest-recent.mjs';
const COMICS = ['George Carlin', 'Richard Pryor', 'Mitch Hedberg', 'Steven Wright', 'Rodney Dangerfield', 'Joan Rivers', 'Robin Williams',
  'Jerry Seinfeld', 'Chris Rock', 'Dave Chappelle', 'Bill Hicks', 'Norm Macdonald', 'Demetri Martin', 'Jim Gaffigan', 'John Mulaney',
  'Eddie Izzard', 'Groucho Marx', 'Henny Youngman', 'Emo Philips', 'Rita Rudner', 'Jack Handey'];
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
  for (const name of process.argv.slice(2).length ? process.argv.slice(2) : COMICS) {
    const d = await api('en.wikiquote.org', { action: 'parse', page: name, prop: 'wikitext', redirects: 1 });
    console.log(`## ${name}`);
    oneLiners(d?.parse?.wikitext || '', name).slice(0, 10).forEach(t => console.log(`  ${t}`));
    await wait(150);
  }
}

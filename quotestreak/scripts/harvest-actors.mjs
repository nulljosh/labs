// v53 harvest: who delivered each harvested line. Every Wikiquote page the bank cites has a cast
// list ("* Actor - Character" or "Actor as Character"); a line's character is matched against it and
// the actor is kept only when exactly one cast entry fits. Writes scripts/harvest-actors.json as
// { quote: actor }; merge it with node scripts/merge-actors.mjs.
import fs from 'fs';
import { api, clean, wait } from './wq.mjs';
const bank = JSON.parse(fs.readFileSync(new URL('../quotes.json', import.meta.url)));
const OUT = new URL('./harvest-actors.json', import.meta.url).pathname;
const pages = new Map();
for (const q of bank) if (q.source?.includes('wikiquote.org/wiki/') && q.character && q.type !== 'book') {
  const page = decodeURIComponent(q.source.split('/wiki/')[1]);
  (pages.get(page) || pages.set(page, []).get(page)).push(q);
}
// "Actor - Character", "Actor – Character", "Actor as Character"; the actor side keeps its link text.
export function cast(wikitext) {
  const sec = wikitext.match(/==\s*(?:Cast|Starring|Voice cast)\s*==([\s\S]*?)(?:\n==[^=]|$)/i);
  if (!sec) return [];
  return sec[1].split('\n').map(l => l.match(/^\*+\s*(.+?)\s+(?:-|–|—|as)\s+(.+)$/)).filter(Boolean)
    .map(([, actor, role]) => ({ actor: clean(actor), roles: clean(role).split(/\s*(?:\/|,| and )\s*/).filter(Boolean) }))
    .filter(c => c.actor && c.actor.length < 40 && c.roles.length);
}
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
// The one cast entry whose role is the character, or whose role starts or ends with it as whole words.
export function actorFor(character, entries) {
  const c = norm(character);
  if (!c) return null;
  const exact = entries.filter(e => e.roles.some(r => norm(r) === c));
  if (exact.length === 1) return exact[0].actor;
  const part = entries.filter(e => e.roles.some(r => { const n = norm(r); return n.startsWith(c + ' ') || n.endsWith(' ' + c) || c.startsWith(n + ' '); }));
  return exact.length === 0 && part.length === 1 ? part[0].actor : null;
}
if (process.argv[1].endsWith('harvest-actors.mjs')) {
  const found = {};
  let i = 0;
  for (const [page, qs] of pages) {
    const d = await api('en.wikiquote.org', { action: 'parse', page, prop: 'wikitext', redirects: 1 });
    const entries = cast(d?.parse?.wikitext || '');
    for (const q of qs) { const a = actorFor(q.character, entries); if (a) found[q.quote] = a; }
    if (++i % 50 === 0) console.log(i, 'of', pages.size, 'pages,', Object.keys(found).length, 'actors');
    await wait(150);
  }
  fs.writeFileSync(OUT, JSON.stringify(found));
  console.log(pages.size, 'pages', Object.keys(found).length, 'lines with an actor');
}

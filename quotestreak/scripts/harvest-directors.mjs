// v54 harvest: who directed each film in the bank, from Wikidata (P57), reached through the film's
// English Wikipedia article. A film is matched only when its article's Wikidata item is a film
// (P31 film, Q11424, or a subclass label containing "film") released in the bank's year (P577),
// so a remake or a same-named film can't slip in. Writes scripts/harvest-directors.json as
// { "Title|year": ["Director", ...] }.
import fs from 'fs';
import { get, wait } from './wq.mjs';
const bank = JSON.parse(fs.readFileSync(new URL('../quotes.json', import.meta.url)));
const OUT = new URL('./harvest-directors.json', import.meta.url).pathname;
const films = [...new Map(bank.filter(q => q.type === 'movie' && q.year).map(q => [`${q.answer}|${q.year}`, q])).values()];
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));
const wp = (p) => get('https://en.wikipedia.org/w/api.php?format=json&formatversion=2&' + new URLSearchParams(p));
const wd = (p) => get('https://www.wikidata.org/w/api.php?format=json&formatversion=2&' + new URLSearchParams(p));

// Article title -> Wikidata item, for each candidate title of each film.
const tries = films.map(f => ({ key: `${f.answer}|${f.year}`, year: f.year, titles: [`${f.answer} (${f.year} film)`, `${f.answer} (film)`, f.answer] }));
const item = new Map();
for (const batch of chunk([...new Set(tries.flatMap(t => t.titles))], 50)) {
  const d = await wp({ action: 'query', prop: 'pageprops', ppprop: 'wikibase_item', redirects: 1, titles: batch.join('|') });
  const redirect = new Map([...(d?.query?.normalized || []), ...(d?.query?.redirects || [])].map(r => [r.from, r.to]));
  const qid = new Map((d?.query?.pages || []).filter(p => p.pageprops?.wikibase_item).map(p => [p.title, p.pageprops.wikibase_item]));
  for (const t of batch) { let to = t; for (let i = 0; i < 3 && redirect.has(to); i++) to = redirect.get(to); if (qid.has(to)) item.set(t, qid.get(to)); }
  await wait(200);
}
// Wikidata claims for every candidate item: is it a film, its year, its directors.
const claims = new Map();
for (const batch of chunk([...new Set(item.values())], 50)) {
  const d = await wd({ action: 'wbgetentities', ids: batch.join('|'), props: 'claims' });
  for (const [id, e] of Object.entries(d?.entities || {})) {
    const vals = (p) => (e.claims?.[p] || []).map(c => c.mainsnak?.datavalue?.value);
    claims.set(id, {
      film: vals('P31').some(v => ['Q11424', 'Q24869', 'Q202866', 'Q506240', 'Q24862', 'Q229390', 'Q2484376'].includes(v?.id)),
      years: vals('P577').map(v => +String(v?.time || '').slice(1, 5)).filter(Boolean),
      directors: vals('P57').map(v => v?.id).filter(Boolean),
    });
  }
  await wait(200);
}
const matched = {};
for (const t of tries) {
  for (const title of t.titles) {
    const c = claims.get(item.get(title));
    if (c && c.film && c.years.some(y => Math.abs(y - t.year) <= 1) && c.directors.length) { matched[t.key] = c.directors; break; }
  }
}
// Director names.
const names = new Map();
for (const batch of chunk([...new Set(Object.values(matched).flat())], 50)) {
  const d = await wd({ action: 'wbgetentities', ids: batch.join('|'), props: 'labels', languages: 'en' });
  for (const [id, e] of Object.entries(d?.entities || {})) if (e.labels?.en) names.set(id, e.labels.en.value);
  await wait(200);
}
const out = Object.fromEntries(Object.entries(matched).map(([k, ids]) => [k, ids.map(i => names.get(i)).filter(Boolean)]).filter(([, n]) => n.length));
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(films.length, 'films', Object.keys(out).length, 'with a director');

// v60 harvest: family ratings, conservatively, from Wikidata through each title's Wikipedia article.
// Films: MPA rating (P1657). Games: ESRB rating (P852). TV: whether the show is a children's series
// (P31 or P136 children's television, Q15416). The article must be the right kind of thing from the
// right year (films and games), as in harvest-directors. Writes scripts/harvest-ratings.json as
// { "type|title|year": rating } where rating is the MPA or ESRB label, or "children's" for TV.
import fs from 'fs';
import { get, wait } from './wq.mjs';
const bank = JSON.parse(fs.readFileSync(new URL('../quotes.json', import.meta.url)));
const OUT = new URL('./harvest-ratings.json', import.meta.url).pathname;
const key = (q) => `${q.type}|${q.answer}|${q.year || ''}`;
const titles = [...new Map(bank.filter(q => ['movie', 'game', 'tv'].includes(q.type)).map(q => [key(q), q])).values()];
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));
const wp = (p) => get('https://en.wikipedia.org/w/api.php?format=json&formatversion=2&' + new URLSearchParams(p));
const wd = (p) => get('https://www.wikidata.org/w/api.php?format=json&formatversion=2&' + new URLSearchParams(p));
const SUFFIX = { movie: (q) => [`${q.answer} (${q.year} film)`, `${q.answer} (film)`], game: (q) => [`${q.answer} (video game)`], tv: (q) => [`${q.answer} (TV series)`, `${q.answer} (American TV series)`] };
const tries = titles.map(q => ({ key: key(q), q, titles: [...SUFFIX[q.type](q), q.answer] }));
const item = new Map();
for (const batch of chunk([...new Set(tries.flatMap(t => t.titles))], 50)) {
  const d = await wp({ action: 'query', prop: 'pageprops', ppprop: 'wikibase_item', redirects: 1, titles: batch.join('|') });
  const redirect = new Map([...(d?.query?.normalized || []), ...(d?.query?.redirects || [])].map(r => [r.from, r.to]));
  const qid = new Map((d?.query?.pages || []).filter(p => p.pageprops?.wikibase_item).map(p => [p.title, p.pageprops.wikibase_item]));
  for (const t of batch) { let to = t; for (let i = 0; i < 3 && redirect.has(to); i++) to = redirect.get(to); if (qid.has(to)) item.set(t, qid.get(to)); }
  await wait(200);
}
const FILM = ['Q11424', 'Q24869', 'Q202866', 'Q506240', 'Q24862', 'Q229390', 'Q2484376'], GAME = ['Q7889'], TVS = ['Q5398426', 'Q15416', 'Q581714', 'Q117467246', 'Q63952888', 'Q1259759'];
const claims = new Map(), labels = new Set();
for (const batch of chunk([...new Set(item.values())], 50)) {
  const d = await wd({ action: 'wbgetentities', ids: batch.join('|'), props: 'claims' });
  for (const [id, e] of Object.entries(d?.entities || {})) {
    const vals = (p) => (e.claims?.[p] || []).map(c => c.mainsnak?.datavalue?.value);
    const c = { kinds: vals('P31').map(v => v?.id), genres: vals('P136').map(v => v?.id), years: vals('P577').map(v => +String(v?.time || '').slice(1, 5)).filter(Boolean), mpa: vals('P1657').map(v => v?.id), esrb: vals('P852').map(v => v?.id) };
    claims.set(id, c);
    [...c.mpa, ...c.esrb].forEach(x => x && labels.add(x));
  }
  await wait(200);
}
const name = new Map();
for (const batch of chunk([...labels], 50)) {
  const d = await wd({ action: 'wbgetentities', ids: batch.join('|'), props: 'labels', languages: 'en' });
  for (const [id, e] of Object.entries(d?.entities || {})) name.set(id, e.labels?.en?.value || id);
}
const out = {};
for (const t of tries) {
  for (const title of t.titles) {
    const c = claims.get(item.get(title));
    if (!c) continue;
    const yearOk = !t.q.year || !c.years.length || c.years.some(y => Math.abs(y - t.q.year) <= 1);
    if (t.q.type === 'movie' && c.kinds.some(k => FILM.includes(k)) && yearOk) { if (c.mpa.length) out[t.key] = name.get(c.mpa[0]); break; }
    if (t.q.type === 'game' && c.kinds.some(k => GAME.includes(k)) && yearOk) { if (c.esrb.length) out[t.key] = name.get(c.esrb[0]); break; }
    if (t.q.type === 'tv' && c.kinds.some(k => TVS.includes(k))) { if ([...c.kinds, ...c.genres].includes('Q15416')) out[t.key] = "children's"; break; }
  }
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
const tally = {}; for (const v of Object.values(out)) tally[v] = (tally[v] || 0) + 1;
console.log(titles.length, 'titles', Object.keys(out).length, 'rated', tally);

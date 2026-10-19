// v74 Seasons of film: which bank films suit Halloween, the holidays or summer, from Wikidata, reached
// through each film's English Wikipedia article (film and year checked, as in harvest-directors.mjs).
// Halloween: a genre (P136) labelled horror, slasher, zombie, vampire, ghost or monster. Holiday: a
// genre labelled Christmas. Wikidata tags horror loosely (Apocalypse Now, The Terminator), so a
// Halloween film must also sit in one of Wikipedia's "... horror films" categories. Summer: an action, sci-fi or animated bank film first released in May to
// August, 1975 on (Jaws made the summer blockbuster). Writes scripts/harvest-seasons.json as
// { "Title|year": ["halloween", ...] }; --merge writes `seasons` into every bank copy.
import fs from 'fs';
import { get, wait } from './wq.mjs';
const BANKS = ['../quotes.json', '../ios/Quotable/Resources/quotes.json', '../macos/Quotable/Resources/quotes.json'].map(p => new URL(p, import.meta.url).pathname);
const OUT = new URL('./harvest-seasons.json', import.meta.url).pathname;
export function seasonsOf(genreLabels, months, year, bankGenre) {
  const g = genreLabels.join(' | ').toLowerCase(), out = [];
  if (/horror|slasher|zombie|vampire|ghost|monster film/.test(g)) out.push('halloween');
  if (/christmas/.test(g)) out.push('holiday');
  if (year >= 1975 && ['action', 'scifi', 'cartoon'].includes(bankGenre) && months.some(m => m >= 5 && m <= 8)) out.push('summer');
  return out;
}

if (process.argv[1]?.endsWith('harvest-seasons.mjs') && process.argv[2] === '--merge') {
  const found = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  for (const p of BANKS) {
    const bank = JSON.parse(fs.readFileSync(p, 'utf8'));
    bank.forEach(q => { const s = found[`${q.answer}|${q.year}`]; if (q.type === 'movie' && s?.length) q.seasons = s; });
    fs.writeFileSync(p, JSON.stringify(bank, null, 2) + '\n');
  }
  console.log(Object.keys(found).length, 'films tagged');
} else if (process.argv[1]?.endsWith('harvest-seasons.mjs')) {
  const bank = JSON.parse(fs.readFileSync(BANKS[0], 'utf8'));
  const films = [...new Map(bank.filter(q => q.type === 'movie' && q.year).map(q => [`${q.answer}|${q.year}`, q])).values()];
  const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));
  const wp = (p) => get('https://en.wikipedia.org/w/api.php?format=json&formatversion=2&' + new URLSearchParams(p));
  const wd = (p) => get('https://www.wikidata.org/w/api.php?format=json&formatversion=2&' + new URLSearchParams(p));
  const tries = films.map(f => ({ f, titles: [`${f.answer} (${f.year} film)`, `${f.answer} (film)`, f.answer] }));
  const item = new Map();
  for (const batch of chunk([...new Set(tries.flatMap(t => t.titles))], 50)) {
    const d = await wp({ action: 'query', prop: 'pageprops', ppprop: 'wikibase_item', redirects: 1, titles: batch.join('|') });
    const redirect = new Map([...(d?.query?.normalized || []), ...(d?.query?.redirects || [])].map(r => [r.from, r.to]));
    const qid = new Map((d?.query?.pages || []).filter(p => p.pageprops?.wikibase_item).map(p => [p.title, p.pageprops.wikibase_item]));
    for (const t of batch) { let to = t; for (let i = 0; i < 3 && redirect.has(to); i++) to = redirect.get(to); if (qid.has(to)) item.set(t, qid.get(to)); }
    await wait(200);
  }
  const claims = new Map();
  for (const batch of chunk([...new Set(item.values())], 50)) {
    const d = await wd({ action: 'wbgetentities', ids: batch.join('|'), props: 'claims' });
    for (const [id, e] of Object.entries(d?.entities || {})) {
      const vals = (p) => (e.claims?.[p] || []).map(c => c.mainsnak?.datavalue?.value);
      const dates = vals('P577').map(v => String(v?.time || '')).filter(Boolean);
      claims.set(id, {
        film: vals('P31').some(v => ['Q11424', 'Q24869', 'Q202866', 'Q506240', 'Q24862', 'Q229390', 'Q2484376'].includes(v?.id)),
        years: dates.map(t => +t.slice(1, 5)), months: dates.map(t => +t.slice(6, 8)).filter(Boolean), genres: vals('P136').map(v => v?.id).filter(Boolean),
      });
    }
    await wait(200);
  }
  const label = new Map();
  for (const batch of chunk([...new Set([...claims.values()].flatMap(c => c.genres))], 50)) {
    const d = await wd({ action: 'wbgetentities', ids: batch.join('|'), props: 'labels', languages: 'en' });
    for (const [id, e] of Object.entries(d?.entities || {})) if (e.labels?.en) label.set(id, e.labels.en.value);
    await wait(200);
  }
  const out = {};
  for (const { f, titles } of tries) for (const t of titles) {
    const c = claims.get(item.get(t));
    if (!c?.film || !c.years.some(y => Math.abs(y - f.year) <= 1)) continue;
    let s = seasonsOf(c.genres.map(g => label.get(g) || ''), c.months, f.year, f.genre);
    if (s.includes('halloween')) {
      const d = await wp({ action: 'query', prop: 'categories', cllimit: 500, redirects: 1, titles: t });
      if (!(d?.query?.pages?.[0]?.categories || []).some(k => / horror films$/.test(k.title))) s = s.filter(x => x !== 'halloween');
      await wait(100);
    }
    if (s.length) out[`${f.answer}|${f.year}`] = s;
    break;
  }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  const n = (s) => Object.values(out).filter(v => v.includes(s)).length;
  console.log(films.length, 'films:', n('halloween'), 'halloween,', n('holiday'), 'holiday,', n('summer'), 'summer');
}

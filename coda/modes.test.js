const assert = require('assert');
const { build } = require('./modes');
const bank = require('./quotes.json');
let seed = 1;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Who said it
const q = bank.find(x => x.type === 'movie' && x.character);
const w = build('who', q, bank, rand);
assert.equal(w.answer, q.character.replace(/\s*\/\s*/g, ' / '));
assert.equal(w.quote, q.quote, 'the line stays for quote ids');
assert.equal(w.options.length, 4);
assert.equal(new Set(w.options).size, 4);
assert(w.options.includes(q.character));
assert(w.prompt.includes(q.answer));
assert.equal(build('who', bank.find(x => x.type === 'music'), bank, rand), null, 'songs have no character');
const playable = bank.filter(x => build('who', x, bank, rand)).length;
assert(playable > 1000, `only ${playable} who-said-it lines`);
assert.equal(build('classic', q, bank), q);

// Finish the line
const f = build('finish', q, bank, rand);
assert(f.display.includes('_____') && !f.display.toLowerCase().includes(` ${f.answer} `), f.display);
assert.equal(f.options.length, 4);
assert(f.options.includes(f.answer));
assert(f.options.every(o => Math.abs(o.length - f.answer.length) <= 1));
const fin = bank.slice(0, 300).filter(x => build('finish', x, bank, rand)).length;
assert(fin > 250, `only ${fin} of 300 finish lines`);

// Misquotes
const { pool } = require('./modes');
const mq = pool('misquote', [], bank, rand);
assert(mq.length >= 15);
for (const m of mq) {
  assert.equal(m.options.length, 4, m.answer);
  assert.equal(new Set(m.options).size, 4, `duplicate option in ${m.character}`);
  assert(m.options.includes(m.answer) && m.options.includes(m.display), m.character);
  assert.notEqual(m.answer, m.display);
}
assert.equal(pool('who', [q], bank, rand).length, 1);

// Timeline: four titles, the answer is the oldest, no letters or codes anywhere
const tl = pool('timeline', bank, bank, rand);
assert.equal(tl.length, 20);
for (const t of tl) {
  assert.equal(new Set(t.options).size, 4);
  assert(t.options.includes(t.answer));
  const later = t.character.match(/\((\d{4})\)/g).map(y => +y.slice(1, 5)), first = +t.character.match(/came out in (\d{4})/)[1];
  assert(later.every(y => y > first), t.character);
  assert(t.options.every(o => !/^[A-D](, [A-D])*$/.test(o)));
}
assert.equal(pool('timeline', bank.slice(0, 3), bank, rand).length, 0, 'three lines make no timeline');

// Poster reveal
const po = pool('poster', bank, bank, rand);
assert(po.length > 100, `only ${po.length} posters`);
assert.equal(new Set(po.map(p => p.answer)).size, po.length, 'one question per title');
assert(po.every(p => p.image.includes('tmdb') && p.options.includes(p.answer) && !p.square));
const al = pool('album', bank, bank, rand);
assert(al.length > 30 && al.every(a => a.square && a.image.includes('mzstatic')), `${al.length} covers`);

// Name the year: four years, the right one among them, no future years; every year in range ends
const thisYear = new Date().getFullYear();
for (let y0 = 1900; y0 <= thisYear; y0++) {
  const o = pool('year', [{ year: y0, answer: 'X', quote: 'q', options: [] }], bank, rand)[0].options;
  assert.equal(new Set(o).size, 4, `${y0}: ${o}`);
}
const yr = pool('year', bank, bank, rand);
assert(yr.length > 1000);
for (const y of yr.slice(0, 300)) {
  assert.equal(new Set(y.options).size, 4);
  assert(y.options.includes(y.answer));
  assert(y.options.every(o => +o <= thisYear), y.options.join());
  if (+y.answer < thisYear - 12) assert(y.options.every(o => y.options.every(p => p === o || Math.abs(+o - +p) >= 3)), y.options.join());
  assert(!y.prompt.includes(y.answer));
}

// Marathon: the whole bank, genres taking turns
const ma = pool('marathon', [], bank, rand).reverse();
assert.equal(ma.length, bank.length);
assert.equal(new Set(ma.slice(0, 15).map(q => q.genre)).size, 15, 'the first fifteen are fifteen genres');

// Said or written: two answers, both kinds present, every line with its reason
const im = pool('improv', [], bank, rand);
assert(im.length >= 16);
assert(im.every(q => q.options.length === 2 && q.options.includes(q.answer) && q.character.length > 20));
assert.equal(new Set(im.map(q => q.answer)).size, 2);

// Director: a real director, three others, the film's title in the prompt
const di = pool('director', bank, bank, rand);
assert(di.length > 500, `${di.length} director questions`);
assert(di.every(q => q.options.length === 4 && new Set(q.options).size === 4 && q.options.includes(q.answer) && q.prompt.startsWith('Who directed')));
const jaws = build('director', bank.find(q => q.answer === 'Jaws' && q.director), bank, rand);
assert.equal(jaws.answer, 'Steven Spielberg');
// Actor: only lines whose character matched one cast entry
const ac = pool('actor', bank, bank, rand);
assert(ac.every(q => q.options.length === 4 && new Set(q.options).size === 4 && q.options.includes(q.answer)));

// Album: the song's album among four
const ab = pool('record', bank, bank, rand);
assert(ab.length > 80, `${ab.length} album questions`);
assert(ab.every(q => q.options.length === 4 && new Set(q.options).size === 4 && q.options.includes(q.answer)));
assert.equal(build('record', bank.find(q => q.song === 'Bohemian Rhapsody'), bank, rand).answer, 'A Night at the Opera');

// Phrases: the word shown plainly, four different works, the meaning in the reveal
const ph = pool('phrase', [], bank, rand);
assert(ph.length >= 15, `${ph.length} phrases`);
assert(ph.every(q => q.plain && q.options.length === 4 && new Set(q.options).size === 4 && q.options.includes(q.answer) && / means ./.test(q.character)));
assert(!ph.some(q => q.plain === 'gaslight' || q.plain === 'Pollyanna'), 'a word inside its own title answers itself');
assert.equal(ph.find(q => q.plain === 'muggle').answer, 'Harry Potter and the Philosopher\u2019s Stone');

// Original languages: four films of the same language, never a dub of an English film
const wo = pool('world', [], bank, rand);
assert(wo.length > 100, `${wo.length} world lines`);
const W = require('./world-data.json');
const langOf = new Map(W.map(d => [d.answer, d.lang]));
assert(wo.every(q => q.options.length === 4 && new Set(q.options).size === 4 && q.options.includes(q.answer) && new Set(q.options.map(o => langOf.get(o))).size === 1));
assert(!wo.some(q => /Godfather|Opera|EuroTrip|Grimm/.test(q.character)), 'dubs of English films stay out');
console.log('modes ok', playable, fin, mq.length, tl.length, po.length, al.length, yr.length, ma.length, im.length, di.length, ac.length, ab.length, ph.length, wo.length);

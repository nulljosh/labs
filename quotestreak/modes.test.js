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
console.log('modes ok', playable, fin, mq.length, tl.length, po.length, al.length);

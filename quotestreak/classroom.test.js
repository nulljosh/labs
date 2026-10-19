const assert = require('assert');
const { LIST, pack, csv } = require('./classroom');
const { plan } = require('./party');
const bank = require('./quotes.json');
for (const [id] of LIST) {
  const p = pack(id, bank);
  assert(p.lines.length >= 10, `${id} has ${p.lines.length} lines`);
  assert(new Set(p.lines.map(l => l.answer)).size >= 4, `${id} needs four answers`);
  const [round] = plan(bank, false, Math.random, p);
  assert.equal(round.quotes.length, 10);
  assert(round.quotes.every(q => q.options.length === 4 && new Set(q.options).size === 4 && q.options.includes(q.answer)), id);
}
assert.equal(pack('nope'), undefined);
assert.equal(csv([{ name: 'Ann "A"', right: 7, asked: 10, score: 80 }]), 'Name,Right,Asked,Points\n"Ann ""A""",7,10,80');
console.log('classroom ok');

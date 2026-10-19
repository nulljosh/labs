const assert = require('assert');
const { SHELVES, questions } = require('./shelves');
for (const id of Object.keys(SHELVES)) {
  const qs = questions(id);
  assert(qs.length >= 10, `${id} has ${qs.length} lines`);
  assert.strictEqual(new Set(qs.map(q => q.quote)).size, qs.length, `${id} repeats a line`);
  for (const q of qs) {
    assert.strictEqual(q.options.length, 4, q.quote);
    assert.strictEqual(new Set(q.options).size, 4, q.quote);
    assert(q.options.includes(q.answer) && q.source.startsWith('https://') && q.noTally, q.quote);
  }
}
console.log('shelves ok');

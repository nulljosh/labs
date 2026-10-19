const assert = require('assert');
const { current, lines } = require('./seasons');
const at = (m, d) => new Date(Date.UTC(2026, m - 1, d, 12));
assert.strictEqual(current(at(10, 19)).id, 'halloween');
assert.strictEqual(current(at(11, 2)).id, 'halloween');
assert.strictEqual(current(at(11, 3)), null);
assert.strictEqual(current(at(12, 24)).id, 'holiday');
assert.strictEqual(current(at(1, 6)).id, 'holiday', 'wraps the new year');
assert.strictEqual(current(at(1, 7)), null);
assert.strictEqual(current(at(7, 4)).id, 'summer');
assert.strictEqual(current(at(3, 1)), null);
const bank = require('./quotes.json');
for (const s of ['halloween', 'holiday', 'summer']) {
  const n = lines(bank, s).length;
  if (bank.some(q => q.seasons)) assert(n >= 10, `${s} has only ${n} lines`);
}
console.log('seasons ok');

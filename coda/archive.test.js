const assert = require('assert');
const { days } = require('./archive');
assert.deepStrictEqual(days(1), [], 'day one has no past');
assert.deepStrictEqual(days(3), [{ day: 2, date: '2026-10-20' }, { day: 1, date: '2026-10-19' }], 'newest first, dated');
assert.strictEqual(days(400).length, 399);
console.log('archive ok');

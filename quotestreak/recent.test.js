const assert = require('assert');
const fs = require('fs');
const { week, weekNumber, SIZE } = require('./recent');
const mon = Date.UTC(2026, 9, 19), day = 86400000;
assert.strictEqual(weekNumber(mon), 0);
assert.strictEqual(weekNumber(mon + 6 * day + 1000), 0, 'same week through Sunday');
assert.strictEqual(weekNumber(mon + 7 * day), 1);
const list = Array.from({ length: 30 }, (_, i) => ({ answer: `Film ${Math.floor(i / 2)}`, quote: `line ${i}` }));
const w0 = week(list, mon), w1 = week(list, mon + 7 * day);
assert.strictEqual(w0.length, SIZE);
assert.strictEqual(new Set(w0.map(q => q.answer)).size, SIZE, 'no title twice in a week');
assert(!w1.some(q => w0.includes(q)), 'next week is new lines');
assert.strictEqual(week(list, mon + 2 * 7 * day).length, SIZE, 'wraps');
assert.deepStrictEqual(week([], mon), []);
if (fs.existsSync(`${__dirname}/recent.json`)) {
  const r = JSON.parse(fs.readFileSync(`${__dirname}/recent.json`, 'utf8'));
  assert(r.length >= SIZE, `only ${r.length} recent lines`);
  for (const q of r) assert(q.options.length === 4 && new Set(q.options).size === 4 && q.options.includes(q.answer) && q.source, q.quote);
}
console.log('recent ok');

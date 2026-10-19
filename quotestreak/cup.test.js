const assert = require('assert');
const { weekKey, quotes, bracket } = require('./cup');
const { seededShuffle } = require('./daily');
assert.equal(weekKey(new Date('2026-10-19T12:00:00Z')), '2026-W43');
assert.equal(weekKey(new Date('2027-01-01T00:00:00Z')), '2026-W53');     // ISO weeks cross the new year
assert.equal(weekKey(new Date('2026-10-25T23:00:00Z')), '2026-W43');     // Sunday is still the same week
const bank = Array.from({ length: 50 }, (_, i) => ({ quote: `q${i}` }));
const a = quotes('2026-W43', bank, seededShuffle), b = quotes('2026-W43', bank, seededShuffle);
assert.deepEqual(a, b);
assert.equal(new Set(a).size, 10);
assert.notDeepEqual(quotes('2026-W44', bank, seededShuffle), a);
const rows = [90, 80, 70, 60, 50, 40, 30, 20].map((score, i) => ({ name: `p${i + 1}`, score }));
const r = bracket(rows);
assert.equal(r.length, 3);
assert.deepEqual(r[0].map(m => [m.a.name, m.b.name]), [['p1', 'p8'], ['p2', 'p7'], ['p3', 'p6'], ['p4', 'p5']]);
assert.equal(r[2][0].winner.name, 'p1');
assert.equal(bracket(rows.slice(0, 3))[0][0].b, null);                   // a bye for the top seed
assert.deepEqual(bracket(rows.slice(0, 1)), []);
console.log('cup ok');

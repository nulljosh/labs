const assert = require('assert');
const { bracket, room } = require('./champions');
const P = (n) => Array.from({ length: n }, (_, i) => ({ code: `P${i + 1}`, name: `Seed ${i + 1}` }));
let b = bracket(P(8), []);
assert.deepEqual(b.slice(0, 4).map(m => [m.a.code, m.b.code]), [['P1', 'P8'], ['P4', 'P5'], ['P2', 'P7'], ['P3', 'P6']]);
assert(b.slice(4).every(m => !m.a && !m.b && !m.winner), 'semis wait for winners');
const results = [
  { match: 0, winner: 'P1', score_a: 60, score_b: 40 }, { match: 1, winner: 'P5', score_a: 20, score_b: 50 },
  { match: 2, winner: 'P2', score_a: 70, score_b: 10 }, { match: 3, winner: 'P6', score_a: 30, score_b: 40 },
  { match: 4, winner: 'P5', score_a: 30, score_b: 80 },
];
b = bracket(P(8), results);
assert.deepEqual([b[4].a.code, b[4].b.code], ['P1', 'P5']);
assert.deepEqual([b[5].a.code, b[5].b.code], ['P2', 'P6']);
assert.deepEqual([b[6].a.code, b[6].b?.code ?? null], ['P5', null], 'the final waits for semi two');
b = bracket(P(6), []);
assert.equal(b[0].winner.code, 'P1', 'seed 1 gets a bye when there is no seed 8');
assert.equal(b[2].winner.code, 'P2');
assert.equal(b[4].a.code, 'P1');
assert.equal(room('2026-Q4', 3), room('2026-Q4', 3));
assert.notEqual(room('2026-Q4', 3), room('2026-Q4', 4));
assert(/^[A-Z]{4}$/.test(room('2026-Q4', 6)));
console.log('champions ok');

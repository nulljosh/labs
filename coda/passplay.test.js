const assert = require('assert');
const { turn, verdict, MAX } = require('./passplay');
const three = [{ name: 'Ann', score: 30 }, { name: 'Bo', score: 50 }, { name: 'Cy', score: 10 }];
assert.deepEqual([0, 1, 2, 3, 4].map(n => turn(n, three)), [0, 1, 2, 0, 1]);
assert.equal(verdict(three), 'Bo wins with 50. Ann 30, Cy 10.');
assert.equal(verdict([{ name: 'Ann', score: 20 }, { name: 'Bo', score: 20 }]), 'Ann and Bo tie at 20.');
assert.equal(verdict([{ name: 'Ann', score: 20 }, { name: 'Bo', score: 20 }, { name: 'Cy', score: 0 }]), 'Ann and Bo tie at 20. Cy 0.');
assert.equal(MAX, 8);
console.log('passplay ok');

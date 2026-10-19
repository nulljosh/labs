const assert = require('assert');
const { encode, decode, verdict } = require('./challenge');
const { qid } = require('./difficulty');
const bank = Array.from({ length: 12 }, (_, i) => ({ quote: `line ${i}` }));
const link = encode(bank.map(q => qid(q.quote)), 70, 'Sam');
const back = decode('?' + link, bank, qid);
assert.equal(back.quotes.length, 10);
assert.equal(back.quotes[3].quote, 'line 3');
assert.deepEqual([back.score, back.name], [70, 'Sam']);
assert.equal(decode('?c=deadbeef', bank, qid), null);              // nothing left of it in the bank
assert.equal(decode('?daily', bank, qid), null);
assert.equal(decode('?c=' + qid('line 1') + '&s=x', bank, qid).score, 0);
assert.equal(verdict(80, 70, 'Sam'), 'You beat Sam, 80 to 70.');
assert.equal(verdict(10, 10, 'Sam'), 'A tie with Sam at 10.');
console.log('challenge ok');

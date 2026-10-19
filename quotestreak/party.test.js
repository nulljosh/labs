const assert = require('assert');
const { score } = require('./party');
assert.deepEqual(score('Jaws', [{ id: 'a', option: 'Jaws', at: 200 }, { id: 'b', option: 'Jaws', at: 100 }, { id: 'c', option: 'Heat', at: 50 }]), { b: 15, a: 10 });
assert.deepEqual(score('Jaws', []), {});
assert.deepEqual(score('Jaws', [{ id: 'c', option: 'Heat', at: 1 }]), {});
const { plan } = require('./party');
const bank = require('./quotes.json');
const quick = plan(bank, false);
assert.equal(quick.length, 1); assert.equal(quick[0].quotes.length, 10);
const night = plan(bank, true);
assert.equal(night.length, 4);
assert.equal(new Set(night.map(r => r.title)).size, 4, 'four different themes');
for (const r of night) {
  assert.equal(r.quotes.length, 5);
  const type = { Movies: 'movie', TV: 'tv', Games: 'game', Music: 'music', 'First lines': 'book' }[r.title];
  assert(r.quotes.every(q => q.type === type), r.title);
}
console.log('party ok');

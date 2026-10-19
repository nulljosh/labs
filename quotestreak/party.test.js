const assert = require('assert');
const { score } = require('./party');
assert.deepEqual(score('Jaws', [{ id: 'a', option: 'Jaws', at: 200 }, { id: 'b', option: 'Jaws', at: 100 }, { id: 'c', option: 'Heat', at: 50 }]), { b: 15, a: 10 });
assert.deepEqual(score('Jaws', []), {});
assert.deepEqual(score('Jaws', [{ id: 'c', option: 'Heat', at: 1 }]), {});
console.log('party ok');

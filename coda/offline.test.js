const assert = require('assert');
const { art } = require('./offline');
const bank = require('./quotes.json');
const bank2 = [{ genre: 'action', art: 'a' }, { genre: 'action', art: 'a' }, { genre: 'comedy', art: 'b' }, { genre: 'action' }];
assert.deepStrictEqual(art(bank2, ['action']), ['a'], 'once each, lines without art skipped');
assert.deepStrictEqual(art(bank2, []), []);
const all = art(bank, [...new Set(bank.map(q => q.genre))]);
assert(all.length > 100 && all.length < 1000, `${all.length} art files for every genre`);
console.log('offline ok');

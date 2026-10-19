const assert = require('assert');
const { own, read, swap, FIRST } = require('./profiles');
const live = [['quotable_high_score', '300'], ['quotestreak_badges', '{"right":9}'], ['quotestreak_family', 'false'], ['quotable_sfx_on', 'true'], ['quotestreak_look', 'noir'], ['sb_token', 'x']];
assert.deepStrictEqual(Object.keys(own(live)).sort(), ['quotable_high_score', 'quotestreak_badges', 'quotestreak_family'], 'device settings and tokens stay with the device');
const book = read(null);
assert.strictEqual(book.active, FIRST);
assert.strictEqual(read('garbage').active, FIRST);
// Add a kid: the parent's progress is filed away, the kid starts empty.
const a = swap(book, live, 'Mia');
assert.deepStrictEqual(a.set, {});
assert.deepStrictEqual(a.remove.sort(), ['quotable_high_score', 'quotestreak_badges', 'quotestreak_family']);
assert.strictEqual(a.book.active, 'Mia');
assert.strictEqual(a.book.list[FIRST].quotable_high_score, '300');
// The kid plays with family mode on, then hands back: both come out intact.
const b = swap(a.book, [['quotable_high_score', '40'], ['quotestreak_family', 'true'], ['quotestreak_look', 'noir']], FIRST);
assert.strictEqual(b.set.quotable_high_score, '300');
assert.strictEqual(b.set.quotestreak_family, 'false');
assert.strictEqual(b.book.list.Mia.quotestreak_family, 'true');
assert.deepStrictEqual(Object.keys(b.book.list), [FIRST, 'Mia']);
console.log('profiles ok');

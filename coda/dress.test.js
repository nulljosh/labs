const assert = require('assert');
const fs = require('fs');
const { LIST, open, src } = require('./dress');
assert.deepStrictEqual(open(1), []);
assert.deepStrictEqual(open(6), ['bowtie', 'headphones', 'beret']);
assert.strictEqual(open(50).length, LIST.length);
assert.strictEqual(src('brand/quip-cheer.svg', 'beret'), 'brand/outfits/quip-cheer-beret.svg');
assert.strictEqual(src('brand/quip-oops-dark.svg', 'tophat'), 'brand/outfits/quip-oops-tophat-dark.svg');
assert.strictEqual(src('brand/outfits/quip-oops-tophat-dark.svg', 'shades'), 'brand/outfits/quip-oops-shades-dark.svg', 'switches outfits');
assert.strictEqual(src('brand/outfits/quip-idle-beret.svg', ''), 'brand/quip-idle.svg', 'undresses');
assert.strictEqual(src('brand/quip-idle.svg', ''), 'brand/quip-idle.svg');
for (const o of LIST) for (const p of ['idle', 'cheer', 'oops', 'streak']) for (const d of ['', '-dark'])
  assert(fs.existsSync(`${__dirname}/brand/outfits/quip-${p}-${o.id}${d}.svg`), `missing ${p} ${o.id}${d}`);
console.log('dress ok');

const assert = require('assert');
const { build } = require('./modes');
const bank = require('./quotes.json');
let seed = 1;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Who said it
const q = bank.find(x => x.type === 'movie' && x.character);
const w = build('who', q, bank, rand);
assert.equal(w.answer, q.character);
assert.equal(w.quote, q.quote, 'the line stays for quote ids');
assert.equal(w.options.length, 4);
assert.equal(new Set(w.options).size, 4);
assert(w.options.includes(q.character));
assert(w.prompt.includes(q.answer));
assert.equal(build('who', bank.find(x => x.type === 'music'), bank, rand), null, 'songs have no character');
const playable = bank.filter(x => build('who', x, bank, rand)).length;
assert(playable > 1000, `only ${playable} who-said-it lines`);
assert.equal(build('classic', q, bank), q);
console.log('modes ok', playable);

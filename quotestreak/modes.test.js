const assert = require('assert');
const { build } = require('./modes');
const bank = require('./quotes.json');
let seed = 1;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Who said it
const q = bank.find(x => x.type === 'movie' && x.character);
const w = build('who', q, bank, rand);
assert.equal(w.answer, q.character.replace(/\s*\/\s*/g, ' / '));
assert.equal(w.quote, q.quote, 'the line stays for quote ids');
assert.equal(w.options.length, 4);
assert.equal(new Set(w.options).size, 4);
assert(w.options.includes(q.character));
assert(w.prompt.includes(q.answer));
assert.equal(build('who', bank.find(x => x.type === 'music'), bank, rand), null, 'songs have no character');
const playable = bank.filter(x => build('who', x, bank, rand)).length;
assert(playable > 1000, `only ${playable} who-said-it lines`);
assert.equal(build('classic', q, bank), q);

// Finish the line
const f = build('finish', q, bank, rand);
assert(f.display.includes('_____') && !f.display.toLowerCase().includes(` ${f.answer} `), f.display);
assert.equal(f.options.length, 4);
assert(f.options.includes(f.answer));
assert(f.options.every(o => Math.abs(o.length - f.answer.length) <= 1));
const fin = bank.slice(0, 300).filter(x => build('finish', x, bank, rand)).length;
assert(fin > 250, `only ${fin} of 300 finish lines`);
console.log('modes ok', playable, fin);

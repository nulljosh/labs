const assert = require('assert');
const { ok } = require('./match');
[['casablanca', 'Casablanca'], ['Godfather', 'The Godfather'], ['beyonce', 'Beyoncé'], ['Casablaca', 'Casablanca'],
  ['anchorman', 'Anchorman: The Legend of Ron Burgundy'], ['airplane', 'Airplane!'], ['ac dc', 'AC/DC'], ['bon jovi', 'Bon Jovi']]
  .forEach(([t, a]) => assert.strictEqual(ok(t, a), true, `${t} should match ${a}`));
[['', 'Alien'], ['Babe', 'Jaws'], ['Back to the Future', 'Back to the Future Part II'], ['300', '2001: A Space Odyssey']]
  .forEach(([t, a]) => assert.strictEqual(ok(t, a), false, `${t} should not match ${a}`));
console.log('match ok');

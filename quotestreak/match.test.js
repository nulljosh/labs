const assert = require('assert');
const { ok } = require('./match');
[['casablanca', 'Casablanca'], ['Godfather', 'The Godfather'], ['beyonce', 'Beyoncé'], ['Casablaca', 'Casablanca'],
  ['anchorman', 'Anchorman: The Legend of Ron Burgundy'], ['airplane', 'Airplane!'], ['ac dc', 'AC/DC'], ['bon jovi', 'Bon Jovi']]
  .forEach(([t, a]) => assert(ok(t, a), `${t} should match ${a}`));
[['', 'Alien'], ['Babe', 'Jaws'], ['Back to the Future', 'Back to the Future Part II'], ['300', '2001: A Space Odyssey']]
  .forEach(([t, a]) => assert(!ok(t, a), `${t} should not match ${a}`));
const { pick } = require('./match');
const opts = ['Jaws', 'Alien', 'The Godfather', 'Back to the Future'];
assert.equal(pick(['jaws'], opts), 'Jaws');
assert.equal(pick(['I think it\'s the godfather'], opts), 'The Godfather');
assert.equal(pick(['jars', 'jaws'], opts), 'Jaws', 'a later alternative can win');
assert.equal(pick(['no idea'], opts), null);
assert.equal(pick(['nineteen'], ['1995', '2000']), null);
assert.equal(pick(['2000'], ['1995', '2000', '2008', '1993']), '2000');
console.log('match ok');

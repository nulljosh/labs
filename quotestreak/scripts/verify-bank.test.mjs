import assert from 'assert';
import { found } from './verify-bank.mjs';
const page = "Rick: Of all the gin joints in all the towns in all the world, she walks into mine. Louis: Round up the usual suspects.";
assert(found('Of all the gin joints in all the towns in all the world, she walks into mine.', page));
assert(found('Of all the gin joints, in all the towns in all the world, she walks into mine!', page), 'punctuation differs');
assert(found('Round up the usual suspects.', page), 'short lines match whole');
assert(!found('Here’s looking at you, kid.', page));
assert(!found('Of all the bars in all the cities on earth, he walks into mine.', page), 'a paraphrase is not a match');
console.log('verify-bank ok');

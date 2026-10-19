import assert from 'assert';
import { entry } from './pull-submissions.mjs';
const bank = [{ answer: 'Casablanca', type: 'movie', genre: 'classic', art: 'a.jpg' }, ...['Jaws', 'Heat', 'Alien', 'Rocky'].map(a => ({ answer: a, type: 'movie', genre: 'action' })), { answer: 'Friends', type: 'tv', genre: 'sitcom' }];
const e = entry({ quote: 'Here’s looking at you, kid.', answer: 'Casablanca', type: 'movie', year: 1942, who: 'Rick' }, bank);
assert.strictEqual(e.genre, 'classic'); assert.strictEqual(e.art, 'a.jpg'); assert.strictEqual(e.character, 'Rick');
assert.strictEqual(e.options.length, 4); assert(e.options.includes('Casablanca')); assert(!e.options.includes('Friends'), 'wrong answers share the type');
assert.strictEqual(new Set(e.options).size, 4);
assert.strictEqual(entry({ quote: 'x', answer: 'New Show', type: 'tv' }, bank).genre, 'tvdrama');
console.log('pull-submissions ok');

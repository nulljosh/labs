// One runnable check for the filtering and validation — the only real logic here.
import assert from 'node:assert/strict';
import { callTool, ToolError } from './tools.js';
import quotes from '../../quotes.json' with { type: 'json' };
import more from '../../quotes-more.json' with { type: 'json' };
const all = [...quotes, ...more];

const genres = callTool('list_genres');
assert.ok(genres.total > 0);
assert.equal(genres.genres.reduce((n, g) => n + g.count, 0), genres.total);

// Use a genre/type pair that exists; most pairs are empty and rightly throw.
const q = callTool('random_quote', { genre: quotes[0].genre, type: quotes[0].type });
assert.ok(q.options.includes(q.answer), 'the answer must be among its own options');

const hit = callTool('search_quotes', { q: q.answer, limit: 1 });
assert.equal(hit.results.length, 1);
assert.ok(hit.total >= 1);

// Bad input is the caller's to fix, so it has to be named rather than silently ignored.
assert.throws(() => callTool('random_quote', { genre: 'nope' }), ToolError);
assert.throws(() => callTool('search_quotes', { q: '' }), ToolError);
assert.throws(() => callTool('search_quotes', { q: 'a', limit: 999 }), ToolError);
assert.throws(() => callTool('random_quote', { genre: 'action', type: 'book' }), ToolError);
assert.equal(callTool('nope'), null);

console.log('tools: ok');

// v79: the API's daily is the game's daily, and it keeps the answer back unless asked.
import { createRequire } from 'node:module';
const Daily = createRequire(import.meta.url)('../../daily.js');
const d = callTool('daily_quote');
assert.equal(d.quote, Daily.quoteFor(Daily.dayNumber(), quotes).quote);
assert.equal(d.answer, undefined);
assert.ok(callTool('daily_quote', { reveal: 'true' }).answer);
const page = callTool('list_quotes', { offset: 100, limit: 200 });
assert.equal(page.total, all.length, 'the API serves both banks (v100)');
assert.equal(page.results[0].quote, all[100].quote);
assert.equal(page.results.length, 200);
assert.throws(() => callTool('list_quotes', { limit: 500 }), ToolError);
console.log('tools ok');

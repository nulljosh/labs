// node --test: the Daily Quote has to be identical for every player and never repeat early.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const Daily = require('./daily.js');
const bank = require('./quotes.json');

test('day one is 2026-10-19 UTC and days roll at midnight UTC', () => {
  assert.equal(Daily.dayNumber(Date.UTC(2026, 9, 19, 0, 0)), 1);
  assert.equal(Daily.dayNumber(Date.UTC(2026, 9, 19, 23, 59)), 1);
  assert.equal(Daily.dayNumber(Date.UTC(2026, 9, 20, 0, 0)), 2);
});

test('everyone gets the same quote and the same board on the same day', () => {
  const a = Daily.quoteFor(42, bank), b = Daily.quoteFor(42, bank);
  assert.equal(a.quote, b.quote);
  assert.deepEqual(a.options, b.options);
  assert.ok(a.options.includes(a.answer));
});

test('no quote repeats until the whole bank has had a day', () => {
  const seen = new Set();
  for (let d = 1; d <= bank.length; d++) seen.add(Daily.quoteFor(d, bank).quote);
  assert.equal(seen.size, bank.length);
});

test('the streak counts days in a row answered right', () => {
  let s = Daily.nextStreak(null, 10, true);
  assert.equal(s.count, 1);
  s = Daily.nextStreak(s, 11, true);
  assert.equal(s.count, 2);
  assert.equal(Daily.nextStreak(s, 13, true).count, 1, 'a skipped day starts over');
  assert.equal(Daily.nextStreak(s, 12, false).count, 0, 'a miss resets');
  assert.equal(Daily.currentStreak(s, 12), 2);
  assert.equal(Daily.currentStreak(s, 13), 0, 'shows zero once a day is skipped');
});

test('the share text names the day, the result and the link', () => {
  const t = Daily.shareText(7, true, 3);
  assert.match(t, /Daily #7/);
  assert.match(t, /Day streak: 3/);
  assert.match(t, /coda\.jaybulb\.com\/play\?daily/);
});

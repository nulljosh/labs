import { test } from 'node:test'
import assert from 'node:assert/strict'
import { stats } from './score.js'

test('perfect 60s run', () => {
  const words = 'the quick brown fox jumps'.split(' ')
  const s = stats(words, words, 60)
  assert.equal(s.raw, 5)          // 25 chars incl. 4 spaces = 5 "words"
  assert.equal(s.wpm, 5)
  assert.equal(s.accuracy, 100)
  assert.equal(s.correctWords, 5)
})

test('errors lower wpm but not raw', () => {
  const s = stats(['teh', 'cat'], ['the', 'cat'], 30)
  assert.equal(s.raw, 3)          // 7 chars in 0.5 min
  assert.equal(s.correct, 4)      // 't' + 'cat'
  assert.equal(s.wrong, 3)        // 'e','h' + the space after a wrong word
  assert.equal(s.correctWords, 1)
  assert.ok(s.wpm < s.raw)
})

test('zero time does not divide by zero', () => {
  assert.doesNotThrow(() => stats([], [], 0))
})

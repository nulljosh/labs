import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Session, PASTE_MAX } from './session.js'
import { stats } from './score.js'
import { WORDS, QUOTES } from './words.js'

// Same cases as kmp/ SessionTest and apple/ SessionTests. A case that fails here but passes there is a bug here.
const seeded = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32)
const make = (kind, n, seed, extra = {}) => new Session({ kind, n, words: WORDS, quotes: QUOTES, random: seeded(seed), ...extra })
const typeAll = (s, ws, t0 = 1000) => { let text = s.text; ws.forEach((w, i) => { text += w + ' '; s.setText(text, t0 + i * 100) }) }

test('words mode finishes after the last space', () => {
  const s = make('words', 25, 1), ws = [...s.target]
  typeAll(s, ws.slice(0, -1))
  assert.equal(s.done, false)
  s.setText(s.text + ws.at(-1), 9000); assert.equal(s.done, false)
  s.setText(s.text + ' ', 9100); assert.equal(s.done, true)
  assert.equal(s.result.correctWords, 25); assert.equal(s.result.accuracy, 100)
})

test('backspace steps back only into a wrong word', () => {
  const s = make('words', 25, 2), first = s.target[0]
  assert.ok(s.setText('zz ', 1000))
  assert.ok(s.setText('zz', 1050)) // the space deleted: back into the wrong word
  assert.equal(s.current, 'zz')
  assert.ok(s.setText(first + ' ', 1100))
  assert.equal(s.setText(first, 1150), false) // a correct word stays closed
  assert.equal(s.text, first + ' ')
})

test('finished words cannot be edited', () => {
  const s = make('words', 25, 8)
  s.setText('zz ', 1000)
  assert.equal(s.setText('yy ', 1100), false)
  assert.equal(s.text, 'zz ')
})

test('batched input lands like slow typing', () => {
  const s = make('words', 25, 9), [a, b] = s.target
  assert.ok(s.setText(`${a} ${b} `, 1000))
  assert.deepEqual(s.typed, [a, b, ''])
})

test('timed run stops at n seconds and scores on n', () => {
  const s = make('time', 15, 3)
  typeAll(s, s.target.slice(0, 10))
  s.tick(1000 + 14900); assert.equal(s.done, false)
  s.tick(1000 + 15080) // a late tick
  assert.equal(s.done, true)
  assert.deepEqual(s.result, stats(s.typed.slice(0, -1), s.target, 15))
})

test('timed stream refills before the end', () => {
  const s = make('time', 60, 4), before = s.target.length
  typeAll(s, s.target.slice(0, 100))
  assert.ok(s.target.length > before)
})

test('quote mode ends with its last word', () => {
  const s = make('quote', 1, 5)
  assert.equal(s.total, s.target.length)
  typeAll(s, [...s.target]); assert.ok(s.done)
})

test('quote mode never repeats the quote just typed', () => {
  for (let seed = 1; seed < 40; seed++) {
    const first = make('quote', 1, seed).target.join(' ')
    assert.notEqual(make('quote', 1, seed, { avoid: first }).target.join(' '), first)
  }
})

test('trailing empty word is not scored', () => {
  const s = make('time', 15, 6)
  typeAll(s, s.target.slice(0, 3)); s.tick(1000 + 16000)
  assert.equal(s.result.correctWords, 3)
})

test('punctuation adds marks, apostrophes and hyphens, and numbers stay rare', () => {
  const s = make('words', 50, 7, { punct: true })
  assert.ok(s.target.some(w => /[^a-z]/i.test(w)))
  assert.equal(s.target.length, 50)
  const many = Array.from({ length: 40 }, (_, i) => make('words', 50, 100 + i, { punct: true }).target).flat()
  assert.ok(many.some(w => w.endsWith("'s")) && many.some(w => /^[a-z]+-[a-z]+/i.test(w)))
  const numbers = many.filter(w => /^\d+$/.test(w)).length / many.length
  assert.ok(numbers > 0 && numbers < 0.08, `numbers ${numbers}`)
})

test('keystroke accuracy counts a fixed typo, final accuracy forgives it', () => {
  const s = make('words', 2, 3), [a, b] = s.target
  const wrong = a[0] === 'x' ? 'y' : 'x'
  s.setText(wrong, 1000)                 // a wrong first key
  s.setText('', 1100)                    // backspaced
  s.setText(a + ' ' + b + ' ', 1200)     // then typed right
  assert.equal(s.done, true)
  assert.equal(s.result.accuracy, 100)
  const keys = 1 + a.length + 1 + b.length + 1
  assert.equal(s.keys, keys); assert.equal(s.hits, keys - 1)
  assert.equal(s.keyAccuracy, Math.round(((keys - 1) / keys) * 100))
  assert.equal(make('time', 15, 4).keyAccuracy, 100) // nothing typed
})

test('a pasted burst marks the run so it cannot set a best; typing does not', () => {
  const typed = make('words', 25, 5), ws = [...typed.target]
  typeAll(typed, ws)
  assert.equal(typed.done, true); assert.equal(typed.pasted, false)
  const pasted = make('words', 25, 5)
  pasted.setText(pasted.target.join(' ') + ' ', 1000)
  assert.equal(pasted.done, true); assert.equal(pasted.pasted, true)
  assert.ok(PASTE_MAX >= 12) // room for a phone's word suggestion
})

test('once over, the counter shows the time the run is scored on', () => {
  const w = make('words', 2, 6), [a, b] = w.target
  w.setText(a + ' ', 1000); w.setText(a + ' ' + b + ' ', 3500)
  assert.equal(w.elapsed, '2.5s')
  const t = make('time', 15, 7)
  t.setText(t.target[0], 1000); t.tick(17000)
  assert.equal(t.elapsed, '15s') // a late tick never adds time
  assert.equal(make('time', 15, 8).elapsed, '')
})

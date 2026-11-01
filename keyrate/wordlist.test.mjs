import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { swift, kotlin, SWIFT, KOTLIN } from './wordlist.mjs'

test('the Swift and Kotlin word lists are current (run node wordlist.mjs)', () => {
  assert.equal(readFileSync(SWIFT, 'utf8'), swift())
  assert.equal(readFileSync(KOTLIN, 'utf8'), kotlin())
})

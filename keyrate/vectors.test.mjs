import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stats } from './score.js'
import { kotlin, swift } from './vectors.mjs'

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8')

test('vectors.json matches score.js', () => {
  for (const v of JSON.parse(read('./vectors.json'))) assert.deepEqual(stats(v.typed, v.target, v.seconds), v.expect)
})

test('generated Kotlin and Swift tests are current (run node vectors.mjs)', () => {
  assert.equal(read('./kmp/shared/src/commonTest/kotlin/com/nulljosh/keyrate/VectorsTest.kt'), kotlin())
  assert.equal(read('./apple/KeyrateTests/VectorsTests.swift'), swift())
})

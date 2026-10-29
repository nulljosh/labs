package com.nulljosh.keyrate

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

// Port of score.test.mjs plus the Swift checks. A case that fails here but passes there is a bug here.
class ScoreTest {
    @Test fun perfect60sRun() {
        val words = "the quick brown fox jumps".split(" ")
        val s = stats(words, words, 60.0)
        assertEquals(5, s.raw) // 25 chars incl. 4 spaces = 5 "words"
        assertEquals(5, s.wpm)
        assertEquals(100, s.accuracy)
        assertEquals(5, s.correctWords)
    }

    @Test fun errorsLowerWpmButNotRaw() {
        val s = stats(listOf("teh", "cat"), listOf("the", "cat"), 30.0)
        assertEquals(3, s.raw) // 7 chars in 0.5 min
        assertEquals(4, s.correct) // 't' + 'cat'
        assertEquals(3, s.wrong) // 'e','h' + the space after a wrong word
        assertEquals(1, s.correctWords)
        assertTrue(s.wpm < s.raw)
    }

    @Test fun zeroTimeDoesNotDivideByZero() {
        stats(emptyList(), emptyList(), 0.0)
    }

    @Test fun extraLettersCountWrong() {
        val s = stats(listOf("catss"), listOf("cat"), 60.0)
        assertEquals(3, s.correct)
        assertEquals(2, s.wrong)
        assertEquals(60, s.accuracy)
    }
}

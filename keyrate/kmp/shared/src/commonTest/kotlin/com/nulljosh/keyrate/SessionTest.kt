package com.nulljosh.keyrate

import kotlin.random.Random
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class SessionTest {
    private fun typeAll(s: Session, words: List<String>, t0: Long = 1_000) {
        var text = s.text
        words.forEachIndexed { i, w -> text += "$w "; s.setText(text, t0 + i * 100L) }
    }

    @Test fun wordsModeFinishesAfterTheLastSpace() {
        val s = Session(Mode(Kind.Words, 25), random = Random(1))
        val words = s.target.toList()
        typeAll(s, words.dropLast(1))
        assertFalse(s.done)
        s.setText(s.text + words.last(), 9_000)
        assertFalse(s.done)
        s.setText(s.text + " ", 9_100)
        assertTrue(s.done)
        assertEquals(25, s.result!!.correctWords)
        assertEquals(100, s.result!!.accuracy)
    }

    @Test fun backspaceStepsBackOnlyIntoAWrongWord() {
        val s = Session(Mode(Kind.Words, 25), random = Random(2))
        val first = s.target[0]
        assertTrue(s.setText("zz ", 1_000))
        assertTrue(s.setText("zz", 1_050)) // the space deleted: back into the wrong word
        assertEquals("zz", s.current)
        assertTrue(s.setText("$first ", 1_100))
        assertFalse(s.setText(first, 1_150)) // a correct word stays closed
        assertEquals("$first ", s.text)
    }

    @Test fun finishedWordsCannotBeEdited() {
        val s = Session(Mode(Kind.Words, 25), random = Random(8))
        s.setText("zz ", 1_000)
        assertFalse(s.setText("yy ", 1_100))
        assertEquals("zz ", s.text)
    }

    @Test fun batchedInputLandsLikeSlowTyping() {
        val s = Session(Mode(Kind.Words, 25), random = Random(9))
        val (a, b) = s.target
        assertTrue(s.setText("$a $b ", 1_000)) // two words and both spaces in one event
        assertEquals(listOf(a, b, ""), s.typed)
        assertEquals(2, s.typed.count { it.isNotEmpty() })
    }

    @Test fun timedRunStopsAtNSecondsAndScoresOnN() {
        val s = Session(Mode(Kind.Time, 15), random = Random(3))
        typeAll(s, s.target.take(10))
        s.tick(1_000 + 14_900)
        assertFalse(s.done)
        s.tick(1_000 + 15_080) // a late tick
        assertTrue(s.done)
        val expected = stats(s.typed.dropLast(1), s.target, 15.0)
        assertEquals(expected, s.result)
    }

    @Test fun timedStreamRefillsBeforeTheEnd() {
        val s = Session(Mode(Kind.Time, 60), random = Random(4))
        val before = s.target.size
        typeAll(s, s.target.take(100))
        assertTrue(s.target.size > before)
    }

    @Test fun quoteModeEndsWithItsLastWord() {
        val s = Session(Mode(Kind.Quote), random = Random(5))
        assertEquals(s.target.size, s.total)
        typeAll(s, s.target.toList())
        assertTrue(s.done)
    }

    @Test fun quoteModeNeverRepeatsTheQuoteJustTyped() {
        for (seed in 1..40) {
            val first = Session(Mode(Kind.Quote), random = Random(seed)).target.joinToString(" ")
            assertNotEquals(first, Session(Mode(Kind.Quote), random = Random(seed), avoid = first).target.joinToString(" "))
        }
    }

    @Test fun trailingEmptyWordIsNotScored() {
        val s = Session(Mode(Kind.Time, 15), random = Random(6))
        typeAll(s, s.target.take(3))
        s.tick(1_000 + 16_000)
        assertEquals(3, s.result!!.correctWords)
    }

    @Test fun punctuationAddsMarksAndNumbers() {
        val s = Session(Mode(Kind.Words, 50), punct = true, random = Random(7))
        assertTrue(s.target.any { w -> w.any { !it.isLetter() } })
        assertEquals(50, s.target.size)
    }

    @Test fun bestAndRunsAreKept() {
        val mem = HashMap<String, String>()
        val store = object : Store {
            override fun get(key: String) = mem[key]
            override fun put(key: String, value: String) { mem[key] = value }
        }
        val mode = Mode(Kind.Time, 60)
        assertEquals(50, recordRun(store, mode, 50))
        assertEquals(50, recordRun(store, mode, 40))
        assertEquals(70, recordRun(store, mode, 70))
        assertEquals(listOf(50, 40, 70), runs(store))
        repeat(40) { recordRun(store, mode, 1) }
        assertEquals(30, runs(store).size)
        assertNotNull(store.get(mode.key))
    }
}

package com.nulljosh.keyrate

import kotlin.math.max
import kotlin.math.pow
import kotlin.math.roundToInt
import kotlin.math.sqrt
import kotlin.math.tanh

data class Stats(
    val wpm: Int,
    val raw: Int,
    val accuracy: Int,
    val correct: Int,
    val wrong: Int,
    val correctWords: Int,
)

// Line-for-line port of score.js. Divergences are bugs, not features.
// Words = every 5 chars typed (incl. spaces), the 10fastfingers/Monkeytype convention.
fun stats(typed: List<String>, target: List<String>, seconds: Double): Stats {
    var correct = 0
    var wrong = 0
    var correctWords = 0
    typed.forEachIndexed { i, w ->
        val t = target.getOrElse(i) { "" }
        if (w == t) correctWords++
        for (c in w.indices) if (c < t.length && w[c] == t[c]) correct++ else wrong++
        if (i < typed.size - 1) if (w == t) correct++ else wrong++ // the space after a word counts
    }
    val min = max(seconds, 0.001) / 60
    val total = correct + wrong
    return Stats(
        wpm = (correct / 5.0 / min).roundToInt(),
        raw = (total / 5.0 / min).roundToInt(),
        accuracy = if (total > 0) (correct.toDouble() / total * 100).roundToInt() else 100,
        correct = correct,
        wrong = wrong,
        correctWords = correctWords,
    )
}

/** score.js consistency: how even the keys per second were, 0 to 100. */
fun consistencyScore(perSecond: List<Int>): Int {
    if (perSecond.size < 2) return 100
    val mean = perSecond.sum().toDouble() / perSecond.size
    if (mean == 0.0) return 0
    val cv = sqrt(perSecond.sumOf { (it - mean).pow(2) } / perSecond.size) / mean
    return (100 * (1 - tanh(cv + cv.pow(3) / 3 + cv.pow(5) / 5))).roundToInt()
}

/** score.js missedKey: the key a keystroke should have been, null if it was right. c == w.length is the space after the word. */
fun missedKey(w: String, t: String, c: Int): String? {
    if (c < w.length) return if (c >= t.length) " " else if (w[c] == t[c]) null else t[c].lowercase()
    return if (c < t.length) t[c].lowercase() else null
}

/** score.js topMisses: the five keys missed most, worst first, ties in key order. */
fun topMisses(misses: Map<String, Int>): List<Pair<String, Int>> =
    misses.entries.sortedWith(compareBy({ -it.value }, { it.key })).take(5).map { it.key to it.value }

/** score.js missedLine: the line under the keyboard on the result. */
fun missedLine(top: List<Pair<String, Int>>): String =
    if (top.isEmpty()) "no keys missed" else "missed most: " + top.joinToString(" · ") { (k, n) -> "${if (k == " ") "space" else k} $n" }

/** score.js KEY_ROWS: the keyboard the result draws. */
val KEY_ROWS = listOf("qwertyuiop", "asdfghjkl", "zxcvbnm", " ")

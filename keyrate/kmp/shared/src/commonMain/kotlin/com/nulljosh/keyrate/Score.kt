package com.nulljosh.keyrate

import kotlin.math.max
import kotlin.math.roundToInt

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

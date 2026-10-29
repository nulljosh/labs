package com.nulljosh.keyrate

import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min
import kotlin.random.Random

enum class Kind { Time, Words, Quote }

data class Mode(val kind: Kind, val n: Int = 0) {
    val label: String get() = when (kind) {
        Kind.Time -> "$n"
        Kind.Words -> "$n words"
        Kind.Quote -> "quote"
    }
    val key: String get() = "best:${kind.name.lowercase()}:$n"
}

val MODES = listOf(
    Mode(Kind.Time, 15), Mode(Kind.Time, 30), Mode(Kind.Time, 60),
    Mode(Kind.Words, 25), Mode(Kind.Words, 50), Mode(Kind.Quote),
)

/** One test, same rules as app/index.html. The UI feeds it text and clock readings, so it needs no timers of its own. */
class Session(val mode: Mode, private val punct: Boolean = false, private val random: Random = Random, avoid: String? = null) {
    val target: MutableList<String> = when (mode.kind) {
        Kind.Quote -> QUOTES.filter { it != avoid }.let { it[random.nextInt(it.size)] }.split(" ").toMutableList() // never the quote just typed
        Kind.Words -> pick(mode.n)
        Kind.Time -> pick(120)
    }
    val typed = mutableListOf("")
    var done = false
        private set
    var result: Stats? = null
        private set

    private var startMs = 0L

    /** Words to finish in word and quote mode, seconds in timed mode. */
    val total: Int get() = if (mode.kind == Kind.Quote) target.size else mode.n
    val started: Boolean get() = startMs != 0L
    val current: String get() = typed.last()

    fun remaining(nowMs: Long): Int = if (!started) mode.n else max(0, ceil(mode.n - (nowMs - startMs) / 1000.0).toInt())

    /** Every word typed so far, joined by spaces. This is what the hidden input holds. */
    val text: String get() = typed.joinToString(" ")

    /**
     * The hidden input now holds [text]. Taking the whole text, not one keystroke, means batched or
     * pasted input lands the same as slow typing. Returns false when the edit is refused (a finished
     * word was changed, or a space was deleted to reopen a correct word); put [text] back in the input.
     */
    fun setText(text: String, nowMs: Long): Boolean {
        if (done) return false
        val p = text.split(' ')
        val c = min(p.size, typed.size) - 1 // words that must be untouched
        val ok = (p.size <= target.size || (p.size == target.size + 1 && p.last().isEmpty())) && p.take(c) == typed.take(c) && when {
            p.size >= typed.size -> p.subList(c, p.size - 1).all { it.isNotEmpty() } // new commits are real words
            p.size == typed.size - 1 -> typed.last().isEmpty() && typed[c] != target[c] && p.last() == typed[c] // step back, wrong words only
            else -> false
        }
        if (!ok) return false
        if (!started && text.isNotEmpty()) startMs = nowMs
        typed.clear()
        p.take(if (mode.kind == Kind.Time) p.size else total + 1).forEachIndexed { i, w -> typed.add(w.take((target.getOrNull(i)?.length ?: 0) + 8)) }
        if (mode.kind != Kind.Time && typed.size > total) finish(nowMs)
        else if (mode.kind == Kind.Time && typed.size > target.size - 30) target += pick(60)
        return true
    }

    fun tick(nowMs: Long) {
        if (!done && started && mode.kind == Kind.Time && nowMs - startMs >= mode.n * 1000L) finish(nowMs)
    }

    private fun finish(nowMs: Long) {
        done = true
        // timed runs stop at n seconds; a late tick must not shave the wpm
        val secs = (nowMs - startMs) / 1000.0
        val seconds = if (mode.kind == Kind.Time) minOf(secs, mode.n.toDouble()) else secs
        result = stats(typed.filterIndexed { i, w -> w.isNotEmpty() || i < typed.size - 1 }, target, seconds)
    }

    private fun pick(k: Int): MutableList<String> =
        MutableList(k) { WORDS[random.nextInt(WORDS.size)] }.also { if (punct) it.replaceAll(::decorate) }

    private fun decorate(word: String): String {
        val r = random.nextDouble()
        if (r < .08) return random.nextInt(1000).toString()
        val w = if (r < .2) word.replaceFirstChar { it.uppercase() } else word
        val e = random.nextDouble()
        return w + when {
            e < .1 -> "."
            e < .2 -> ","
            e < .23 -> "?"
            e < .25 -> "!"
            else -> ""
        }
    }
}

/** Saves a finished run and returns the best wpm for its mode. Keeps the last 30 runs for the sparkline. */
fun recordRun(store: Store, mode: Mode, wpm: Int): Int {
    val best = max(store.get(mode.key)?.toIntOrNull() ?: 0, wpm)
    store.put(mode.key, best.toString())
    store.put("runs", (runs(store) + wpm).takeLast(30).joinToString(","))
    return best
}

fun runs(store: Store): List<Int> = store.get("runs")?.split(",")?.mapNotNull { it.toIntOrNull() } ?: emptyList()

/** Per-device key/value storage. Android uses SharedPreferences, desktop uses java.util.prefs. */
interface Store {
    fun get(key: String): String?
    fun put(key: String, value: String)
}

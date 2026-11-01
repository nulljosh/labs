import { stats } from './score.js'

// The paste rule: one input event that adds more than this many characters is a paste, not typing. An
// autocorrect or a phone keyboard's suggestion stays well under it.
export const PASTE_MAX = 20

// One test, same rules as kmp/Session.kt and apple/Session.swift. The page feeds it text and clock readings,
// so it needs no timers or DOM of its own. kind is 'time' (n seconds), 'words' (n words) or 'quote'.
export class Session {
  constructor({ kind = 'time', n = 60, punct = false, words, quotes, random = Math.random, avoid = null }) {
    Object.assign(this, { kind, n, punct, words, random })
    this.typed = ['']
    this.done = false
    this.result = null
    this.startMs = 0
    this.keys = 0 // every character that arrived, judged when it arrived (keystroke accuracy)
    this.hits = 0
    this.pasted = false // a burst of more than PASTE_MAX characters in one input: the run cannot set a best
    if (kind === 'quote') {
      const pool = quotes.filter(q => q !== avoid)
      this.target = pool[this.int(pool.length)].split(' ')
    } else this.target = this.pick(kind === 'words' ? n : 120)
  }

  int(k) { return Math.floor(this.random() * k) }
  // words to finish in word and quote mode, seconds in timed mode
  get total() { return this.kind === 'quote' ? this.target.length : this.n }
  get current() { return this.typed.at(-1) }
  // every word typed so far, joined by spaces: what the hidden input holds
  get text() { return this.typed.join(' ') }

  remaining(nowMs) {
    return this.startMs ? Math.max(0, Math.ceil(this.n - (nowMs - this.startMs) / 1000)) : this.n
  }

  // The hidden input now holds `text`. Taking the whole text, not one keystroke, means batched or pasted input
  // lands the same as slow typing. False means the edit was refused (a finished word was changed, or a space was
  // deleted to reopen a correct word); put session.text back in the input.
  setText(text, nowMs) {
    if (this.done) return false
    const p = text.split(' '), t = this.typed
    const c = Math.min(p.length, t.length) - 1 // words that must be untouched
    let ok = p.slice(0, c).every((w, i) => w === t[i]) &&
      (p.length <= this.target.length || (p.length === this.target.length + 1 && p.at(-1) === ''))
    if (ok && p.length >= t.length) ok = p.slice(c, p.length - 1).every(w => w !== '') // new commits are real words
    else if (ok && p.length === t.length - 1) ok = t.at(-1) === '' && t[c] !== this.target[c] && p.at(-1) === t[c] // step back, wrong words only
    else if (ok) ok = false
    if (!ok) return false
    if (!this.startMs && text) this.startMs = nowMs
    const before = this.text
    const limit = this.kind === 'time' ? p.length : this.total + 1
    this.typed = p.slice(0, limit).map((w, i) => w.slice(0, (this.target[i]?.length ?? 0) + 8))
    this.tally(before)
    if (this.kind !== 'time' && this.typed.length > this.total) this.finish(nowMs)
    else if (this.kind === 'time' && this.typed.length > this.target.length - 30) this.target.push(...this.pick(60))
    return true
  }

  // Keystroke accuracy: each character added since the last text counts once, right or wrong at the moment it
  // landed, so a typo you later fix still counts here (the final-text accuracy in stats() forgives it).
  tally(before) {
    const after = this.text
    let i = 0
    while (i < before.length && i < after.length && before[i] === after[i]) i++
    if (after.length - i > PASTE_MAX) this.pasted = true
    let start = 0
    this.typed.forEach((w, wi) => {
      const t = this.target[wi] ?? ''
      for (let c = Math.max(0, i - start); c <= w.length && start + c < after.length; c++) {
        this.keys++
        if (c < w.length ? w[c] === t[c] : w === t) this.hits++
      }
      start += w.length + 1
    })
  }

  // The finished run's time, as the counter shows it: whole seconds when timed, tenths otherwise.
  get elapsed() { return this.done ? (this.kind === 'time' ? `${Math.round(this.seconds)}s` : `${this.seconds.toFixed(1)}s`) : '' }

  get keyAccuracy() { return this.keys ? Math.round((this.hits / this.keys) * 100) : 100 }

  tick(nowMs) {
    if (!this.done && this.startMs && this.kind === 'time' && nowMs - this.startMs >= this.n * 1000) this.finish(nowMs)
  }

  finish(nowMs) {
    this.done = true
    // timed runs stop at n seconds; a late tick must not shave the wpm
    const secs = (nowMs - this.startMs) / 1000
    const scored = this.typed.filter((w, i) => w || i < this.typed.length - 1)
    this.seconds = this.kind === 'time' ? Math.min(secs, this.n) : secs // what the run is scored on, shown once it is over
    this.result = stats(scored, this.target, this.seconds)
  }

  pick(k) {
    return Array.from({ length: k }, () => this.words[this.int(this.words.length)]).map(w => this.punct ? this.decorate(w) : w)
  }

  // Punct mode: capitals and marks, an apostrophe or a hyphen now and then, and rare numbers (1 in 25).
  decorate(w) {
    const r = this.random()
    if (r < .04) return String(this.int(1000))
    if (r < .16) w = w[0].toUpperCase() + w.slice(1)
    const e = this.random()
    if (e < .04) return w + "'s"
    if (e < .07) return w + '-' + this.words[this.int(this.words.length)]
    return w + (e < .17 ? '.' : e < .27 ? ',' : e < .30 ? '?' : e < .32 ? '!' : '')
  }
}

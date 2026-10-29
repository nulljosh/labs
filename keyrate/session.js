import { stats } from './score.js'

// One test, same rules as kmp/Session.kt and apple/Session.swift. The page feeds it text and clock readings,
// so it needs no timers or DOM of its own. kind is 'time' (n seconds), 'words' (n words) or 'quote'.
export class Session {
  constructor({ kind = 'time', n = 60, punct = false, words, quotes, random = Math.random, avoid = null }) {
    Object.assign(this, { kind, n, punct, words, random })
    this.typed = ['']
    this.done = false
    this.result = null
    this.startMs = 0
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
    const limit = this.kind === 'time' ? p.length : this.total + 1
    this.typed = p.slice(0, limit).map((w, i) => w.slice(0, (this.target[i]?.length ?? 0) + 8))
    if (this.kind !== 'time' && this.typed.length > this.total) this.finish(nowMs)
    else if (this.kind === 'time' && this.typed.length > this.target.length - 30) this.target.push(...this.pick(60))
    return true
  }

  tick(nowMs) {
    if (!this.done && this.startMs && this.kind === 'time' && nowMs - this.startMs >= this.n * 1000) this.finish(nowMs)
  }

  finish(nowMs) {
    this.done = true
    // timed runs stop at n seconds; a late tick must not shave the wpm
    const secs = (nowMs - this.startMs) / 1000
    const scored = this.typed.filter((w, i) => w || i < this.typed.length - 1)
    this.result = stats(scored, this.target, this.kind === 'time' ? Math.min(secs, this.n) : secs)
  }

  pick(k) {
    return Array.from({ length: k }, () => this.words[this.int(this.words.length)]).map(w => this.punct ? this.decorate(w) : w)
  }

  decorate(w) {
    const r = this.random()
    if (r < .08) return String(this.int(1000))
    if (r < .2) w = w[0].toUpperCase() + w.slice(1)
    const e = this.random()
    return w + (e < .1 ? '.' : e < .2 ? ',' : e < .23 ? '?' : e < .25 ? '!' : '')
  }
}

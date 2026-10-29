import Foundation
import Observation

enum Kind { case time, words, quote }

struct Mode: Equatable {
    let kind: Kind
    var n = 0
    var label: String {
        switch kind {
        case .time: "\(n)"
        case .words: "\(n) words"
        case .quote: "quote"
        }
    }
    var key: String { "best:\(kind):\(n)" }
}

let modes = [
    Mode(kind: .time, n: 15), Mode(kind: .time, n: 30), Mode(kind: .time, n: 60),
    Mode(kind: .words, n: 25), Mode(kind: .words, n: 50), Mode(kind: .quote),
]

/// Dice the tests can seed. `int(k)` is 0..<k, `double()` is 0..<1.
struct Dice {
    var int: (Int) -> Int
    var double: () -> Double
    static let system = Dice(int: { Int.random(in: 0..<$0) }, double: { Double.random(in: 0..<1) })
    static func seeded(_ seed: UInt64) -> Dice {
        final class State { var s: UInt64; init(_ s: UInt64) { self.s = s } }
        let st = State(seed)
        func next() -> UInt64 { // splitmix64
            st.s &+= 0x9E3779B97F4A7C15
            var z = st.s
            z = (z ^ (z >> 30)) &* 0xBF58476D1CE4E5B9
            z = (z ^ (z >> 27)) &* 0x94D049BB133111EB
            return z ^ (z >> 31)
        }
        return Dice(int: { Int(next() % UInt64($0)) }, double: { Double(next() >> 11) / Double(1 << 53) })
    }
}

/// One test, same rules as app/index.html and kmp/Session.kt. The view feeds it text and clock readings.
@Observable
final class Session {
    let mode: Mode
    private let punct: Bool
    private let dice: Dice
    private(set) var target: [String] = []
    private(set) var typed: [String] = [""]
    private(set) var done = false
    private(set) var result: Stats?
    private var startMs: Int64 = 0

    init(mode: Mode, punct: Bool = false, dice: Dice = .system, avoid: String? = nil) {
        self.mode = mode
        self.punct = punct
        self.dice = dice
        switch mode.kind {
        case .quote: // never the quote just typed
            let pool = quotes.filter { $0 != avoid }
            target = pool[dice.int(pool.count)].split(separator: " ").map(String.init)
        case .words: target = pick(mode.n)
        case .time: target = pick(120)
        }
    }

    /// Words to finish in word and quote mode, seconds in timed mode.
    var total: Int { mode.kind == .quote ? target.count : mode.n }
    var started: Bool { startMs != 0 }
    var current: String { typed.last ?? "" }
    /// Every word typed so far, joined by spaces. This is what the hidden input holds.
    var text: String { typed.joined(separator: " ") }

    func remaining(nowMs: Int64) -> Int {
        guard started else { return mode.n }
        return max(0, Int((Double(mode.n) - Double(nowMs - startMs) / 1000).rounded(.up)))
    }

    /// The hidden input now holds `text`. Taking the whole text, not one keystroke, means batched or
    /// pasted input lands the same as slow typing. False means the edit was refused (a finished word
    /// was changed, or a space was deleted to reopen a correct word); put `self.text` back in the input.
    @discardableResult
    func setText(_ text: String, nowMs: Int64) -> Bool {
        if done { return false }
        let p = text.split(separator: " ", omittingEmptySubsequences: false).map(String.init)
        let c = min(p.count, typed.count) - 1 // words that must be untouched
        guard p.count <= target.count || (p.count == target.count + 1 && p.last!.isEmpty),
              Array(p.prefix(c)) == Array(typed.prefix(c)) else { return false }
        if p.count >= typed.count {
            guard p[c..<(p.count - 1)].allSatisfy({ !$0.isEmpty }) else { return false } // new commits are real words
        } else if p.count == typed.count - 1 {
            guard typed.last!.isEmpty, typed[c] != target[c], p.last! == typed[c] else { return false } // step back, wrong words only
        } else {
            return false
        }
        if !started && !text.isEmpty { startMs = nowMs }
        let limit = mode.kind == .time ? p.count : total + 1
        typed = p.prefix(limit).enumerated().map { i, w in String(w.prefix((i < target.count ? target[i].count : 0) + 8)) }
        if mode.kind != .time && typed.count > total {
            finish(nowMs: nowMs)
        } else if mode.kind == .time && typed.count > target.count - 30 {
            target += pick(60)
        }
        return true
    }

    func tick(nowMs: Int64) {
        if !done && started && mode.kind == .time && nowMs - startMs >= Int64(mode.n) * 1000 { finish(nowMs: nowMs) }
    }

    private func finish(nowMs: Int64) {
        done = true
        // timed runs stop at n seconds; a late tick must not shave the wpm
        let secs = Double(nowMs - startMs) / 1000
        let seconds = mode.kind == .time ? min(secs, Double(mode.n)) : secs
        let scored = typed.enumerated().filter { !$0.element.isEmpty || $0.offset < typed.count - 1 }.map(\.element)
        result = stats(typed: scored, target: target, seconds: seconds)
    }

    private func pick(_ k: Int) -> [String] {
        (0..<k).map { _ in words[dice.int(words.count)] }.map { punct ? decorate($0) : $0 }
    }

    private func decorate(_ word: String) -> String {
        let r = dice.double()
        if r < 0.08 { return String(dice.int(1000)) }
        let w = r < 0.2 ? word.prefix(1).uppercased() + word.dropFirst() : word
        let e = dice.double()
        return w + (e < 0.1 ? "." : e < 0.2 ? "," : e < 0.23 ? "?" : e < 0.25 ? "!" : "")
    }
}

/// Per-device key/value storage; the app uses UserDefaults.
protocol Store {
    func get(_ key: String) -> String?
    func put(_ key: String, _ value: String)
}

func runs(_ store: Store) -> [Int] {
    (store.get("runs") ?? "").split(separator: ",").compactMap { Int($0) }
}

/// Saves a finished run and returns the best wpm for its mode. Keeps the last 30 runs for the sparkline.
@discardableResult
func recordRun(_ store: Store, _ mode: Mode, _ wpm: Int) -> Int {
    let best = max(Int(store.get(mode.key) ?? "") ?? 0, wpm)
    store.put(mode.key, String(best))
    store.put("runs", (runs(store) + [wpm]).suffix(30).map(String.init).joined(separator: ","))
    return best
}

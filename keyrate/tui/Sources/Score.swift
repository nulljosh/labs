import Foundation

// Line-for-line port of score.js. Divergences are bugs, not features.
// Words = every 5 chars typed (incl. spaces), the 10fastfingers/Monkeytype convention.
struct Stats {
    let wpm: Int
    let raw: Int
    let accuracy: Int
    let correct: Int
    let wrong: Int
    let correctWords: Int
}

func stats(typed: [String], target: [String], seconds: Double) -> Stats {
    var correct = 0, wrong = 0, correctWords = 0
    for (i, w) in typed.enumerated() {
        let t = i < target.count ? target[i] : ""
        if w == t { correctWords += 1 }
        let wChars = Array(w), tChars = Array(t)
        for c in 0..<wChars.count {
            if c < tChars.count && wChars[c] == tChars[c] { correct += 1 } else { wrong += 1 }
        }
        if i < typed.count - 1 { if w == t { correct += 1 } else { wrong += 1 } }
    }
    let min = max(seconds, 0.001) / 60
    let total = correct + wrong
    return Stats(
        wpm: Int((Double(correct) / 5 / min).rounded()),
        raw: Int((Double(total) / 5 / min).rounded()),
        accuracy: total > 0 ? Int((Double(correct) / Double(total) * 100).rounded()) : 100,
        correct: correct, wrong: wrong, correctWords: correctWords
    )
}

/// score.js consistency: how even the keys per second were, 0 to 100.
func consistencyScore(_ perSecond: [Int]) -> Int {
    guard perSecond.count > 1 else { return 100 }
    let n = Double(perSecond.count), mean = Double(perSecond.reduce(0, +)) / n
    if mean == 0 { return 0 }
    let cv = (perSecond.reduce(0.0) { $0 + pow(Double($1) - mean, 2) } / n).squareRoot() / mean
    return Int((100 * (1 - tanh(cv + pow(cv, 3) / 3 + pow(cv, 5) / 5))).rounded())
}

/// score.js missedKey: the key a keystroke should have been, nil if it was right. c == w.count is the space after the word.
func missedKey(_ w: [Character], _ t: [Character], _ c: Int) -> String? {
    if c < w.count {
        if c >= t.count { return " " }
        return w[c] == t[c] ? nil : String(t[c]).lowercased()
    }
    return c < t.count ? String(t[c]).lowercased() : nil
}

/// score.js topMisses: the five keys missed most, worst first, ties in key order.
func topMisses(_ misses: [String: Int]) -> [(key: String, count: Int)] {
    misses.sorted { $0.value != $1.value ? $0.value > $1.value : $0.key < $1.key }.prefix(5).map { (key: $0.key, count: $0.value) }
}

/// score.js missedLine: the line under the keyboard on the result.
func missedLine(_ top: [(key: String, count: Int)]) -> String {
    top.isEmpty ? "no keys missed" : "missed most: " + top.map { "\($0.key == " " ? "space" : $0.key) \($0.count)" }.joined(separator: " · ")
}

/// score.js KEY_ROWS: the keyboard the result draws.
let keyRows = ["qwertyuiop", "asdfghjkl", "zxcvbnm", " "]

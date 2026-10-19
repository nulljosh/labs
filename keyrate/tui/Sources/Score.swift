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

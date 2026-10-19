import Foundation

// Port of score.test.mjs. Run with `swift run keyrate-tui --check` (see main.swift).
func runChecks() {
    do {
        let words = "the quick brown fox jumps".split(separator: " ").map(String.init)
        let s = stats(typed: words, target: words, seconds: 60)
        assert(s.raw == 5, "raw \(s.raw)")
        assert(s.wpm == 5, "wpm \(s.wpm)")
        assert(s.accuracy == 100, "accuracy \(s.accuracy)")
        assert(s.correctWords == 5, "correctWords \(s.correctWords)")
    }
    do {
        let s = stats(typed: ["teh", "cat"], target: ["the", "cat"], seconds: 30)
        assert(s.raw == 3, "raw \(s.raw)")
        assert(s.correct == 4, "correct \(s.correct)")
        assert(s.wrong == 3, "wrong \(s.wrong)")
        assert(s.correctWords == 1, "correctWords \(s.correctWords)")
        assert(s.wpm < s.raw, "wpm should be < raw")
    }
    do {
        _ = stats(typed: [], target: [], seconds: 0) // must not divide by zero / crash
    }
    print("keyrate-tui: all checks passed")
}

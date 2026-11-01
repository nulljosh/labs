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
    // The shared vectors every port must agree on (vectors.json at the repo root, run from there).
    if let d = FileManager.default.contents(atPath: "vectors.json"),
       let cases = try? JSONSerialization.jsonObject(with: d) as? [[String: Any]] {
        for c in cases {
            let s = stats(typed: c["typed"] as! [String], target: c["target"] as! [String], seconds: (c["seconds"] as! NSNumber).doubleValue)
            let e = c["expect"] as! [String: Int]
            let got = ["wpm": s.wpm, "raw": s.raw, "accuracy": s.accuracy, "correct": s.correct, "wrong": s.wrong, "correctWords": s.correctWords]
            for (k, v) in e { assert(got[k] == v, "vector \(c["typed"]!) \(k): \(got[k]!) != \(v)") }
        }
        print("keyrate-tui: \(cases.count) shared vectors agree")
    } else {
        print("keyrate-tui: run from the repo root to check vectors.json")
    }
    // A full words run through the shared Session: typing the target exactly scores 100 percent.
    let run = Session(mode: modes[3], dice: .seeded(7))
    run.setText(run.target.joined(separator: " "), nowMs: 1000)
    assert(run.done && run.result?.accuracy == 100 && run.result?.correctWords == 25, "session run")
    print("keyrate-tui: all checks passed")
}

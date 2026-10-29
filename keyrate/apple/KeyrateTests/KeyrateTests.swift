import XCTest

// Same cases as score.test.mjs and kmp/'s ScoreTest and SessionTest. A case that fails here but passes there is a bug here.
final class ScoreTests: XCTestCase {
    func testPerfect60sRun() {
        let w = "the quick brown fox jumps".split(separator: " ").map(String.init)
        let s = stats(typed: w, target: w, seconds: 60)
        XCTAssertEqual(s.raw, 5)
        XCTAssertEqual(s.wpm, 5)
        XCTAssertEqual(s.accuracy, 100)
        XCTAssertEqual(s.correctWords, 5)
    }

    func testErrorsLowerWpmButNotRaw() {
        let s = stats(typed: ["teh", "cat"], target: ["the", "cat"], seconds: 30)
        XCTAssertEqual(s.raw, 3)
        XCTAssertEqual(s.correct, 4)
        XCTAssertEqual(s.wrong, 3)
        XCTAssertEqual(s.correctWords, 1)
        XCTAssertLessThan(s.wpm, s.raw)
    }

    func testZeroTimeDoesNotDivideByZero() {
        _ = stats(typed: [], target: [], seconds: 0)
    }
}

final class SessionTests: XCTestCase {
    private func typeAll(_ s: Session, _ ws: [String], t0: Int64 = 1_000) {
        var text = s.text
        for (i, w) in ws.enumerated() { text += "\(w) "; s.setText(text, nowMs: t0 + Int64(i) * 100) }
    }

    func testWordsModeFinishesAfterTheLastSpace() {
        let s = Session(mode: Mode(kind: .words, n: 25), dice: .seeded(1))
        let ws = s.target
        typeAll(s, Array(ws.dropLast()))
        XCTAssertFalse(s.done)
        s.setText(s.text + ws.last!, nowMs: 9_000)
        XCTAssertFalse(s.done)
        s.setText(s.text + " ", nowMs: 9_100)
        XCTAssertTrue(s.done)
        XCTAssertEqual(s.result?.correctWords, 25)
        XCTAssertEqual(s.result?.accuracy, 100)
    }

    func testBackspaceStepsBackOnlyIntoAWrongWord() {
        let s = Session(mode: Mode(kind: .words, n: 25), dice: .seeded(2))
        let first = s.target[0]
        XCTAssertTrue(s.setText("zz ", nowMs: 1_000))
        XCTAssertTrue(s.setText("zz", nowMs: 1_050))
        XCTAssertEqual(s.current, "zz")
        XCTAssertTrue(s.setText("\(first) ", nowMs: 1_100))
        XCTAssertFalse(s.setText(first, nowMs: 1_150)) // a correct word stays closed
        XCTAssertEqual(s.text, "\(first) ")
    }

    func testFinishedWordsCannotBeEdited() {
        let s = Session(mode: Mode(kind: .words, n: 25), dice: .seeded(8))
        s.setText("zz ", nowMs: 1_000)
        XCTAssertFalse(s.setText("yy ", nowMs: 1_100))
        XCTAssertEqual(s.text, "zz ")
    }

    func testBatchedInputLandsLikeSlowTyping() {
        let s = Session(mode: Mode(kind: .words, n: 25), dice: .seeded(9))
        let (a, b) = (s.target[0], s.target[1])
        XCTAssertTrue(s.setText("\(a) \(b) ", nowMs: 1_000))
        XCTAssertEqual(s.typed, [a, b, ""])
    }

    func testTimedRunStopsAtNSecondsAndScoresOnN() {
        let s = Session(mode: Mode(kind: .time, n: 15), dice: .seeded(3))
        typeAll(s, Array(s.target.prefix(10)))
        s.tick(nowMs: 1_000 + 14_900)
        XCTAssertFalse(s.done)
        s.tick(nowMs: 1_000 + 15_080) // a late tick
        XCTAssertTrue(s.done)
        XCTAssertEqual(s.result?.wpm, stats(typed: Array(s.typed.dropLast()), target: s.target, seconds: 15).wpm)
    }

    func testTimedStreamRefillsBeforeTheEnd() {
        let s = Session(mode: Mode(kind: .time, n: 60), dice: .seeded(4))
        let before = s.target.count
        typeAll(s, Array(s.target.prefix(100)))
        XCTAssertGreaterThan(s.target.count, before)
    }

    func testQuoteModeEndsWithItsLastWord() {
        let s = Session(mode: Mode(kind: .quote), dice: .seeded(5))
        XCTAssertEqual(s.total, s.target.count)
        typeAll(s, s.target)
        XCTAssertTrue(s.done)
    }

    func testQuoteModeNeverRepeatsTheQuoteJustTyped() {
        for seed in UInt64(1)...40 {
            let first = Session(mode: Mode(kind: .quote), dice: .seeded(seed)).target.joined(separator: " ")
            XCTAssertNotEqual(Session(mode: Mode(kind: .quote), dice: .seeded(seed), avoid: first).target.joined(separator: " "), first)
        }
    }

    func testPunctuationAddsMarksAndNumbers() {
        let s = Session(mode: Mode(kind: .words, n: 50), punct: true, dice: .seeded(7))
        XCTAssertTrue(s.target.contains { $0.contains { !$0.isLetter } })
        XCTAssertEqual(s.target.count, 50)
    }

    func testBestAndRunsAreKept() {
        final class Mem: Store {
            var d: [String: String] = [:]
            func get(_ k: String) -> String? { d[k] }
            func put(_ k: String, _ v: String) { d[k] = v }
        }
        let store = Mem()
        let m = Mode(kind: .time, n: 60)
        XCTAssertEqual(recordRun(store, m, 50), 50)
        XCTAssertEqual(recordRun(store, m, 40), 50)
        XCTAssertEqual(recordRun(store, m, 70), 70)
        XCTAssertEqual(runs(store), [50, 40, 70])
        for _ in 0..<40 { recordRun(store, m, 1) }
        XCTAssertEqual(runs(store).count, 30)
    }
}

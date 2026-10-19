import Foundation
import Observation

/// Port of game.js. Scoring, streaks and the speed-round timer live here so the
/// self-check in ios/Checks can drive them without SwiftUI or a real clock.
@Observable
final class Game {
    enum Phase: Equatable { case menu, playing, over }

    static let timeLimit = 10.0
    static let tickInterval = 0.1

    private(set) var quotes: [Quote] = []
    private(set) var phase: Phase = .menu
    private(set) var pool: [Quote] = []
    private(set) var current: Quote?
    private(set) var score = 0
    private(set) var streak = 0
    private(set) var speedMode = false
    private(set) var timeLeft = timeLimit
    /// Set once an answer is picked; nil while the question is open.
    private(set) var pickedAnswer: String?
    private(set) var lastWasCorrect: Bool?
    /// Points the last correct answer earned, so the feedback line can read "Correct! +30".
    private(set) var lastPoints = 0
    /// Questions answered this game; a duel reports it with each score.
    private(set) var answeredCount = 0
    private(set) var highScore = SharedStore.cloudHigh(UserDefaults.standard.integer(forKey: Game.highKey))

    private static let highKey = "quotable_high_score"

    var isAnswered: Bool { pickedAnswer != nil || lastWasCorrect != nil }

    var genres: [String] { Array(Set(quotes.map(\.genre))).sorted() }
    /// Decades with at least one dated line, e.g. 1930, 1940. Mirrors the web decade menu.
    var decades: [Int] { Array(Set(quotes.compactMap { $0.year.map { $0 / 10 * 10 } })).sorted() }

    init(quotes: [Quote] = Quote.loadBundled()) {
        self.quotes = quotes
    }

    /// Fair play (v87): every question of this game as the server checks it, and when the game began.
    struct RunItem: Codable, Equatable { var qid: String; var pick: String?; var pts: Int }
    private(set) var run: [RunItem] = []
    private(set) var startedAt = Date()

    /// Per-quote answer tallies from jaybulb-api, filled in by Account after launch.
    var stats: [String: (plays: Int, correct: Int)] = [:]

    func start(genre: String?, speed: Bool, decade: Int? = nil, level: String? = nil) {
        speedMode = speed
        score = 0
        streak = 0
        answeredCount = 0
        run = []
        startedAt = Date()
        let byGenre = genre.map { g in quotes.filter { $0.genre == g } } ?? quotes
        let byDecade = decade.map { d in byGenre.filter { $0.year.map { $0 / 10 * 10 } == d } } ?? byGenre
        let byLevel = level.map { l in byDecade.filter { $0.level(stats) == l } } ?? byDecade
        let filtered = !byLevel.isEmpty ? byLevel : byDecade.isEmpty ? byGenre : byDecade  // an empty pairing plays the genre
        pool = filtered.shuffled()
        phase = .playing
        nextQuestion()
        SharedStore.sync(score: score, streak: streak, highScore: highScore, phase: phase)
    }

    /// A fixed run, played in order: a duel's ten quotes (v33).
    func start(fixed: [Quote]) {
        speedMode = false
        score = 0
        streak = 0
        answeredCount = 0
        run = []
        startedAt = Date()
        pool = fixed.reversed()   // popLast deals from the front
        phase = .playing
        nextQuestion()
    }

    // MARK: Handoff (v40): start on the phone, finish on the Mac.

    static let handoffType = "com.heyitsmejosh.quotable.game"

    /// The game in progress, small enough for NSUserActivity: the unanswered quotes by id (current first).
    var handoff: [String: Any] {
        let left = (current.map { [$0] } ?? []) + pool.reversed()
        return ["qids": left.prefix(200).map(\.qid), "score": score, "streak": streak, "speed": speedMode]
    }

    /// Pick up a game handed off from another device at the question it was on.
    func resume(_ info: [AnyHashable: Any]) {
        guard let qids = info["qids"] as? [String], !qids.isEmpty else { return }
        let byId = Dictionary(quotes.map { ($0.qid, $0) }, uniquingKeysWith: { a, _ in a })
        let left = qids.compactMap { byId[$0] }
        guard !left.isEmpty else { return }
        speedMode = info["speed"] as? Bool ?? false
        score = info["score"] as? Int ?? 0
        streak = info["streak"] as? Int ?? 0
        answeredCount = 0
        pool = left.reversed()
        phase = .playing
        nextQuestion()
    }

    func nextQuestion() {
        pickedAnswer = nil
        lastWasCorrect = nil
        lastPoints = 0
        timeLeft = Self.timeLimit
        guard let next = pool.popLast() else { return endGame() }
        current = next
    }

    /// Points for answering correctly right now. Mirrors game.js: 10, multiplied by the
    /// whole seconds remaining in a speed round (never less than 1x).
    var pendingPoints: Int {
        10 * (speedMode ? max(1, Int(timeLeft.rounded(.up))) : 1)
    }

    /// `answer == nil` is a speed-round timeout, which game.js scores as a miss.
    @discardableResult
    func choose(_ answer: String?) -> Bool {
        guard let current, !isAnswered else { return false }
        let correct = answer == current.answer
        let points = pendingPoints
        pickedAnswer = answer
        lastWasCorrect = correct
        answeredCount += 1
        lastPoints = correct ? points : 0
        run.append(RunItem(qid: current.qid, pick: answer, pts: lastPoints))
        if correct {
            streak += 1
            score += points
        } else {
            streak = 0
        }
        SharedStore.sync(score: score, streak: streak, highScore: highScore, phase: phase)
        return correct
    }

    /// Advance the speed-round clock. Returns true if this tick timed the question out.
    @discardableResult
    func tick(_ delta: Double = tickInterval) -> Bool {
        guard speedMode, phase == .playing, !isAnswered else { return false }
        timeLeft -= delta
        guard timeLeft <= 0 else { return false }
        timeLeft = 0
        choose(nil)
        return true
    }

    func endGame() {
        current = nil
        phase = .over
        if score > highScore {
            highScore = score
            UserDefaults.standard.set(score, forKey: Self.highKey)
        }
        SharedStore.sync(score: score, streak: streak, highScore: highScore, phase: phase)
    }

    func backToMenu() {
        phase = .menu
    }
}

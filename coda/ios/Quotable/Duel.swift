import Foundation
import Observation
#if os(iOS)
import ActivityKit
#endif

/// Live duels on the apps (v33), on the same quotestreak-duel room as the web (duel/worker.js), so a
/// phone can duel a browser. Same messages as duel-client.js: the host picks ten quote ids when the
/// friend arrives, both play them, each answer sends the running score. On iPhone the duel also runs
/// as a Live Activity, so both scores sit on the lock screen and in the Dynamic Island.
@MainActor @Observable final class Duel {
    enum Stage { case waiting, playing, finished }
    static let size = 10

    let code: String
    private(set) var stage = Stage.waiting
    private(set) var you = 0
    private(set) var them = 0
    private(set) var asked = 0
    private(set) var theirDone = false
    private(set) var left = false
    private(set) var failed = false
    /// Called once with the ten quotes when the duel starts.
    var onStart: (([Quote]) -> Void)?

    private let bank: [Quote]
    private var socket: URLSessionWebSocketTask?
    #if os(iOS)
    private var activity: Activity<DuelAttributes>?
    #endif

    var link: URL { URL(string: "https://coda.jaybulb.com/play?duel=\(code)")! }
    var settled: Bool { stage == .finished && (theirDone || left) }

    init(code: String? = nil, bank: [Quote]) {
        self.code = code?.uppercased() ?? String((0..<4).map { _ in "ABCDEFGHJKLMNPQRSTUVWXYZ".randomElement()! })
        self.bank = bank
    }

    static func isCode(_ s: String) -> Bool { s.count == 4 && s.allSatisfy { $0.isLetter && $0.isASCII } }

    func connect() {
        socket = URLSession.shared.webSocketTask(with: URL(string: "wss://coda.jaybulb.com/duel/ws?room=\(code)")!)
        socket?.resume()
        receive()
    }

    private func receive() {
        socket?.receive { [weak self] result in
            Task { @MainActor in self?.handle(result) }
        }
    }

    private func handle(_ result: Result<URLSessionWebSocketTask.Message, Error>) {
        guard case .success(let message) = result else {
            if stage == .waiting { failed = true } else if !settled { left = true }
            return
        }
        if case .string(let text) = message, let data = text.data(using: .utf8),
           let m = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            apply(m)
        }
        receive()
    }

    private func apply(_ m: [String: Any]) {
        switch m["type"] as? String {
        case "opponent":
            let qids = bank.shuffled().prefix(Self.size).map(\.qid)
            send(["type": "start", "qids": Array(qids)])
            begin(Array(qids))
        case "start": begin(m["qids"] as? [String] ?? [])
        case "answer": them = m["score"] as? Int ?? them; refreshActivity()
        case "done": them = m["score"] as? Int ?? them; theirDone = true; refreshActivity()
        case "left": left = true; refreshActivity()
        default: break
        }
    }

    private func begin(_ qids: [String]) {
        guard stage == .waiting else { return }
        let byId = Dictionary(bank.map { ($0.qid, $0) }, uniquingKeysWith: { a, _ in a })
        let quotes = qids.compactMap { byId[$0] }
        stage = .playing
        onStart?(quotes)
        startActivity()
    }

    func answered(score: Int, count: Int) {
        you = score
        asked = count
        send(["type": "answer", "score": score, "i": count, "name": Account.shared.name])
        refreshActivity()
    }

    func finish(score: Int) {
        you = score
        stage = .finished
        send(["type": "done", "score": score])
        refreshActivity()
    }

    /// The end-of-game line, in challenge.js's words.
    var verdict: String {
        guard theirDone || left else { return "You scored \(you). Waiting for your friend to finish\u{2026}" }
        let tail = left && !theirDone ? " They left early." : ""
        if you > them { return "You beat your friend, \(you) to \(them).\(tail)" }
        if you < them { return "Your friend wins, \(them) to \(you).\(tail)" }
        return "A tie with your friend at \(you).\(tail)"
    }

    func close() {
        socket?.cancel(with: .goingAway, reason: nil)
        endActivity()
    }

    private func send(_ m: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: m), let text = String(data: data, encoding: .utf8) else { return }
        socket?.send(.string(text)) { _ in }
    }

    // MARK: Live Activity

    #if os(iOS)
    private var state: DuelAttributes.ContentState {
        .init(you: you, them: them, question: min(asked + 1, Self.size), total: Self.size, youDone: stage == .finished, themDone: theirDone || left)
    }
    #endif

    private func startActivity() {
        #if os(iOS)
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }
        activity = try? Activity.request(attributes: DuelAttributes(code: code), content: .init(state: state, staleDate: nil))
        #endif
    }

    private func refreshActivity() {
        #if os(iOS)
        guard let activity else { return }
        let content = ActivityContent(state: state, staleDate: nil)
        Task { await activity.update(content) }
        if settled { endActivity() }
        #endif
    }

    private func endActivity() {
        #if os(iOS)
        guard let activity else { return }
        let content = ActivityContent(state: state, staleDate: nil)
        self.activity = nil
        Task { await activity.end(content, dismissalPolicy: .after(.now.addingTimeInterval(15 * 60))) }
        #endif
    }
}

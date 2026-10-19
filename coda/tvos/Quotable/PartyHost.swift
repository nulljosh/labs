import Foundation
import Observation

/// The big-screen side of a party game (v34). The TV opens a party room (duel/worker.js, Party),
/// shows a code, and phones join it from coda.jaybulb.com/buzz. The TV deals ten quotes, sends
/// each question's options to the phones, collects their buzzes and keeps score: a right answer is
/// worth 10, and the fastest right answer 5 more.
@MainActor @Observable final class PartyHost {
    struct Player: Identifiable, Equatable {
        let id: String
        var name: String
        var score = 0
        var buzz: String?
        var buzzedAt: Double = 0
        var gained = 0
    }
    enum Stage { case lobby, question, reveal, over }

    static let rounds = 10
    static let questionTime = 15.0

    let code = String((0..<4).map { _ in "ABCDEFGHJKLMNPQRSTUVWXYZ".randomElement()! })
    private(set) var players: [Player] = []
    private(set) var stage = Stage.lobby
    private(set) var round = 0
    private(set) var current: Quote?
    private(set) var options: [String] = []
    private(set) var timeLeft = questionTime
    private(set) var connected = false

    private let bank: [Quote]
    private var deck: [Quote] = []
    private var askedAt = Date()
    private var socket: URLSessionWebSocketTask?

    var joinURL: URL { URL(string: "https://coda.jaybulb.com/buzz?room=\(code)")! }
    var standings: [Player] { players.sorted { $0.score > $1.score } }

    init(bank: [Quote]) { self.bank = bank }

    func connect() {
        socket = URLSession.shared.webSocketTask(with: URL(string: "wss://coda.jaybulb.com/duel/party?room=\(code)&role=host")!)
        socket?.resume()
        connected = true
        receive()
    }

    private func receive() {
        socket?.receive { [weak self] result in
            Task { @MainActor in
                guard let self else { return }
                guard case .success(let message) = result else { self.connected = false; return }
                if case .string(let text) = message, let data = text.data(using: .utf8),
                   let m = try? JSONSerialization.jsonObject(with: data) as? [String: Any] { self.apply(m) }
                self.receive()
            }
        }
    }

    private func apply(_ m: [String: Any]) {
        let id = m["id"] as? String ?? ""
        switch m["type"] as? String {
        case "join": if !players.contains(where: { $0.id == id }) { players.append(Player(id: id, name: m["name"] as? String ?? "Player")) }
        case "leave": players.removeAll { $0.id == id }
        case "buzz":
            guard stage == .question, let i = players.firstIndex(where: { $0.id == id }), players[i].buzz == nil else { return }
            players[i].buzz = m["option"] as? String
            players[i].buzzedAt = Date().timeIntervalSince(askedAt)
            if players.allSatisfy({ $0.buzz != nil }) { reveal() }
        default: break
        }
    }

    func start() {
        deck = Array(bank.shuffled().prefix(Self.rounds))
        round = 0
        for i in players.indices { players[i].score = 0 }
        next()
    }

    func next() {
        guard round < deck.count else { return finish() }
        let q = deck[round]
        round += 1
        current = q
        options = q.options.shuffled()
        for i in players.indices { players[i].buzz = nil; players[i].gained = 0 }
        askedAt = .now
        timeLeft = Self.questionTime
        stage = .question
        send(["type": "question", "n": round, "total": deck.count, "options": options])
    }

    /// Drive the clock from the view's timer; at zero the answer shows.
    func tick() {
        guard stage == .question else { return }
        timeLeft = max(0, Self.questionTime - Date().timeIntervalSince(askedAt))
        if timeLeft == 0 { reveal() }
    }

    func reveal() {
        guard stage == .question, let answer = current?.answer else { return }
        let fastest = players.filter { $0.buzz == answer }.min { $0.buzzedAt < $1.buzzedAt }?.id
        for i in players.indices where players[i].buzz == answer {
            players[i].gained = 10 + (players[i].id == fastest ? 5 : 0)
            players[i].score += players[i].gained
        }
        stage = .reveal
        send(["type": "reveal", "answer": answer, "scores": scores()])
    }

    private func finish() {
        stage = .over
        current = nil
        send(["type": "over", "scores": scores()])
    }

    func backToLobby() { stage = .lobby }

    private func scores() -> [[String: Any]] { standings.map { ["id": $0.id, "name": $0.name, "score": $0.score] } }

    private func send(_ m: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: m), let text = String(data: data, encoding: .utf8) else { return }
        socket?.send(.string(text)) { _ in }
    }
}

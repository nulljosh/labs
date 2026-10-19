import Foundation

/// The web's challenge link (challenge.js) in Swift: ten quote ids, a score and a name in a /play URL,
/// so a challenge made in iMessage (v49) opens the same lines in any browser, and back.
struct ChallengeLink: Equatable {
    static let size = 10
    var qids: [String]
    var score: Int
    var name: String?

    var url: URL {
        var c = URLComponents(string: "https://coda.jaybulb.com/c")!   // the invite landing (v83), which hands off to /play
        c.queryItems = [URLQueryItem(name: "c", value: qids.prefix(Self.size).joined(separator: ".")), URLQueryItem(name: "s", value: String(score))]
        if let name, !name.isEmpty { c.queryItems?.append(URLQueryItem(name: "n", value: String(name.prefix(24)))) }
        return c.url!
    }

    init(qids: [String], score: Int, name: String? = nil) {
        self.qids = qids; self.score = score; self.name = name
    }

    /// Mirrors challenge.js decode: bad ids are dropped, a missing score is zero.
    init?(url: URL) {
        let items = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems ?? []
        // URLSearchParams on the web writes a space as "+", which URLComponents leaves alone.
        func value(_ k: String) -> String? { items.first { $0.name == k }?.value?.replacingOccurrences(of: "+", with: " ") }
        guard let c = value("c") else { return nil }
        let ids = c.split(separator: ".").map(String.init).filter { $0.count == 8 && $0.allSatisfy(\.isHexDigit) }
        guard !ids.isEmpty else { return nil }
        self.init(qids: Array(ids.prefix(Self.size)), score: max(0, Int(value("s") ?? "") ?? 0), name: value("n").map { String($0.prefix(24)) })
    }

    /// The same words as challenge.js verdict.
    static func verdict(mine: Int, theirs: Int, name: String) -> String {
        mine > theirs ? "You beat \(name), \(mine) to \(theirs)." : mine < theirs ? "\(name) wins, \(theirs) to \(mine)." : "A tie with \(name) at \(mine)."
    }
}

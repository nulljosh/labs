import Foundation

/// One entry of `quotes.json`. The schema is shared verbatim with the web game —
/// do not diverge it; `CLAUDE.md` requires the same file in both places.
struct Quote: Decodable, Identifiable, Equatable {
    enum Kind: String, Decodable { case movie, music, tv, game, book }

    let quote: String
    let answer: String
    let options: [String]
    let genre: String
    let type: Kind
    let year: Int?
    let art: URL?
    /// Wikiquote or Gutenberg page for harvested lines; nil for the hand-picked bank.
    let source: String?

    /// FNV-1a of the quote text, hex. Same as difficulty.js, so both tally into one row.
    var qid: String {
        var h: UInt32 = 0x811c9dc5
        for b in quote.utf8 { h = (h ^ UInt32(b)) &* 0x01000193 }
        return String(format: "%08x", h)
    }

    /// Mirrors difficulty.js: the real hit rate after ten plays, else hand-picked = easy.
    func level(_ stats: [String: (plays: Int, correct: Int)]) -> String {
        if let s = stats[qid], s.plays >= 10 {
            let rate = Double(s.correct) / Double(s.plays)
            return rate >= 0.75 ? "easy" : rate <= 0.4 ? "hard" : "medium"
        }
        return source == nil ? "easy" : "medium"
    }

    var id: String { quote }

    /// Prompt text, mirroring `game.js` nextQuestion().
    var prompt: String {
        switch type {
        case .music: "Guess the artist from the lyric."
        case .tv: "Guess the show from the quote."
        case .game: "Guess the game from the quote."
        case .book: "Name the book from its first line."
        case .movie: "Guess the movie from the quote."
        }
    }

    static func loadBundled() -> [Quote] {
        guard let url = Bundle.main.url(forResource: "quotes", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let quotes = try? JSONDecoder().decode([Quote].self, from: data)
        else { return [] }
        return quotes
    }
}

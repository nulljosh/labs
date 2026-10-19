import Foundation

/// The Daily Quote, ported from daily.js so the widget shows the same line as the web on the same
/// UTC day. Same epoch, same mulberry32 seeds, same shuffle; ios/Checks compares the two.
enum Daily {
    static let epoch = Date(timeIntervalSince1970: 1_792_368_000)   // 2026-10-19 UTC, Daily #1
    static let day: TimeInterval = 86_400

    static func dayNumber(_ now: Date = .now) -> Int {
        Int((now.timeIntervalSince(epoch) / day).rounded(.down)) + 1
    }

    /// The next UTC midnight, when the widget should move on.
    static func nextChange(_ now: Date = .now) -> Date {
        epoch.addingTimeInterval(Double(dayNumber(now)) * day)
    }

    /// mulberry32, bit for bit with the JavaScript (UInt32 wrapping stands in for Math.imul and |0).
    struct Mulberry {
        var seed: UInt32
        mutating func next() -> Double {
            seed = seed &+ 0x6d2b_79f5
            var t = (seed ^ (seed >> 15)) &* (1 | seed)
            t = (t &+ ((t ^ (t >> 7)) &* (61 | t))) ^ t
            return Double(t ^ (t >> 14)) / 4_294_967_296
        }
    }

    static func seededShuffle<T>(_ items: [T], seed: Int) -> [T] {
        var a = items, rng = Mulberry(seed: UInt32(truncatingIfNeeded: seed))
        for i in stride(from: a.count - 1, to: 0, by: -1) {
            let j = Int((rng.next() * Double(i + 1)).rounded(.down))
            a.swapAt(i, j)
        }
        return a
    }

    /// The day's quote and its options in the fixed order every player sees.
    static func quote(for day: Int, in bank: [Quote]) -> (quote: Quote, options: [String])? {
        guard !bank.isEmpty, day >= 1 else { return nil }
        let cycle = (day - 1) / bank.count
        let order = seededShuffle(Array(bank.indices), seed: 1000 + cycle)
        let q = bank[order[(day - 1) % bank.count]]
        return (q, seededShuffle(q.options, seed: day))
    }
}

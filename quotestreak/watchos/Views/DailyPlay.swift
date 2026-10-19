import SwiftUI

/// Play the Daily Quote on the wrist (v32): the same line and the same four answers as the web and
/// the widget (Daily.swift), with the day streak kept on the watch. One try a day, like everywhere.
struct DailyPlay: View {
    @AppStorage("dailyDay") private var playedDay = 0
    @AppStorage("dailyRight") private var playedRight = false
    @AppStorage("dailyAnswer") private var playedAnswer = ""
    @AppStorage("streakLastDay") private var streakLastDay = 0
    @AppStorage("streakCount") private var streakCount = 0
    @State private var picked: String?

    private static let bank: [Quote] = {
        guard let url = Bundle.main.url(forResource: "quotes", withExtension: "json"),
              let data = try? Data(contentsOf: url) else { return [] }
        return (try? JSONDecoder().decode([Quote].self, from: data)) ?? []
    }()

    private var today: Int { Daily.dayNumber() }
    private var streak: Int { streakLastDay >= today - 1 ? streakCount : 0 }

    var body: some View {
        ScrollView {
            if let (q, options) = Daily.quote(for: today, in: Self.bank) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Daily #\(today)").font(.caption2.bold()).foregroundStyle(.yellow)
                    Text("\u{201C}\(q.quote)\u{201D}").font(.footnote.weight(.semibold))
                    if playedDay == today {
                        Text(playedRight ? "Got it: \(playedAnswer)" : "It was \(playedAnswer)")
                            .font(.footnote).foregroundStyle(playedRight ? .green : .red)
                        Text("Day streak \(streak)").font(.caption2).foregroundStyle(.secondary)
                    } else {
                        ForEach(options, id: \.self) { option in
                            Button(option) { answer(option, q) }
                                .font(.footnote)
                                .tint(picked == nil ? nil : option == q.answer ? .green : option == picked ? .red : nil)
                                .disabled(picked != nil)
                        }
                    }
                }
            } else {
                Text("Today's line didn't load.").font(.footnote)
            }
        }
    }

    /// Mirrors daily.js nextStreak: a right answer extends yesterday's run, a miss resets it.
    private func answer(_ option: String, _ q: Quote) {
        picked = option
        let right = option == q.answer
        streakCount = !right ? 0 : (streakLastDay == today - 1 && streakCount > 0 ? streakCount + 1 : 1)
        streakLastDay = today
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            playedDay = today; playedRight = right; playedAnswer = q.answer; picked = nil
        }
    }
}

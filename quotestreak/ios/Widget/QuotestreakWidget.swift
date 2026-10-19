import SwiftUI
import WidgetKit

// The Daily Quote on the home screen, lock screen and Mac desktop (v31). The widget carries its own
// copy of the bank and works the day's line out itself (Daily.swift), so it needs no app group and
// shows the same line as the web. It never shows the answer: tapping opens the game.

struct DailyEntry: TimelineEntry {
    let date: Date
    let day: Int
    let quote: Quote?
}

struct DailyProvider: TimelineProvider {
    private static let bank = Quote.loadBundled()

    private func entry(_ date: Date) -> DailyEntry {
        let day = Daily.dayNumber(date)
        return DailyEntry(date: date, day: day, quote: Daily.quote(for: day, in: Self.bank)?.quote)
    }

    func placeholder(in context: Context) -> DailyEntry { entry(.now) }
    func getSnapshot(in context: Context, completion: @escaping (DailyEntry) -> Void) { completion(entry(.now)) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<DailyEntry>) -> Void) {
        let now = Date.now, next = Daily.nextChange(now)
        completion(Timeline(entries: [entry(now), entry(next)], policy: .after(next)))
    }
}

struct DailyView: View {
    @Environment(\.widgetFamily) private var family
    let entry: DailyEntry

    /// Short enough for the small widget's last line.
    static func ask(_ kind: Quote.Kind) -> String {
        switch kind {
        case .movie: "Name the movie."
        case .tv: "Name the show."
        case .game: "Name the game."
        case .music: "Name the artist."
        case .book: "Name the book."
        }
    }

    private var isLockScreen: Bool {
        #if os(iOS)
        family == .accessoryRectangular
        #else
        false
        #endif
    }

    var body: some View {
        Group {
            if let q = entry.quote {
                if isLockScreen {
                    Text("\u{201C}\(q.quote)\u{201D}").font(.quip(.footnote, weight: .semibold)).lineLimit(3)
                } else {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Daily Quote").font(.quip(.caption, weight: .bold)).foregroundStyle(Theme.accentStroke)
                        Text("\u{201C}\(q.quote)\u{201D}")
                            .font(.quip(family == .systemSmall ? .footnote : .subheadline, weight: .semibold))
                            .minimumScaleFactor(0.7)
                        Spacer(minLength: 0)
                        Text(Self.ask(q.type)).font(.quip(.caption2)).foregroundStyle(.secondary).lineLimit(1)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                }
            } else {
                Text("Open Quotestreak for today's line.").font(.quip(.footnote))
            }
        }
        .containerBackground(for: .widget) { Theme.canvas }
    }
}

@main
struct QuotestreakWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "DailyQuote", provider: DailyProvider()) { DailyView(entry: $0) }
            .configurationDisplayName("Daily Quote")
            .description("Today's line, the same one everyone gets. Tap to guess it.")
            #if os(iOS)
            .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
            #else
            .supportedFamilies([.systemSmall, .systemMedium])
            #endif
    }
}

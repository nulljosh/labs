import AppIntents
import Foundation

/// Siri and Shortcuts (v39). "Give me a quote" reads today's Daily Quote without opening the app;
/// "Start a speed round" opens straight into one. The phrases work in Siri, Spotlight and Shortcuts.
struct DailyQuoteIntent: AppIntent {
    static let title: LocalizedStringResource = "Give me a quote"
    static let description = IntentDescription("Today's Daily Quote, the same line everyone gets.")

    func perform() async throws -> some IntentResult & ProvidesDialog {
        guard let (q, _) = Daily.quote(for: Daily.dayNumber(), in: Quote.loadBundled()) else {
            return .result(dialog: "Open Coda for today's line.")
        }
        return .result(dialog: "\u{201C}\(q.quote)\u{201D} \(q.prompt) Open Coda to answer.")
    }
}

struct SpeedRoundIntent: AppIntent {
    static let title: LocalizedStringResource = "Start a speed round"
    static let description = IntentDescription("Opens Coda straight into a ten-second speed round.")
    static let openAppWhenRun = true

    @MainActor
    func perform() async throws -> some IntentResult {
        // ContentView watches this key and starts the round as soon as it is set.
        UserDefaults.standard.set("speed", forKey: "quotestreak_launch")
        return .result()
    }
}

struct CodaShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: DailyQuoteIntent(), phrases: ["Give me a quote from \(.applicationName)", "\(.applicationName) daily quote"],
                    shortTitle: "Daily Quote", systemImageName: "quote.opening")
        AppShortcut(intent: SpeedRoundIntent(), phrases: ["Start a speed round in \(.applicationName)", "\(.applicationName) speed round"],
                    shortTitle: "Speed Round", systemImageName: "timer")
    }
}

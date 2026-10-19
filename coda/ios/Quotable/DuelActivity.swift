#if os(iOS)
import ActivityKit

/// A live duel's Live Activity (v33), shared by the app (Duel.swift starts and updates it) and the
/// widget extension (DuelLiveActivity draws it on the lock screen and in the Dynamic Island).
struct DuelAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var you: Int
        var them: Int
        var question: Int
        var total: Int
        var youDone: Bool
        var themDone: Bool
    }

    var code: String
}
#endif

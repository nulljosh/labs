import SwiftUI
import SwiftData

@main
struct CanLIIApp: App {
    var body: some Scene {
        WindowGroup {
            SearchView()
        }
        .modelContainer(for: Bookmark.self)
    }
}

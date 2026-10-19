import SwiftUI

/// Coda on Apple Vision Pro (v35): the whole game in a window, built from the same sources as
/// iPhone and Mac, plus the poster wall as a space you stand inside (PosterWall.swift).
@main
struct QuotableApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .frame(minWidth: 560, minHeight: 760)
        }
        .windowResizability(.contentMinSize)

        ImmersiveSpace(id: PosterWall.id) {
            PosterWall()
        }
    }
}

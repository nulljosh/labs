import SwiftUI

@main
struct HamurabiApp: App {
    var body: some Scene {
        #if os(macOS)
        // One window, and closing it quits: no music playing on with nothing to look at.
        Window("Hamurabi", id: "main") { RootView() }
            .windowStyle(.hiddenTitleBar)
            .defaultSize(width: 1120, height: 720)
            .windowResizability(.contentMinSize)
        #else
        WindowGroup { RootView() }
        #endif
    }
}

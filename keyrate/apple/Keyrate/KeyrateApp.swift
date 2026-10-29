import SwiftUI

@main
struct KeyrateApp: App {
    var body: some Scene {
        let window = WindowGroup { ContentView() }
        #if os(macOS)
        window.defaultSize(width: 980, height: 720)
        #else
        window
        #endif
    }
}

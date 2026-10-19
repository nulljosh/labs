import SwiftUI

// ponytail: single-window app, so quit when the window closes (App Review Guideline 4 alternative)
// instead of adding a Window menu. Switch to a Window scene + menu if a second window ever appears.
final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

@main
struct ConwayApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .defaultSize(width: 1440, height: 900)
        .commands { CommandGroup(replacing: .newItem) {} }
    }
}

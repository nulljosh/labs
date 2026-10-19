import SwiftUI

@main
struct FieldbookApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView().frame(minWidth: 760, minHeight: 520)
        }
        .windowResizability(.contentMinSize)
    }
}

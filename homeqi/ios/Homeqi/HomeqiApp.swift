import SwiftUI

@main
struct HomeqiApp: App {
    // `-readTab` opens on Read, so screenshots and visual checks need no taps.
    @State private var tab = CommandLine.arguments.contains("-readTab") ? 1 : 0

    var body: some Scene {
        WindowGroup {
            TabView(selection: $tab) {
                AssessmentView()
                    .tabItem { Label("Assess", systemImage: "checklist") }
                    .tag(0)
                ChapterListView()
                    .tabItem { Label("Read", systemImage: "book") }
                    .tag(1)
            }
        }
    }
}

import SwiftUI

@main
struct EtymaApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    @State private var query = ""

    var body: some View {
        NavigationStack {
            List {
                if query.isEmpty {
                    Text("Search a word to trace its roots.")
                        .foregroundStyle(.secondary)
                }
            }
            .searchable(text: $query, prompt: "Look up a word")
            .navigationTitle("Etyma")
        }
    }
}

import SwiftUI

@main
struct QuoteGuessApp: App {
    var body: some Scene {
        WindowGroup {
            GameWebView()
                .ignoresSafeArea()
        }
    }
}

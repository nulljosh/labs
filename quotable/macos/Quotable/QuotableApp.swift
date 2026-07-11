import SwiftUI

@main
struct QuotableApp: App {
    var body: some Scene {
        WindowGroup {
            GameWebView()
                .frame(minWidth: 480, minHeight: 700)
        }
    }
}

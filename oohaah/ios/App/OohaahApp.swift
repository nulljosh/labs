import SwiftUI

@main
struct OohaahApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
                .tint(Theme.accent)
                #if os(macOS)
                .frame(minWidth: 420, minHeight: 640)
                #endif
        }
    }
}

/// Mirrors web/tokens.css. Every colour is from clrs.cc.
enum Theme {
    static let accent = Color("AccentColor")
    static let purple = Color(red: 0xB1 / 255, green: 0x0D / 255, blue: 0xC9 / 255)
    static let navy = Color(red: 0x00 / 255, green: 0x1F / 255, blue: 0x3F / 255)
    static let danger = Color(red: 0xFF / 255, green: 0x41 / 255, blue: 0x36 / 255)
    static let terms = URL(string: "https://oohaah.jaybulb.com/terms")!
    static let privacy = URL(string: "https://oohaah.jaybulb.com/privacy")!
    static let contact = URL(string: "mailto:trommatic@icloud.com?subject=Oohaah")!

    /// Thin condensed caps, the native echo of the landing's display face.
    static func display(_ size: CGFloat) -> Font { .system(size: size, weight: .light).width(.condensed) }
}

struct RootView: View {
    @AppStorage("oohaah.adult") private var adult = false

    var body: some View {
        if adult { CallView() } else { GateView(adult: $adult) }
    }
}

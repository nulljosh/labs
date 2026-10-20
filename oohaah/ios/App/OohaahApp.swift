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

/// The 8 point grid and the one radius. Every gap and size in the app comes from here.
enum Space {
    static let s: CGFloat = 8
    static let m: CGFloat = 12
    static let l: CGFloat = 16
    static let xl: CGFloat = 24
    static let xxl: CGFloat = 32
    static let control: CGFloat = 48
    static let radius: CGFloat = 20
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

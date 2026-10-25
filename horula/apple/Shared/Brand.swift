import SwiftUI
#if os(iOS)
import AlarmKit

/// What an alarm carries into the system alert and the Live Activity.
struct HorulaAlarm: AlarmMetadata { var label = "" }
#endif

extension Color {
    /// The one brand colour: #0a5fd6, lighter in dark mode like the web tokens.
    static let horula = Color(light: .init(red: 0x0a / 255, green: 0x5f / 255, blue: 0xd6 / 255), dark: .init(red: 0x4d / 255, green: 0xa3 / 255, blue: 1))
    init(light: Color, dark: Color) {
        #if os(watchOS)
        self = dark   // the watch is always dark
        #elseif os(macOS)
        self.init(nsColor: NSColor(name: nil) { $0.bestMatch(from: [.darkAqua, .vibrantDark]) != nil ? NSColor(dark) : NSColor(light) })
        #else
        self.init(uiColor: UIColor { $0.userInterfaceStyle == .dark ? UIColor(dark) : UIColor(light) })
        #endif
    }
}


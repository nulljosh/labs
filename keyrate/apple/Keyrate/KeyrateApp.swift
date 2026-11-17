import SwiftUI

/// Appearance: "system" follows the device, or force "light" / "dark". Stored in UserDefaults under "appearance".
enum Appearance: String, CaseIterable, Identifiable {
    case system, light, dark
    var id: String { rawValue }
    var label: String { rawValue.capitalized }
    var scheme: ColorScheme? { self == .light ? .light : self == .dark ? .dark : nil }
}

@main
struct KeyrateApp: App {
    @AppStorage("appearance") private var appearance = Appearance.system

    var body: some Scene {
        let window = WindowGroup { ContentView().preferredColorScheme(appearance.scheme) }
        #if os(macOS)
        window.defaultSize(width: 980, height: 720)
        Settings {
            Form {
                Picker("Appearance", selection: $appearance) {
                    ForEach(Appearance.allCases) { Text($0.label).tag($0) }
                }
                .pickerStyle(.inline)
            }
            .padding(20).frame(width: 280)
            .preferredColorScheme(appearance.scheme)
        }
        #else
        window
        #endif
    }
}

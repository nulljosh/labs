import SwiftUI

struct SettingsView: View {
    private let version = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? ""

    var body: some View {
        NavigationStack {
            List {
                Section {
                    LabeledContent("Version", value: version)
                }
                Section {
                    Link("Website", destination: URL(string: "https://coranto.jaybulb.com")!)
                    Link("Privacy", destination: URL(string: "https://coranto.jaybulb.com/privacy")!)
                    Link("Support", destination: URL(string: "https://coranto.jaybulb.com/support")!)
                }
            }
            .navigationTitle("Settings")
        }
    }
}

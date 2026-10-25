import SwiftUI

struct SettingsView: View {
    @AppStorage("readerTextSize") private var textSize = 17.0
    private let version = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? ""

    var body: some View {
        NavigationStack {
            List {
                Section("Reading") {
                    Stepper(value: $textSize, in: 13...28) {
                        LabeledContent("Text size", value: "\(Int(textSize)) pt")
                    }
                    Text("The quick brown fox reads the news.")
                        .font(.system(size: textSize))
                        .foregroundStyle(.secondary)
                }
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

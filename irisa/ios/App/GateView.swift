import SwiftUI

/// 18+ and the rules, agreed once before the camera ever turns on.
struct GateView: View {
    @Binding var adult: Bool
    @State private var agreed = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Image("Mascot")
                    .resizable()
                    .frame(width: 112, height: 112)
                    .accessibilityLabel("Irisa's mascot, a small monkey with white wings")
                Text("IRISA PUTS YOU ON CAMERA WITH A STRANGER.")
                    .font(Theme.display(40))
                VStack(alignment: .leading, spacing: 12) {
                    rule("18 and over", "Adults only. Minors are removed.")
                    rule("No nudity", "Nothing sexual, ever, on camera or in chat.")
                    rule("No harassment", "Slurs are masked before anyone sees them.")
                    rule("Report", "Cuts the call. Reports are reviewed by a person.")
                    rule("Block", "You will never be matched with that person again.")
                }
                Toggle(isOn: $agreed) {
                    Text("I am 18 or older and I agree to the [terms](\(Theme.terms.absoluteString)).")
                }
                #if os(iOS)
                .toggleStyle(.switch)
                #else
                .toggleStyle(.checkbox)
                #endif
                Button {
                    adult = true
                } label: {
                    Text("Continue").frame(maxWidth: .infinity, minHeight: 48)
                }
                .buttonStyle(.borderedProminent)
                .buttonBorderShape(.capsule)
                .disabled(!agreed)
                HStack(spacing: 16) {
                    Link("Privacy", destination: Theme.privacy)
                    Link("Contact", destination: Theme.contact)
                }
                .font(.footnote)
            }
            .padding(24)
            .frame(maxWidth: 560, alignment: .leading)
            .frame(maxWidth: .infinity)
        }
    }

    private func rule(_ title: String, _ detail: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title).font(.headline)
            Text(detail).foregroundStyle(.secondary)
        }
    }
}

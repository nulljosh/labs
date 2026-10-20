import SwiftUI

/// 18+ and the rules, agreed once before the camera ever turns on. An inset grouped list.
struct GateView: View {
    @Binding var adult: Bool
    @State private var agreed = false

    private let rules: [(String, String)] = [
        ("18 and over", "Adults only. Minors are removed."),
        ("No nudity", "Nothing sexual, ever, on camera or in chat."),
        ("No harassment", "Slurs are masked before anyone sees them."),
        ("Report", "Cuts the call. Reports are reviewed by a person."),
        ("Block", "You are never matched with that person again."),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Space.xl) {
                Image("Mascot")
                    .resizable()
                    .frame(width: 80, height: 80)
                    .accessibilityHidden(true)
                Text("Oohaah puts you on camera with a stranger.")
                    .font(.largeTitle.bold())
                    .fixedSize(horizontal: false, vertical: true)
                group {
                    ForEach(Array(rules.enumerated()), id: \.offset) { index, rule in
                        if index > 0 { Divider().padding(.leading, Space.l) }
                        VStack(alignment: .leading, spacing: 2) {
                            Text(rule.0).font(.body.weight(.semibold))
                            Text(rule.1).font(.subheadline).foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.vertical, Space.m)
                        .padding(.horizontal, Space.l)
                    }
                }
                group {
                    Toggle(isOn: $agreed) {
                        Text("I am 18 or older and I agree to the [terms](\(Theme.terms.absoluteString)).")
                    }
                    .padding(.vertical, Space.m)
                    .padding(.horizontal, Space.l)
                }
                Button {
                    adult = true
                } label: {
                    Text("Continue")
                        .font(.body.weight(.semibold))
                        .frame(maxWidth: .infinity, minHeight: Space.control)
                }
                .buttonStyle(.glassProminent)
                .buttonBorderShape(.capsule)
                .disabled(!agreed)
                HStack(spacing: Space.l) {
                    Link("Privacy", destination: Theme.privacy)
                    Link("Contact", destination: Theme.contact)
                }
                .font(.footnote)
                .frame(maxWidth: .infinity)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, Space.xxl)
            .frame(maxWidth: 680)
            .frame(maxWidth: .infinity)
        }
    }

    /// One inset grouped container: radius 20, no borders, rows separated by an inset hairline.
    private func group<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
        VStack(spacing: 0, content: content)
            .background(.fill.quinary, in: RoundedRectangle(cornerRadius: Space.radius, style: .continuous))
    }
}

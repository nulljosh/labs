import SwiftUI

/// Start or join a live duel (v33). Starting shows a four-letter code and a link a friend can open in
/// the app or any browser; joining takes their code. The sheet closes itself when the duel begins.
struct DuelSheet: View {
    @Environment(\.dismiss) private var dismiss
    let game: Game
    @Binding var duel: Duel?
    @State private var joinCode = ""

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                if let duel, duel.stage == .waiting {
                    Text("Send this to a friend. The duel starts when they open it.")
                        .font(.quip(.headline)).multilineTextAlignment(.center)
                    Text(duel.code).font(.quip(.largeTitle, weight: .bold)).kerning(6)
                    if duel.failed {
                        Text("That duel is full or gone. Start a new one.").font(.quip(.footnote)).foregroundStyle(.red)
                    } else {
                        ShareLink(item: duel.link) { Text("Share link") }.buttonStyle(PrimaryButtonStyle())
                        ProgressView().padding(.top, 8)
                    }
                } else {
                    Text("Ten quotes, the same for both of you, scored live.")
                        .font(.quip(.headline)).multilineTextAlignment(.center)
                    Button("Start a duel") { open(Duel(bank: game.quotes)) }.buttonStyle(PrimaryButtonStyle())
                    HStack(spacing: 12) {
                        TextField("Friend's code", text: $joinCode)
                            .textFieldStyle(.roundedBorder)
                            #if os(iOS)
                            .textInputAutocapitalization(.characters)
                            #endif
                            .autocorrectionDisabled()
                        Button("Join") { open(Duel(code: joinCode, bank: game.quotes)) }
                            .buttonStyle(SecondaryButtonStyle())
                            .disabled(!Duel.isCode(joinCode))
                    }
                }
            }
            .padding(28)
            .navigationTitle("Live duel")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { if duel?.stage == .waiting { duel?.close(); duel = nil }; dismiss() }
                }
            }
        }
    }

    private func open(_ d: Duel) {
        d.onStart = { quotes in
            game.start(fixed: quotes)
            dismiss()
        }
        duel = d
        d.connect()
    }
}

import CoreImage.CIFilterBuiltins
import SwiftUI

/// Coda on Apple TV (v34): a living-room game. The TV shows the line and the scores; everyone
/// plays on their own phone at coda.jaybulb.com/buzz with the code on screen (PartyHost.swift).
@main
struct CodaTV: App {
    var body: some Scene {
        WindowGroup { PartyScreen() }
    }
}

struct PartyScreen: View {
    @State private var host = PartyHost(bank: Quote.loadBundled())
    private let clock = Timer.publish(every: 0.25, on: .main, in: .common).autoconnect()

    var body: some View {
        Group {
            switch host.stage {
            case .lobby: Lobby(host: host)
            case .question, .reveal: Round(host: host)
            case .over: Over(host: host)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.canvas)
        .font(.quip(.body))
        .onAppear { host.connect() }
        .onReceive(clock) { _ in host.tick() }
    }
}

private struct Lobby: View {
    let host: PartyHost

    var body: some View {
        HStack(spacing: 80) {
            VStack(alignment: .leading, spacing: 28) {
                Text("Coda").font(.quip(.largeTitle, weight: .bold))
                Text("Grab your phones. Open \(host.joinURL.host() ?? "")/buzz and type the code.")
                    .font(.quip(.title3)).foregroundStyle(.secondary)
                Text(host.code).font(.quip(.largeTitle, weight: .bold)).kerning(24).foregroundStyle(Theme.accentStroke)
                    .scaleEffect(1.6, anchor: .leading).padding(.vertical, 24)
                if !host.connected {
                    Text("Can't reach the game room. Check the TV's internet.").foregroundStyle(.red)
                }
                PlayerChips(players: host.players)
                Button(host.players.isEmpty ? "Waiting for players" : "Start the game") { host.start() }
                    .disabled(host.players.isEmpty)
            }
            QRCode(url: host.joinURL).frame(width: 360, height: 360)
        }
        .padding(80)
    }
}

private struct PlayerChips: View {
    let players: [PartyHost.Player]
    var body: some View {
        HStack(spacing: 16) {
            ForEach(players) { p in
                HStack(spacing: 8) {
                    Circle().fill(p.buzz == nil ? Color.secondary.opacity(0.3) : Theme.accent).frame(width: 14, height: 14)
                    Text(p.name).font(.quip(.headline, weight: .semibold))
                }
                .padding(.horizontal, 18).padding(.vertical, 10)
                .background(.thinMaterial, in: Capsule())
            }
        }
    }
}

private struct Round: View {
    let host: PartyHost

    var body: some View {
        if let q = host.current {
            VStack(spacing: 36) {
                HStack {
                    Text("Question \(host.round) of \(PartyHost.rounds)").font(.quip(.headline)).foregroundStyle(.secondary)
                    Spacer()
                    if host.stage == .question {
                        Text("\(Int(host.timeLeft.rounded(.up)))").font(.quip(.title, weight: .bold)).monospacedDigit()
                    }
                }
                Text(LocalizedStringKey(q.prompt)).font(.quip(.title3, weight: .semibold)).foregroundStyle(.secondary)
                Text("\u{201C}\(q.quote)\u{201D}").font(.quip(.largeTitle, weight: .semibold)).multilineTextAlignment(.center)
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 24) {
                    ForEach(host.options, id: \.self) { o in
                        let right = host.stage == .reveal && o == q.answer
                        Text(o).font(.quip(.title3, weight: .semibold))
                            .frame(maxWidth: .infinity, minHeight: 96)
                            .background(right ? Color.green : Color.secondary.opacity(0.12), in: RoundedRectangle(cornerRadius: 20))
                            .foregroundStyle(right ? .white : .primary)
                    }
                }
                if host.stage == .reveal {
                    HStack(spacing: 32) {
                        ForEach(host.standings) { p in
                            Text("\(p.name) \(p.score)\(p.gained > 0 ? "  +\(p.gained)" : "")").font(.quip(.headline, weight: .semibold))
                                .foregroundStyle(p.gained > 0 ? Color.green : Color.primary)
                        }
                    }
                    Button(host.round == PartyHost.rounds ? "See who won" : "Next question") { host.next() }
                } else {
                    PlayerChips(players: host.players)
                    Button("Show the answer") { host.reveal() }
                }
            }
            .padding(80)
        }
    }
}

private struct Over: View {
    let host: PartyHost
    var body: some View {
        VStack(spacing: 32) {
            Text(host.standings.first.map { "\($0.name) wins" } ?? "Game over").font(.quip(.largeTitle, weight: .bold))
            ForEach(Array(host.standings.enumerated()), id: \.element.id) { i, p in
                Text("\(i + 1).  \(p.name)  \(p.score)").font(.quip(.title2, weight: i == 0 ? .bold : .regular))
            }
            Button("Play again") { host.start() }
            Button("Back to the lobby") { host.backToLobby() }
        }
        .padding(80)
    }
}

/// The join link as a QR code, so a phone camera gets straight to the buzzer.
private struct QRCode: View {
    let url: URL
    var body: some View {
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(url.absoluteString.utf8)
        filter.correctionLevel = "M"
        let scaled = filter.outputImage?.transformed(by: CGAffineTransform(scaleX: 12, y: 12))
        if let scaled, let cg = CIContext().createCGImage(scaled, from: scaled.extent) {
            return AnyView(Image(decorative: cg, scale: 1).interpolation(.none).resizable().padding(20).background(Color.white, in: RoundedRectangle(cornerRadius: 24)))
        }
        return AnyView(EmptyView())
    }
}

import SwiftUI

/// The call: the stranger full size, you in the corner, the clock, and the six buttons.
struct CallView: View {
    @State private var call = Call()
    @AppStorage("irisa.handle") private var handle = ""
    @State private var text = ""
    @State private var reporting = false

    private var real: Bool { call.state == .connected }
    private var live: Bool { real || call.practicing }

    var body: some View {
        VStack(spacing: 0) {
            header
            stage
            if live { chat }
            controls
        }
        #if DEBUG
        .task { if UserDefaults.standard.bool(forKey: "autostart") { await call.start(handle: handle) } }
        #endif
        .confirmationDialog("What happened?", isPresented: $reporting, titleVisibility: .visible) {
            ForEach(["Nudity or sexual content", "Harassment or hate", "Looks under 18", "Spam or a bot", "Something else"], id: \.self) { reason in
                Button(reason, role: .destructive) { call.report(reason) }
            }
        } message: {
            Text("The call ends now. Three reports and they are banned.")
        }
    }

    private var header: some View {
        HStack(alignment: .firstTextBaseline, spacing: 12) {
            Text("IRISA").font(Theme.display(24))
            Text(call.note.isEmpty ? "Ready" : call.note)
                .font(.footnote)
                .foregroundStyle(.secondary)
                .lineLimit(1)
            Spacer()
            if let deadline = call.deadline {
                TimelineView(.periodic(from: .now, by: 0.25)) { context in
                    let left = max(0, Int(deadline.timeIntervalSince(context.date).rounded(.up)))
                    Text("\(left)")
                        .font(Theme.display(28).monospacedDigit())
                        .foregroundStyle(left <= 5 ? Theme.danger : Theme.accent)
                        .accessibilityLabel("\(left) seconds left")
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private var stage: some View {
        ZStack(alignment: .bottomTrailing) {
            ZStack {
                LinearGradient(colors: [Theme.purple, Theme.navy], startPoint: .top, endPoint: .bottom)
                if let remote = call.remoteVideo {
                    VideoView(track: remote)
                } else if call.practicing {
                    VStack(spacing: 16) {
                        Image("Mascot").resizable().frame(width: 112, height: 112)
                            .phaseAnimator([false, true]) { view, up in
                                view.offset(y: up ? -6 : 0).rotationEffect(.degrees(up ? -3 : 0))
                            } animation: { _ in .easeInOut(duration: 0.8) }
                            .accessibilityHidden(true)
                        Text("PRACTICE CALL").font(Theme.display(28)).foregroundStyle(.white)
                        Text("Iri is the Irisa mascot, not a person. You will be moved to a real person the moment one arrives.")
                            .font(.footnote)
                            .foregroundStyle(.white.opacity(0.85))
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: 320)
                    }
                    .padding(24)
                } else {
                    VStack(spacing: 16) {
                        Image("Mascot").resizable().frame(width: 112, height: 112)
                            .accessibilityHidden(true)
                        Text(call.state == .idle ? "Fifteen seconds with someone new." : call.state == .connecting ? "Connecting..." : "Finding someone...")
                            .font(Theme.display(28))
                            .foregroundStyle(.white)
                            .multilineTextAlignment(.center)
                    }
                    .padding(24)
                }
                if let banner {
                    VStack {
                        Text(banner)
                            .font(.subheadline.weight(.semibold))
                            .padding(.horizontal, 16).padding(.vertical, 8)
                            .background(.ultraThinMaterial, in: Capsule())
                        Spacer()
                    }
                    .padding(12)
                }
            }
            if let local = call.localVideo {
                VideoView(track: local)
                    .frame(width: 96, height: 128)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(.white.opacity(0.6), lineWidth: 1))
                    .padding(12)
                    .accessibilityLabel("Your camera")
            }
        }
        .clipped()
    }

    private var banner: String? {
        if let kept = call.kept {
            return kept.isEmpty ? "You kept each other, but they left no handle." : "You kept each other. They are \(kept)."
        }
        switch call.asked {
        case "extend": return "They want more time. Tap More time."
        case "keep": return "They want to keep you. Tap Keep."
        default: return nil
        }
    }

    private var chat: some View {
        VStack(spacing: 8) {
            ScrollView {
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(call.lines.suffix(20)) { line in
                        Text(line.text)
                            .padding(.horizontal, 12).padding(.vertical, 6)
                            .background(line.mine ? Theme.purple : Color.secondary.opacity(0.15), in: RoundedRectangle(cornerRadius: 12))
                            .foregroundStyle(line.mine ? .white : .primary)
                            .frame(maxWidth: .infinity, alignment: line.mine ? .trailing : .leading)
                    }
                }
            }
            .frame(maxHeight: 120)
            HStack {
                TextField("Say something", text: $text)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit(send)
                Button("Send", action: send).disabled(text.trimmingCharacters(in: .whitespaces).isEmpty)
            }
        }
        .padding(.horizontal, 16)
        .padding(.top, 8)
    }

    private func send() {
        call.say(String(text.prefix(280)))
        text = ""
    }

    @ViewBuilder private var controls: some View {
        VStack(spacing: 8) {
            if call.state == .idle {
                TextField("Your @ (shared only if you both keep)", text: $handle)
                    .textFieldStyle(.roundedBorder)
                    .autocorrectionDisabled()
                    .onChange(of: handle) { _, new in if new.count > 32 { handle = String(new.prefix(32)) } }
                pill("Start", prominent: true) { Task { await call.start(handle: handle) } }
            } else {
                HStack(spacing: 8) {
                    pill("More time", prominent: call.asked == "extend", action: call.extend).disabled(!live)
                    pill("Keep", prominent: call.asked == "keep", action: call.keep).disabled(!live)
                    pill("Next", action: call.next)
                }
                HStack(spacing: 8) {
                    pill("Block", action: call.block).disabled(!real)
                    pill("Report", role: .destructive) { reporting = true }.disabled(!real)
                    pill("Stop") { call.stop() }
                }
            }
        }
        .padding(16)
    }

    private func pill(_ title: String, prominent: Bool = false, role: ButtonRole? = nil, action: @escaping () -> Void) -> some View {
        Button(role: role, action: action) {
            Text(title).frame(maxWidth: .infinity, minHeight: 48)
        }
        .buttonBorderShape(.capsule)
        .modifier(Prominence(prominent: prominent))
    }
}

private struct Prominence: ViewModifier {
    let prominent: Bool
    func body(content: Content) -> some View {
        if prominent { content.buttonStyle(.borderedProminent) } else { content.buttonStyle(.bordered) }
    }
}

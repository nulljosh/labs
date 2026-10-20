import SwiftUI

/// The call, FaceTime style: the stranger fills the screen, everything else floats on Liquid Glass.
/// Every gap is on the 8 point grid, every control is a 48 point capsule.
struct CallView: View {
    @State private var call = Call()
    @AppStorage("oohaah.handle") private var handle = ""
    @State private var text = ""
    @State private var reporting = false

    private var real: Bool { call.state == .connected }
    private var live: Bool { real || call.practicing }

    var body: some View {
        ZStack {
            stage.ignoresSafeArea()
            VStack(spacing: Space.m) {
                header
                if let banner { pill(banner) }
                Spacer(minLength: 0)
                if live { chat }
                controls
            }
            .padding(Space.l)
        }
        .overlay(alignment: .topTrailing) { selfView }
        .tint(Theme.purple)
        .preferredColorScheme(.dark)
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

    // MARK: - Stage

    private var stage: some View {
        ZStack {
            Color.black
            if let remote = call.remoteVideo {
                VideoView(track: remote)
            } else {
                placeholder
            }
        }
    }

    private var placeholder: some View {
        VStack(spacing: Space.l) {
            Image("Mascot")
                .resizable()
                .frame(width: 112, height: 112)
                .phaseAnimator([false, true]) { view, up in
                    view.offset(y: up && call.practicing ? -4 : 0)
                } animation: { _ in .easeInOut(duration: 0.8) }
                .accessibilityHidden(true)
            VStack(spacing: Space.s) {
                Text(headline).font(.title2.bold())
                if call.practicing {
                    Text("Momo is the Oohaah mascot, not a person. A real person takes over the moment one arrives.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
            .multilineTextAlignment(.center)
            .frame(maxWidth: 320)
        }
        .foregroundStyle(.white)
        .padding(Space.xl)
        .padding(.bottom, Space.control * 3)  // clear the control block below
    }

    private var headline: String {
        if call.practicing { return "Practice call" }
        switch call.state {
        case .idle: return "Fifteen seconds with someone new."
        case .connecting: return "Connecting..."
        default: return "Finding someone..."
        }
    }

    // MARK: - Floating chrome

    private var header: some View {
        HStack(spacing: Space.m) {
            HStack(spacing: Space.s) {
                Text("Oohaah").font(.headline)
                Text(call.note.isEmpty ? "Ready" : call.note)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
            .padding(.horizontal, Space.l)
            .frame(height: Space.control)
            .glassEffect(.regular, in: .capsule)
            Spacer(minLength: 0)
            if let deadline = call.deadline {
                TimelineView(.periodic(from: .now, by: 0.25)) { context in
                    let left = max(0, Int(deadline.timeIntervalSince(context.date).rounded(.up)))
                    Text("\(left)")
                        .font(.headline.monospacedDigit())
                        .foregroundStyle(left <= 5 ? Theme.danger : .white)
                        .frame(width: Space.control, height: Space.control)
                        .glassEffect(.regular, in: .circle)
                        .accessibilityLabel("\(left) seconds left")
                }
            }
        }
    }

    @ViewBuilder private var selfView: some View {
        if let local = call.localVideo {
            VideoView(track: local)
                .frame(width: 96, height: 128)
                .clipShape(RoundedRectangle(cornerRadius: Space.radius, style: .continuous))
                .padding(.top, Space.l + Space.control + Space.s)
                .padding(.trailing, Space.l)
                .accessibilityLabel("Your camera")
        }
    }

    private func pill(_ text: String) -> some View {
        Text(text)
            .font(.subheadline.weight(.semibold))
            .padding(.horizontal, Space.l)
            .frame(minHeight: Space.control)
            .glassEffect(.regular.tint(Theme.purple.opacity(0.4)), in: .capsule)
    }

    private var banner: String? {
        if let kept = call.kept {
            return kept.isEmpty ? "You kept each other, but they left no handle." : "You kept each other. They are \(kept)."
        }
        switch call.asked {
        case "extend": return "They want more time."
        case "keep": return "They want to keep you."
        default: return nil
        }
    }

    private var chat: some View {
        VStack(alignment: .leading, spacing: Space.s) {
            ForEach(call.lines.suffix(4)) { line in
                Text(line.text)
                    .font(.subheadline)
                    .padding(.horizontal, Space.m)
                    .padding(.vertical, Space.s)
                    .glassEffect(line.mine ? .regular.tint(Theme.purple.opacity(0.6)) : .regular,
                                 in: RoundedRectangle(cornerRadius: Space.radius, style: .continuous))
                    .frame(maxWidth: .infinity, alignment: line.mine ? .trailing : .leading)
            }
            HStack(spacing: Space.s) {
                TextField("Say something", text: $text)
                    .textFieldStyle(.plain)
                    .onSubmit(send)
                    .padding(.horizontal, Space.l)
                    .frame(height: Space.control)
                    .glassEffect(.regular, in: .capsule)
                Button(action: send) {
                    Image(systemName: "arrow.up")
                        .font(.headline)
                        .frame(width: Space.control, height: Space.control)
                }
                .buttonStyle(.glassProminent)
                .buttonBorderShape(.circle)
                .disabled(text.trimmingCharacters(in: .whitespaces).isEmpty)
                .accessibilityLabel("Send")
            }
        }
    }

    private func send() {
        call.say(String(text.prefix(280)))
        text = ""
    }

    @ViewBuilder private var controls: some View {
        GlassEffectContainer(spacing: Space.s) {
            if call.state == .idle {
                VStack(spacing: Space.s) {
                    TextField("Your @, shared only if you both keep", text: $handle)
                        .textFieldStyle(.plain)
                        .autocorrectionDisabled()
                        .onChange(of: handle) { _, new in if new.count > 32 { handle = String(new.prefix(32)) } }
                        .padding(.horizontal, Space.l)
                        .frame(height: Space.control)
                        .glassEffect(.regular, in: .capsule)
                    capsule("Start", prominent: true) { Task { await call.start(handle: handle) } }
                }
            } else {
                VStack(spacing: Space.s) {
                    HStack(spacing: Space.s) {
                        capsule("More time", prominent: call.asked == "extend", action: call.extend).disabled(!live)
                        capsule("Keep", prominent: call.asked == "keep", action: call.keep).disabled(!live)
                        capsule("Next", action: call.next)
                    }
                    HStack(spacing: Space.s) {
                        capsule("Block", action: call.block).disabled(!real)
                        capsule("Report") { reporting = true }.disabled(!real).tint(Theme.danger)
                        capsule("Stop") { call.stop() }
                    }
                }
            }
        }
    }

    private func capsule(_ title: String, prominent: Bool = false, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.body.weight(.semibold))
                .frame(maxWidth: .infinity, minHeight: Space.control)
        }
        .buttonBorderShape(.capsule)
        .modifier(Prominence(prominent: prominent))
    }
}

private struct Prominence: ViewModifier {
    let prominent: Bool
    @Environment(\.isEnabled) private var enabled

    func body(content: Content) -> some View {
        if prominent {
            content.buttonStyle(.glassProminent)
        } else {
            // White reads on dark glass; a disabled button has to look disabled too.
            content.buttonStyle(.glass).foregroundStyle(.white.opacity(enabled ? 1 : 0.35))
        }
    }
}

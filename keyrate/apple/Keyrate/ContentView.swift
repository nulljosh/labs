import SwiftUI

private struct Palette {
    let bg, text, dim, chip, bad, hi: Color
    // Colours from the shared tokens (warm paper and charcoal), accent from brand/BRAND.md.
    static let light = Palette(bg: Color(red: 0.961, green: 0.941, blue: 0.894), text: Color(red: 0.122, green: 0.106, blue: 0.086),
                               dim: Color(red: 0.122, green: 0.106, blue: 0.086).opacity(0.34), chip: Color(red: 0.922, green: 0.894, blue: 0.827),
                               bad: Color(red: 0.753, green: 0.224, blue: 0.169), hi: Color(red: 0.902, green: 0.604, blue: 0).opacity(0.25))
    static let dark = Palette(bg: Color(red: 0.110, green: 0.102, blue: 0.090), text: Color(red: 0.953, green: 0.929, blue: 0.878),
                              dim: Color(red: 0.953, green: 0.929, blue: 0.878).opacity(0.34), chip: Color(red: 0.149, green: 0.137, blue: 0.122),
                              bad: Color(red: 0.851, green: 0.314, blue: 0.247), hi: Color(red: 0.902, green: 0.604, blue: 0).opacity(0.25))
}

private struct DefaultsStore: Store {
    func get(_ key: String) -> String? { UserDefaults.standard.string(forKey: key) }
    func put(_ key: String, _ value: String) { UserDefaults.standard.set(value, forKey: key) }
}

#if os(macOS)
private let wordSize: CGFloat = 26
#else
private let wordSize: CGFloat = 22
#endif

struct ContentView: View {
    @Environment(\.colorScheme) private var scheme
    @State private var mode = modes[2]
    @State private var punct = false
    @State private var session = Session(mode: modes[2])
    @State private var input = ""
    @State private var best = 0
    @State private var clock = 0 // bumped on every tick so the countdown redraws
    @FocusState private var focus: Bool
    private let store = DefaultsStore()
    private let ticker = Timer.publish(every: 0.1, on: .main, in: .common).autoconnect()

    private var p: Palette { scheme == .dark ? .dark : .light }
    private var nowMs: Int64 { Int64(ProcessInfo.processInfo.systemUptime * 1000) + 1 } // never 0, Session reads 0 as "not started"

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Text("Keyrate").font(.system(size: 16, weight: .semibold)).foregroundStyle(p.text.opacity(0.6))
                Flow(hSpacing: 4, vSpacing: 4, centered: true) {
                    ForEach(modes.indices, id: \.self) { i in
                        chip(modes[i].label, on: modes[i] == mode) { mode = modes[i]; restart() }
                    }
                    chip("punct", on: punct) { punct.toggle(); restart() }
                    chip("restart", on: false) { restart() }
                }
                Text(counter).font(.system(size: 18)).foregroundStyle(p.dim).monospacedDigit()
                wordsView
                TextField("", text: $input)
                    .textFieldStyle(.plain)
                    .focused($focus)
                    .frame(width: 1, height: 1).opacity(0.01)
                    .autocorrectionDisabled()
                    #if os(iOS)
                    .textInputAutocapitalization(.never)
                    #endif
                    .onChange(of: input) { _, new in
                        if new != session.text { session.setText(new, nowMs: nowMs) }
                        if input != session.text { input = session.text } // a refused edit puts the old text back
                        clock += 1
                    }
                    .onKeyPress(.tab) { restart(); return .handled }
                    .onKeyPress(.return) { if session.done { restart(); return .handled }; return .ignored }
                if let r = session.result { resultView(r) } else {
                    Text("Start typing. Tab restarts.").font(.system(size: 14)).foregroundStyle(p.dim)
                }
            }
            .padding(24)
            .frame(maxWidth: .infinity, minHeight: 600)
        }
        .background(p.bg.ignoresSafeArea())
        .task { try? await Task.sleep(for: .milliseconds(300)); focus = true } // the field is not focusable until the window is up
        .onReceive(ticker) { _ in
            if session.started && !session.done { session.tick(nowMs: nowMs); clock += 1 }
        }
        .onChange(of: session.done) { _, done in
            if done, let r = session.result { best = recordRun(store, mode, r.wpm) }
        }
    }

    private var counter: String {
        _ = clock
        if session.done { return " " }
        if mode.kind == .time { return String(session.remaining(nowMs: nowMs)) }
        return "\(min(session.typed.count - 1, session.total))/\(session.total)"
    }

    private var wordsView: some View {
        Flow(hSpacing: wordSize * 0.3, vSpacing: wordSize * 0.35, window: (session.typed.count - 1, 3)) {
            ForEach(session.target.indices, id: \.self) { k in
                Text(attributed(k)).font(.system(size: wordSize)).fixedSize()
            }
        }
        .frame(maxWidth: 832)
        .clipped()
        .opacity(session.done || !focus ? 0.35 : 1)
        .contentShape(Rectangle())
        .onTapGesture { focus = true }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Words to type")
    }

    private func attributed(_ k: Int) -> AttributedString {
        let t = Array(session.target[k])
        let ty = k < session.typed.count ? Array(session.typed[k]) : []
        let cur = session.typed.count - 1
        let wrongDone = k < cur && ty != t
        var out = AttributedString()
        for c in 0..<max(t.count, ty.count) {
            var s = AttributedString(String(c >= t.count ? ty[c] : t[c]))
            s.foregroundColor = c >= t.count ? p.bad.opacity(0.6) : c < ty.count ? (ty[c] == t[c] ? p.text : p.bad) : p.dim
            if wrongDone { s.underlineStyle = .single }
            if k == cur && c == ty.count { s.backgroundColor = p.hi }
            out += s
        }
        if k == cur && ty.count >= t.count { // the space after the word is where the caret sits once it is complete
            var s = AttributedString(" ")
            s.backgroundColor = p.hi
            out += s
        }
        return out
    }

    private func chip(_ label: String, on: Bool, _ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label).font(.system(size: 14)).foregroundStyle(on ? p.text : p.dim)
                .padding(.horizontal, 12).padding(.vertical, 8)
                .background(on ? p.chip : .clear, in: Capsule())
                .contentShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    private func resultView(_ r: Stats) -> some View {
        VStack(spacing: 12) {
            HStack(alignment: .lastTextBaseline, spacing: 6) {
                Text("\(r.wpm)").font(.system(size: 64, weight: .semibold)).foregroundStyle(p.text)
                Text("wpm").font(.system(size: 16)).foregroundStyle(p.dim)
            }
            HStack(spacing: 32) {
                stat("accuracy", "\(r.accuracy)%")
                stat("raw", "\(r.raw)")
                stat("chars", "\(r.correct)/\(r.wrong)")
            }
            Text("best \(best) wpm · \(mode.kind == .time ? "\(mode.n)s" : mode.label)").font(.system(size: 14)).foregroundStyle(p.dim)
            sparkline(runs(store))
            Text("Enter restarts.").font(.system(size: 13)).foregroundStyle(p.dim)
        }
        .accessibilityElement(children: .combine)
    }

    private func stat(_ label: String, _ value: String) -> some View {
        VStack(spacing: 2) {
            Text(label).font(.system(size: 12)).foregroundStyle(p.dim)
            Text(value).font(.system(size: 20)).foregroundStyle(p.text)
        }
    }

    @ViewBuilder private func sparkline(_ r: [Int]) -> some View {
        if r.count >= 2 {
            let top = CGFloat(max(r.max() ?? 1, 1))
            Path { path in
                for (i, v) in r.enumerated() {
                    let pt = CGPoint(x: 2 + CGFloat(i) / CGFloat(r.count - 1) * 236, y: 38 - CGFloat(v) / top * 36)
                    i == 0 ? path.move(to: pt) : path.addLine(to: pt)
                }
            }
            .stroke(p.text, style: StrokeStyle(lineWidth: 1.5, lineCap: .round, lineJoin: .round))
            .frame(width: 240, height: 40)
        }
    }

    private func restart() {
        session = Session(mode: mode, punct: punct)
        input = ""
        best = 0
        focus = true
    }
}

import SwiftUI

private struct Palette {
    // dim is small text (4.5:1 needed), word is the large upcoming words (3:1 needed)
    let bg, text, dim, word, chip, bad, hi: Color
    // Colours from the shared tokens (warm paper and charcoal), accent from brand/BRAND.md.
    static let light = Palette(bg: Color(red: 0.961, green: 0.941, blue: 0.894), text: Color(red: 0.122, green: 0.106, blue: 0.086),
                               dim: Color(red: 0.122, green: 0.106, blue: 0.086).opacity(0.66), word: Color(red: 0.122, green: 0.106, blue: 0.086).opacity(0.52), chip: Color(red: 0.922, green: 0.894, blue: 0.827),
                               bad: Color(red: 0.753, green: 0.224, blue: 0.169), hi: Color(red: 0.902, green: 0.604, blue: 0).opacity(0.25))
    static let dark = Palette(bg: Color(red: 0.110, green: 0.102, blue: 0.090), text: Color(red: 0.953, green: 0.929, blue: 0.878),
                              dim: Color(red: 0.953, green: 0.929, blue: 0.878).opacity(0.66), word: Color(red: 0.953, green: 0.929, blue: 0.878).opacity(0.52), chip: Color(red: 0.149, green: 0.137, blue: 0.122),
                              bad: Color(red: 0.851, green: 0.314, blue: 0.247), hi: Color(red: 0.902, green: 0.604, blue: 0).opacity(0.25))
}

private struct DefaultsStore: Store {
    func get(_ key: String) -> String? { UserDefaults.standard.string(forKey: key) }
    func put(_ key: String, _ value: String) { UserDefaults.standard.set(value, forKey: key) }
}



struct ContentView: View {
    @Environment(\.colorScheme) private var scheme
    @State private var mode = modes[2]
    @State private var punct = false
    @State private var session = Session(mode: modes[2])
    @State private var input = ""
    @State private var best = 0
    @State private var lastQuote: String?
    @State private var clock = 0 // bumped on every tick so the countdown redraws
    @FocusState private var focus: Bool
    private let store = DefaultsStore()
    @Environment(\.scenePhase) private var phase
    /// The countdown ticks only during a run in a window on screen; nothing runs in the background.
    private var ticking: Bool { session.started && !session.done && phase == .active }

    private var p: Palette { scheme == .dark ? .dark : .light }
    /// Follows Dynamic Type (and the Mac's text size), capped so three lines of words still fit the window.
    @ScaledMetric(relativeTo: .title2) private var typeScale: CGFloat = 1
    #if os(iOS)
    @Environment(\.horizontalSizeClass) private var sizeClass
    /// iPad (regular width) fills the 832 point column with Mac sized words; iPhone keeps them smaller.
    private var wordSize: CGFloat { (sizeClass == .regular ? 28 : 22) * min(typeScale, 1.6) }
    #else
    private var wordSize: CGFloat { 26 * min(typeScale, 1.6) }
    #endif
    private var nowMs: Int64 { Int64(ProcessInfo.processInfo.systemUptime * 1000) + 1 } // never 0, Session reads 0 as "not started"

    @State private var splash = UserDefaults.standard.string(forKey: "shot") == nil // store shots skip it

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Text(counter).font(.system(size: 18)).foregroundStyle(p.dim).monospacedDigit()
                wordsView
                TextField("", text: $input)
                    .textFieldStyle(.plain)
                    .focused($focus)
                    .frame(width: 1, height: 1).opacity(0.01)
                    .foregroundStyle(.clear).tint(.clear) // no stray caret dot under the words
                    .accessibilityLabel("Type the words shown")
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
        .safeAreaInset(edge: .top) { modeBar.padding(6).glassBar().padding(.horizontal, 16).padding(.top, 8) } // functional layer: the only glass
        .background(p.bg.ignoresSafeArea())
        .overlay { if splash { Splash(shown: $splash) } }
        .task { try? await Task.sleep(for: .milliseconds(300)); focus = true } // the field is not focusable until the window is up
        #if DEBUG
        .onAppear(perform: shot)
        #endif
        .task(id: ticking) {
            while ticking, !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(100))
                session.tick(nowMs: nowMs); clock += 1
            }
        }
        .onChange(of: session.done) { _, done in
            if done, let r = session.result { best = session.pasted ? Int(store.get(mode.key) ?? "") ?? 0 : recordRun(store, mode, r.wpm) }
        }
    }

    private var counter: String {
        _ = clock
        if session.done { return session.elapsed }
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
            s.foregroundColor = c >= t.count ? p.bad.opacity(0.6) : c < ty.count ? (ty[c] == t[c] ? p.text : p.bad) : p.word
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

    private var modeBar: some View {
        Flow(hSpacing: 4, vSpacing: 4, centered: true) {
            ForEach(modes.indices, id: \.self) { i in
                chip(modes[i].label, on: modes[i] == mode) { mode = modes[i]; restart() }
                    .keyboardShortcut(KeyEquivalent(Character("\(i + 1)")), modifiers: .command) // Cmd-1 to Cmd-6
            }
            chip("punct", on: punct) { punct.toggle(); restart() }
            chip("restart", on: false) { restart() }
                .keyboardShortcut("r", modifiers: .command)
        }    }

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
                stat("keys", "\(session.keyAccuracy)%")
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

    #if DEBUG
    /// Store screenshots without a demo account or a hand on the keyboard: `-shot typing` stops seven words into a
    /// 25 word run, `-shot result` finishes it. The run is typed one character at a time at about 85 wpm, with one
    /// typo fixed, through the same setText the keyboard uses.
    private func shot() {
        guard let kind = UserDefaults.standard.string(forKey: "shot") else { return }
        #if os(macOS)
        NSApp.windows.first?.setFrame(NSRect(x: 0, y: 0, width: 1440, height: 900), display: true) // 2880x1800 store size at 2x
        #endif
        mode = modes[3]
        session = Session(mode: mode, dice: .seeded(4))
        var text = "", ms: Int64 = 1
        func type(_ s: String) { for ch in s { text.append(ch); ms += 140; session.setText(text, nowMs: ms) } }
        func erase() { text.removeLast(); ms += 140; session.setText(text, nowMs: ms) }
        let count = kind == "result" ? session.target.count : 7
        for (i, w) in session.target.prefix(count).enumerated() {
            if i == 2 { type("x"); erase() }
            type(w)
            if i < count - 1 || kind != "result" { type(" ") }
        }
        input = session.text
        // The result reads better without the keyboard over it; the launch task focuses the field at 300 ms.
        if kind == "result" { Task { try? await Task.sleep(for: .milliseconds(800)); focus = false } }
    }
    #endif

    private func restart() {
        session = Session(mode: mode, punct: punct, avoid: lastQuote)
        if mode.kind == .quote { lastQuote = session.target.joined(separator: " ") }
        input = ""
        best = 0
        focus = true
    }
}

extension View {
    /// Liquid Glass on iOS and macOS 26, the regular material before that.
    @ViewBuilder func glassBar() -> some View {
        if #available(iOS 26, macOS 26, *) { glassEffect(.regular, in: .rect(cornerRadius: 24)) } else { background(.regularMaterial, in: .rect(cornerRadius: 24)) }
    }
}

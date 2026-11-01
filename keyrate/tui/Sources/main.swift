import Foundation

// keyrate-tui: the typing test in a terminal. Raw mode, a redraw on every key and every tenth of a second, the same
// Session as the iPhone and Mac app (Session.swift and Words.swift are symlinks to apple/Keyrate).
// Keys: type to start, Tab restarts, Enter restarts after a result, Left and Right change the mode, Esc quits.
// Bests per mode live in ~/.keyrate, one `key=value` per line.

let args = Array(CommandLine.arguments.dropFirst())
if args.first == "--check" { runChecks(); exit(0) }

/// ~/.keyrate: the same keys the apps use (best:time:60, runs).
struct FileStore: Store {
    let url = URL(fileURLWithPath: ProcessInfo.processInfo.environment["HOME"] ?? NSHomeDirectory()).appendingPathComponent(".keyrate")
    private func all() -> [String: String] {
        guard let s = try? String(contentsOf: url, encoding: .utf8) else { return [:] }
        var out: [String: String] = [:]
        for line in s.split(separator: "\n") {
            let kv = line.split(separator: "=", maxSplits: 1).map(String.init)
            if kv.count == 2 { out[kv[0]] = kv[1] }
        }
        return out
    }
    func get(_ key: String) -> String? { all()[key] }
    func put(_ key: String, _ value: String) {
        var a = all(); a[key] = value
        try? a.keys.sorted().map { "\($0)=\(a[$0]!)" }.joined(separator: "\n").appending("\n").write(to: url, atomically: true, encoding: .utf8)
    }
}

func nowMs() -> Int64 { Int64(Date().timeIntervalSince1970 * 1000) }

// Raw mode: no echo, no line buffering, restored on every way out.
var saved = termios()
tcgetattr(STDIN_FILENO, &saved)
func restore() { var t = saved; tcsetattr(STDIN_FILENO, TCSAFLUSH, &t); print("\u{1B}[?25h\u{1B}[?1049l", terminator: ""); fflush(stdout) }
var raw = saved
raw.c_lflag &= ~tcflag_t(ECHO | ICANON | ISIG | IEXTEN)
raw.c_iflag &= ~tcflag_t(IXON | ICRNL)
withUnsafeMutablePointer(to: &raw.c_cc) { $0.withMemoryRebound(to: cc_t.self, capacity: Int(NCCS)) { $0[Int(VMIN)] = 0; $0[Int(VTIME)] = 0 } }
tcsetattr(STDIN_FILENO, TCSAFLUSH, &raw)
signal(SIGTERM) { _ in restore(); exit(0) }
print("\u{1B}[?1049h\u{1B}[?25l", terminator: "")

let store = FileStore()
var modeIndex = args.first.flatMap { a in modes.firstIndex { $0.label == a || $0.label == "\(a) words" } } ?? 2
var session = Session(mode: modes[modeIndex])
var best = Int(store.get(modes[modeIndex].key) ?? "") ?? 0

func restart(_ index: Int? = nil) {
    if let index { modeIndex = (index + modes.count) % modes.count }
    session = Session(mode: modes[modeIndex], avoid: session.mode.kind == .quote ? session.target.joined(separator: " ") : nil)
    best = Int(store.get(modes[modeIndex].key) ?? "") ?? 0
}

func width() -> Int {
    var w = winsize()
    return ioctl(STDOUT_FILENO, TIOCGWINSZ, &w) == 0 && w.ws_col > 20 ? min(Int(w.ws_col) - 4, 80) : 76
}

/// The words, coloured as typed: right in plain ink, wrong in red, the rest dim; three lines around the current one.
func wordLines() -> [String] {
    let w = width()
    var lines: [[String]] = [[]], lens = [0], currentLine = 0
    for (i, t) in session.target.enumerated() {
        let typed = i < session.typed.count ? session.typed[i] : nil
        let shown = max(t.count, typed?.count ?? 0)
        if lens.last! + shown + 1 > w && lens.last! > 0 { lines.append([]); lens.append(0) }
        if i == session.typed.count - 1 { currentLine = lines.count - 1 }
        var s = ""
        if let typed, i < session.typed.count - 1 || session.done {
            s = typed == t ? t : "\u{1B}[31m\(typed.isEmpty ? t : typed)\u{1B}[0m"
        } else if let typed {
            let tc = Array(t), yc = Array(typed)
            for (c, ch) in tc.enumerated() {
                if c < yc.count { s += yc[c] == ch ? String(ch) : "\u{1B}[31m\(yc[c])\u{1B}[0m" }
                else { s += c == yc.count ? "\u{1B}[4;2m\(ch)\u{1B}[0m" : "\u{1B}[2m\(ch)\u{1B}[0m" }
            }
            if yc.count > tc.count { s += "\u{1B}[31m\(String(yc[tc.count...]))\u{1B}[0m" }
        } else {
            s = "\u{1B}[2m\(t)\u{1B}[0m"
        }
        lines[lines.count - 1].append(s)
        lens[lens.count - 1] += shown + 1
    }
    let start = max(0, min(currentLine - 1, lines.count - 3))
    return lines[start..<min(lines.count, start + 3)].map { $0.joined(separator: " ") }
}

func draw() {
    var out = "\u{1B}[H\u{1B}[2J\n  \u{1B}[1mkeyrate\u{1B}[0m   "
    out += modes.enumerated().map { i, m in i == modeIndex ? "\u{1B}[7m \(m.label) \u{1B}[0m" : "\u{1B}[2m \(m.label) \u{1B}[0m" }.joined()
    out += "\n\n"
    if let r = session.result {
        out += "  \u{1B}[1m\(r.wpm) wpm\u{1B}[0m   \(r.raw) raw   \(session.keyAccuracy)% accuracy   \(session.elapsed)\n"
        out += "  best \(best) wpm\(session.pasted ? "   (pasted, not counted)" : "")\n\n"
        out += "  \u{1B}[2mEnter or Tab for another, Left and Right change the mode, Esc quits\u{1B}[0m\n"
    } else {
        let counter = session.mode.kind == .time ? "\(session.remaining(nowMs: nowMs()))" : "\(max(0, session.typed.count - 1))/\(session.total)"
        out += "  \u{1B}[33m\(counter)\u{1B}[0m\n\n"
        out += wordLines().map { "  \($0)\n" }.joined()
        out += "\n  \u{1B}[2m\(session.started ? "Tab restarts, Esc quits" : "Start typing. Tab restarts, Left and Right change the mode, Esc quits")\u{1B}[0m\n"
    }
    FileHandle.standardOutput.write(out.data(using: .utf8)!)
}

func finished() {
    if let r = session.result, !session.pasted { best = recordRun(store, session.mode, r.wpm) }
}

var pending: [UInt8] = []
draw()
loop: while true {
    var fds = pollfd(fd: STDIN_FILENO, events: Int16(POLLIN), revents: 0)
    if poll(&fds, 1, 100) > 0 {
        var buf = [UInt8](repeating: 0, count: 64)
        let n = read(STDIN_FILENO, &buf, 64)
        if n > 0 { pending += buf[0..<n] }
    }
    let wasDone = session.done
    while !pending.isEmpty {
        let b = pending.removeFirst()
        switch b {
        case 27: // Esc alone quits; Esc [ C / D are the arrows
            if pending.count >= 2, pending[0] == 91 {
                let k = pending[1]; pending.removeFirst(2)
                if k == 67 { restart(modeIndex + 1) } else if k == 68 { restart(modeIndex - 1) }
            } else { break loop }
        case 3: break loop // Ctrl-C
        case 9: restart() // Tab
        case 13: if session.done { restart() } // Enter
        case 127, 8: // Backspace
            var t = session.text
            if !t.isEmpty { t.removeLast(); session.setText(t, nowMs: nowMs()) }
        default:
            if b >= 32 && b < 127 { session.setText(session.text + String(UnicodeScalar(b)), nowMs: nowMs()) }
        }
    }
    session.tick(nowMs: nowMs())
    if session.done && !wasDone { finished() }
    draw()
}
restore()

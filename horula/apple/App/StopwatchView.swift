import SwiftUI

struct StopwatchView: View {
    @Environment(Store.self) private var store
    @AppStorage("swAnalog") private var analog = false   // tap the readout to switch, like the web and iOS

    var body: some View {
        let sw = store.stopwatch, running = sw.start != nil
        NavigationStack {
            VStack(spacing: 0) {
                TimelineView(.animation(paused: !running)) { ctx in
                    let t = sw.elapsed(ctx.date)
                    Group {
                        if analog {
                            StopwatchDial(total: t, lap: sw.laps.isEmpty ? nil : t - sw.laps.last!).frame(maxWidth: 320).padding(.vertical, 16)
                        } else {
                            Text(Clockwork.stopwatchText(t))
                                .font(.system(size: 76, weight: .thin)).monospacedDigit().minimumScaleFactor(0.5).lineLimit(1)
                                .padding(.vertical, 40)
                        }
                    }
                    .contentShape(Rectangle()).onTapGesture { analog.toggle() }
                    .accessibilityAddTraits(.isButton).accessibilityHint(analog ? "Shows digits" : "Shows a dial")
                }
                HStack {
                    round(running || sw.acc == 0 ? "Lap" : "Reset", .secondary, disabled: !running && sw.acc == 0) { lapOrReset() }
                    Spacer()
                    round(running ? "Stop" : "Start", running ? .red : .green) { toggle() }
                        .keyboardShortcut(.space, modifiers: [])
                }
                .padding(.horizontal, 24)
                List {
                    let splits = sw.laps.enumerated().map { $0.element - ($0.offset > 0 ? sw.laps[$0.offset - 1] : 0) }
                    let marks = Clockwork.lapMarks(splits)
                    if running || sw.acc > 0 {
                        TimelineView(.animation(paused: !running)) { ctx in
                            row("Lap \(sw.laps.count + 1)", sw.elapsed(ctx.date) - (sw.laps.last ?? 0), .primary)
                        }
                    }
                    ForEach(Array(splits.enumerated()).reversed(), id: \.offset) { i, d in
                        row("Lap \(i + 1)", d, d == marks.best ? .green : d == marks.worst ? .red : .primary)
                    }
                }
                .listStyle(.plain)
            }
            .readableColumn()
            .navigationTitle("Stopwatch")
            .toolbar {
                if !sw.laps.isEmpty {
                    ToolbarItem(placement: .primaryAction) { Button { copy(Clockwork.lapsTable(sw.laps)) } label: { Label("Copy Laps", systemImage: "doc.on.doc") } }
                }
            }
        }
    }

    private func copy(_ s: String) {
        #if os(iOS)
        UIPasteboard.general.string = s
        #else
        NSPasteboard.general.clearContents(); NSPasteboard.general.setString(s, forType: .string)
        #endif
    }
    private func toggle() {
        var s = store.stopwatch
        if let start = s.start { s.acc += Date.now.timeIntervalSince(start); s.start = nil } else { s.start = .now }
        store.stopwatch = s
    }
    private func lapOrReset() {
        var s = store.stopwatch
        if s.start != nil { s.laps.append(s.elapsed()) } else { s = StopwatchState() }
        store.stopwatch = s
    }
    private func row(_ name: String, _ t: TimeInterval, _ c: Color) -> some View {
        HStack { Text(name); Spacer(); Text(Clockwork.stopwatchText(t)).monospacedDigit() }.foregroundStyle(c)
    }
    private func round(_ title: String, _ c: Color, disabled: Bool = false, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title).font(.title3).frame(width: 84, height: 84)
                .background(c.opacity(0.2), in: Circle()).foregroundStyle(c == .secondary ? .primary : c)
        }
        .buttonStyle(.plain).disabled(disabled).opacity(disabled ? 0.4 : 1)
    }
}

/// The iOS analog stopwatch: seconds on the big dial, minutes to 30 on a small one, a blue hand for the current lap.
struct StopwatchDial: View {
    let total: TimeInterval
    let lap: TimeInterval?
    var body: some View {
        Canvas { g, size in
            let r = min(size.width, size.height) / 2, c = CGPoint(x: size.width / 2, y: size.height / 2)
            func pt(_ o: CGPoint, _ a: Double, _ len: Double) -> CGPoint { CGPoint(x: o.x + len * sin(a), y: o.y - len * cos(a)) }
            func line(_ o: CGPoint, _ a: Double, _ from: Double, _ to: Double, _ w: Double, _ col: Color) {
                var p = Path(); p.move(to: pt(o, a, from)); p.addLine(to: pt(o, a, to)); g.stroke(p, with: .color(col), style: .init(lineWidth: w, lineCap: .round))
            }
            g.fill(Path(ellipseIn: CGRect(x: c.x - r, y: c.y - r, width: 2 * r, height: 2 * r)), with: .color(.secondary.opacity(0.12)))
            for i in 0..<60 { line(c, Double(i) * .pi / 30, r * (i % 5 == 0 ? 0.81 : 0.89), r * 0.94, i % 5 == 0 ? 3 : 1, .secondary) }
            let m = CGPoint(x: c.x, y: c.y - r * 0.38), mr = r * 0.2
            g.stroke(Path(ellipseIn: CGRect(x: m.x - mr, y: m.y - mr, width: 2 * mr, height: 2 * mr)), with: .color(.secondary.opacity(0.4)), lineWidth: 0.6)
            for i in 0..<30 { line(m, Double(i) * .pi / 15, mr * (i % 5 == 0 ? 0.74 : 0.84), mr * 0.92, i % 5 == 0 ? 1 : 0.5, .secondary) }
            line(m, total / 60 / 30 * 2 * .pi, 0, mr * 0.8, 1.6, .primary)
            g.draw(Text(Clockwork.stopwatchText(total)).font(.system(size: r * 0.12)).monospacedDigit(), at: CGPoint(x: c.x, y: c.y + r * 0.42))
            if let lap { line(c, lap.truncatingRemainder(dividingBy: 60) / 60 * 2 * .pi, -r * 0.15, r * 0.86, 2, .horula) }
            line(c, total.truncatingRemainder(dividingBy: 60) / 60 * 2 * .pi, -r * 0.15, r * 0.86, 2, .primary)
            g.fill(Path(ellipseIn: CGRect(x: c.x - 5, y: c.y - 5, width: 10, height: 10)), with: .color(.horula))
        }
        .aspectRatio(1, contentMode: .fit)
        .accessibilityLabel(Clockwork.stopwatchText(total))
    }
}

import SwiftUI

// The analog stopwatch: a sweep hand, a lap hand and a 30 minute sub-dial, like iOS. Shared with the Watch.
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

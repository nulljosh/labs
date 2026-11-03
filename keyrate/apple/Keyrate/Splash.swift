import SwiftUI

/// The brand mark on its 1024 grid.
struct KeycapsMark: Shape {
    func path(in r: CGRect) -> Path {
        let s = min(r.width, r.height) / 1024, ox = r.midX - 512 * s, oy = r.midY - 512 * s
        // brand/mark.svg: four keys, three keys staggered under them, a space bar
        let keys: [(CGFloat, CGFloat, CGFloat, CGFloat)] = [208, 368, 528, 688].map { ($0, 308, 128, 128) } + [288, 448, 608].map { ($0, 468, 128, 128) } + [(288, 628, 448, 88)]
        var p = Path()
        for (x, y, w, h) in keys {
            p.addRoundedRect(in: CGRect(x: ox + x * s, y: oy + y * s, width: w * s, height: h * s), cornerSize: CGSize(width: 30 * s, height: 30 * s))
        }
        return p
    }
}

/// Launch splash: the mark draws in, fills, then scales away. About 1.1 s, once per launch.
struct Splash: View {
    @Binding var shown: Bool
    let bg: Color
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var trim: CGFloat = 0
    @State private var fill = 0.0
    @State private var out = false
    private let accent = Color(red: 0.902, green: 0.604, blue: 0) // #e69a00

    var body: some View {
        ZStack {
            bg.ignoresSafeArea()
            ZStack {
                KeycapsMark().fill(accent.opacity(fill))
                KeycapsMark().trim(from: 0, to: trim).stroke(accent, style: StrokeStyle(lineWidth: 6, lineCap: .round, lineJoin: .round))
            }
            .frame(width: 140, height: 140)
            .scaleEffect(out ? 3 : 1)
        }
        .opacity(out ? 0 : 1)
        .accessibilityHidden(true)
        .task {
            if reduceMotion { trim = 1; fill = 1; try? await Task.sleep(for: .milliseconds(300)); withAnimation(.easeOut(duration: 0.2)) { out = true } }
            else {
                withAnimation(.easeInOut(duration: 0.5)) { trim = 1 }
                try? await Task.sleep(for: .milliseconds(450))
                withAnimation(.easeIn(duration: 0.25)) { fill = 1 }
                try? await Task.sleep(for: .milliseconds(300))
                withAnimation(.easeIn(duration: 0.35)) { out = true }
            }
            try? await Task.sleep(for: .milliseconds(380))
            shown = false
        }
    }
}

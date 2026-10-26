import SwiftUI

/// Four faces like StandBy (digits, analog, sun dial, world), red from 22:00 to 07:00, a dim slider, and a slow drift against burn in. Tap to close.
struct Nightstand: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @AppStorage("standFace") private var face = "digits"
    @AppStorage("standDim") private var dim = 1.0
    private static let here: [Double]? = Cities.coords[TimeZone.current.identifier.split(separator: "/").last.map { $0.replacingOccurrences(of: "_", with: " ") } ?? ""]
    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { ctx in
            let h = Calendar.current.component(.hour, from: ctx.date), night = h >= 22 || h < 7
            let ink = night ? Color(red: 1, green: 0.23, blue: 0.19) : .white
            let digits = ctx.date.formatted(.dateTime.hour().minute()).replacingOccurrences(of: #"\s?[AP]M"#, with: "", options: .regularExpression)
            ZStack {
                VStack(spacing: 8) {
                    switch face {
                    case "analog": ClockFace(hands: ink, night: true).frame(maxWidth: 420).environment(\.colorScheme, .dark)
                    case "sun":
                        SunDial(p: Clockwork.dialPoint(ctx.date, lat: Self.here?[0], lon: Self.here?[1]), ink: ink).frame(maxWidth: 520)
                        Text(digits).font(.system(size: 96, weight: .thin)).minimumScaleFactor(0.2).lineLimit(1).monospacedDigit()
                    case "world":
                        Text(digits).font(.system(size: 96, weight: .thin)).minimumScaleFactor(0.2).lineLimit(1).monospacedDigit()
                        StandWorld(at: ctx.date, here: Self.here, ink: ink).frame(maxWidth: 900)
                    default: Text(digits).font(.system(size: 200, weight: .thin)).minimumScaleFactor(0.2).lineLimit(1).monospacedDigit()
                    }
                    Text(ctx.date.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day())
                         + (store.nextAlarm(after: ctx.date).map { " · Alarm \($0.at.formatted(date: .omitted, time: .shortened))" } ?? ""))
                        .foregroundStyle(night ? Color(red: 0.54, green: 0.12, blue: 0.1) : .gray)
                }
                .foregroundStyle(ink).padding()
                .offset(Clockwork.drift(Int(ctx.date.timeIntervalSince1970 / 60)))
                .opacity(dim)
                .animation(.easeInOut(duration: 2), value: Int(ctx.date.timeIntervalSince1970 / 60))
                VStack {
                    Spacer()
                    HStack(spacing: 16) {
                        Picker("Face", selection: $face) { Text("Digits").tag("digits"); Text("Analog").tag("analog"); Text("Sun Dial").tag("sun"); Text("World").tag("world") }
                            .pickerStyle(.segmented).frame(maxWidth: 340)
                        Slider(value: $dim, in: 0.15...1).frame(maxWidth: 160).accessibilityLabel("Brightness")
                    }
                    .opacity(0.5).environment(\.colorScheme, .dark)
                    .padding(.horizontal, 16).padding(.vertical, 8)
                    .glassEffect(.regular, in: .capsule)   // floating controls are the functional layer
                    .padding(.bottom, 24)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity).background(.black)
            .contentShape(Rectangle()).onTapGesture { dismiss() }
        }
        #if os(iOS)
        .onAppear { UIApplication.shared.isIdleTimerDisabled = true }
        .onDisappear { UIApplication.shared.isIdleTimerDisabled = false }
        .statusBarHidden()
        #endif
    }
}

/// StandBy's World face: every city as a dot, bright where the sun is up and dim where it is night, and you.
struct StandWorld: View {
    let at: Date
    let here: [Double]?
    let ink: Color
    var body: some View {
        Canvas { g, size in
            let k = size.width / 360
            func pt(_ lat: Double, _ lon: Double) -> CGPoint { CGPoint(x: (lon + 180) * k, y: (90 - lat) * k) }
            func dots(_ g: GraphicsContext, _ alpha: Double) {
                for p in Cities.coords.values where p.count == 2 {
                    let c = pt(p[0], p[1]); g.fill(Path(ellipseIn: CGRect(x: c.x - k, y: c.y - k, width: 2 * k, height: 2 * k)), with: .color(ink.opacity(alpha)))
                }
            }
            dots(g, 0.28)
            // The lit half: the terminator, closed along the pole that has daylight.
            let s = Clockwork.subsolar(at), edge = s.lat > 0 ? 0 : size.height
            var day = Path(); day.move(to: CGPoint(x: 0, y: edge))
            for x in stride(from: 0.0, through: 360, by: 3) { day.addLine(to: pt(Clockwork.terminatorLat(s, lon: x - 180), x - 180)) }
            day.addLine(to: CGPoint(x: size.width, y: edge)); day.closeSubpath()
            var lit = g; lit.clip(to: day); dots(lit, 1)
            if let h = here, h.count == 2 {
                let c = pt(h[0], h[1]); g.fill(Path(ellipseIn: CGRect(x: c.x - 3.5 * k, y: c.y - 3.5 * k, width: 7 * k, height: 7 * k)), with: .color(ink == .white ? .horula : ink))
            }
        }
        .aspectRatio(2, contentMode: .fit)
        .accessibilityHidden(true)
    }
}

/// The sun's path as a dotted arc over a horizon, and a dip under it by night. The dot is the sun, hollow for night.
struct SunDial: View {
    let p: (x: Double, y: Double, day: Bool)
    let ink: Color
    var body: some View {
        Canvas { g, size in
            let k = size.width / 224, o = CGPoint(x: size.width / 2, y: 108 * k)
            func pt(_ x: Double, _ y: Double) -> CGPoint { CGPoint(x: o.x + x * k, y: o.y + y * k) }
            var arc = Path(); arc.addArc(center: o, radius: 100 * k, startAngle: .degrees(180), endAngle: .degrees(360), clockwise: false)
            var dip = Path(); dip.addEllipse(in: CGRect(x: o.x - 100 * k, y: o.y - 18 * k, width: 200 * k, height: 36 * k))
            g.stroke(arc, with: .color(ink.opacity(0.5)), style: .init(lineWidth: 2, lineCap: .round, dash: [2, 6]))
            g.clip(to: Path(CGRect(x: 0, y: o.y, width: size.width, height: size.height)))
            g.stroke(dip, with: .color(ink.opacity(0.5)), style: .init(lineWidth: 2, lineCap: .round, dash: [2, 6]))
            g.clip(to: Path(CGRect(origin: .zero, size: size)))
            var line = Path(); line.move(to: pt(-110, 0)); line.addLine(to: pt(110, 0))
            g.stroke(line, with: .color(ink.opacity(0.35)), lineWidth: 1)
            let dot = Path(ellipseIn: CGRect(x: pt(p.x, p.y).x - 9 * k, y: pt(p.x, p.y).y - 9 * k, width: 18 * k, height: 18 * k))
            if p.day { g.fill(dot, with: .color(ink)) } else { g.fill(dot, with: .color(.black)); g.stroke(dot, with: .color(ink), lineWidth: 3) }
        }
        .aspectRatio(224 / 132, contentMode: .fit)
        .accessibilityHidden(true)
    }
}

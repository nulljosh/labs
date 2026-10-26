import SwiftUI

/// The analog face. The second hand sweeps every frame, like the web app; it ticks under reduced motion.
struct ClockFace: View {
    @Environment(\.accessibilityReduceMotion) private var still
    var zone: TimeZone = .current
    var shift: TimeInterval = 0
    var hands: Color? = nil   // nightstand: red after 22:00
    var night: Bool? = nil   // set for the Mac grid: white face by day, black by night, like macOS Clock
    var body: some View {
        TimelineView(.animation(minimumInterval: still ? 1 : nil)) { ctx in
            Canvas { g, size in
                let r = min(size.width, size.height) / 2, c = CGPoint(x: size.width / 2, y: size.height / 2)
                g.fill(Path(ellipseIn: CGRect(x: c.x - r, y: c.y - r, width: 2 * r, height: 2 * r)), with: .color(night == nil ? .secondary.opacity(0.12) : night! ? .black : .white))
                for i in 0..<60 {
                    let a = Double(i) * .pi / 30, major = i % 5 == 0, r1 = r * (major ? 0.81 : 0.89)
                    var p = Path(); p.move(to: pt(c, a, r1)); p.addLine(to: pt(c, a, r * 0.94))
                    g.stroke(p, with: .color(night == nil ? .secondary : night! ? .white.opacity(0.6) : .black.opacity(0.5)), style: .init(lineWidth: major ? 3 : 1, lineCap: .round))
                }
                var cal = Calendar.current; cal.timeZone = zone
                let d = ctx.date.addingTimeInterval(shift), ink: Color = hands ?? (night == nil ? .primary : night! ? .white : .black)
                let s = Double(cal.component(.second, from: d)) + (still ? 0 : d.timeIntervalSince1970.truncatingRemainder(dividingBy: 1))
                let m = Double(cal.component(.minute, from: d)) + s / 60, h = Double(cal.component(.hour, from: d) % 12) + m / 60
                hand(g, c, h / 12, r * 0.5, 7, ink); hand(g, c, m / 60, r * 0.76, 5, ink)
                hand(g, c, s / 60, r * 0.86, 2, .horula, tail: r * 0.15)
                g.fill(Path(ellipseIn: CGRect(x: c.x - 5, y: c.y - 5, width: 10, height: 10)), with: .color(.horula))
            }
        }
        .aspectRatio(1, contentMode: .fit)
        .accessibilityHidden(true)
    }
    private func pt(_ c: CGPoint, _ a: Double, _ r: Double) -> CGPoint { CGPoint(x: c.x + r * sin(a), y: c.y - r * cos(a)) }
    private func hand(_ g: GraphicsContext, _ c: CGPoint, _ turn: Double, _ len: Double, _ w: Double, _ col: Color, tail: Double = 0) {
        let a = turn * 2 * .pi
        var p = Path(); p.move(to: pt(c, a + .pi, tail)); p.addLine(to: pt(c, a, len))
        g.stroke(p, with: .color(col), style: .init(lineWidth: w, lineCap: .round))
    }
}

/// "3:12" with a small "PM", like iOS.
struct TimeText: View {
    let date: Date
    var zone: TimeZone = .current
    var size: CGFloat = 34
    var weight: Font.Weight = .light
    var body: some View {
        let f = Date.FormatStyle(timeZone: zone).hour().minute()
        let full = date.formatted(f)
        let parts = full.split(separator: " ", maxSplits: 1)
        HStack(alignment: .firstTextBaseline, spacing: 2) {
            Text(parts.first.map(String.init) ?? full).font(.system(size: size, weight: weight))
            if parts.count == 2 { Text(parts[1]).font(.system(size: size * 0.5)) }
        }
    }
}

struct WorldView: View {
    @Environment(Store.self) private var store
    @State private var adding = false
    @State private var settings = false
    @State private var stand = false
    @State private var detail: City?
    @State private var plan = 0.0   // 15 minute steps, -48 to 48

    var body: some View {
        NavigationStack {
            List {
                Section {
                    VStack(spacing: 12) {
                        ClockFace().frame(maxWidth: 300).padding(.top, 8)
                        TimelineView(.periodic(from: .now, by: 1)) { ctx in
                            VStack(spacing: 6) {
                                Text(ctx.date.formatted(date: .omitted, time: .standard)).font(.system(size: 52, weight: .light)).monospacedDigit()
                                Text(ctx.date.formatted(.dateTime.weekday(.wide).month(.wide).day())).foregroundStyle(.secondary)
                                if let n = store.nextAlarm(after: ctx.date) {
                                    Text("Next alarm \(n.at.formatted(.dateTime.weekday(.abbreviated).hour().minute()))").foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                    .frame(maxWidth: .infinity).listRowBackground(Color.clear)
                }
                #if os(macOS)
                Section {
                    TimelineView(.everyMinute) { ctx in WorldMap(zones: store.zones, at: ctx.date.addingTimeInterval(plan * 900)) }
                        .listRowBackground(Color.clear)
                }
                Section {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 16)], spacing: 16) {
                        ForEach(store.zones) { c in CityCard(city: c, shift: plan * 900) { detail = c } }
                    }
                    .listRowBackground(Color.clear)
                }
                #else
                Section {
                    ForEach(store.zones) { c in
                        // one live row per city: a TimelineView around the ForEach would merge them into one cell
                        TimelineView(.everyMinute) { ctx in
                            Button { detail = c } label: { CityRow(city: c, at: ctx.date.addingTimeInterval(plan * 900)) }.buttonStyle(.plain)
                        }
                    }
                    .onDelete { store.zones.remove(atOffsets: $0) }
                    .onMove { store.zones.move(fromOffsets: $0, toOffset: $1) }
                }
                #endif
                Section("Plan across cities") {
                    HStack {
                        Slider(value: $plan, in: -48...48, step: 1).accessibilityLabel("Plan across cities")
                        Text(plan == 0 ? "Now" : planText).monospacedDigit().frame(minWidth: 72, alignment: .trailing)
                    }
                    if plan != 0 { Button("Back to now") { plan = 0 } }
                }
            }
            .readableColumn()
            .navigationTitle("World Clock")
            .toolbar {
                #if os(iOS)
                ToolbarItem(placement: .topBarLeading) { EditButton() }
                #endif
                ToolbarItemGroup(placement: .primaryAction) {
                    Button { stand = true } label: { Label("Nightstand", systemImage: "moon") }
                    Button { settings = true } label: { Label("Settings", systemImage: "gearshape") }
                    Button { adding = true } label: { Label("Add City", systemImage: "plus") }
                }
            }
            .sheet(isPresented: $adding) { AddCity() }
            .sheet(isPresented: $settings) { SettingsView() }
            .sheet(item: $detail) { CityDetail(city: $0) }
            #if os(iOS)
            .fullScreenCover(isPresented: $stand) { Nightstand() }
            #else
            .sheet(isPresented: $stand) { Nightstand().frame(minWidth: 600, minHeight: 400) }
            #endif
        }
    }

    private var planText: String {
        let m = Int(abs(plan)) * 15
        return "\(plan > 0 ? "+" : "-")\(m / 60):\(String(format: "%02d", m % 60))"
    }
}

struct CityRow: View {
    let city: City
    let at: Date
    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(Clockwork.offsetLabel(zone: city.zone, at: at)).font(.footnote).foregroundStyle(.secondary)
                Text(city.city).font(.title3)
            }
            Spacer()
            if let day = Cities.isDay(city, at: at) {
                Image(systemName: day ? "sun.max" : "moon").foregroundStyle(.secondary).accessibilityLabel(day ? "Day" : "Night")
            }
            TimeText(date: at, zone: TimeZone(identifier: city.zone) ?? .current)
        }
        .contentShape(Rectangle())
    }
}

#if os(macOS)
/// The map from macOS Clock: every city we know as a dot, night shaded along the real line, your cities pinned with their time.
struct WorldMap: View {
    let zones: [City]
    let at: Date
    var body: some View {
        Canvas { g, size in
            let k = size.width / 360
            func pt(_ lat: Double, _ lon: Double) -> CGPoint { CGPoint(x: (lon + 180) * k, y: (90 - lat) * k) }
            let card = Path(roundedRect: CGRect(origin: .zero, size: size), cornerRadius: 16)
            g.clip(to: card); g.fill(card, with: .color(.secondary.opacity(0.08)))
            for p in Cities.coords.values where p.count == 2 {
                let c = pt(p[0], p[1]); g.fill(Path(ellipseIn: CGRect(x: c.x - 1, y: c.y - 1, width: 2, height: 2)), with: .color(.secondary.opacity(0.5)))
            }
            let s = Clockwork.subsolar(at), edge = s.lat > 0 ? size.height : 0
            var night = Path(); night.move(to: CGPoint(x: 0, y: edge))
            for x in stride(from: 0.0, through: 360, by: 3) { night.addLine(to: pt(Clockwork.terminatorLat(s, lon: x - 180), x - 180)) }
            night.addLine(to: CGPoint(x: size.width, y: edge)); night.closeSubpath()
            g.fill(night, with: .color(.black.opacity(0.25)))
            for z in zones {
                guard let p = Cities.coords[z.city], p.count == 2 else { continue }
                let c = pt(p[0], p[1]), end = p[1] + 180 > 300
                g.fill(Path(ellipseIn: CGRect(x: c.x - 4, y: c.y - 4, width: 8, height: 8)), with: .color(.horula))
                let t = at.formatted(Date.FormatStyle(timeZone: TimeZone(identifier: z.zone) ?? .current).hour().minute())
                g.draw(Text("\(z.city) \(t)").font(.caption), at: CGPoint(x: c.x + (end ? -8 : 8), y: c.y), anchor: end ? .trailing : .leading)
            }
        }
        .aspectRatio(2, contentMode: .fit)
        .accessibilityLabel("World map with day and night")
    }
}

/// One city in the Mac grid: a small face, the name, the offset. Right click to remove.
struct CityCard: View {
    @Environment(Store.self) private var store
    let city: City
    let shift: TimeInterval
    let open: () -> Void
    var body: some View {
        TimelineView(.everyMinute) { ctx in
            let at = ctx.date.addingTimeInterval(shift)
            Button(action: open) {
                VStack(spacing: 6) {
                    ClockFace(zone: TimeZone(identifier: city.zone) ?? .current, shift: shift, night: Cities.isDay(city, at: at).map { !$0 } ?? false)
                        .frame(width: 112).padding(.bottom, 4)
                    Text(city.city).font(.headline).lineLimit(1)
                    Text(Clockwork.offsetLabel(zone: city.zone, at: at)).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                }
                .frame(maxWidth: .infinity).padding(12)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 16))
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel("\(city.city), \(Clockwork.offsetLabel(zone: city.zone, at: at))")
            .contextMenu { Button("Remove", role: .destructive) { store.zones.removeAll { $0.id == city.id } } }
        }
    }
}
#endif

struct AddCity: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var q = ""
    var body: some View {
        NavigationStack {
            List(Cities.all.filter { q.isEmpty || $0.city.localizedCaseInsensitiveContains(q) }) { c in
                Button(c.city) {
                    if !store.zones.contains(where: { $0.city == c.city }) { store.zones.append(c) }
                    dismiss()
                }
            }
            .searchable(text: $q, prompt: "Search for a city")
            .navigationTitle("Choose a City")
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } } }
        }
    }
}

struct CityDetail: View {
    let city: City
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        let tz = TimeZone(identifier: city.zone) ?? .current, now = Date.now
        var cal = Calendar(identifier: .gregorian); cal.timeZone = tz
        let p = Cities.coords[city.city]
        let t = p.flatMap { Clockwork.sunTimes(on: now, lat: $0[0], lon: $0[1], cal: cal) }
        return NavigationStack {
            List {
                Section {
                    VStack(spacing: 6) {
                        TimeText(date: now, zone: tz, size: 52)
                        Text(Clockwork.offsetLabel(zone: city.zone, at: now)).foregroundStyle(.secondary)
                    }.frame(maxWidth: .infinity).listRowBackground(Color.clear)
                }
                Section {
                    LabeledContent("Sunrise") { if let t { TimeText(date: t.rise, zone: tz, size: 17, weight: .regular) } else { Text("None today") } }
                    LabeledContent("Sunset") { if let t { TimeText(date: t.set, zone: tz, size: 17, weight: .regular) } else { Text("None today") } }
                    LabeledContent("Daylight", value: t.map { Clockwork.durationText($0.set.timeIntervalSince($0.rise)).replacingOccurrences(of: #" \d+ sec"#, with: "", options: .regularExpression) } ?? "None today")
                }
            }
            .navigationTitle(city.city)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } } }
        }
    }
}

/// Three faces (digits, analog, sun dial), red from 22:00 to 07:00, a dim slider, and a slow drift against burn in. Tap to close.
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
                        Picker("Face", selection: $face) { Text("Digits").tag("digits"); Text("Analog").tag("analog"); Text("Sun").tag("sun") }
                            .pickerStyle(.segmented).frame(maxWidth: 260)
                        Slider(value: $dim, in: 0.15...1).frame(maxWidth: 160).accessibilityLabel("Brightness")
                    }
                    .opacity(0.5).environment(\.colorScheme, .dark).padding(.bottom, 24)
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

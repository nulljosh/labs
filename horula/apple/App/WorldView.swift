import SwiftUI

/// The analog face. The second hand sweeps every frame, like the web app; it ticks under reduced motion.
struct ClockFace: View {
    @Environment(\.accessibilityReduceMotion) private var still
    var body: some View {
        TimelineView(.animation(minimumInterval: still ? 1 : nil)) { ctx in
            Canvas { g, size in
                let r = min(size.width, size.height) / 2, c = CGPoint(x: size.width / 2, y: size.height / 2)
                g.fill(Path(ellipseIn: CGRect(x: c.x - r, y: c.y - r, width: 2 * r, height: 2 * r)), with: .color(.secondary.opacity(0.12)))
                for i in 0..<60 {
                    let a = Double(i) * .pi / 30, major = i % 5 == 0, r1 = r * (major ? 0.81 : 0.89)
                    var p = Path(); p.move(to: pt(c, a, r1)); p.addLine(to: pt(c, a, r * 0.94))
                    g.stroke(p, with: .color(.secondary), style: .init(lineWidth: major ? 3 : 1, lineCap: .round))
                }
                let cal = Calendar.current, d = ctx.date
                let s = Double(cal.component(.second, from: d)) + (still ? 0 : d.timeIntervalSince1970.truncatingRemainder(dividingBy: 1))
                let m = Double(cal.component(.minute, from: d)) + s / 60, h = Double(cal.component(.hour, from: d) % 12) + m / 60
                hand(g, c, h / 12, r * 0.5, 7, .primary); hand(g, c, m / 60, r * 0.76, 5, .primary)
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
                Section {
                    TimelineView(.everyMinute) { ctx in
                        let at = ctx.date.addingTimeInterval(plan * 900)
                        ForEach(store.zones) { c in
                            Button { detail = c } label: { CityRow(city: c, at: at) }.buttonStyle(.plain)
                        }
                        .onDelete { store.zones.remove(atOffsets: $0) }
                        .onMove { store.zones.move(fromOffsets: $0, toOffset: $1) }
                    }
                }
                Section("Plan across cities") {
                    HStack {
                        Slider(value: $plan, in: -48...48, step: 1).accessibilityLabel("Plan across cities")
                        Text(plan == 0 ? "Now" : planText).monospacedDigit().frame(minWidth: 72, alignment: .trailing)
                    }
                    if plan != 0 { Button("Back to now") { plan = 0 } }
                }
            }
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

/// Big digits, screen kept awake, red from 22:00 to 07:00. Tap to close.
struct Nightstand: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { ctx in
            let h = Calendar.current.component(.hour, from: ctx.date), night = h >= 22 || h < 7
            VStack(spacing: 8) {
                Text(ctx.date.formatted(.dateTime.hour().minute()).replacingOccurrences(of: #"\s?[AP]M"#, with: "", options: .regularExpression))
                    .font(.system(size: 200, weight: .thin)).minimumScaleFactor(0.2).lineLimit(1).monospacedDigit()
                Text(ctx.date.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day())
                     + (store.nextAlarm(after: ctx.date).map { " · Alarm \($0.at.formatted(date: .omitted, time: .shortened))" } ?? ""))
                    .foregroundStyle(night ? Color(red: 0.54, green: 0.12, blue: 0.1) : .gray)
            }
            .foregroundStyle(night ? Color(red: 1, green: 0.23, blue: 0.19) : .white)
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

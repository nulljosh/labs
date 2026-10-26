import SwiftUI
import UserNotifications

// Horula on the wrist: world clocks, a stopwatch, timers and alarms. The watch keeps its own Store,
// and its alarms and timers ring as notifications (watchOS has no AlarmKit), scheduled by AlarmScheduler.

@main
struct HorulaWatchApp: App {
    @State private var store = Store()
    @AppStorage("wpage") private var page = 0   // -wpage 1 on launch picks a page, for screenshots
    var body: some Scene {
        WindowGroup {
            TabView(selection: $page) {
                WatchWorld().tag(0)
                WatchStopwatch().tag(1)
                WatchTimers().tag(2)
                WatchAlarms().tag(3)
            }
            .tabViewStyle(.verticalPage)
            .environment(store)
            .tint(.horula)
        }
    }
}

struct WatchWorld: View {
    @Environment(Store.self) private var store
    var body: some View {
        NavigationStack {
            TimelineView(.everyMinute) { ctx in
                List(store.zones) { c in
                    VStack(alignment: .leading, spacing: 2) {
                        HStack {
                            Text(c.name).font(.headline).lineLimit(1)
                            Spacer()
                            if let day = Cities.isDay(c, at: ctx.date) { Image(systemName: day ? "sun.max" : "moon").foregroundStyle(.secondary) }
                        }
                        Text(ctx.date, style: .time).font(.title2).environment(\.timeZone, TimeZone(identifier: c.zone) ?? .current)
                        Text(Clockwork.offsetLabel(zone: c.zone, at: ctx.date)).font(.caption2).foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("World Clock")
        }
    }
}

struct WatchStopwatch: View {
    @Environment(Store.self) private var store
    var body: some View {
        let sw = store.stopwatch, running = sw.start != nil
        VStack {
            TimelineView(.animation(minimumInterval: 0.05, paused: !running)) { ctx in
                Text(Clockwork.stopwatchText(sw.elapsed(ctx.date))).font(.system(size: 34, weight: .light)).monospacedDigit().minimumScaleFactor(0.6)
            }
            HStack {
                Button(running || sw.acc == 0 ? "Lap" : "Reset") {
                    var s = store.stopwatch
                    if s.start != nil { s.laps.append(s.elapsed()) } else { s = StopwatchState() }
                    store.stopwatch = s
                }
                .disabled(!running && sw.acc == 0)
                Button(running ? "Stop" : "Start") {
                    var s = store.stopwatch
                    if let start = s.start { s.acc += Date.now.timeIntervalSince(start); s.start = nil } else { s.start = .now }
                    store.stopwatch = s
                }
                .tint(running ? .red : .green)
            }
            if let last = sw.laps.last { Text("Lap \(sw.laps.count)  \(Clockwork.stopwatchText(last - (sw.laps.dropLast().last ?? 0)))").font(.caption).foregroundStyle(.secondary) }
        }
        .navigationTitle("Stopwatch")
    }
}

struct WatchTimers: View {
    @Environment(Store.self) private var store
    // The grid watchOS Clock opens on.
    private let quick: [TimeInterval] = [60, 180, 300, 600, 900, 1800, 3600, 7200]
    var body: some View {
        NavigationStack {
            TimelineView(.periodic(from: .now, by: 1)) { ctx in
                ScrollView {
                    ForEach(store.timers) { t in
                        HStack {
                            VStack(alignment: .leading, spacing: 0) {
                                Text(Clockwork.timerText(t.remaining(ctx.date))).font(.title3).monospacedDigit()
                                if !t.label.isEmpty { Text(t.label).font(.caption).foregroundStyle(.secondary) }
                            }
                            Spacer()
                            Button { store.timers.removeAll { $0.id == t.id }; sync() } label: { Image(systemName: "xmark") }
                                .buttonStyle(.bordered).buttonBorderShape(.circle)
                        }
                    }
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())]) {
                        ForEach(quick, id: \.self) { d in
                            Button { store.startTimer(d, label: ""); sync() } label: {
                                Text(Clockwork.durationText(d)).font(.headline).frame(maxWidth: .infinity, minHeight: 56)
                            }
                            .buttonStyle(.bordered).buttonBorderShape(.roundedRectangle(radius: 16))
                        }
                    }
                }
                .onChange(of: ctx.date) { store.timers.removeAll { $0.end.map { $0 <= ctx.date } ?? false } }
            }
            .navigationTitle("Timers")
        }
    }
    private func sync() { Task { await AlarmScheduler().sync(store) } }
}

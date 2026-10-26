import SwiftUI
import WidgetKit
#if os(iOS)
import ActivityKit
import AlarmKit
#endif

// Home Screen, Lock Screen, StandBy and Watch faces read the app's Store through the shared app group.
// One timeline entry an hour is enough: the times themselves are live Text dates that the system advances.

struct Entry: TimelineEntry {
    let date: Date
    let zones: [City]
    let next: (at: Date, label: String)?
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> Entry { Entry(date: .now, zones: Store.preview, next: nil) }
    func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) { completion(entry()) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
        completion(Timeline(entries: [entry()], policy: .after(.now.addingTimeInterval(3600))))
    }
    private func entry() -> Entry { let s = Store(); return Entry(date: .now, zones: s.zones, next: s.nextAlarm()) }
}

extension Store { static let preview = [City(city: "New York", zone: "America/New_York"), City(city: "London", zone: "Europe/London"), City(city: "Tokyo", zone: "Asia/Tokyo")] }

/// World clocks: one city small, three medium, a column on the Lock Screen.
struct WorldWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "world", provider: Provider()) { e in WorldWidgetView(e: e).containerBackground(.fill.tertiary, for: .widget) }
            .configurationDisplayName("World Clock")
            .description("The time in your cities, and whether the sun is up there.")
            #if os(watchOS)
            .supportedFamilies([.accessoryRectangular, .accessoryInline])
            #elseif os(iOS)
            .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular, .accessoryInline])
            #else
            .supportedFamilies([.systemSmall, .systemMedium])
            #endif
    }
}

struct WorldWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let e: Entry
    private var small: Bool {
        #if os(watchOS)
        false
        #else
        family == .systemSmall
        #endif
    }
    var body: some View {
        let list = Array(e.zones.prefix(small ? 1 : 3))
        switch family {
        case .accessoryInline:
            if let c = list.first { (Text("\(c.name) ") + Text(e.date, style: .time)).environment(\.timeZone, TimeZone(identifier: c.zone) ?? .current) }
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 0) {
                ForEach(list) { c in
                    HStack { Text(c.name).lineLimit(1); Spacer(); Text(e.date, style: .time).environment(\.timeZone, TimeZone(identifier: c.zone) ?? .current) }
                }
            }.font(.caption)
        default:
            VStack(alignment: .leading, spacing: small ? 4 : 8) {
                ForEach(list) { c in
                    HStack(alignment: .firstTextBaseline) {
                        VStack(alignment: .leading, spacing: 0) {
                            Text(c.name).font(.headline).lineLimit(1)
                            Text(Clockwork.offsetLabel(zone: c.zone, at: e.date)).font(.caption2).foregroundStyle(.secondary).lineLimit(1)
                        }
                        Spacer(minLength: 4)
                        if let day = Cities.isDay(c, at: e.date) { Image(systemName: day ? "sun.max" : "moon").font(.caption).foregroundStyle(.secondary) }
                        Text(e.date, style: .time).font(.system(size: small ? 28 : 22, weight: .light)).monospacedDigit()
                            .environment(\.timeZone, TimeZone(identifier: c.zone) ?? .current)
                    }
                }
            }
        }
    }
}

/// Next alarm on the Lock Screen and Watch face.
struct NextAlarmWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "next-alarm", provider: Provider()) { e in
            Group {
                if let n = e.next {
                    ViewThatFits {
                        HStack { Image(systemName: "alarm.fill"); Text(n.at, style: .time) }
                        Image(systemName: "alarm.fill")
                    }
                } else {
                    Image(systemName: "alarm")
                }
            }
            .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Next Alarm")
        .description("When your next alarm rings.")
        #if os(macOS)
        .supportedFamilies([.systemSmall])
        #else
        .supportedFamilies([.accessoryCircular, .accessoryInline, .accessoryRectangular])
        #endif
    }
}

#if os(iOS)
/// AlarmKit draws snoozes and timers as a Live Activity on the Lock Screen and in the Dynamic Island.
struct AlarmActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: AlarmAttributes<HorulaAlarm>.self) { ctx in
            HStack {
                Text(ctx.attributes.metadata?.label ?? "Horula").font(.headline)
                Spacer()
                countdown(ctx.state).font(.system(size: 34, weight: .light)).monospacedDigit()
            }
            .padding().tint(.horula)
        } dynamicIsland: { ctx in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) { Text(ctx.attributes.metadata?.label ?? "Horula") }
                DynamicIslandExpandedRegion(.trailing) { countdown(ctx.state).monospacedDigit() }
            } compactLeading: { Image(systemName: "timer") } compactTrailing: { countdown(ctx.state).monospacedDigit().frame(maxWidth: 56) } minimal: { Image(systemName: "timer") }
        }
    }

    @ViewBuilder private func countdown(_ s: AlarmPresentationState) -> some View {
        switch s.mode {
        case .countdown(let c): Text(timerInterval: Date.now...c.fireDate, countsDown: true)
        case .paused(let p): Text(Clockwork.timerText(p.totalCountdownDuration - p.previouslyElapsedDuration))
        default: Text("Now")
        }
    }
}
#endif

@main
struct HorulaWidgets: WidgetBundle {
    var body: some Widget {
        WorldWidget()
        NextAlarmWidget()
        #if os(iOS)
        AlarmActivity()
        #endif
    }
}

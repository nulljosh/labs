import SwiftUI

// The two screens watchOS Clock pushes: an alarm's settings, and a city's day.

/// Tap an alarm: its time, repeat days, label and snooze, and Delete, like watchOS Clock.
struct WatchAlarmEdit: View {
    let id: UUID
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        // By id, not a binding into the list, so Delete cannot leave this screen pointing past the end.
        if let i = store.alarms.firstIndex(where: { $0.id == id }) { form(Bindable(store).alarms[i]) }
    }
    private func form(_ alarm: Binding<AlarmItem>) -> some View {
        List {
            DatePicker("Alarm", selection: Binding(get: { WatchAlarms.at(alarm.wrappedValue.time) }, set: {
                let c = Calendar.current.dateComponents([.hour, .minute], from: $0)
                alarm.wrappedValue.time = String(format: "%02d:%02d", c.hour ?? 0, c.minute ?? 0)
            }), displayedComponents: .hourAndMinute)
            NavigationLink {
                List(0..<7, id: \.self) { d in
                    Toggle(Calendar.current.weekdaySymbols[d], isOn: Binding(get: { alarm.wrappedValue.days.contains(d) }, set: { on in
                        alarm.wrappedValue.days = on ? (alarm.wrappedValue.days + [d]).sorted() : alarm.wrappedValue.days.filter { $0 != d }
                    }))
                }
                .navigationTitle("Repeat")
            } label: {
                LabeledContent("Repeat", value: Clockwork.repeatText(alarm.wrappedValue.days))
            }
            TextField("Label", text: alarm.label, prompt: Text("Alarm"))
            Toggle("Snooze", isOn: alarm.snooze)
            Toggle("Wake Up Check", isOn: alarm.check)
            Toggle("Solve to Stop", isOn: alarm.mission)
            Button("Delete Alarm", role: .destructive) { dismiss(); store.alarms.removeAll { $0.id == id } }
        }
        .navigationTitle("Edit Alarm")
    }
}

/// Tap a city: its time, sunrise, sunset, length of day and next clock change, like the phone's city sheet.
struct WatchCityDetail: View {
    let city: City
    var body: some View {
        TimelineView(.everyMinute) { ctx in
            let tz = TimeZone(identifier: city.zone) ?? .current, now = ctx.date
            var cal = Calendar(identifier: .gregorian); cal.timeZone = tz
            let t = Cities.coords[city.city].flatMap { Clockwork.sunTimes(on: now, lat: $0[0], lon: $0[1], cal: cal) }
            let time = Date.FormatStyle(date: .omitted, time: .shortened, timeZone: tz)
            return List {
                VStack(alignment: .leading) {
                    Text(now.formatted(time)).font(.title)
                    Text(Clockwork.offsetLabel(zone: city.zone, at: now)).font(.caption2).foregroundStyle(.secondary)
                }
                .listRowBackground(Color.clear)
                LabeledContent("Sunrise", value: t.map { $0.rise.formatted(time) } ?? String(localized: "None today"))
                LabeledContent("Sunset", value: t.map { $0.set.formatted(time) } ?? String(localized: "None today"))
                LabeledContent("Daylight", value: t.map { Clockwork.durationText($0.set.timeIntervalSince($0.rise)).replacingOccurrences(of: #" \d+ sec"#, with: "", options: .regularExpression) } ?? String(localized: "None today"))
                if let s = Clockwork.nextShift(zone: city.zone, after: now) {
                    LabeledContent(s.to > s.from ? LocalizedStringKey("Clocks go forward") : "Clocks go back",
                                   value: s.at.formatted(Date.FormatStyle(timeZone: TimeZone(secondsFromGMT: s.from) ?? tz).month(.abbreviated).day().hour().minute()))
                }
            }
        }
        .navigationTitle(city.name)
    }
}

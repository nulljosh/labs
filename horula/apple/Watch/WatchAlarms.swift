import SwiftUI

// Alarms on the wrist, like watchOS Clock: the list, a switch on each, swipe to delete, + for a new one.
// They live in the watch's own Store and ring as notifications through AlarmScheduler.
struct WatchAlarms: View {
    @Environment(Store.self) private var store
    @State private var adding = false
    @State private var time = Date.now
    var body: some View {
        @Bindable var store = store
        NavigationStack {
            List {
                ForEach($store.alarms) { $a in
                    Toggle(isOn: $a.on) {
                        VStack(alignment: .leading, spacing: 0) {
                            Text(Self.at(a.time), style: .time).font(.title2)
                            Text(a.label.isEmpty ? Clockwork.repeatText(a.days) : a.label).font(.caption).foregroundStyle(.secondary)
                        }
                    }
                }
                .onDelete { store.alarms.remove(atOffsets: $0) }
            }
            .overlay { if store.alarms.isEmpty { Text("No alarms. Tap + to add one.").multilineTextAlignment(.center).foregroundStyle(.secondary) } }
            .navigationTitle("Alarms")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { time = .now; adding = true } label: { Image(systemName: "plus") }.accessibilityLabel("Add Alarm")
                }
            }
            .sheet(isPresented: $adding) {
                VStack {
                    DatePicker("Alarm", selection: $time, displayedComponents: .hourAndMinute).labelsHidden()
                    Button("Save") {
                        let c = Calendar.current.dateComponents([.hour, .minute], from: time)
                        store.alarms.append(AlarmItem(time: String(format: "%02d:%02d", c.hour ?? 0, c.minute ?? 0)))
                        adding = false
                    }
                    .tint(.horula)
                }
            }
        }
        .onChange(of: store.alarms) { Task { await AlarmScheduler().sync(store) } }
    }
    static func at(_ hm: String) -> Date { let m = Clockwork.minutes(hm); return Calendar.current.date(bySettingHour: m / 60, minute: m % 60, second: 0, of: .now)! }
}

import SwiftUI

// Alarms on the wrist, like watchOS Clock: the list, a switch on each, swipe to delete, + for a new one.
// They live in the watch's own Store and ring as notifications through AlarmScheduler.
struct WatchAlarms: View {
    @Environment(Store.self) private var store
    @State private var adding = false
    @State private var time = Date.now
    @State private var sum = Clockwork.newSum()
    @State private var answer = ""
    var body: some View {
        @Bindable var store = store
        NavigationStack {
            List {
                TimelineView(.periodic(from: .now, by: 15)) { ctx in
                    // Wake Up Check and Solve to Stop, as on the phone: the second ring goes away only from here.
                    if let c = store.pendingChecks(at: ctx.date).first, c.rang <= ctx.date {
                        Section {
                            Text("Are you up?").font(.title3)
                            Text("Rings again at \(c.rang.addingTimeInterval(Clockwork.checkGap).formatted(date: .omitted, time: .shortened))").font(.caption).foregroundStyle(.secondary)
                            if c.alarm.mission {
                                LabeledContent(sum.q + " =") { TextField("Answer", text: $answer).monospacedDigit() }
                                    .onChange(of: answer) { if Int(answer) == sum.a { answer = ""; sum = Clockwork.newSum(); up() } }
                            } else {
                                Button("I'm Up") { up() }.tint(.green)
                            }
                        }
                    }
                }
                ForEach($store.alarms) { $a in
                    HStack {
                        // Tap the time for its settings, flip the switch to arm it, like watchOS Clock.
                        NavigationLink { WatchAlarmEdit(id: a.id) } label: {
                            VStack(alignment: .leading, spacing: 0) {
                                Text(Self.at(a.time), style: .time).font(.title2)
                                Text(a.label.isEmpty ? Clockwork.repeatText(a.days) : a.label).font(.caption).foregroundStyle(.secondary)
                            }
                        }
                        Toggle("Alarm", isOn: $a.on).labelsHidden()
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
    private func up() { store.awake = .now; Task { await AlarmScheduler().sync(store) } }
    static func at(_ hm: String) -> Date { let m = Clockwork.minutes(hm); return Calendar.current.date(bySettingHour: m / 60, minute: m % 60, second: 0, of: .now)! }
}

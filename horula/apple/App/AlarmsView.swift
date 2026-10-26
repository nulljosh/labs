import SwiftUI

struct AlarmsView: View {
    @Environment(Store.self) private var store
    @Environment(AlarmScheduler.self) private var scheduler
    @State private var editing: AlarmItem?
    @State private var sleepSheet = false
    @State private var sum = AlarmsView.newSum()
    @State private var answer = ""
    static func newSum() -> (q: String, a: Int) { var g = SystemRandomNumberGenerator(); return Clockwork.mathProblem(using: &g) }

    var body: some View {
        @Bindable var store = store
        NavigationStack {
            List {
                TimelineView(.periodic(from: .now, by: 15)) { ctx in
                    // Wake Up Check, like Alarmy: while an alarm's second ring is coming, one tap says you are up.
                    if let c = store.pendingChecks(at: ctx.date).first, c.rang <= ctx.date {
                        Section {
                            HStack {
                                VStack(alignment: .leading) {
                                    Text("Are you up?").font(.title2)
                                    Text("Rings again at \(c.rang.addingTimeInterval(Clockwork.checkGap).formatted(date: .omitted, time: .shortened))").font(.subheadline).foregroundStyle(.secondary)
                                }
                                Spacer()
                                if !c.alarm.mission {
                                    Button("I'm Up") { store.awake = .now; Task { await scheduler.sync(store) } }
                                        .buttonStyle(.borderedProminent).buttonBorderShape(.capsule).tint(.green)
                                }
                            }
                            // Solve to Stop: iPhone's own Stop cannot be held back, so the sum is what cancels the second ring.
                            if c.alarm.mission {
                                LabeledContent(sum.q + " =") {
                                    TextField("Answer", text: $answer).labelsHidden().multilineTextAlignment(.trailing).monospacedDigit()
                                        #if os(iOS)
                                        .keyboardType(.numberPad)
                                        #endif
                                }
                                .font(.title2)
                                .onChange(of: answer) { if Int(answer) == sum.a { answer = ""; sum = Self.newSum(); store.awake = .now; Task { await scheduler.sync(store) } } }
                            }
                        }
                    }
                }
                Section {
                    // Sleep row like iOS: the wake time big, which morning, one button to change it.
                    HStack {
                        if store.sleep.on, let w = Clockwork.fireTime(store.sleep.wake, days: store.sleep.days, after: .now) {
                            VStack(alignment: .leading) {
                                TimeText(date: w, size: 48, weight: .ultraLight)
                                Text(Clockwork.dayWord(w, from: .now)).font(.subheadline).foregroundStyle(.secondary)
                            }
                            Spacer()
                            Button("Change") { sleepSheet = true }.buttonStyle(.bordered).buttonBorderShape(.capsule)
                        } else {
                            VStack(alignment: .leading) { Text("No Alarm").font(.title2); Text("Set a bedtime and a wake up time").font(.subheadline).foregroundStyle(.secondary) }
                            Spacer()
                            Button("Set Up") { sleepSheet = true }.buttonStyle(.bordered).buttonBorderShape(.capsule)
                        }
                    }
                } header: { Label("Sleep | Wake Up", systemImage: "bed.double.fill") }
                SleepSoundsSection()

                Section("Other") {
                    if store.alarms.isEmpty { Text("No alarms. Tap + to add one.").foregroundStyle(.secondary) }
                    ForEach($store.alarms) { $a in
                        HStack {
                            Button { editing = a } label: {
                                VStack(alignment: .leading) {
                                    TimeText(date: Self.at(a.time), size: 48, weight: .ultraLight)
                                    Text(meta(a)).font(.subheadline).foregroundStyle(.secondary)
                                }
                                .opacity(a.on ? 1 : 0.5).frame(maxWidth: .infinity, alignment: .leading).contentShape(Rectangle())
                            }
                            .buttonStyle(.plain)
                            Toggle("Alarm \(a.time)", isOn: $a.on).labelsHidden().toggleStyle(.switch).tint(.green)
                        }
                    }
                    .onDelete { store.alarms.remove(atOffsets: $0) }
                }
                if scheduler.allowed == false {
                    Section { Text("Alarms are turned off for Horula in Settings, so they cannot ring.").foregroundStyle(.red) }
                }
            }
            .readableColumn()
            .navigationTitle("Alarms")
            .toolbar {
                #if os(iOS)
                ToolbarItem(placement: .topBarLeading) { EditButton() }
                #endif
                ToolbarItem(placement: .primaryAction) {
                    Button { editing = AlarmItem(time: Self.hm(.now)) } label: { Label("Add Alarm", systemImage: "plus") }
                }
            }
            .sheet(item: $editing) { AlarmSheet(alarm: $0) }
            .sheet(isPresented: $sleepSheet) { SleepSheet() }
            .onChange(of: store.alarms) { Task { await scheduler.sync(store) } }
            .onChange(of: store.sleep) { Task { await scheduler.sync(store) } }
        }
    }

    private func meta(_ a: AlarmItem) -> String {
        var s = a.label.isEmpty ? "Alarm" : a.label
        if !a.days.isEmpty { s += ", " + Clockwork.repeatText(a.days) }
        if a.on, let skip = a.skip, let real = Clockwork.fireTime(a.time, days: a.days, after: .now), Clockwork.dayKey(real) == skip {
            s += " · " + String(localized: "Skipping \(String(localized: String.LocalizationValue(Clockwork.dayShort[Calendar.current.component(.weekday, from: real) - 1])))")
        }
        return s
    }
    static func hm(_ d: Date) -> String { let c = Calendar.current.dateComponents([.hour, .minute], from: d); return String(format: "%02d:%02d", c.hour!, c.minute!) }
    static func at(_ hm: String) -> Date { let m = Clockwork.minutes(hm); return Calendar.current.date(bySettingHour: m / 60, minute: m % 60, second: 0, of: .now)! }
}

struct DayChips: View {
    @Binding var days: [Int]
    var body: some View {
        HStack(spacing: 4) {
            ForEach(0..<7) { d in
                let on = days.contains(d)
                Button(["S", "M", "T", "W", "T", "F", "S"][d]) { if on { days.removeAll { $0 == d } } else { days.append(d) } }
                    .frame(maxWidth: .infinity, minHeight: 40).background(on ? Color.horula : Color.secondary.opacity(0.15), in: Circle())
                    .foregroundStyle(on ? .white : .primary).buttonStyle(.plain)
                    .accessibilityLabel(Clockwork.dayShort[d]).accessibilityAddTraits(on ? .isSelected : [])
            }
        }
    }
}

struct AlarmSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State var alarm: AlarmItem
    @State private var time = Date.now

    var body: some View {
        let exists = store.alarms.contains { $0.id == alarm.id }
        NavigationStack {
            Form {
                DatePicker("Time", selection: $time, displayedComponents: .hourAndMinute)
                    #if os(iOS)
                    .datePickerStyle(.wheel).labelsHidden().frame(maxWidth: .infinity)
                    #endif
                Section("Repeat") { DayChips(days: $alarm.days) }
                Section {
                    TextField("Label", text: $alarm.label, prompt: Text("Alarm"))
                    Toggle("Snooze", isOn: $alarm.snooze)
                    if alarm.snooze { Picker("Snooze Length", selection: $alarm.snoozeMin) { ForEach(1...15, id: \.self) { Text("\($0) min") } } }
                    Toggle("Wake Up Check", isOn: $alarm.check)
                    Toggle("Solve to Stop", isOn: $alarm.mission)
                }
                if exists {
                    Section {
                        if alarm.on && !alarm.days.isEmpty {
                            Button("Skip Next Alarm") {
                                if let at = Clockwork.fireTime(alarm.time, days: alarm.days, after: .now) { alarm.skip = Clockwork.dayKey(at) }
                                save()
                            }
                        }
                        Button("Delete Alarm", role: .destructive) { store.alarms.removeAll { $0.id == alarm.id }; dismiss() }
                    }
                }
            }
            .navigationTitle(exists ? "Edit Alarm" : "Add Alarm")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save") { alarm.time = AlarmsView.hm(time); alarm.on = true; save() } }
            }
            .onAppear { time = AlarmsView.at(alarm.time) }
        }
    }

    private func save() {
        if let i = store.alarms.firstIndex(where: { $0.id == alarm.id }) { store.alarms[i] = alarm } else { store.alarms.append(alarm) }
        store.alarms.sort { $0.time < $1.time }
        dismiss()
    }
}

struct SleepSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var plan = SleepPlan()
    @State private var bed = Date.now
    @State private var wake = Date.now
    var body: some View {
        NavigationStack {
            Form {
                Toggle("Sleep Schedule", isOn: $plan.on)
                DatePicker("Bedtime", selection: $bed, displayedComponents: .hourAndMinute)
                DatePicker("Wake Up", selection: $wake, displayedComponents: .hourAndMinute)
                let mins = (Clockwork.minutes(AlarmsView.hm(wake)) - Clockwork.minutes(AlarmsView.hm(bed)) + 1440) % 1440
                Text("\(mins / 60) hr \(mins % 60) min of sleep").foregroundStyle(.secondary)
                Section("Days") { DayChips(days: $plan.days) }
                Picker("Wind Down", selection: $plan.wind) {
                    Text("Off").tag(0); Text("15 minutes").tag(15); Text("30 minutes").tag(30); Text("45 minutes").tag(45); Text("1 hour").tag(60)
                }
                Toggle("Snooze", isOn: $plan.snooze)
            }
            .navigationTitle("Sleep Schedule")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Done") { plan.bed = AlarmsView.hm(bed); plan.wake = AlarmsView.hm(wake); store.sleep = plan; dismiss() } }
            }
            .onAppear { plan = store.sleep; if !plan.on { plan.on = true }; bed = AlarmsView.at(plan.bed); wake = AlarmsView.at(plan.wake) }
        }
    }
}

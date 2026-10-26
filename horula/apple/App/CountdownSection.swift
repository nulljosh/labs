import SwiftUI

/// Countdowns to a date ("Vacation, 1 month, 29 days"), like Timer+, under the timers. Counted in whole days.
struct CountdownSection: View {
    @Environment(Store.self) private var store
    @State private var label = ""
    @State private var date = Calendar.current.date(byAdding: .day, value: 7, to: .now) ?? .now
    private static let ymd: DateFormatter = { let f = DateFormatter(); f.locale = Locale(identifier: "en_US_POSIX"); f.dateFormat = "yyyy-MM-dd"; return f }()

    var body: some View {
        Section("Countdowns") {
            TimelineView(.everyMinute) { ctx in
                ForEach(store.countdowns, id: \.self) { c in
                    HStack {
                        VStack(alignment: .leading) {
                            Text(c.label.isEmpty ? String(localized: "Countdown") : c.label)
                            if let d = Self.ymd.date(from: c.date) { Text(d, style: .date).font(.subheadline).foregroundStyle(.secondary) }
                        }
                        Spacer()
                        Text(Clockwork.dateSpan(c.date, now: ctx.date).map(Clockwork.spanText) ?? "")
                    }
                }
                .onDelete { store.countdowns.remove(atOffsets: $0) }
            }
            LabeledContent("Label") { TextField("Label", text: $label, prompt: Text("Countdown")).labelsHidden().multilineTextAlignment(.trailing) }
            DatePicker("Date", selection: $date, displayedComponents: .date)
            HStack {
                Spacer()
                Button("Add") {
                    let c = Countdown(label: String(label.trimmingCharacters(in: .whitespaces).prefix(40)), date: Self.ymd.string(from: date))
                    if !store.countdowns.contains(c) { store.countdowns = (store.countdowns + [c]).sorted { $0.date < $1.date }.prefix(50).map { $0 } }
                    label = ""
                }
                .buttonStyle(.bordered).buttonBorderShape(.capsule).tint(.green)
            }
        }
    }
}

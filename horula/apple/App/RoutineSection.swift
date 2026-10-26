import SwiftUI

/// Routines, like Timer+: named steps (Warm up 5 min, Run 20 min, Cool down 5 min) run back to back.
/// A step is the wheel's time and the Label field above, so building one uses the controls already on screen.
struct RoutineSection: View {
    @Environment(Store.self) private var store
    @AppStorage("tmSpeak") private var speak = false
    let dur: TimeInterval
    @Binding var label: String
    @State private var name = ""
    @State private var draft: [Recent] = []

    var body: some View {
        Section {
            ForEach(store.routines, id: \.self) { r in
                HStack {
                    VStack(alignment: .leading) {
                        Text(r.name.isEmpty ? String(localized: "Routine") : r.name)
                        Text(String(localized: "\(r.steps.count) steps") + " · " + Clockwork.durationText(r.steps.reduce(0) { $0 + $1.dur }) + " · "
                             + r.steps.map { $0.label.isEmpty ? Clockwork.durationText($0.dur) : $0.label }.joined(separator: ", "))
                            .font(.subheadline).foregroundStyle(.secondary)
                    }
                    Spacer()
                    Button("Start") {
                        store.startRoutine(r)
                        if speak, let t = store.timers.last, let steps = t.steps { Chime.say(Clockwork.stepText(steps, 0)) }
                    }
                    .buttonStyle(.bordered).buttonBorderShape(.capsule).tint(.green)
                }
            }
            .onDelete { store.routines.remove(atOffsets: $0) }
            LabeledContent("Name") { TextField("Name", text: $name, prompt: Text("Routine")).labelsHidden().multilineTextAlignment(.trailing) }
            ForEach(Array(draft.enumerated()), id: \.offset) { i, s in
                LabeledContent("\(i + 1). " + (s.label.isEmpty ? String(localized: "Timer") : s.label), value: Clockwork.durationText(s.dur))
            }
            .onDelete { draft.remove(atOffsets: $0) }
            HStack {
                Spacer()
                Button("Add Step") { draft = (draft + [Recent(dur: dur, label: String(label.trimmingCharacters(in: .whitespaces).prefix(40)))]).prefix(30).map { $0 }; label = "" }
                    .buttonStyle(.bordered).buttonBorderShape(.capsule).disabled(dur == 0)
                Button("Save") {
                    store.routines = (store.routines + [Routine(name: String(name.trimmingCharacters(in: .whitespaces).prefix(40)), steps: draft)]).prefix(20).map { $0 }
                    draft = []; name = ""
                }
                .buttonStyle(.bordered).buttonBorderShape(.capsule).tint(.green).disabled(draft.isEmpty)
            }
        } header: { Text("Routines") } footer: { Text("Set a time and label above, then add it as a step.") }
    }
}

import SwiftUI

struct AssessmentView: View {
    @State private var store = PropertyStore()
    @State private var showingRename = false
    @State private var showingNew = false
    @State private var nameInput = ""

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(AssessmentData.layers) { layer in
                        layerSection(layer)
                    }
                }
            }
            .navigationTitle(store.current.name)
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Menu {
                        ForEach(store.list) { p in
                            Button(p.name) { store.currentID = p.id }
                        }
                        Divider()
                        Button("New place") { nameInput = ""; showingNew = true }
                        Button("Rename") { nameInput = store.current.name; showingRename = true }
                        if store.list.count > 1 {
                            Button("Delete", role: .destructive) { store.deleteCurrent() }
                        }
                    } label: {
                        Image(systemName: "house.badge.plus")
                    }
                }
            }
            .alert("Name this place", isPresented: $showingNew) {
                TextField("New place", text: $nameInput)
                Button("Cancel", role: .cancel) {}
                Button("Add") { if !nameInput.isEmpty { store.addProperty(named: nameInput) } }
            }
            .alert("Rename this place", isPresented: $showingRename) {
                TextField("Name", text: $nameInput)
                Button("Cancel", role: .cancel) {}
                Button("Save") { if !nameInput.isEmpty { store.rename(nameInput) } }
            }
        }
    }

    private func layerSection(_ layer: Layer) -> some View {
        let tally = AssessmentData.tally(store.current.answers)[layer.id] ?? .init()
        return Section {
            ForEach(AssessmentData.questions.filter { $0.layer == layer.id }) { q in
                questionRow(q)
            }
        } header: {
            VStack(alignment: .leading, spacing: 2) {
                Text(layer.name).font(.headline)
                Text(layer.sub).font(.caption).textCase(nil)
                if tally.answered > 0 {
                    Text("\(tally.concerns) concern\(tally.concerns == 1 ? "" : "s") of \(tally.answered) answered")
                        .font(.caption2)
                        .foregroundStyle(tally.concerns > 0 ? .orange : .secondary)
                        .textCase(nil)
                }
            }
        }
    }

    private func questionRow(_ q: AssessQuestion) -> some View {
        let answer = store.current.answers[q.id]
        return VStack(alignment: .leading, spacing: 6) {
            Text(q.text).font(.subheadline)
            HStack(spacing: 8) {
                ForEach(["yes", "no", "unsure"], id: \.self) { v in
                    Button(v.capitalized) { store.answer(q.id, v) }
                        .buttonStyle(.bordered)
                        .tint(answer == v ? (v == q.bad ? .orange : .accentColor) : .gray)
                }
            }
            if answer == q.bad {
                Text(q.note).font(.caption).foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

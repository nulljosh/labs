import SwiftUI

struct TimersView: View {
    @Environment(Store.self) private var store
    @Environment(AlarmScheduler.self) private var scheduler
    @State private var h = 0
    @State private var m = 5
    @State private var s = 0
    @State private var label = ""

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack(spacing: 0) {
                        wheel($h, 0..<24, "hours"); wheel($m, 0..<60, "min"); wheel($s, 0..<60, "sec")
                    }
                    TextField("Label", text: $label, prompt: Text("Timer"))
                    HStack {
                        Spacer()
                        Button("Start") { store.startTimer(TimeInterval(h * 3600 + m * 60 + s), label: label) }
                            .font(.title3).frame(width: 84, height: 84).background(.green.opacity(0.2), in: Circle()).foregroundStyle(.green)
                            .buttonStyle(.plain).disabled(h + m + s == 0)
                        Spacer()
                    }
                    .listRowBackground(Color.clear)
                }
                if !store.timers.isEmpty {
                    Section("Running") {
                        ForEach(store.timers) { t in
                            TimelineView(.periodic(from: .now, by: 0.25)) { ctx in TimerRow(timer: t, now: ctx.date) }
                        }
                        .onDelete { store.timers.remove(atOffsets: $0) }
                    }
                }
                if !store.recents.isEmpty {
                    Section("Recents") {
                        ForEach(store.recents, id: \.self) { r in
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(Clockwork.timerText(r.dur)).font(.system(size: 28, weight: .light))
                                    Text(r.label.isEmpty ? Clockwork.durationText(r.dur) : r.label).font(.subheadline).foregroundStyle(.secondary)
                                }
                                Spacer()
                                Button("Start") { store.startTimer(r.dur, label: r.label) }.buttonStyle(.bordered).buttonBorderShape(.capsule).tint(.green)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Timers")
            .onChange(of: store.timers) { Task { await scheduler.syncTimers(store) } }
        }
    }

    private func wheel(_ v: Binding<Int>, _ r: Range<Int>, _ unit: String) -> some View {
        Picker(unit, selection: v) { ForEach(r, id: \.self) { Text("\($0) \(unit)").tag($0) } }
            #if os(iOS)
            .pickerStyle(.wheel)
            #endif
            .frame(maxWidth: .infinity)
    }
}

struct TimerRow: View {
    @Environment(Store.self) private var store
    let timer: TimerItem
    let now: Date
    var body: some View {
        let left = timer.remaining(now)
        HStack(spacing: 12) {
            ZStack {
                Circle().stroke(.secondary.opacity(0.2), lineWidth: 5)
                Circle().trim(from: 0, to: max(0, left) / timer.dur).stroke(Color.horula, style: .init(lineWidth: 5, lineCap: .round)).rotationEffect(.degrees(-90))
            }
            .frame(width: 48, height: 48)
            VStack(alignment: .leading) {
                Text(Clockwork.timerText(left)).font(.system(size: 28, weight: .light)).monospacedDigit()
                Text([timer.label.isEmpty ? nil : timer.label, timer.end.map { "Ends " + $0.formatted(date: .omitted, time: .shortened) } ?? "Paused"]
                    .compactMap { $0 }.joined(separator: " · ")).font(.subheadline).foregroundStyle(.secondary)
            }
            Spacer()
            Button(timer.end == nil ? "Resume" : "Pause") { pause() }.buttonStyle(.bordered).buttonBorderShape(.capsule)
        }
        .onChange(of: left <= 0) { _, done in if done, timer.end != nil { store.timers.removeAll { $0.id == timer.id } } }
    }
    private func pause() {
        guard let i = store.timers.firstIndex(where: { $0.id == timer.id }) else { return }
        var t = store.timers[i]
        if let end = t.end { t.left = end.timeIntervalSinceNow; t.end = nil } else { t.end = .now.addingTimeInterval(t.left) }
        store.timers[i] = t
    }
}

struct SettingsView: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var exporting = false
    @State private var importing = false
    @State private var note: String?

    var body: some View {
        NavigationStack {
            Form {
                LabeledContent("Version", value: Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "")
                Link("horula.jaybulb.com", destination: URL(string: "https://horula.jaybulb.com/")!)
                Section {
                    Button("Export Backup") { exporting = true }
                    Button("Import Backup") { importing = true }
                } header: { Text("Backup") } footer: { Text("One file with your alarms, cities and timers. Works with Horula on the web too.") }
                if let note { Text(note).foregroundStyle(.secondary) }
                Section { Text("Everything stays on this device. No account, no tracking.").foregroundStyle(.secondary) }
            }
            .navigationTitle("Settings")
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } } }
            .fileExporter(isPresented: $exporting, document: BackupFile(data: store.backup()), contentType: .json, defaultFilename: "horula-backup") { _ in }
            .fileImporter(isPresented: $importing, allowedContentTypes: [.json]) { result in
                do {
                    let url = try result.get(), ok = url.startAccessingSecurityScopedResource()
                    defer { if ok { url.stopAccessingSecurityScopedResource() } }
                    let n = try store.restore(Data(contentsOf: url))
                    note = "Restored \(n.alarms) alarms and \(n.cities) cities"
                } catch { note = error.localizedDescription }
            }
        }
    }
}

import UniformTypeIdentifiers
struct BackupFile: FileDocument {
    static var readableContentTypes: [UTType] { [.json] }
    var data: Data
    init(data: Data) { self.data = data }
    init(configuration: ReadConfiguration) throws { data = configuration.file.regularFileContents ?? Data() }
    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper { FileWrapper(regularFileWithContents: data) }
}

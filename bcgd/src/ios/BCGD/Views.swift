import SwiftUI
import UniformTypeIdentifiers

// MARK: - Dashboard

struct DashboardView: View {
    @Environment(Store.self) private var store
    @AppStorage("reorderEmail") private var reorderEmail = ""

    var body: some View {
        NavigationStack {
            List {
                Section("Today") {
                    if store.todayJobs.isEmpty {
                        Text("Nothing scheduled today").foregroundStyle(.secondary)
                    }
                    ForEach(store.todayJobs) { job in
                        NavigationLink(value: job.id) { TodayRow(job: job) }
                    }
                }
                Section("Stats") {
                    statRow("Parts in stock", value: "\(store.parts.reduce(0) { $0 + $1.quantity })")
                    statRow("Low stock items", value: "\(store.lowStockParts.count)")
                    statRow("Open jobs", value: "\(store.jobs.filter { $0.status != .paid }.count)")
                    statRow("Jobs paid", value: "\(store.jobs.filter { $0.status == .paid }.count)")
                }
                if !store.lowStockParts.isEmpty { lowStock }
            }
            .navigationTitle("Doorstock")
            .navigationDestination(for: UUID.self) { JobDetailView(jobID: $0) }
        }
    }

    private var lowStock: some View {
        Section("Low Stock") {
            ForEach(store.lowStockParts) { part in
                HStack {
                    Text(part.name)
                    Spacer()
                    Text("\(part.quantity)").foregroundStyle(.red).fontWeight(.semibold)
                }
            }
            if let url = store.reorderURL(to: reorderEmail) {
                Link("Email a reorder", destination: url)
            }
        }
    }

    private func statRow(_ label: String, value: String) -> some View {
        HStack {
            Text(label)
            Spacer()
            Text(value).fontWeight(.semibold).foregroundStyle(Color.doorstock)
        }
    }
}

struct TodayRow: View {
    @Environment(Store.self) private var store
    let job: Job

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(job.customer).font(.subheadline)
            if !job.address.isEmpty { Text(job.address).font(.caption).foregroundStyle(.secondary) }
            if !job.parts.isEmpty {
                Text(job.parts.compactMap { p in store.part(p.partID).map { "\(p.quantity) × \($0.name)" } }.joined(separator: ", "))
                    .font(.caption).foregroundStyle(Color.doorstock)
            }
        }
    }
}

// MARK: - Inventory

struct InventoryView: View {
    @Environment(Store.self) private var store
    @State private var search = ""
    @State private var editing: Part?

    private var filtered: [Part] {
        search.isEmpty ? store.parts : store.parts.filter {
            $0.name.localizedCaseInsensitiveContains(search) ||
            $0.category.localizedCaseInsensitiveContains(search)
        }
    }

    private var categories: [String] { Array(Set(filtered.map(\.category))).sorted() }

    var body: some View {
        NavigationStack {
            List {
                ForEach(categories, id: \.self) { category in
                    Section(category) {
                        ForEach(filtered.filter { $0.category == category }) { part in
                            PartRow(part: part)
                                .contentShape(Rectangle())
                                .onTapGesture { editing = part }
                                .swipeActions { Button("Delete", role: .destructive) { delete(part) } }
                        }
                    }
                }
            }
            .searchable(text: $search)
            .navigationTitle("Inventory")
            .toolbar {
                Button { editing = Part(name: "", category: "", quantity: 0) } label: { Label("Add part", systemImage: "plus") }
            }
            .sheet(item: $editing) { PartEditor(part: $0) }
        }
    }

    private func delete(_ part: Part) { store.parts.removeAll { $0.id == part.id } }
}

struct PartRow: View {
    @Environment(Store.self) private var store
    let part: Part

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(part.name).font(.subheadline)
                if part.isLowStock { Text("Low stock").font(.caption).foregroundStyle(.red) }
            }
            Spacer()
            Stepper("\(part.quantity)", value: quantity, in: 0...999).fixedSize()
        }
    }

    private var quantity: Binding<Int> {
        Binding(
            get: { store.part(part.id)?.quantity ?? 0 },
            set: { store.adjust(part.id, by: $0 - (store.part(part.id)?.quantity ?? 0), reason: "Count") }
        )
    }
}

struct PartEditor: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State var part: Part

    private var isNew: Bool { store.part(part.id) == nil }

    var body: some View {
        NavigationStack {
            Form {
                TextField("Name", text: $part.name)
                TextField("Category", text: $part.category)
                if isNew { Stepper("Quantity: \(part.quantity)", value: $part.quantity, in: 0...999) }
                Stepper("Low stock at: \(part.lowStockThreshold)", value: $part.lowStockThreshold, in: 0...99)
            }
            .navigationTitle(isNew ? "New Part" : "Edit Part")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save(); dismiss() }
                        .disabled(part.name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }

    private func save() {
        if part.category.isEmpty { part.category = "Other" }
        if let i = store.parts.firstIndex(where: { $0.id == part.id }) {
            store.parts[i].name = part.name
            store.parts[i].category = part.category
            store.parts[i].lowStockThreshold = part.lowStockThreshold
        } else {
            store.parts.append(part)
            store.history.insert(StockChange(partName: part.name, delta: part.quantity, reason: "Added"), at: 0)
        }
    }
}

// MARK: - Jobs

struct JobsView: View {
    @Environment(Store.self) private var store
    @State private var newCustomer = ""

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack {
                        TextField("New job: customer name", text: $newCustomer)
                        Button("Add") {
                            store.jobs.insert(Job(customer: newCustomer), at: 0)
                            newCustomer = ""
                        }
                        .disabled(newCustomer.isEmpty)
                        .buttonStyle(.borderedProminent)
                    }
                }
                ForEach(store.jobs) { job in
                    NavigationLink(value: job.id) { JobRow(job: job) }
                }
                .onDelete { store.jobs.remove(atOffsets: $0) }
            }
            .navigationTitle("Jobs")
            .navigationDestination(for: UUID.self) { JobDetailView(jobID: $0) }
        }
    }
}

struct JobRow: View {
    @Environment(Store.self) private var store
    let job: Job

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(job.customer).font(.subheadline)
                Text(job.scheduled.map { "\(job.status.rawValue) · \($0.formatted(date: .abbreviated, time: .shortened))" } ?? job.status.rawValue)
                    .font(.caption)
                    .foregroundStyle(job.status == .paid ? Color.secondary : Color.doorstock)
            }
            Spacer()
            if let next = job.status.next {
                Button(next.rawValue) { store.advance(job.id) }.buttonStyle(.bordered)
            }
        }
    }
}

struct JobDetailView: View {
    @Environment(Store.self) private var store
    let jobID: UUID
    @State private var adding: UUID?

    private var index: Int? { store.jobs.firstIndex { $0.id == jobID } }

    var body: some View {
        @Bindable var store = store
        if let i = index {
            Form {
                Section("Customer") {
                    TextField("Name", text: $store.jobs[i].customer)
                    TextField("Address", text: $store.jobs[i].address)
                    TextField("Notes", text: $store.jobs[i].detail, axis: .vertical)
                }
                Section("When") { ScheduleField(date: $store.jobs[i].scheduled) }
                Section("Parts") { JobPartsEditor(job: $store.jobs[i]) }
                Section {
                    LabeledContent("Status", value: store.jobs[i].status.rawValue)
                    if let next = store.jobs[i].status.next {
                        Button("Move to \(next.rawValue)") { store.advance(jobID) }
                    }
                } footer: {
                    if !store.jobs[i].stockDeducted && !store.jobs[i].parts.isEmpty {
                        Text("Parts come off the shelf when the job moves to Complete.")
                    }
                }
            }
            .navigationTitle(store.jobs[i].customer)
        } else {
            Text("This job was deleted.").foregroundStyle(.secondary)
        }
    }
}

struct ScheduleField: View {
    @Binding var date: Date?

    var body: some View {
        Toggle("Scheduled", isOn: Binding(get: { date != nil }, set: { date = $0 ? (date ?? Date()) : nil }))
        if let d = date {
            DatePicker("Date", selection: Binding(get: { d }, set: { date = $0 }))
        }
    }
}

struct JobPartsEditor: View {
    @Environment(Store.self) private var store
    @Binding var job: Job

    var body: some View {
        ForEach($job.parts) { $p in
            Stepper("\(p.quantity) × \(store.part(p.partID)?.name ?? "Removed part")", value: $p.quantity, in: 1...99)
                .disabled(job.stockDeducted)
        }
        .onDelete { job.parts.remove(atOffsets: $0) }
        if !job.stockDeducted {
            Menu("Add a part") {
                ForEach(store.parts.filter { p in !job.parts.contains { $0.partID == p.id } }) { part in
                    Button(part.name) { job.parts.append(JobPart(partID: part.id, quantity: 1)) }
                }
            }
        }
    }
}

// MARK: - Settings

struct SettingsView: View {
    @Environment(Store.self) private var store
    @AppStorage("reorderEmail") private var reorderEmail = ""
    @State private var importing = false
    @State private var importResult: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Reorders") {
                    TextField("Supplier email", text: $reorderEmail)
                }
                Section("Data") {
                    NavigationLink("Stock history") { HistoryView() }
                    ShareLink("Export inventory (CSV)", item: store.exportFile("doorstock-inventory.csv", Data(store.csv.utf8)))
                    ShareLink("Export backup", item: store.exportFile("doorstock-backup.json", store.backup))
                    Button("Restore a backup") { importing = true }
                    Button("Reset inventory to defaults", role: .destructive) { store.parts = Store.seedParts }
                }
                Section("About") {
                    LabeledContent("Version", value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "")
                    Link("doorstock.jaybulb.com", destination: URL(string: "https://doorstock.jaybulb.com")!)
                }
            }
            .navigationTitle("Settings")
            .fileImporter(isPresented: $importing, allowedContentTypes: [.json]) { restore($0) }
            .alert(importResult ?? "", isPresented: Binding(get: { importResult != nil }, set: { if !$0 { importResult = nil } })) {}
        }
    }

    private func restore(_ result: Result<URL, Error>) {
        guard case .success(let url) = result else { return }
        let scoped = url.startAccessingSecurityScopedResource()
        defer { if scoped { url.stopAccessingSecurityScopedResource() } }
        let ok = (try? Data(contentsOf: url)).map(store.restore) ?? false
        importResult = ok ? "Backup restored." : "That file isn't a Doorstock backup."
    }
}

struct HistoryView: View {
    @Environment(Store.self) private var store

    var body: some View {
        List(store.history) { change in
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(change.partName).font(.subheadline)
                    Text("\(change.reason) · \(change.date.formatted(date: .abbreviated, time: .shortened))")
                        .font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
                Text(change.delta > 0 ? "+\(change.delta)" : "\(change.delta)")
                    .fontWeight(.semibold)
                    .foregroundStyle(change.delta > 0 ? Color.doorstock : .red)
            }
        }
        .overlay { if store.history.isEmpty { Text("No stock changes yet").foregroundStyle(.secondary) } }
        .navigationTitle("Stock History")
    }
}

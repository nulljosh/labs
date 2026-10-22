import SwiftUI
import UniformTypeIdentifiers

// MARK: - Dashboard

struct DashboardView: View {
    @Environment(Store.self) private var store
    @AppStorage("reorderEmail") private var reorderEmail = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 12)], spacing: 12) {
                        StatTile(label: "Parts in stock", value: store.parts.reduce(0) { $0 + $1.quantity }, symbol: "shippingbox")
                        StatTile(label: "Low stock", value: store.lowStockParts.count, symbol: "exclamationmark.triangle", alert: !store.lowStockParts.isEmpty)
                        StatTile(label: "Open jobs", value: store.jobs.filter { $0.status != .paid }.count, symbol: "list.clipboard")
                        StatTile(label: "Jobs paid", value: store.jobs.filter { $0.status == .paid }.count, symbol: "checkmark.circle")
                    }
                    Card("Today") {
                        if store.todayJobs.isEmpty {
                            CardRow { Text("Nothing scheduled today").foregroundStyle(.secondary) }
                        }
                        ForEach(Array(store.todayJobs.enumerated()), id: \.element.id) { i, job in
                            NavigationLink(value: job.id) {
                                CardRow(divider: i > 0) { TodayRow(job: job); Spacer(); Image(systemName: "chevron.right").font(.footnote.weight(.semibold)).foregroundStyle(.tertiary) }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    if !store.lowStockParts.isEmpty {
                        Card("Low stock") {
                            ForEach(Array(store.lowStockParts.enumerated()), id: \.element.id) { i, part in
                                CardRow(divider: i > 0) {
                                    Text(part.name)
                                    Spacer()
                                    Text("\(part.quantity) left").foregroundStyle(.red).monospacedDigit()
                                }
                            }
                            if let url = store.reorderURL(to: reorderEmail) {
                                CardRow(divider: true) { Link("Email a reorder", destination: url) }
                            }
                        }
                    }
                }
                .padding(20)
                .frame(maxWidth: 760)
                .frame(maxWidth: .infinity)
            }
            .background(Color.page)
            .navigationTitle("Doorstock")
            .navigationDestination(for: UUID.self) { JobDetailView(jobID: $0) }
        }
    }
}

// MARK: - Building blocks (8 point grid; cards 28, grouped lists 20)

extension Color {
    #if os(macOS)
    static let page = Color(nsColor: .windowBackgroundColor)
    static let card = Color(nsColor: .quaternarySystemFill)
    #else
    static let page = Color(uiColor: .systemGroupedBackground)
    static let card = Color(uiColor: .secondarySystemGroupedBackground)
    #endif
}

struct StatTile: View {
    let label: String
    let value: Int
    let symbol: String
    var alert = false

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Image(systemName: symbol)
                .font(.title3)
                .foregroundStyle(alert ? Color.red : Color.doorstock)
                .padding(.bottom, 12)
            Text("\(value)")
                .font(.system(size: 34, weight: .bold, design: .rounded))
                .monospacedDigit()
            Text(label).font(.subheadline).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color.card, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
    }
}

struct Card<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    init(_ title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.headline).padding(.leading, 4)
            VStack(spacing: 0) { content }
            .background(Color.card, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
    }
}

struct CardRow<Content: View>: View {
    var divider = false
    @ViewBuilder let content: Content

    var body: some View {
        HStack(spacing: 12) { content }
            .padding(.vertical, 12)
            .padding(.horizontal, 16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .contentShape(Rectangle())
            .overlay(alignment: .top) { if divider { Divider().padding(.leading, 16) } }
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
            .insetList()
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
                Text(part.name)
                if part.isLowStock { Text("Low stock").font(.caption).foregroundStyle(.red) }
            }
            Spacer()
            Stepper(value: quantity, in: 0...999) {
                Text("\(part.quantity)").monospacedDigit().frame(minWidth: 32, alignment: .trailing)
            }
            .fixedSize()
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
            .formStyle(.grouped)
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
    @State private var adding = false

    var body: some View {
        NavigationStack {
            List {
                ForEach(store.jobs) { job in
                    NavigationLink(value: job.id) { JobRow(job: job) }
                        .listRowSeparator(.hidden)
                }
                .onDelete { store.jobs.remove(atOffsets: $0) }
            }
            .insetList()
            .overlay { if store.jobs.isEmpty { Text("No jobs yet").foregroundStyle(.secondary) } }
            .navigationTitle("Jobs")
            .toolbar {
                Button { adding = true } label: { Label("New job", systemImage: "plus") }
            }
            .alert("New job", isPresented: $adding) {
                TextField("Customer name", text: $newCustomer)
                Button("Add") {
                    let name = newCustomer.trimmingCharacters(in: .whitespaces)
                    if !name.isEmpty { store.jobs.insert(Job(customer: name), at: 0) }
                    newCustomer = ""
                }
                Button("Cancel", role: .cancel) { newCustomer = "" }
            }
            .navigationDestination(for: UUID.self) { JobDetailView(jobID: $0) }
        }
    }
}

struct JobRow: View {
    @Environment(Store.self) private var store
    let job: Job

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(job.customer)
                HStack(spacing: 8) {
                    StatusPill(status: job.status)
                    if let date = job.scheduled {
                        Text(date.formatted(date: .abbreviated, time: .shortened)).font(.footnote).foregroundStyle(.secondary)
                    }
                }
            }
            Spacer()
            if let next = job.status.next {
                Button(next.rawValue, systemImage: "arrow.right") { store.advance(job.id) }
                    .buttonStyle(.bordered)
                    .buttonBorderShape(.capsule)
            }
        }
        .padding(.vertical, 4)
    }
}

struct StatusPill: View {
    let status: JobStatus

    var body: some View {
        let tint = status == .paid ? Color.secondary : Color.doorstock
        Text(status.rawValue)
            .font(.caption.weight(.semibold))
            .foregroundStyle(tint)
            .padding(.horizontal, 8)
            .padding(.vertical, 2)
            .background(tint.opacity(0.12), in: Capsule())
    }
}

extension View {
    @ViewBuilder func insetList() -> some View {
        #if os(macOS)
        listStyle(.inset(alternatesRowBackgrounds: false))
        #else
        listStyle(.insetGrouped)
        #endif
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
            .formStyle(.grouped)
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
            .formStyle(.grouped)
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
                    Text(change.partName)
                    Text("\(change.reason) · \(change.date.formatted(date: .abbreviated, time: .shortened))")
                        .font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
                Text(change.delta > 0 ? "+\(change.delta)" : "\(change.delta)")
                    .fontWeight(.semibold)
                    .foregroundStyle(change.delta > 0 ? Color.doorstock : .red)
            }
        }
        .insetList()
        .overlay { if store.history.isEmpty { Text("No stock changes yet").foregroundStyle(.secondary) } }
        .navigationTitle("Stock History")
    }
}

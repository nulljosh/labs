import SwiftUI
import UniformTypeIdentifiers

// MARK: - Dashboard

struct DashboardView: View {
    @Environment(Store.self) private var store
    @AppStorage("reorderEmail") private var reorderEmail = ""
    @State private var editing: Part?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 32) {
                    LazyVGrid(columns: Grid.tiles, spacing: 12) {
                        StatTile(label: "Parts in stock", value: store.parts.reduce(0) { $0 + $1.quantity }, symbol: "shippingbox")
                        StatTile(label: "Low stock", value: store.lowStockParts.count, symbol: "exclamationmark.triangle", alert: !store.lowStockParts.isEmpty)
                        StatTile(label: "Open jobs", value: store.jobs.filter { $0.status != .paid }.count, symbol: "list.clipboard")
                        StatTile(label: "Jobs paid", value: store.jobs.filter { $0.status == .paid }.count, symbol: "checkmark.circle")
                    }
                    if !store.lowStockParts.isEmpty {
                        Shelf("Low stock", symbol: "exclamationmark.triangle") {
                            LazyVGrid(columns: Grid.tiles, spacing: 12) {
                                ForEach(store.lowStockParts) { PartTile(part: $0) { editing = $0 } }
                            }
                            if let url = store.reorderURL(to: reorderEmail) {
                                Link(destination: url) { Label("Email a reorder", systemImage: "envelope") }
                                    .buttonStyle(.bordered)
                                    .buttonBorderShape(.capsule)
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
            .sheet(item: $editing) { PartEditor(part: $0) }
        }
    }
}

// MARK: - Inventory

extension Part {
    var symbol: String {
        switch category {
        case "Cables": "cable.connector"
        case "Hardware": "wrench.and.screwdriver"
        case "Openers": "door.garage.open"
        case "Rollers": "circle.circle"
        case "Seals": "drop"
        case "Springs": "arrow.up.and.down"
        default: "shippingbox"
        }
    }
}

struct InventoryView: View {
    @Environment(Store.self) private var store
    @Environment(Account.self) private var account
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
            ScrollView {
                VStack(alignment: .leading, spacing: 32) {
                    ForEach(categories, id: \.self) { category in
                        let parts = filtered.filter { $0.category == category }
                        Shelf(category, symbol: parts[0].symbol) {
                            LazyVGrid(columns: Grid.tiles, spacing: 12) {
                                ForEach(parts) { part in
                                    PartTile(part: part) { editing = $0 }
                                        .contextMenu { if account.isOwner { Button("Delete", systemImage: "trash", role: .destructive) { delete(part) } } }
                                }
                            }
                        }
                    }
                    if categories.isEmpty { EmptyTile(symbol: "magnifyingglass", text: "No parts match") }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(20)
            }
            .background(Color.page)
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

struct PartTile: View {
    @Environment(Store.self) private var store
    let part: Part
    let edit: (Part) -> Void

    var body: some View {
        let low = part.isLowStock
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: part.symbol).font(.title3).foregroundStyle(low ? Color.red : Color.doorstock)
                Spacer()
                if low { Text("Low").font(.caption.weight(.semibold)).foregroundStyle(.red) }
            }
            Text(part.name).font(.subheadline.weight(.medium)).lineLimit(2, reservesSpace: true)
            HStack(spacing: 8) {
                Text("\(part.quantity)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    .lineLimit(1)
                    .fixedSize()
                    .foregroundStyle(low ? Color.red : Color.primary)
                Spacer()
                RoundIcon(symbol: "minus") { store.adjust(part.id, by: -1, reason: "Count") }
                    .disabled(part.quantity == 0)
                RoundIcon(symbol: "plus") { store.adjust(part.id, by: 1, reason: "Count") }
            }
        }
        .cardBackground()
        .contentShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        .onTapGesture { edit(part) }
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

extension JobStatus {
    var symbol: String {
        switch self {
        case .lead: "person.crop.circle.badge.plus"
        case .quote: "doc.text"
        case .scheduled: "calendar"
        case .complete: "checkmark.seal"
        case .paid: "dollarsign.circle"
        }
    }
}

struct JobsView: View {
    @Environment(Store.self) private var store
    @Environment(Account.self) private var account
    @State private var newCustomer = ""
    @State private var adding = false

    var body: some View {
        NavigationStack {
            // ponytail: one board, columns by status; scrolls both ways so it fits a phone too
            ScrollView([.horizontal, .vertical]) {
                HStack(alignment: .top, spacing: 16) {
                    ForEach(JobStatus.allCases, id: \.self) { status in
                        let jobs = store.jobs.filter { $0.status == status }
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Label(status.rawValue, systemImage: status.symbol).font(.headline)
                                Spacer()
                                Text("\(jobs.count)").font(.subheadline).foregroundStyle(.secondary).monospacedDigit()
                            }
                            .padding(.horizontal, 4)
                            ForEach(jobs) { job in
                                NavigationLink(value: job.id) { JobCard(job: job) }
                                    .buttonStyle(.plain)
                                    .contextMenu {
                                        if account.isOwner { Button("Delete", systemImage: "trash", role: .destructive) { store.jobs.removeAll { $0.id == job.id } } }
                                    }
                            }
                            if jobs.isEmpty { EmptyTile(symbol: status.symbol, text: "None") }
                        }
                        .frame(width: 232)
                    }
                }
                .padding(20)
            }
            .background(Color.page)
            .navigationTitle("Jobs")
            .navigationDestination(for: UUID.self) { JobDetailView(jobID: $0) }
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
        }
    }
}

struct JobCard: View {
    @Environment(Store.self) private var store
    let job: Job
    var showsStatus = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(job.customer).font(.body.weight(.semibold)).lineLimit(1)
            if showsStatus { StatusPill(status: job.status) }
            if !job.address.isEmpty { fact("mappin", job.address) }
            if let date = job.scheduled { fact("clock", date.formatted(date: .abbreviated, time: .shortened)) }
            if !job.parts.isEmpty { fact("shippingbox", "\(job.parts.reduce(0) { $0 + $1.quantity }) parts") }
            if let next = job.status.next {
                Button(next.rawValue, systemImage: "arrow.right") { store.advance(job.id) }
                    .buttonStyle(.bordered)
                    .buttonBorderShape(.capsule)
                    .padding(.top, 4)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardBackground()
        .contentShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
    }

    private func fact(_ symbol: String, _ text: String) -> some View {
        Label(text, systemImage: symbol).font(.footnote).foregroundStyle(.secondary).lineLimit(1)
    }
}

struct StatusPill: View {
    let status: JobStatus

    var body: some View {
        let tint = status == .paid ? Color.secondary : Color.doorstock
        Label(status.rawValue, systemImage: status.symbol)
            .font(.caption.weight(.semibold))
            .foregroundStyle(tint)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
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
                Section { StatusTrack(status: store.jobs[i].status) }
                Section("Customer") {
                    TextField("Name", text: $store.jobs[i].customer)
                    TextField("Address", text: $store.jobs[i].address)
                    TextField("Notes", text: $store.jobs[i].detail, axis: .vertical)
                }
                Section("When") { ScheduleField(date: $store.jobs[i].scheduled) }
                Section("Parts") { JobPartsEditor(job: $store.jobs[i]) }
                Section {
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

struct StatusTrack: View {
    let status: JobStatus

    var body: some View {
        let reached = JobStatus.allCases.firstIndex(of: status) ?? 0
        HStack(spacing: 0) {
            ForEach(Array(JobStatus.allCases.enumerated()), id: \.offset) { i, step in
                if i > 0 { Rectangle().fill(i <= reached ? Color.doorstock : Color.secondary.opacity(0.25)).frame(height: 2) }
                VStack(spacing: 4) {
                    Image(systemName: step.symbol)
                        .font(.body.weight(.semibold))
                        .frame(width: 40, height: 40)
                        .foregroundStyle(i <= reached ? Color.white : Color.secondary)
                        .background(i <= reached ? Color.doorstock : Color.secondary.opacity(0.12), in: Circle())
                    Text(step.rawValue).font(.caption2).foregroundStyle(i == reached ? Color.primary : Color.secondary)
                }
                .fixedSize()
            }
        }
        .padding(.vertical, 8)
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


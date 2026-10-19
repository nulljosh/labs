import SwiftUI

// MARK: - Dashboard

struct DashboardView: View {
    @Environment(Store.self) private var store

    var body: some View {
        NavigationStack {
            List {
                Section("Stats") {
                    statRow("Parts in stock", value: "\(store.parts.reduce(0) { $0 + $1.quantity })")
                    statRow("Low stock items", value: "\(store.lowStockParts.count)")
                    statRow("Open jobs", value: "\(store.jobs.filter { $0.status != .paid }.count)")
                    statRow("Jobs paid", value: "\(store.jobs.filter { $0.status == .paid }.count)")
                }
                if !store.lowStockParts.isEmpty {
                    Section("Low Stock") {
                        ForEach(store.lowStockParts) { part in
                            HStack {
                                Text(part.name)
                                Spacer()
                                Text("\(part.quantity)")
                                    .foregroundStyle(.red)
                                    .fontWeight(.semibold)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Doorstock")
        }
    }

    private func statRow(_ label: String, value: String) -> some View {
        HStack {
            Text(label)
            Spacer()
            Text(value).fontWeight(.semibold).foregroundStyle(Color.bcgdTeal)
        }
    }
}

// MARK: - Inventory

struct InventoryView: View {
    @Environment(Store.self) private var store
    @State private var search = ""

    private var filtered: [Part] {
        search.isEmpty ? store.parts : store.parts.filter {
            $0.name.localizedCaseInsensitiveContains(search) ||
            $0.category.localizedCaseInsensitiveContains(search)
        }
    }

    private var categories: [String] {
        Array(Set(filtered.map(\.category))).sorted()
    }

    var body: some View {
        NavigationStack {
            List {
                ForEach(categories, id: \.self) { category in
                    Section(category) {
                        ForEach(filtered.filter { $0.category == category }) { part in
                            PartRow(part: part)
                        }
                    }
                }
            }
            .searchable(text: $search)
            .navigationTitle("Inventory")
        }
    }
}

struct PartRow: View {
    @Environment(Store.self) private var store
    let part: Part

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(part.name).font(.subheadline)
                if part.isLowStock {
                    Text("Low stock").font(.caption).foregroundStyle(.red)
                }
            }
            Spacer()
            Stepper("\(part.quantity)", value: binding, in: 0...999)
                .fixedSize()
        }
    }

    private var binding: Binding<Int> {
        Binding(
            get: { store.parts.first(where: { $0.id == part.id })?.quantity ?? 0 },
            set: { qty in
                if let i = store.parts.firstIndex(where: { $0.id == part.id }) {
                    store.parts[i].quantity = qty
                }
            }
        )
    }
}

// MARK: - Jobs

struct JobsView: View {
    @Environment(Store.self) private var store
    @State private var newCustomer = ""

    var body: some View {
        @Bindable var store = store
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
                        .tint(.bcgdTeal)
                    }
                }
                ForEach($store.jobs) { $job in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(job.customer).font(.subheadline)
                            Text(job.status.rawValue)
                                .font(.caption)
                                .foregroundStyle(job.status == .paid ? Color.bcgdSage : Color.bcgdTeal)
                        }
                        Spacer()
                        if let next = job.status.next {
                            Button(next.rawValue) { job.status = next }
                                .buttonStyle(.bordered)
                                .tint(.bcgdTeal)
                        }
                    }
                }
                .onDelete { store.jobs.remove(atOffsets: $0) }
            }
            .navigationTitle("Jobs")
        }
    }
}

// MARK: - Settings

struct SettingsView: View {
    @Environment(Store.self) private var store

    var body: some View {
        NavigationStack {
            List {
                Section("Data") {
                    Button("Reset inventory to defaults", role: .destructive) {
                        store.parts = Store.seedParts
                    }
                }
                Section("About") {
                    LabeledContent("Version", value: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "")
                    Link("doorstock.jaybulb.com", destination: URL(string: "https://doorstock.jaybulb.com")!)
                        .tint(.bcgdTeal)
                }
            }
            .navigationTitle("Settings")
        }
    }
}

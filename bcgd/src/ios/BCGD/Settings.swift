import SwiftUI
import UniformTypeIdentifiers

// MARK: - Settings

struct SettingsView: View {
    @Environment(Store.self) private var store
    @Environment(Account.self) private var account
    @AppStorage("reorderEmail") private var reorderEmail = ""
    @State private var importing = false
    @State private var importResult: String?
    @State private var resetting = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 32) {
                    TeamShelf()
                    Shelf("Reorders", symbol: "envelope") {
                        TextField("Supplier email", text: $reorderEmail)
                            .textFieldStyle(.plain)
                            .cardBackground()
                    }
                    Shelf("Data", symbol: "externaldrive") {
                        LazyVGrid(columns: Grid.tiles, spacing: 12) {
                            NavigationLink { HistoryView() } label: { ActionTile("Stock history", symbol: "clock.arrow.circlepath") }
                            ShareLink(item: store.exportFile("doorstock-inventory.csv", Data(store.csv.utf8))) { ActionTile("Export CSV", symbol: "tablecells") }
                            ShareLink(item: store.exportFile("doorstock-backup.json", store.backup)) { ActionTile("Export backup", symbol: "square.and.arrow.up") }
                            if account.isOwner {
                                Button { importing = true } label: { ActionTile("Restore backup", symbol: "square.and.arrow.down") }
                                Button { resetting = true } label: { ActionTile("Reset stock", symbol: "arrow.counterclockwise", tint: .red) }
                            }
                        }
                        .buttonStyle(.plain)
                    }
                    Shelf("About", symbol: "info.circle") {
                        HStack {
                            Image(systemName: "door.garage.closed").font(.title2).foregroundStyle(Color.doorstock)
                            Text("Doorstock " + (Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""))
                            Spacer()
                            Link(destination: URL(string: "https://doorstock.jaybulb.com")!) { Image(systemName: "safari").font(.title3) }
                        }
                        .cardBackground()
                    }
                }
                .padding(20)
                .frame(maxWidth: 760)
                .frame(maxWidth: .infinity)
            }
            .background(Color.page)
            .navigationTitle("Settings")
            .confirmationDialog("Reset inventory to the default parts?", isPresented: $resetting) {
                Button("Reset", role: .destructive) { store.parts = Store.seedParts }
            }
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
            HStack(spacing: 12) {
                Image(systemName: change.delta > 0 ? "arrow.up" : "arrow.down")
                    .font(.footnote.weight(.bold))
                    .frame(width: 32, height: 32)
                    .foregroundStyle(change.delta > 0 ? Color.doorstock : .red)
                    .background((change.delta > 0 ? Color.doorstock : Color.red).opacity(0.12), in: Circle())
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

import SwiftUI
import SwiftData

struct SearchView: View {
    @State private var databases: [CanLIIDatabase] = []
    @State private var selectedDatabase: CanLIIDatabase?
    @State private var query = ""
    @State private var results: [CanLIICase] = []
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            VStack {
                Picker("Database", selection: $selectedDatabase) {
                    ForEach(databases) { db in
                        Text(db.name).tag(Optional(db))
                    }
                }
                .pickerStyle(.menu)

                List(results) { result in
                    NavigationLink(value: result) {
                        VStack(alignment: .leading) {
                            Text(result.title).font(.headline)
                            if let citation = result.citation {
                                Text(citation).font(.caption).foregroundStyle(.secondary)
                            }
                        }
                    }
                }
                .navigationDestination(for: CanLIICase.self) { result in
                    CaseDetailView(result: result)
                }
            }
            .searchable(text: $query)
            .onSubmit(of: .search) { Task { await runSearch() } }
            .task { await loadDatabases() }
            .navigationTitle("CanLII")
            .alert("Error", isPresented: .constant(errorMessage != nil), actions: {
                Button("OK") { errorMessage = nil }
            }, message: {
                Text(errorMessage ?? "")
            })
        }
    }

    private func loadDatabases() async {
        do {
            databases = try await CanLIIClient.databases()
            selectedDatabase = databases.first
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func runSearch() async {
        guard let db = selectedDatabase, !query.isEmpty else { return }
        do {
            results = try await CanLIIClient.search(databaseId: db.databaseId, query: query)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

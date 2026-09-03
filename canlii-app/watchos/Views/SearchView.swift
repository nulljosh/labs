import SwiftUI

struct SearchView: View {
    @State private var databases: [CanLIIDatabase] = []
    @State private var selectedDatabase: CanLIIDatabase?
    @State private var query = ""
    @State private var results: [CanLIICase] = []
    @State private var isSearching = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            List {
                if !databases.isEmpty {
                    Picker("Court", selection: $selectedDatabase) {
                        ForEach(databases) { db in
                            Text(db.name).tag(Optional(db))
                        }
                    }
                    .pickerStyle(.navigationLink)
                }

                if isSearching {
                    HStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                } else if results.isEmpty && !query.isEmpty {
                    Text("No results")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(results) { result in
                        NavigationLink(value: result) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(result.title)
                                    .font(.caption.bold())
                                    .lineLimit(2)
                                if let citation = result.citation {
                                    Text(citation)
                                        .font(.system(size: 10))
                                        .foregroundStyle(.secondary)
                                        .lineLimit(1)
                                }
                            }
                        }
                    }
                }
            }
            .navigationDestination(for: CanLIICase.self) { result in
                CaseDetailView(result: result, court: selectedDatabase?.name)
            }
            .searchable(text: $query, prompt: "Search cases")
            .onSubmit(of: .search) { Task { await runSearch() } }
            .onChange(of: selectedDatabase) { _, _ in Task { await runSearch() } }
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
        if let cached = WatchAPI.shared.cachedDatabases() {
            databases = cached
            selectedDatabase = cached.first
        }
        do {
            let fetched = try await WatchAPI.shared.fetchDatabases()
            databases = fetched
            if selectedDatabase == nil {
                selectedDatabase = fetched.first
            }
        } catch {
            if databases.isEmpty {
                errorMessage = error.localizedDescription
            }
        }
    }

    private func runSearch() async {
        guard let db = selectedDatabase, !query.isEmpty else {
            results = []
            return
        }
        isSearching = true
        do {
            results = try await WatchAPI.shared.search(databaseId: db.databaseId, query: query)
        } catch {
            errorMessage = error.localizedDescription
        }
        isSearching = false
    }
}

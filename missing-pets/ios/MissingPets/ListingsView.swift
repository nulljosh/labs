import SwiftUI

struct ListingsView: View {
    @State private var listings: [Listing] = []
    @State private var filter: ListingType?
    @State private var showingPost = false

    var filtered: [Listing] {
        guard let filter else { return listings }
        return listings.filter { $0.type == filter }
    }

    var body: some View {
        NavigationStack {
            List(filtered) { listing in
                NavigationLink(value: listing) {
                    VStack(alignment: .leading) {
                        HStack {
                            Text(listing.type.rawValue.uppercased())
                                .font(.caption2.bold())
                                .padding(.horizontal, 4)
                                .background(listing.type == .lost ? Color.red.opacity(0.15) : Color.green.opacity(0.15))
                            Text(listing.pet_name ?? listing.species)
                                .font(.headline)
                        }
                        Text(listing.last_seen_location)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Missing Pets")
            .navigationDestination(for: Listing.self) { ListingDetailView(listing: $0) }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Post") { showingPost = true }
                }
                ToolbarItem(placement: .topBarLeading) {
                    Picker("Filter", selection: $filter) {
                        Text("All").tag(ListingType?.none)
                        Text("Lost").tag(ListingType?.some(.lost))
                        Text("Found").tag(ListingType?.some(.found))
                    }
                }
            }
            .sheet(isPresented: $showingPost) {
                PostListingView { await loadListings() }
            }
            .task { await loadListings() }
            .refreshable { await loadListings() }
        }
    }

    func loadListings() async {
        do {
            listings = try await supabase
                .from("listings")
                .select()
                .eq("status", value: "active")
                .order("created_at", ascending: false)
                .execute()
                .value
        } catch {
            print("load error: \(error)")
        }
    }
}

extension Listing: Hashable {
    static func == (lhs: Listing, rhs: Listing) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

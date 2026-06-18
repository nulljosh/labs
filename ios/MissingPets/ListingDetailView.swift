import SwiftUI

struct ListingDetailView: View {
    let listing: Listing

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 8) {
                if let url = listing.photo_url, let imageURL = URL(string: url) {
                    AsyncImage(url: imageURL) { $0.resizable().scaledToFit() } placeholder: { Color.gray.opacity(0.2) }
                        .cornerRadius(8)
                }
                if listing.status == .resolved {
                    Text("RESOLVED").font(.headline).foregroundStyle(.green)
                }
                row("Species", listing.species)
                row("Color", listing.color)
                row("Tag / chip #", listing.tag_number)
                row("Last seen", listing.last_seen_location)
                row("Notes", listing.description)
                row("Phone", listing.contact_phone)
                row("Email", listing.contact_email)
            }
            .padding()
        }
        .navigationTitle(listing.pet_name ?? listing.species)
    }

    @ViewBuilder
    func row(_ label: String, _ value: String?) -> some View {
        if let value, !value.isEmpty {
            VStack(alignment: .leading) {
                Text(label).font(.caption).foregroundStyle(.secondary)
                Text(value)
            }
        }
    }
}

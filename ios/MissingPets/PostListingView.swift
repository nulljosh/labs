import SwiftUI
import PhotosUI

struct PostListingView: View {
    var onPosted: () async -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var type: ListingType = .lost
    @State private var petName = ""
    @State private var species = ""
    @State private var color = ""
    @State private var description = ""
    @State private var tagNumber = ""
    @State private var lastSeenLocation = ""
    @State private var contactPhone = ""
    @State private var contactEmail = ""
    @State private var photoItem: PhotosPickerItem?
    @State private var photoData: Data?
    @State private var submitting = false

    var body: some View {
        NavigationStack {
            Form {
                Picker("Type", selection: $type) {
                    Text("Lost").tag(ListingType.lost)
                    Text("Found").tag(ListingType.found)
                }
                TextField("Pet name (if known)", text: $petName)
                TextField("Species", text: $species)
                TextField("Color / description", text: $color)
                TextField("Notes", text: $description)
                TextField("Ear tattoo / tag / chip #", text: $tagNumber)
                TextField("Last seen location", text: $lastSeenLocation)
                PhotosPicker("Add photo", selection: $photoItem, matching: .images)
                TextField("Contact phone", text: $contactPhone)
                TextField("Contact email", text: $contactEmail)
                Button(submitting ? "Posting..." : "Post listing") {
                    Task { await submit() }
                }
                .disabled(submitting || species.isEmpty || lastSeenLocation.isEmpty)
            }
            .navigationTitle("New Listing")
            .onChange(of: photoItem) { _, item in
                Task { photoData = try? await item?.loadTransferable(type: Data.self) }
            }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    func submit() async {
        submitting = true
        defer { submitting = false }

        var photoURL: String?
        if let photoData {
            let path = "\(UUID().uuidString).jpg"
            do {
                try await supabase.storage.from("pet-photos").upload(path, data: photoData)
                photoURL = try supabase.storage.from("pet-photos").getPublicURL(path: path).absoluteString
            } catch {
                print("upload error: \(error)")
            }
        }

        struct NewListing: Encodable {
            let type: String
            let pet_name: String?
            let species: String
            let color: String?
            let description: String?
            let tag_number: String?
            let last_seen_location: String
            let contact_phone: String?
            let contact_email: String?
            let photo_url: String?
        }

        do {
            try await supabase.from("listings").insert(NewListing(
                type: type.rawValue,
                pet_name: petName.isEmpty ? nil : petName,
                species: species,
                color: color.isEmpty ? nil : color,
                description: description.isEmpty ? nil : description,
                tag_number: tagNumber.isEmpty ? nil : tagNumber,
                last_seen_location: lastSeenLocation,
                contact_phone: contactPhone.isEmpty ? nil : contactPhone,
                contact_email: contactEmail.isEmpty ? nil : contactEmail,
                photo_url: photoURL
            )).execute()
            await onPosted()
            dismiss()
        } catch {
            print("insert error: \(error)")
        }
    }
}

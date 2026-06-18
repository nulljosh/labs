import Foundation

enum ListingType: String, Codable { case lost, found }
enum ListingStatus: String, Codable { case active, resolved }

struct Listing: Codable, Identifiable {
    let id: UUID
    let created_at: Date
    let type: ListingType
    let pet_name: String?
    let species: String
    let color: String?
    let description: String?
    let tag_number: String?
    let last_seen_location: String
    let photo_url: String?
    let contact_phone: String?
    let contact_email: String?
    let status: ListingStatus
}

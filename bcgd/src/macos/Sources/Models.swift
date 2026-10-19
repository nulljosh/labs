import Foundation
import SwiftUI

extension Color {
    static let bcgdTeal = Color(red: 0x1B / 255, green: 0x59 / 255, blue: 0x59 / 255)
    static let bcgdDeep = Color(red: 0x13 / 255, green: 0x40 / 255, blue: 0x40 / 255)
    static let bcgdSage = Color(red: 0x8D / 255, green: 0xA6 / 255, blue: 0xA6 / 255)
}

struct Part: Identifiable, Codable {
    var id = UUID()
    var name: String
    var category: String
    var quantity: Int
    var lowStockThreshold: Int = 2

    var isLowStock: Bool { quantity <= lowStockThreshold }
}

enum JobStatus: String, Codable, CaseIterable {
    case lead = "Lead"
    case quote = "Quote"
    case scheduled = "Scheduled"
    case complete = "Complete"
    case paid = "Paid"

    var next: JobStatus? {
        let all = JobStatus.allCases
        guard let i = all.firstIndex(of: self), i + 1 < all.count else { return nil }
        return all[i + 1]
    }
}

struct Job: Identifiable, Codable {
    var id = UUID()
    var customer: String
    var address: String = ""
    var detail: String = ""
    var status: JobStatus = .lead
    var created = Date()
}

@Observable
final class Store {
    var parts: [Part] { didSet { save() } }
    var jobs: [Job] { didSet { save() } }

    // ponytail: UserDefaults JSON persistence, swap for shared API when dashboard sync lands
    private static let key = "bcgd.store"

    init() {
        if let data = UserDefaults.standard.data(forKey: Self.key),
           let saved = try? JSONDecoder().decode(Saved.self, from: data) {
            parts = saved.parts
            jobs = saved.jobs
        } else {
            parts = Store.seedParts
            jobs = []
        }
    }

    private struct Saved: Codable {
        var parts: [Part]
        var jobs: [Job]
    }

    private func save() {
        if let data = try? JSONEncoder().encode(Saved(parts: parts, jobs: jobs)) {
            UserDefaults.standard.set(data, forKey: Self.key)
        }
    }

    var lowStockParts: [Part] { parts.filter(\.isLowStock) }

    static let seedParts: [Part] = [
        Part(name: "Torsion Spring .225 x 24\"", category: "Springs", quantity: 6),
        Part(name: "Torsion Spring .250 x 30\"", category: "Springs", quantity: 4),
        Part(name: "Extension Spring 120 lb", category: "Springs", quantity: 3),
        Part(name: "Cable 8' Door", category: "Cables", quantity: 10),
        Part(name: "Cable 7' Door", category: "Cables", quantity: 8),
        Part(name: "Roller 2\" Nylon", category: "Rollers", quantity: 20),
        Part(name: "Roller 3\" Steel", category: "Rollers", quantity: 12),
        Part(name: "Hinge #1", category: "Hardware", quantity: 15),
        Part(name: "Hinge #2", category: "Hardware", quantity: 15),
        Part(name: "Bottom Bracket Pair", category: "Hardware", quantity: 5),
        Part(name: "LiftMaster 87504-267", category: "Openers", quantity: 2),
        Part(name: "LiftMaster 84602", category: "Openers", quantity: 2),
        Part(name: "LiftMaster Remote 893MAX", category: "Openers", quantity: 8),
        Part(name: "Weather Seal 9'", category: "Seals", quantity: 6),
        Part(name: "Weather Seal 16'", category: "Seals", quantity: 4),
    ]
}

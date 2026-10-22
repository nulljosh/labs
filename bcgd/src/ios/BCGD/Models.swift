import Foundation
import SwiftUI

extension Color {
    // Doorstock blue, from brand/tokens.css (--accent). The website keeps the shop's teal.
    // Dark mode lifts it to --accent-light (#3a86ff) so it stays readable on black.
    #if os(macOS)
    static let doorstock = Color(nsColor: NSColor(name: nil) {
        $0.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua
            ? NSColor(red: 0x3A / 255, green: 0x86 / 255, blue: 0xFF / 255, alpha: 1)
            : NSColor(red: 0x1B / 255, green: 0x4F / 255, blue: 0xC4 / 255, alpha: 1)
    })
    #else
    static let doorstock = Color(uiColor: UIColor {
        $0.userInterfaceStyle == .dark
            ? UIColor(red: 0x3A / 255, green: 0x86 / 255, blue: 0xFF / 255, alpha: 1)
            : UIColor(red: 0x1B / 255, green: 0x4F / 255, blue: 0xC4 / 255, alpha: 1)
    })
    #endif
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

struct JobPart: Identifiable, Codable, Hashable {
    var id: UUID { partID }
    var partID: UUID
    var quantity: Int
}

struct Job: Identifiable, Codable {
    var id = UUID()
    var customer: String
    var address: String = ""
    var detail: String = ""
    var status: JobStatus = .lead
    var created = Date()
    var scheduled: Date? = nil
    var parts: [JobPart] = []
    var stockDeducted = false

    init(customer: String) { self.customer = customer }

    // 1.0 saves have none of the newer keys. Synthesized decoding would throw on them,
    // the store would fall back to the seed list and overwrite the shop's real stock.
    init(from d: Decoder) throws {
        let c = try d.container(keyedBy: CodingKeys.self)
        id = try c.decodeIfPresent(UUID.self, forKey: .id) ?? UUID()
        customer = try c.decode(String.self, forKey: .customer)
        address = try c.decodeIfPresent(String.self, forKey: .address) ?? ""
        detail = try c.decodeIfPresent(String.self, forKey: .detail) ?? ""
        status = try c.decodeIfPresent(JobStatus.self, forKey: .status) ?? .lead
        created = try c.decodeIfPresent(Date.self, forKey: .created) ?? Date()
        scheduled = try c.decodeIfPresent(Date.self, forKey: .scheduled)
        parts = try c.decodeIfPresent([JobPart].self, forKey: .parts) ?? []
        stockDeducted = try c.decodeIfPresent(Bool.self, forKey: .stockDeducted) ?? false
    }

    var isToday: Bool { scheduled.map(Calendar.current.isDateInToday) ?? false }
}

struct PartNeed: Identifiable {
    let part: Part
    let needed: Int
    var id: UUID { part.id }
    var short: Bool { part.quantity < needed }
}

extension Job {
    /// Apple Maps directions to the address; opens Maps on both Mac and iPhone.
    var routeURL: URL? {
        let a = address.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !a.isEmpty else { return nil }
        var c = URLComponents(string: "https://maps.apple.com/")
        c?.queryItems = [URLQueryItem(name: "daddr", value: a)]
        return c?.url
    }
}

struct StockChange: Identifiable, Codable {
    var id = UUID()
    var date = Date()
    var partName: String
    var delta: Int
    var reason: String
}

struct Saved: Codable {
    var parts: [Part]
    var jobs: [Job]
    var history: [StockChange] = []

    init(parts: [Part], jobs: [Job], history: [StockChange]) {
        self.parts = parts; self.jobs = jobs; self.history = history
    }

    init(from d: Decoder) throws {
        let c = try d.container(keyedBy: CodingKeys.self)
        parts = try c.decode([Part].self, forKey: .parts)
        jobs = try c.decodeIfPresent([Job].self, forKey: .jobs) ?? []
        history = try c.decodeIfPresent([StockChange].self, forKey: .history) ?? []
    }

    static func decode(_ data: Data) -> Saved? { try? JSONDecoder().decode(Saved.self, from: data) }
}

@Observable
final class Store {
    var parts: [Part] { didSet { save() } }
    var jobs: [Job] { didSet { save() } }
    var history: [StockChange] { didSet { save() } }

    // Local copy in UserDefaults; Account syncs it with the shop when signed in.
    private static let key = "bcgd.store"
    @ObservationIgnored var onChange: (() -> Void)?
    @ObservationIgnored var onAdjust: ((UUID, Int) -> Void)?

    init() {
        let defaults = UserDefaults.standard
        if let data = defaults.data(forKey: Self.key) {
            if let saved = Saved.decode(data) {
                parts = saved.parts; jobs = saved.jobs; history = saved.history
                return
            }
            // Never lose data we can't read: park it before seeding.
            defaults.set(data, forKey: Self.key + ".unreadable." + String(Int(Date().timeIntervalSince1970)))
        }
        parts = Store.seedParts; jobs = []; history = []
    }

    private func save() {
        if let data = try? JSONEncoder().encode(Saved(parts: parts, jobs: jobs, history: history)) {
            UserDefaults.standard.set(data, forKey: Self.key)
        }
        onChange?()
    }

    func replace(parts: [Part], jobs: [Job]) {
        self.parts = parts
        self.jobs = jobs
    }

    var lowStockParts: [Part] { parts.filter(\.isLowStock) }
    var todayJobs: [Job] { jobs.filter { $0.isToday && $0.status == .scheduled } }

    func part(_ id: UUID) -> Part? { parts.first { $0.id == id } }

    /// Today's route in time order.
    var todayRoute: [Job] { todayJobs.sorted { ($0.scheduled ?? .distantFuture) < ($1.scheduled ?? .distantFuture) } }

    /// What today's jobs need off the shelf, summed per part. Jobs already past stock deduction need nothing.
    var todayNeeds: [PartNeed] {
        var totals: [UUID: Int] = [:]
        for j in todayJobs where !j.stockDeducted { for p in j.parts { totals[p.partID, default: 0] += p.quantity } }
        return parts.compactMap { part in totals[part.id].map { PartNeed(part: part, needed: $0) } }
    }

    /// Every stock change goes through here so the history stays complete. Never below zero.
    func adjust(_ id: UUID, by delta: Int, reason: String) {
        guard let i = parts.firstIndex(where: { $0.id == id }) else { return }
        let new = max(0, parts[i].quantity + delta)
        let applied = new - parts[i].quantity
        guard applied != 0 else { return }
        parts[i].quantity = new
        onAdjust?(id, applied)
        history.insert(StockChange(partName: parts[i].name, delta: applied, reason: reason), at: 0)
    }

    /// Moving a job into Complete takes its parts off the shelf, once.
    func advance(_ jobID: UUID) {
        guard let i = jobs.firstIndex(where: { $0.id == jobID }), let next = jobs[i].status.next else { return }
        if next == .complete && !jobs[i].stockDeducted {
            for p in jobs[i].parts { adjust(p.partID, by: -p.quantity, reason: "Job: \(jobs[i].customer)") }
            jobs[i].stockDeducted = true
        }
        jobs[i].status = next
    }

    func reorderURL(to email: String) -> URL? {
        let lines = lowStockParts.map { "\($0.name): \($0.quantity) left" }.joined(separator: "\n")
        var c = URLComponents(string: "mailto:\(email)")
        c?.queryItems = [URLQueryItem(name: "subject", value: "Reorder"), URLQueryItem(name: "body", value: lines)]
        return c?.url
    }

    var csv: String {
        let esc = { (s: String) in "\"" + s.replacingOccurrences(of: "\"", with: "\"\"") + "\"" }
        return (["Name,Category,Quantity,Low stock at"] + parts.map {
            "\(esc($0.name)),\(esc($0.category)),\($0.quantity),\($0.lowStockThreshold)"
        }).joined(separator: "\n")
    }

    var backup: Data { (try? JSONEncoder().encode(Saved(parts: parts, jobs: jobs, history: history))) ?? Data() }

    func restore(_ data: Data) -> Bool {
        guard let saved = Saved.decode(data) else { return false }
        parts = saved.parts; jobs = saved.jobs; history = saved.history
        return true
    }

    // ponytail: writes the export on each call; it's a few KB, fine until inventories get big
    func exportFile(_ name: String, _ data: Data) -> URL {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(name)
        try? data.write(to: url)
        return url
    }

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

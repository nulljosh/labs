import Foundation

enum BuildingType: String, Codable, Sendable, CaseIterable {
    case miner
    case smelter
    case assembler
    case storage

    var displayName: String {
        switch self {
        case .miner: "Miner"
        case .smelter: "Smelter"
        case .assembler: "Assembler"
        case .storage: "Storage"
        }
    }

    var cost: [ItemType: Int] {
        switch self {
        case .miner: [.ore: 5]
        case .smelter: [.ore: 10]
        case .assembler: [.ore: 15]
        case .storage: [.ore: 8]
        }
    }

    var description: String {
        switch self {
        case .miner: "Extracts ore from the ground"
        case .smelter: "Converts ore into iron plates"
        case .assembler: "Assembles plates into gears"
        case .storage: "Stores items"
        }
    }

    var tileSize: (w: Int, h: Int) {
        (1, 1)
    }
}

struct BuildingModel: Identifiable, Codable, Sendable {
    var id: UUID
    var type: BuildingType
    var col: Int
    var row: Int
    var isActive: Bool = true
}

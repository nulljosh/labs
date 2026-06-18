import Foundation

enum ItemType: String, Codable, Sendable, CaseIterable, Hashable {
    case ore
    case iron_plate
    case copper_ore
    case gear

    var displayName: String {
        switch self {
        case .ore: "Ore"
        case .iron_plate: "Iron Plate"
        case .copper_ore: "Copper Ore"
        case .gear: "Gear"
        }
    }

    var symbol: String {
        switch self {
        case .ore: "O"
        case .iron_plate: "I"
        case .copper_ore: "C"
        case .gear: "G"
        }
    }
}

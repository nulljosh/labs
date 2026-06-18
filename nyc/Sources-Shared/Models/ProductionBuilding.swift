import Foundation

struct ProductionBuilding: Identifiable, Codable, Sendable {
    var id: UUID
    var type: BuildingType
    var col: Int
    var row: Int
    var inventory: [ItemType: Int] = [:]
    var progressTicks: Int = 0

    var recipeKey: String {
        switch type {
        case .miner: "miner"
        case .smelter: "smelter"
        case .assembler: "assembler"
        case .storage: "storage"
        default: "unknown"
        }
    }

    var recipe: Recipe? {
        recipesByBuildingType[recipeKey]
    }

    var isProducing: Bool {
        progressTicks > 0
    }

    var productionProgress: Double {
        guard let recipe = recipe, recipe.timeTicks > 0 else { return 0 }
        return Double(recipe.timeTicks - progressTicks) / Double(recipe.timeTicks)
    }
}

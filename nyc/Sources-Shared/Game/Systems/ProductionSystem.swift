import Foundation

final class ProductionSystem: Sendable {
    func tick(buildings: inout [ProductionBuilding]) {
        for i in buildings.indices {
            let recipe = buildings[i].recipe ?? recipesByBuildingType["storage"]!

            let hasInputs = recipe.inputs.allSatisfy { item, amt in
                (buildings[i].inventory[item] ?? 0) >= amt
            }

            if hasInputs && buildings[i].progressTicks == 0 && recipe.timeTicks > 0 {
                for (item, amt) in recipe.inputs {
                    buildings[i].inventory[item, default: 0] -= amt
                }
                buildings[i].progressTicks = recipe.timeTicks
            }

            if buildings[i].progressTicks > 0 {
                buildings[i].progressTicks -= 1
                if buildings[i].progressTicks == 0 {
                    for (item, amt) in recipe.outputs {
                        buildings[i].inventory[item, default: 0] += amt
                    }
                }
            }

            autoPullFromNeighbors(buildings: &buildings, buildingIndex: i)
        }
    }

    private func autoPullFromNeighbors(buildings: inout [ProductionBuilding], buildingIndex: Int) {
        let current = buildings[buildingIndex]
        let directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        for (dc, dr) in directions {
            let neighborCol = current.col + dc
            let neighborRow = current.row + dr

            if let neighborIndex = buildings.firstIndex(where: { $0.col == neighborCol && $0.row == neighborRow }) {
                let neighbor = buildings[neighborIndex]

                for itemType in ItemType.allCases {
                    let neighborHas = neighbor.inventory[itemType] ?? 0
                    if neighborHas > 0 {
                        let neededByRecipe = current.recipe?.inputs[itemType] ?? 0
                        if (current.inventory[itemType] ?? 0) < neededByRecipe {
                            buildings[neighborIndex].inventory[itemType, default: 0] -= 1
                            buildings[buildingIndex].inventory[itemType, default: 0] += 1
                            return
                        }
                    }
                }
            }
        }
    }
}

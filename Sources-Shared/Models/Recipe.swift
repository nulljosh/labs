import Foundation

struct Recipe: Sendable {
    let inputs: [ItemType: Int]
    let outputs: [ItemType: Int]
    let timeTicks: Int
}

let recipesByBuildingType: [String: Recipe] = [
    "miner": Recipe(
        inputs: [:],
        outputs: [.ore: 1],
        timeTicks: 2
    ),
    "smelter": Recipe(
        inputs: [.ore: 5],
        outputs: [.iron_plate: 1],
        timeTicks: 10
    ),
    "assembler": Recipe(
        inputs: [.iron_plate: 2],
        outputs: [.gear: 1],
        timeTicks: 15
    ),
    "storage": Recipe(
        inputs: [:],
        outputs: [:],
        timeTicks: 0
    )
]

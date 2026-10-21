import SpriteKit

extension GameScene {
    /// `-demo`: walk the tutorial at real speed, one step a second, then hand the city to DemoBot at
    /// DemoBot.speed ticks a second. Every action is a command a player's click would issue.
    func demoTick() {
        if let step = gameState.tutorialStep {
            demoTutorial(step)
            return
        }
        if demoBot.tutorialDoneTick == nil { demoBot.tutorialDoneTick = gameState.currentTick }
        // Leave the controls card up for three seconds, then speed time up.
        if timeSystem.speed == 1, gameState.currentTick >= (demoBot.tutorialDoneTick ?? 0) + 3 {
            UserDefaults.standard.set(true, forKey: "nyc-controls-hint-seen")
            gameState.selectedColonistId = nil
            gameState.selectedColonistIds = []
            timeSystem.speed = DemoBot.speed ?? 1
        }
        guard timeSystem.speed > 1 else { return }
        demoBot.tick(gameState, jobs: jobSystem, pathfinder: pathfinder,
                     canPlace: { buildSystem.canPlace(type: $0, col: $1, row: $2, tileMap: tileMap, gameState: gameState) },
                     place: { type, col, row in
                         let before = gameState.buildings.count
                         gameState.selectedBuildingType = type
                         placeBuilding(col: col, row: row)
                         gameState.selectedBuildingType = nil
                         return gameState.buildings.count > before
                     })
    }

    private func demoTutorial(_ step: Int) {
        guard let alex = gameState.colonists.first(where: { !$0.isDead }) else { return }
        switch step {
        case 2, 6:
            gameState.selectedColonistId = alex.id
            gameState.selectedColonistIds = [alex.id]
            gameState.log("Selected \(alex.name)")
            if step == 6 {
                jobSystem.commandMove(colonistId: alex.id, destCol: alex.col - 6, destRow: alex.row, gameState: gameState, pathfinder: pathfinder)
            }
            TutorialView.checkAdvance(gameState: gameState, event: .colonistSelected)
        case 4:
            gameState.showBuildMenu = true
            TutorialView.checkAdvance(gameState: gameState, event: .buildMenuOpened)
        case 5:
            gameState.selectedBuildingType = .shelter
            gameState.inputMode = .build
            search: for r in 2...10 {
                for dc in -r...r {
                    for dr in [-r, r] where buildSystem.canPlace(type: .shelter, col: alex.col + dc, row: alex.row + dr, tileMap: tileMap, gameState: gameState) {
                        placeBuilding(col: alex.col + dc, row: alex.row + dr)   // advances the tutorial itself
                        break search
                    }
                }
            }
            gameState.inputMode = .normal
            gameState.selectedBuildingType = nil
            gameState.showBuildMenu = false
        default:
            gameState.tutorialStep = step >= 9 ? nil : step + 1
        }
    }
}

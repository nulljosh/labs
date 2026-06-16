import Foundation

enum InputMode: String, Sendable {
    case normal, build, demolish
}

@Observable
@MainActor
final class GameState {
    var globalInventory: [ItemType: Int] = [
        .ore: 100,
        .copper_ore: 50,
        .iron_plate: 10,
        .gear: 0
    ]
    var buildings: [ProductionBuilding] = []
    var isPaused: Bool = false
    var currentTick: Int = 0
    var inputMode: InputMode = .normal
    var selectedBuildingType: BuildingType?
    var gameLog: [String] = []
    var showBuildMenu: Bool = false
    var showSettings: Bool = false

    // Save system
    var lastSaveSlot: Int? = nil
    var autoSaveEnabled: Bool = true
    var showSaveIndicator: Bool = false

    // Audio
    var soundEnabled: Bool {
        get { AudioManager.shared.soundEnabled }
        set { AudioManager.shared.soundEnabled = newValue }
    }

    func log(_ message: String) {
        gameLog.append(message)
        if gameLog.count > 50 {
            gameLog.removeFirst()
        }
    }
}

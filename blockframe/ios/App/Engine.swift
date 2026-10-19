// Canvas engine — manages a 2D character grid.
// Grid coordinate system: (col, row), 0-indexed.
//
// Ported function-for-function from src/lib/engine.js so the two stay diffable.
// ponytail: no cloneGrid() — Swift arrays are value types, so every `var next = grid`
// is already the deep copy the JS version had to write by hand.

import Foundation

typealias Grid = [[Character]]

let defaultCols = 100
let defaultRows = 50

func createGrid(cols: Int = defaultCols, rows: Int = defaultRows) -> Grid {
    Array(repeating: Array(repeating: " " as Character, count: cols), count: rows)
}

func gridToText(_ grid: Grid) -> String {
    grid.map { String($0) }.joined(separator: "\n")
}

func textToGrid(_ text: String, cols: Int = defaultCols, rows: Int = defaultRows) -> Grid {
    var grid = createGrid(cols: cols, rows: rows)
    for (r, line) in text.split(separator: "\n", omittingEmptySubsequences: false).enumerated() {
        if r >= rows { break }
        for (c, ch) in line.enumerated() {
            if c >= cols { break }
            grid[r][c] = ch
        }
    }
    return grid
}

/// Stamp a component template onto the grid at (col, row). Clips at every edge.
func stampComponent(_ grid: Grid, template: [String], col: Int, row: Int) -> Grid {
    var next = grid
    let rows = grid.count
    guard rows > 0 else { return next }
    let cols = grid[0].count

    for (dy, line) in template.enumerated() {
        let r = row + dy
        if r < 0 || r >= rows { continue }
        for (dx, ch) in line.enumerated() {
            let c = col + dx
            if c < 0 || c >= cols { continue }
            next[r][c] = ch
        }
    }
    return next
}

/// Set a single character. Out-of-bounds writes return the grid untouched.
func setChar(_ grid: Grid, col: Int, row: Int, char: Character?) -> Grid {
    guard row >= 0, row < grid.count else { return grid }
    guard col >= 0, col < grid[0].count else { return grid }
    var next = grid
    next[row][col] = char ?? " "
    return next
}

func eraseRegion(_ grid: Grid, col: Int, row: Int, width: Int, height: Int) -> Grid {
    var next = grid
    for dy in 0..<max(0, height) {
        let r = row + dy
        if r < 0 || r >= grid.count { continue }
        for dx in 0..<max(0, width) {
            let c = col + dx
            if c < 0 || c >= grid[0].count { continue }
            next[r][c] = " "
        }
    }
    return next
}

/// Pixel coordinate → grid cell, given character dimensions.
func pxToCell(px: Double, py: Double, charW: Double, charH: Double) -> (col: Int, row: Int) {
    guard charW > 0, charH > 0 else { return (0, 0) }
    return (Int(floor(px / charW)), Int(floor(py / charH)))
}

// MARK: - Editor state

/// The grid plus its undo/redo history. 50 steps each way, matching the web app.
struct EditorState {
    static let historyLimit = 50

    var grid: Grid
    let cols: Int
    let rows: Int
    private(set) var history: [Grid] = []
    private(set) var future: [Grid] = []

    init(cols: Int = defaultCols, rows: Int = defaultRows) {
        self.cols = cols
        self.rows = rows
        self.grid = createGrid(cols: cols, rows: rows)
    }

    var canUndo: Bool { !history.isEmpty }
    var canRedo: Bool { !future.isEmpty }

    /// Call immediately BEFORE mutating `grid`, so the pre-edit state is what gets restored.
    mutating func pushHistory() {
        history.append(grid)
        if history.count > Self.historyLimit { history.removeFirst(history.count - Self.historyLimit) }
        future.removeAll()
    }

    mutating func undo() {
        guard let previous = history.popLast() else { return }
        future.insert(grid, at: 0)
        if future.count > Self.historyLimit { future.removeLast(future.count - Self.historyLimit) }
        grid = previous
    }

    mutating func redo() {
        guard !future.isEmpty else { return }
        let next = future.removeFirst()
        history.append(grid)
        if history.count > Self.historyLimit { history.removeFirst(history.count - Self.historyLimit) }
        grid = next
    }

    var text: String { gridToText(grid) }
}

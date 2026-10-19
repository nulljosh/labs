// Engine + presets self-check. Ported from src/lib/engine.test.js and presets.test.js.
//
// Run with no build system, no framework:
//   swiftc -o /tmp/wtcheck ios/App/Engine.swift ios/App/Presets.swift ios/Checks/main.swift && /tmp/wtcheck
//
// (`swift file1 file2 file3` compiles but does not run top-level code — use swiftc.)
//
// ponytail: plain asserts in a main.swift instead of an XCTest target — the logic under
// test is pure Foundation, so a test target would only add a build graph to maintain.

import Foundation

var checks = 0
func check(_ condition: @autoclosure () -> Bool, _ label: String) {
    checks += 1
    guard condition() else {
        FileHandle.standardError.write("FAIL: \(label)\n".data(using: .utf8)!)
        exit(1)
    }
}

// MARK: createGrid

let g53 = createGrid(cols: 5, rows: 3)
check(g53.count == 3, "createGrid row count")
check(g53[0].count == 5, "createGrid column count")
check(g53.allSatisfy { $0.allSatisfy { $0 == " " } }, "createGrid fills with spaces")

let gDefault = createGrid()
check(gDefault.count == defaultRows && gDefault[0].count == defaultCols, "createGrid defaults")

// MARK: value semantics (the JS cloneGrid tests)

var copied = g53
copied[0][0] = "X"
check(g53[0][0] == " ", "grids are value types — mutating a copy leaves the original alone")

// MARK: gridToText / textToGrid

var rt = createGrid(cols: 5, rows: 3)
rt[0][0] = "H"
rt[1][2] = "i"
let restored = textToGrid(gridToText(rt), cols: 5, rows: 3)
check(restored[0][0] == "H" && restored[1][2] == "i", "text round-trip")
check(gridToText(rt) == gridToText(restored), "round-trip is lossless")

var twoRow = createGrid(cols: 3, rows: 2)
twoRow[0][0] = "A"
twoRow[1][1] = "B"
check(gridToText(twoRow).split(separator: "\n", omittingEmptySubsequences: false).count == 2,
      "gridToText joins rows with newlines")

// Unicode: the presets are box-drawing characters, so this is the case that matters.
var uni = createGrid(cols: 4, rows: 1)
uni[0][0] = "┌"
uni[0][1] = "─"
uni[0][2] = "┐"
check(textToGrid(gridToText(uni), cols: 4, rows: 1)[0][2] == "┐", "unicode survives the round-trip")

// MARK: stampComponent

let stamped = stampComponent(createGrid(cols: 10, rows: 5), template: ["AB", "CD"], col: 2, row: 1)
check(stamped[1][2] == "A" && stamped[1][3] == "B", "stamp first template row")
check(stamped[2][2] == "C" && stamped[2][3] == "D", "stamp second template row")

let untouched = createGrid(cols: 5, rows: 5)
_ = stampComponent(untouched, template: ["X"], col: 0, row: 0)
check(untouched[0][0] == " ", "stampComponent does not mutate its input")

// Clipping at all four edges — the JS version only checked the right edge.
let small = createGrid(cols: 3, rows: 3)
check(stampComponent(small, template: ["ABCD"], col: 2, row: 0)[0][2] == "A", "clips past right edge")
check(stampComponent(small, template: ["AB"], col: -1, row: 0)[0][0] == "B", "clips past left edge")
check(stampComponent(small, template: ["A", "B"], col: 0, row: -1)[0][0] == "B", "clips past top edge")
check(stampComponent(small, template: ["A", "B"], col: 0, row: 2)[2][0] == "A", "clips past bottom edge")

// Every real preset must stamp into the real grid without trapping.
for p in presets {
    let out = stampComponent(createGrid(), template: p.template, col: defaultCols - 2, row: defaultRows - 2)
    check(out.count == defaultRows, "preset \(p.id) stamps at the far corner without resizing the grid")
}

// MARK: setChar

check(setChar(createGrid(cols: 5, rows: 5), col: 2, row: 3, char: "#")[3][2] == "#", "setChar writes")
let oob = createGrid(cols: 5, rows: 5)
check(gridToText(setChar(oob, col: -1, row: 0, char: "#")) == gridToText(oob), "setChar ignores out-of-bounds")
let filled = setChar(createGrid(cols: 3, rows: 3), col: 1, row: 1, char: "*")
check(setChar(filled, col: 1, row: 1, char: nil)[1][1] == " ", "setChar(nil) erases")

// MARK: eraseRegion

var region = setChar(createGrid(cols: 10, rows: 10), col: 2, row: 2, char: "X")
region = setChar(region, col: 3, row: 3, char: "Y")
let erased = eraseRegion(region, col: 2, row: 2, width: 2, height: 2)
check(erased[2][2] == " " && erased[3][3] == " ", "eraseRegion clears the rectangle")

// MARK: pxToCell

check(pxToCell(px: 30, py: 48, charW: 10, charH: 16) == (3, 3), "pxToCell converts")
check(pxToCell(px: 9, py: 15, charW: 10, charH: 16) == (0, 0), "pxToCell floors")

// MARK: undo / redo

var state = EditorState(cols: 5, rows: 5)
check(!state.canUndo && !state.canRedo, "fresh state has no history")

let blank = state.text
state.undo()
check(state.text == blank, "undo on empty history is a no-op")
state.redo()
check(state.text == blank, "redo on empty future is a no-op")

state.pushHistory()
state.grid = setChar(state.grid, col: 0, row: 0, char: "Z")
check(state.canUndo, "editing records history")
state.undo()
check(state.grid[0][0] == " ", "undo reverts the edit")
state.redo()
check(state.grid[0][0] == "Z", "redo reapplies the edit")

// A new edit clears the redo stack — otherwise redo would resurrect a discarded branch.
state.pushHistory()
state.grid = setChar(state.grid, col: 1, row: 1, char: "Q")
state.undo()
state.pushHistory()
state.grid = setChar(state.grid, col: 2, row: 2, char: "R")
check(!state.canRedo, "a fresh edit clears the redo stack")

// History is bounded, so a long session cannot grow without limit.
var bounded = EditorState(cols: 3, rows: 3)
for i in 0..<(EditorState.historyLimit + 20) {
    bounded.pushHistory()
    bounded.grid = setChar(bounded.grid, col: i % 3, row: (i / 3) % 3, char: "#")
}
check(bounded.history.count == EditorState.historyLimit, "history is capped at \(EditorState.historyLimit)")

// MARK: presets

check(!presets.isEmpty, "presets exist")
check(presets.count == 23, "all 23 presets ported from presets.js")
check(Set(presets.map(\.id)).count == presets.count, "preset ids are unique")
for p in presets {
    check(!p.id.isEmpty && !p.label.isEmpty && !p.category.isEmpty, "preset \(p.id) has its labels")
    check(!p.template.isEmpty, "preset \(p.id) has a template")
    check(p.height == p.template.count, "preset \(p.id) height matches template")
    check(p.width > 0, "preset \(p.id) has a width")
}
check(presetCategories == presets.reduce(into: [String]()) { if !$0.contains($1.category) { $0.append($1.category) } },
      "categories are unique and in first-appearance order")
check(preset(id: "button")?.id == "button", "lookup by id")
check(preset(id: "not-real") == nil, "unknown id returns nil")
for p in presets { check(preset(id: p.id) == p, "lookup returns preset \(p.id)") }

print("ok — \(checks) checks passed")

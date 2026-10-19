// Component presets — Unicode box-drawing wireframe templates.
//
// Verbatim copy of ios/App/Presets.swift (itself transcribed from src/lib/presets.js) so all
// three surfaces keep the same 23 components. Multi-row/wide templates like Modal or Browser
// simply clip against the smaller watch grid, same as any oversized stamp clips on iOS —
// no special-casing needed.

import Foundation

struct Preset: Identifiable, Hashable {
    let id: String
    let label: String
    let category: String
    let template: [String]

    var height: Int { template.count }
    var width: Int { template.map(\.count).max() ?? 0 }
}

let presets: [Preset] = [
    Preset(id: "button", label: "Button", category: "Input", template: ["[ OK ]"]),
    Preset(id: "input", label: "Input", category: "Input", template: ["[____________]"]),
    Preset(id: "select", label: "Select", category: "Input", template: ["[▾           ]"]),
    Preset(id: "checkbox", label: "Checkbox", category: "Input", template: ["[✓] Label"]),
    Preset(id: "radio", label: "Radio", category: "Input", template: ["(●) Option"]),
    Preset(id: "toggle", label: "Toggle", category: "Input", template: ["[●━━━━━]"]),
    Preset(id: "table", label: "Table", category: "Data", template: [
        "┌──────┬──────┬──────┐",
        "│ Head │ Head │ Head │",
        "├──────┼──────┼──────┤",
        "│ Cell │ Cell │ Cell │",
        "│ Cell │ Cell │ Cell │",
        "└──────┴──────┴──────┘",
    ]),
    Preset(id: "modal", label: "Modal", category: "Overlay", template: [
        "┌────────────[×]──────┐",
        "│ Modal Title         │",
        "│                     │",
        "│ Content goes here   │",
        "│                     │",
        "│         [ Cancel ]  [ OK ] │",
        "└─────────────────────┘",
    ]),
    Preset(id: "browser", label: "Browser", category: "Layout", template: [
        "┌─────────────────────────────┐",
        "│ ◄ ► ⟳  [___________________]│",
        "├─────────────────────────────┤",
        "│                             │",
        "│                             │",
        "│                             │",
        "└─────────────────────────────┘",
    ]),
    Preset(id: "card", label: "Card", category: "Layout", template: [
        "┌──────────────────┐",
        "│ Card Title       │",
        "│                  │",
        "│ Card content     │",
        "│ goes here.       │",
        "│                  │",
        "│ [ Action ]       │",
        "└──────────────────┘",
    ]),
    Preset(id: "navbar", label: "Navbar", category: "Layout", template: [
        "┌─────────────────────────────────┐",
        "│ ≡  Logo            Search    ☆  │",
        "└─────────────────────────────────┘",
    ]),
    Preset(id: "tabs", label: "Tabs", category: "Layout", template: [
        "┌──────┐  ────────  ────────",
        "│ Tab1 │   Tab 2     Tab 3  ",
        "├──────┴──────────────────┐",
        "│ Content                  │",
        "└──────────────────────────┘",
    ]),
    Preset(id: "progress", label: "Progress", category: "Feedback", template: ["▓▓▓▓▓▓░░░░░░░░ 42%"]),
    Preset(id: "icon", label: "Icon", category: "Media", template: ["★"]),
    Preset(id: "image", label: "Image", category: "Media", template: [
        "╔══════════════╗",
        "║              ║",
        "║   [ img ]    ║",
        "║              ║",
        "╚══════════════╝",
    ]),
    Preset(id: "divider", label: "Divider", category: "Layout", template: ["─────────────────────"]),
    Preset(id: "alert", label: "Alert", category: "Feedback", template: [
        "┌──────────────────────────┐",
        "│ ⚠  Warning message here  │",
        "└──────────────────────────┘",
    ]),
    Preset(id: "breadcrumb", label: "Breadcrumb", category: "Navigation", template: ["Home > Section > Page"]),
    Preset(id: "avatar", label: "Avatar", category: "Media", template: [
        "╭──╮",
        "│DH│",
        "╰──╯",
    ]),
    Preset(id: "list", label: "List", category: "Data", template: [
        "• Item one",
        "• Item two",
        "• Item three",
    ]),
    Preset(id: "stepper", label: "Stepper", category: "Navigation", template: ["● ─────── ○ ─────── ○"]),
    Preset(id: "rating", label: "Rating", category: "Feedback", template: ["★★★☆☆"]),
    Preset(id: "skeleton", label: "Skeleton", category: "Feedback", template: [
        "░░░░░░░░░░░░░░░░░░░░",
        "░░░░░░░░░░░░░░",
        "░░░░░░░░░░░░░░░░░",
    ]),
]

/// Categories in first-appearance order, matching the JS `[...new Set(...)]`.
let presetCategories: [String] = presets.reduce(into: [String]()) { acc, p in
    if !acc.contains(p.category) { acc.append(p.category) }
}

func preset(id: String) -> Preset? {
    presets.first { $0.id == id }
}

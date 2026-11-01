// swift-tools-version:5.9
import PackageDescription

// The terminal app. Session.swift and Words.swift are symlinks to the Apple app's, so the rules and words are one copy.
let package = Package(
    name: "keyrate-tui",
    platforms: [.macOS(.v14)],
    targets: [
        .executableTarget(name: "keyrate-tui", path: "tui/Sources")
    ]
)

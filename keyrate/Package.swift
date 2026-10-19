// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "keyrate-tui",
    platforms: [.macOS(.v13)],
    dependencies: [
        .package(url: "https://github.com/rensbreur/SwiftTUI", branch: "main")
    ],
    targets: [
        .executableTarget(
            name: "keyrate-tui",
            dependencies: ["SwiftTUI"],
            path: "tui/Sources"
        )
    ]
)

Note: requires "Show and Tell" flair. Safest to post in the weekly self-promo thread if one is pinned; check before a standalone post.

## Title
[Show and Tell] Toroid: Conway's Game of Life with a wrapping board, SwiftUI, no backend

## Body

Shipped an iOS/iPadOS/macOS app for Conway's Game of Life where the board wraps at every edge instead of walling gliders in. A glider that leaves the right side of the grid comes back in on the left.

The engine is a pure Swift function, `step(grid) -> grid`, shared as source between the iOS and macOS targets. There's also a standalone watchOS companion with its own 12x12 port of the same rules, fully local, no connection to the phone app. Both the Swift engine and a separate JavaScript port for the web version are held to the same four test cases (block still life, blinker, glider translation, edge wrap), so if either port drifts from the real rules, a test catches it.

No accounts, no network access, no analytics. Built with xcodegen and SwiftUI, no third-party dependencies.

$0.99 upfront on the App Store, and there's a free web version at toroid.jaybulb.com if you want to try it before buying: apps.apple.com/app/id6806324937

Happy to talk through the wrap math or the watchOS port if anyone's curious.

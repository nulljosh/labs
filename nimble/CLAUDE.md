# Nimble
v1.3.0

Native macOS instant-answer search. Query classification (math/factual/definition). Offline math. DDG + Wikipedia.

## Stack
- SwiftUI, macOS 14+, @Observable
- QueryEngine: classifyQuery() enum, NSExpression math eval
- DuckDuckGo Instant Answer API + Wikipedia REST API
- 26 tests (QueryEngine + Preferences)

## Structure
- `Sources/Models/QueryEngine.swift` — classification, math eval, API queries
- `Sources/Models/AppState.swift` — state, theme, preferences
- `Sources/Views/SearchView.swift` — main search UI
- `Tests/` — 26 tests

## Build
```bash
xcodegen generate && open Nimble.xcodeproj
```

> MenuBarExtra disabled (macOS Tahoe beta bug). Re-enabled when SDK stabilizes.

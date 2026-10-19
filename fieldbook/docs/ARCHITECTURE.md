# Architecture

Encyclopedia of science and math fields. One page shows every field as a card: domain, name, one-liner, explanation, four key ideas, and the biggest misconception. Static HTML reads a data file. iOS, macOS, watchOS, and Kotlin Multiplatform clients share the same data source.

## How it runs

`index.html` renders the fields from `data.js`, a simple array of field objects. Each card shows the field name, domain, explanation, key ideas, and misconception. Local progress tracking via browser localStorage. Native clients (iOS, macOS, watchOS, Kotlin Multiplatform) import the same data via code generation (`scripts/gen.mjs` converts `data.js` to `Fields.swift` and `Fields.kt`). All clients are read-only; there is no edit UI.

| File | What it owns |
|---|---|
| `index.html` | Sole web page. Loads `data.js`, renders all fields as cards with sections for name, domain, explanation, four key ideas, and the gap. Inline CSS. Read progress via localStorage. |
| `data.js` | Field definitions. One entry per field: domain, name, one-liner, multi-paragraph explanation, array of four key ideas, misconception. |
| `scripts/gen.mjs` | Code generator. Reads `data.js`, outputs `Fields.swift` (iOS, macOS, watchOS) and `Fields.kt` (Android). Runs as a test; CI fails if data stale. |
| `ios/` + `macos/` | SwiftUI, xcodegen project. Shared ContentView.swift, displays Fields array (same data as web). |
| `watchos/` | watchOS read-only feed (no writing, matching iOS). Same data source. |
| `kmp/` + `composeApp/` | Kotlin Multiplatform. Android and desktop Compose. Native-release.yml CI builds msi, deb, apk. |
| `tui/` | Terminal UI. SwiftPM + SwiftTUI target. Reads Fields.swift from parent project. |
| `Package.swift` | SwiftPM manifest for iOS, macOS, watchOS, and TUI targets. |
| `data.test.mjs` + `ui.test.mjs` | Unit tests. `data.test.mjs` verifies the data structure matches what `gen.mjs` expects. `ui.test.mjs` checks layout rendering. |
| `wrangler.toml` | Cloudflare Worker, static asset deployment. |

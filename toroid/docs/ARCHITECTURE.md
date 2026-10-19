# Architecture

Toroid plays Conway's Game of Life. You get a grid of squares. Click to switch squares on, press play, and they live, die, and multiply by four simple rules. Patterns grow, settle, or march across the board on their own. There are no accounts, no sign-up, and nothing is saved or sent anywhere.

The board has no edges. Anything that walks off the right side comes back on the left, and off the top comes back on the bottom, the way the surface of a doughnut joins up to itself. That is what "toroid" means.

It runs in a browser and as apps on iPhone, Mac, and Apple Watch. The rules are written twice, once for the web and once for the Apple apps, and both are checked against the same tests so they cannot drift apart.

## How it runs

**Web:** User navigates to toroid.heyitsmejosh.com. The landing page (`index.html`) shows a hero and a live board in the background, pre-loaded with a Gosper gun pattern. `play.html` is the full interactive version: draw patterns by clicking cells, step or auto-run at variable speeds, clear, randomize, or load a preset pattern. The grid size is responsive to viewport size; patterns are preserved when the grid resizes. The engine is `life.js` (see below).

**iOS/macOS:** Apps launch with a blank grid. SwiftUI views let users click cells to toggle them, press buttons to step/run, adjust speed, and load preset patterns. The engine is `Life.swift`, a line-for-line port of `life.js`. macOS gets a slightly larger default window.

**watchOS:** Standalone companion app (not mirrored from iOS). Pages through six preset patterns on a fixed 12x12 board. Shows population count and generation number. The engine is a 12x12 port of `Life.swift` embedded directly in the watchOS app.

## Engine

The board is one long list of bytes, one per square, rather than a grid of grids. The next generation is written into a second list so the current one stays intact while it is being read. Working out where the board wraps around is done once per row and once per column, instead of once for each of a square's eight neighbours. That alone makes each step four to five times faster.

| File | What it owns |
|---|---|
| `life.js` | JavaScript engine. `Life` class with constructor (cols, rows), `get`/`set`/`toggle`, `clear`, `randomize` (random distribution), `neighbors` (count for one cell), `step` (advance one generation), `population` (count live cells), and `stamp` (place a pattern from ASCII art). Toroidal wrap via modulo on x and y. Double-buffered generation. The `step()` method unrolls wrap computation to avoid the modulo on each neighbor read. |
| `life.test.js` | Test suite for the engine. Verifies the four rules: live cell survives on 2 or 3 neighbors, dies otherwise; dead cell is born on exactly 3. Checks corner cases and torus wrap. Run with `node life.test.js`. Tests are shared by `ios/Checks/main.swift` so the Swift version cannot drift. |
| `ios/Conway/Life.swift` | Line-for-line port of `life.js` to Swift. Same methods and behavior. Returns `[UInt8]` for the grid. Toroidal wrap via modulo. Double-buffered generation. Must stay synchronized with the JavaScript version via shared test vectors. |
| `ios/Checks/main.swift` | Test suite for `Life.swift`. Mirrors `life.test.js`. Run after building: `swiftc ios/Conway/Life.swift ios/Checks/main.swift -o /tmp/c && /tmp/c`. |
| `watchos/Models/Life.swift` | Hardcoded 12x12 port of the engine for watchOS. Smaller grid so it fits comfortably on a watch face with tap targets. Uses the same `step()` logic. |

## Web

| File | What it owns |
|---|---|
| `index.html` | Landing page with hero, tagline, and a live interactive board in the background showing a Gosper gun pattern. SVG canvas with mouse/touch support to step generations or watch auto-run. Styled for desktop and mobile. Click the pattern to open `play.html`. |
| `play.html` | Full interactive Game of Life player. SVG grid, click to toggle cells, toolbar with step/run/speed controls, clear/randomize/pattern-load buttons. Preserves patterns when the viewport resizes. Queries `?w=400&h=400` for initial board size. |
| `privacy.html` | Privacy policy. |
| `devices.css` | Device frame styling for landing and web app. Responsive iPhone/Android/Mac containers. |
| `src/lib/tools.js` | Web app helpers. Board serialization, pattern loading, preset patterns (Gosper gun, glider, blinker, etc.). Called by both `index.html` and `play.html`. |
| `sw.js` | Service worker. Caches the app shell for offline play. |
| `tools.test.mjs` | Test suite for `src/lib/tools.js`. Verifies board serialization, pattern loading, and preset patterns. Run with `node tools.test.mjs`. |
| `scripts/deploy.sh` | Deployment script. Builds the web app and deploys to Cloudflare Pages. |

## iOS and macOS

| File | What it owns |
|---|---|
| `ios/Conway/ConwayApp.swift` | iOS entry point. Single `WindowGroup` with `ContentView()`. Share button overlay. |
| `macos/Conway/ConwayApp.swift` | macOS entry point. `WindowGroup` with larger default size. Same `ContentView` as iOS but with menu bar and more screen real estate. |
| `ios/Conway/ContentView.swift` | Main UI for iOS and macOS. SVG grid rendering (or CoreGraphics on macOS). Toolbar with step/run/speed controls, clear, randomize, pattern-load buttons. Tap or click to toggle cells. Handles pinch-to-zoom on iOS. |
| `ios/Conway/Life.swift` | The engine (see above). |

## watchOS

| File | What it owns |
|---|---|
| `watchos/ToroidWatchApp.swift` | watchOS app entry point. Single `NavigationStack` with `ContentView` (page navigation). |
| `watchos/Views/GridView.swift` | 12x12 grid display. Shows live cells as filled squares, dead cells as empty. Read-only on this view. |
| `watchos/Views/ControlsView.swift` | Buttons to step/run and toggle auto-play. Speed control (fast/medium/slow). Tap targets sized for watch interaction. |
| `watchos/Models/Life.swift` | 12x12 Game of Life engine. Simplified for a smaller board. |
| `watchos/Models/Board.swift` | Wrapper around a `Life` instance to track UI state (running, speed, current pattern). |

## Kotlin Multiplatform

Note: Toroid's KMP implementation (if created) would mirror the JavaScript and Swift engines, sharing the same test cases in Kotlin.

## Cloudflare Workers

| File | What it owns |
|---|---|
| `functions/api/[[route]].js` | REST API endpoint. `GET /api/step?board=...` takes a board state, advances it one generation, and returns the new state. Allows browser agents to run Game of Life without client-side JavaScript (used by autonomous testing). Board is encoded as a base64 string or similar compact format. |
| `functions/mcp.js` | Model Context Protocol server. Registers a `step` tool so agents can advance the game via MCP. Same implementation as the REST API, calls the engine so the two cannot drift. |

## Presets and utilities

| File | What it owns |
|---|---|
| `src/lib/tools.js` | Preset patterns: Gosper gun (famous 60-cycle pattern), glider (moves 4 cells every 4 generations), blinker (oscillates every 2 gens), toad, pulsar, beacon. Patterns are stored as ASCII art (`. ` for dead, `O` for alive) and stamped onto the board via `Life.stamp()`. |

## Gotchas

- **Toroidal wrap:** The grid wraps at edges. A glider that exits the right side reappears on the left. This is by design, not a bug. It means there is no "edge" in the classical sense, and some patterns that would die on an infinite grid survive indefinitely on a torus.
- **Performance:** The `step()` method avoids calling `idx(x, y)` (which computes two modulos) for each of the 8 neighbor reads per cell. Instead, it computes the wrap once per row and once per column. This speeds up a 400x400 board by 4-5x, keeping 60 fps playable.
- **Double buffering:** The engine uses two grids, swapping them after each generation. This avoids read-after-write bugs where a cell's death before processing its neighbors would change the outcome.
- **Engine parity:** `life.js` and `ios/Conway/Life.swift` must stay perfectly synchronized. Divergence is a bug, not an improvement. Both are pinned by the same test cases in `life.test.js` and `ios/Checks/main.swift`.
- **Wrapping on tiny boards:** On a 1x1 board, a cell is its own neighbor in all 8 directions, so it sees itself 8 times. This is correct toroidal behavior. On a 1xN board, each cell sees itself 6 times (horizontally and vertically, but not diagonally). All edge cases are handled by the modulo arithmetic, not special-cased.
- **No persistence:** The app does not save state across sessions. Each launch starts with a blank grid or a preset. This is by design to keep the app focused and simple.

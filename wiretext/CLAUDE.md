# wiretext web

v1.1.0 — Unicode wireframe tool. Vite + React 19. Dark Editorial design.

## Run

```bash
npm install && npm run dev   # dev server on :5173
npm run build                # production build
```

## Key Files

- `src/lib/presets.js` — 23 component templates (Button through Skeleton)
- `src/lib/engine.js` — grid state, stampComponent, undo/redo, pxToCell
- `src/App.jsx` — root reducer (SELECT_PRESET, PLACE_COMPONENT, UNDO, REDO, CLEAR)
- `src/components/Canvas.jsx` — HTML canvas, monospace char grid, hover preview, click-to-place
- `src/components/Toolbar.jsx` — component palette grouped by category
- `src/components/Inspector.jsx` — cursor coords, preset preview, history counts

## Design

Dark-mode only (`data-theme="dark"` set in `index.html`), using the exact tokens from `nulljosh.github.io/tokens.css`: `#1A1A1A` bg, `#5B9BD5` accent, `#FFF8F0` text. Fraunces + DM Sans. Matches portfolio aesthetic exactly (was previously a zinc-palette approximation).

## iOS

Native SwiftUI app in `ios/` (xcodegen). Rewritten from a WKWebView shell 2026-08-17 — Apple's
Guideline 5.6 notice cited quality/completeness, and the 72-line shell was the finding. No web
assets are bundled any more; `npm run build:ios` is no longer part of the iOS build.

- `App/Engine.swift` — grid + undo/redo, ported function-for-function from `src/lib/engine.js`
- `App/Presets.swift` — the same 23 templates as `src/lib/presets.js`
- `App/CanvasView.swift` — SwiftUI `Canvas`, one Text draw per row (not per cell)
- `App/Store.swift` — canvas persists to Application Support, survives relaunch
- `Checks/main.swift` — the JS test suite ported as plain asserts

```bash
cd ios && xcodegen generate
xcodebuild build -scheme Wiretext-iOS -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath /tmp/dd-wiretext -skipPackagePluginValidation

# engine self-check, no framework needed
swiftc -o /tmp/wtcheck ios/App/Engine.swift ios/App/Presets.swift ios/Checks/main.swift && /tmp/wtcheck
```

Native-only capabilities the web build cannot offer: on-device persistence, the system share
sheet, and hardware-keyboard undo/redo (⌘Z / ⇧⌘Z).

Keep `Engine.swift`/`Presets.swift` in sync with their `src/lib/` counterparts — the ports are
deliberately line-comparable.

## Architecture

- `state.grid: string[][]` — 100x50 2D char array
- `stampComponent(grid, template, col, row)` — immutable stamp
- `gridToText(grid)` — joins for export/copy
- Canvas renders via `<canvas>` 2D context (not DOM/pre)
- Undo stack: 50 steps max, stored as grid snapshots

## Notes

- No backend, no external deps beyond React
- Keyboard shortcuts: Ctrl+Z undo, Ctrl+Y redo (canvas must be focused)
- Export writes `wireframe.txt` via Blob URL

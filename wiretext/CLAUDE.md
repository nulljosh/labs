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

Thin WKWebView shell in `ios/` (xcodegen, no Capacitor — app has no native API needs). Serves the build over a custom `app://` scheme (not `file://`) since ES module scripts are blocked cross-origin under `file://`.

```bash
npm run build:ios            # builds to ios/web with relative asset paths
cd ios && xcodegen generate && open Wiretext.xcodeproj
```

No AppIcon asset catalog yet — generate one from `icon.svg` before App Store submission.

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

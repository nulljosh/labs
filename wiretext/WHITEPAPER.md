# Wiretext Technical Whitepaper

**v1.1.0** | July 2026

Wiretext is a Unicode wireframe design tool: click a component from the
palette, stamp it onto a monospace character grid, and export the mockup as
plain text. Wireframes that paste into a commit message, a code comment, or a
chat. Live at
[wiretext.heyitsmejosh.com](https://wiretext.heyitsmejosh.com).

## Core Mechanic: The Character Grid

The document is `state.grid: string[][]` — a 100×50 2D array of characters.
Everything is a pure function over that array:

- **Components** — 23 presets (`src/lib/presets.js`), Button through Skeleton,
  each a small template of box-drawing characters.
- **Stamping** — `stampComponent(grid, template, col, row)` returns a new grid
  with the template written in; the reducer never mutates. Immutability makes
  undo/redo (50 steps) a matter of keeping old grids.
- **Export** — `gridToText(grid)` joins rows into the final plain-text
  wireframe for `.txt` download or clipboard copy.

The canvas (`src/components/Canvas.jsx`) renders the grid to an HTML canvas in
a monospace font, converts pointer position to cells via `pxToCell`, and shows
a hover preview of the selected component before placing.

## Architecture

- **Stack**: Vite 6 + React 19, no external UI libraries.
- **State**: one root reducer in `App.jsx` (SELECT_PRESET, PLACE_COMPONENT,
  UNDO, REDO, CLEAR).
- **UI**: `Toolbar.jsx` (palette grouped by category), `Inspector.jsx`
  (cursor coords, preset preview, history counts).
- **Design**: dark-mode only, exact portfolio tokens from
  `nulljosh.github.io/tokens.css` (#1A1A1A bg, #5B9BD5 accent, Fraunces +
  DM Sans), consumed via the shared tokens.css `@import`.

## iOS

A thin WKWebView shell in `ios/` (xcodegen, no Capacitor — the app has no
native API needs). The build is served over a custom `app://` scheme rather
than `file://`, because ES module scripts are blocked cross-origin under
`file://`. `npm run build:ios` produces the embedded web build with relative
asset paths. Remaining before App Store submission: generate an AppIcon asset
catalog from `icon.svg`.

## Privacy

Fully client-side. No accounts, no network calls, no storage beyond the
in-memory grid — close the tab and the document is gone unless exported.

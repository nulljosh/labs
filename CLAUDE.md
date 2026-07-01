# Quotable

Movie-quote guessing game. Static site, no build step, no backend.

## Stack
Plain HTML/CSS/JS. Quote bank in `quotes.json` (~45 hand-seeded quotes — see root roadmap.md for plan to pull from a real quotes API). High score persisted via localStorage.

## Deploy
GitHub Pages via `.github/workflows/deploy.yml` (Settings → Pages → Source: GitHub Actions).

## iOS
`ios/` — SwiftUI wrapper (WKWebView loading the same `index.html`/`game.js`/`quotes.json` bundled as resources). Scaffold only, not built/signed. See root roadmap.md for TestFlight status.

## macOS
`macos/` — same pattern as iOS, AppKit `NSViewRepresentable` wrapping WKWebView. Scaffold only, not built/signed.

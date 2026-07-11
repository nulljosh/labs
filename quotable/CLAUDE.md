# Quotable

Movie-quote guessing game. Static site, no build step, no backend.

## Stack
Plain HTML/CSS/JS. Quote bank in `quotes.json` (100 hand-seeded quotes — see root roadmap.md for plan to pull from a real quotes API). High score persisted via localStorage. Genre-colored badges/icons and correct/wrong feedback animations added in v1.1.0. v1.2.0: full-viewport layout, larger type/spacing, per-genre badge text color (fixes low-contrast text on drama/sci-fi badges), flat backgrounds (no gradients), quote bank doubled to 100. v1.3.0: quote bank to 143 (verified, no fabricated attributions), stronger accent color (panel left border, deeper bg tint), auto light/dark only (toggle removed), 100dvh mobile fix. v1.4.0: settings panel (gear icon) — sound effects toggle + volume slider, synthesized via Web Audio API (no audio assets), persisted in localStorage. Profiles/accounts (Supabase) deferred — not yet implemented. v1.4.1: removed decorative purple left-border accent stripe on panel, replaced purple accent2 (Speed Round button) with blue to match the rest of the palette. v1.4.2: removed all emojis from UI copy (genre badges, feedback text, settings button) per standing no-generic-AI-UI rule (no border stripes, no purple, no gradients, no emojis). v1.5.0: added 50 music trivia entries (lyric → artist, genres pop/rock/hiphop/rnb/country), renamed `movie` field to `answer` across quotes.json to support both categories, genre dropdown now populated dynamically from quotes.json instead of hardcoded. Rebuilt header as a full-width sticky top nav (icon only, no wordmark, since icon.svg already renders "QUOTE" as text); widened content to 720px max-width.

## iOS/macOS sync
`ios/QuoteGuess/Resources/` and `macos/Quotable/Resources/` are plain file copies of the root `index.html`/`style.css`/`game.js`/`quotes.json`, not symlinks or a build step. Re-copy the four files into both Resources dirs whenever the root web files change.

## Deploy
GitHub Pages via `.github/workflows/deploy.yml` (Settings → Pages → Source: GitHub Actions).

## iOS
`ios/` — SwiftUI wrapper (WKWebView loading the same `index.html`/`game.js`/`quotes.json` bundled as resources). Scaffold only, not built/signed. See root roadmap.md for TestFlight status.

## macOS
`macos/` — same pattern as iOS, AppKit `NSViewRepresentable` wrapping WKWebView. Scaffold only, not built/signed.

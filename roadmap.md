# Keyrate roadmap

- [ ] Cross-platform native apps: iOS, macOS, Windows, Android. Use KMP Compose per homeward/kmp and nimble/kmp (PWA is not coverage). Landing page already lists them as "Coming soon"; swap in store links as each ships.
- [ ] Maybe a better name. Run asc-name-creator before the ASC record. Candidates: Keyrate (current), Typerate, Wpm, Quicktype, Keystroke.

## TUI pilot (2026-09-05)
- `keyrate-tui` SwiftPM target (SwiftTUI), `tui/Sources/Score.swift` is a line-for-line port of score.js. `swift build && ./.build/debug/keyrate-tui "target text" "typed text" 3.2` scores one attempt. Static score render, not a live typing test — see comment in tui/Sources/main.swift. Needs a real TTY.
- [ ] native (kmp) port — sibling apps have one, this doesn't (project-sync 2026-09-05)

## Ingested 2026-10-05
- [ ] Ship apps etc

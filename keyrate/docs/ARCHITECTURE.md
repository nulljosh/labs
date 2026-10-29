# Architecture

Typing test. Type the words, the clock runs out, you get one number. No account, no settings, no theme picker. Static pages, no build.

## How it runs

`app/index.html` is the test. A hidden input catches keystrokes, the visible words are rebuilt from the typed and target arrays on every input, and `finish()` hands both lists plus the elapsed seconds to `stats()` in `score.js`. Best per mode and the last 30 runs go to `localStorage`. `index.html` is the landing page and embeds `/app` in an iframe under the hero.

| File | What it owns |
|---|---|
| `index.html` | Landing page. Hero, the embedded test, platform cards, footer. |
| `app/index.html` | The test: modes (15/30/60s, 25/50 words, quote), punct toggle, caret, result, best, sparkline. |
| `score.js` | Pure scoring: wpm, raw, accuracy, correct words. Shared by the page and the tests. |
| `score.test.mjs` | Three cases for `stats()`. `node --test`. |
| `tui/` | Terminal companion. SwiftPM + SwiftTUI. `Score.swift` is a line-for-line port of `score.js`, `Checks.swift` mirrors the tests. Scores one attempt, not a live test. |
| `kmp/` | Native Android and desktop app. `shared/` ports `score.js` and the word stream with the same tests, `composeApp/` is the UI. |
| `apple/` | iOS, iPadOS and macOS app. SwiftUI, one xcodegen target for both destinations. `Session.swift` ports the test rules, `Score.swift` is shared with `tui/`. |
| `wrangler.toml` | Cloudflare Workers static assets. `.assetsignore` keeps docs and tests off the edge. |

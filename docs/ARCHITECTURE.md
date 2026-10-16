# Architecture

Typing speed test. Type words that appear, clock runs out, get one number. No account, no settings, no theme picker. Static single page.

## How it runs

`index.html` loads `score.js`, which manages test state (words, timer, keystrokes). Words appear at the top; you type them at the bottom. Wrong letters show red. Tab restarts. Spacebar moves to the next word. When time runs out, your WPM (words per minute) is calculated and displayed. Best per mode (60s, 90s, 120s) saved to browser localStorage.

| File | What it owns |
|---|---|
| `index.html` | Sole page. Displays words, input field, timer, results. Inline CSS. |
| `score.js` | Pure logic for calculating WPM, tracking accuracy, managing test states. Shared by web and tests. |
| `score.test.mjs` | Unit tests for scoring calculation. |
| `app/index.html` | Alternative entry point (unused, legacy). |
| `tui/` | Terminal UI. SwiftPM + SwiftTUI target. Runs the same typing test in the terminal using Checks.swift (display), Score.swift (logic shared via code generation or direct port), main.swift (entry). |
| `Package.swift` | SwiftPM manifest for TUI target. |
| `wrangler.toml` | Cloudflare Worker deployment config. |

# Fieldbook

Every field of science and math explained plainly. One page, no build. Live at fieldbook.heyitsmejosh.com.

- `index.html` renders `data.js` (one entry per field: domain, name, one-liner, explanation, four key ideas, the gap). Add a field by adding an entry
- Read progress in localStorage only
- Deploy: `env -u CLOUDFLARE_API_TOKEN npx wrangler deploy`
- Design tokens from heyitsmejosh.com/tokens.css. No emojis, no serif, no purple
- Native: `ios/` + `macos/` (xcodegen, shared ContentView), `kmp/` (Android + desktop Compose, CI builds msi/deb/apk via native-release.yml), `tui/` (SwiftPM + SwiftTUI). All read `Fields.swift`/`Fields.kt`, generated from data.js by `node scripts/gen.mjs`; data.test.mjs fails if stale
- No JDK on this Mac. Gradle is verified by CI only

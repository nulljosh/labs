# Keyrate

Typing test. One page, no build. Live at keyrate.jaybulb.com.

- `index.html` is the landing page (it embeds `/app` in an iframe under the hero), `app/index.html` is the test, `session.js` holds the test rules, `score.js` is the math, `score.test.mjs`, `session.test.mjs` and `vectors.test.mjs` check them (`node --test`)
- Native: `kmp/` is the Android and desktop app, `apple/` is the iPhone, iPad and Mac app (xcodegen), `tui/` is the terminal app. All of them must agree on `vectors.json`
- Roadmap: `roadmap.md`, steps v11 to v100

## The loop

The `/loop` that works the roadmap is documented in `docs/LOOP-HANDOFF.md`: what it does, where things stand, what comes next, and the restart prompt. Read it before starting a loop run.
- Deploy: `env -u CLOUDFLARE_API_TOKEN npx wrangler deploy` (Workers static assets, `.assetsignore` hides docs)
- Screenshots: Playwright with `channel: 'chrome'` run from epiphany's node_modules; no browsers are downloaded on this Mac
- Design tokens come from jaybulb.com/tokens.css. No emojis, no serif, no purple

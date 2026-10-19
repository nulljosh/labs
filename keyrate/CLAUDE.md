# Keyrate

Typing test. One page, no build. Live at keyrate.heyitsmejosh.com.

- `index.html` is the landing page, `app/index.html` is the test, `score.js` is the math, `score.test.mjs` checks it (`node --test`)
- Deploy: `env -u CLOUDFLARE_API_TOKEN npx wrangler deploy` (Workers static assets, `.assetsignore` hides docs)
- Screenshots: Playwright with `channel: 'chrome'` run from epiphany's node_modules; no browsers are downloaded on this Mac
- Design tokens come from heyitsmejosh.com/tokens.css. No emojis, no serif, no purple

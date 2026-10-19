# Fieldbook Technical Whitepaper

**v0** | September 2026

No one has time to survey every field of science and math before picking one to study, so most people never get the map, just whatever field they happened to fall into. Fieldbook is a single static page that maps every field of science and mathematics. Each field gets a few hundred words: what it studies, four ideas that carry most of the weight, and the misconception most people hold. The goal is coverage at the level of a map, so a reader knows where everything is before deciding where to go deep.

## The core mechanic

All content lives in one JavaScript array, one object per field, because a flat array is the simplest shape that a hundred-plus entries can grow into without a database. The page groups entries by domain, builds a sidebar index, and renders each entry as an article. A search box filters articles and the index by substring. A "Mark read" button per field stores the field's slug in localStorage and drives a progress count, because reading is the whole interaction and progress should be visible without an account. Nothing is sent anywhere: a reading log is nobody's business but the reader's.

## Content rules

Plain English, short sentences, no jargon without an inline gloss, because a map that needs its own glossary has failed at being a map. Exactly four key ideas per field, a fixed number chosen so every field gets the same weight rather than letting a favorite subject sprawl. The gap line names a specific wrong belief and corrects it in one or two sentences, because the point of a map is to catch the wrong turn before it's taken. A test enforces shape, uniqueness, minimum length, and house voice (no em dashes, no emojis, no marketing verbs), so one bad entry can't sneak past review and undercut the whole thing's credibility.

## Testing

`node --test data.test.mjs` checks the content. `node --test ui.test.mjs`. `swift build && .build/debug/fieldbook-tui --check` covers the native content; xcodegen + xcodebuild in ios/ and macos/; `./gradlew :composeApp:packageDmg` in kmp/ needs JDK 17 (CI does Windows, Linux, Android) drives the live page in Chrome through Playwright: render count, search filtering, mark-read persistence across reload, index navigation, and captures screenshots.

## Deployment

Cloudflare Workers static assets via `wrangler deploy`. Docs, tests, and screenshots are excluded by `.assetsignore`.

## Roadmap

One self-check question per field. A prerequisite ordering so the page reads as a course. Further fields as gaps are found.

MIT, Joshua Trommel, 2026.

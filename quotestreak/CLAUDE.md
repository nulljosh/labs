# Quotestreak

Movie-quote guessing game. Static site, no build step, no backend.

## Stack
Plain HTML/CSS/JS. Quote bank in `quotes.json` (100 hand-seeded quotes, see root roadmap.md for plan to pull from a real quotes API). High score persisted via localStorage. Genre-colored badges/icons and correct/wrong feedback animations added in v1.1.0. v1.2.0: full-viewport layout, larger type/spacing, per-genre badge text color (fixes low-contrast text on drama/sci-fi badges), flat backgrounds (no gradients), quote bank doubled to 100. v1.3.0: quote bank to 143 (verified, no fabricated attributions), stronger accent color (panel left border, deeper bg tint), auto light/dark only (toggle removed), 100dvh mobile fix. v1.4.0: settings panel (gear icon), sound effects toggle + volume slider, synthesized via Web Audio API (no audio assets), persisted in localStorage. Profiles/accounts are iOS/macOS-only (web stays local-only, no login): `Account.swift` holds Apple + Google sign-in (Google via supabase-swift's OAuth browser flow, `quotable://` registered as the redirect scheme; Apple stays on the raw GoTrue REST calls other methods use), account deletion via the shared spark `delete-account` Edge Function, and the leaderboard read/write. v1.4.1: removed decorative purple left-border accent stripe on panel, replaced purple accent2 (Speed Round button) with blue to match the rest of the palette. v1.4.2: removed all emojis from UI copy (genre badges, feedback text, settings button) per standing no-generic-AI-UI rule (no border stripes, no purple, no gradients, no emojis). v1.5.0: added 50 music trivia entries (lyric → artist, genres pop/rock/hiphop/rnb/country), renamed `movie` field to `answer` across quotes.json to support both categories, genre dropdown now populated dynamically from quotes.json instead of hardcoded. Rebuilt header as a full-width sticky top nav; widened content to 720px max-width. v1.5.1: the "icon only, no wordmark" call was wrong, icon.svg sets its "QUOTE" lettering at font-size 24 in a 200px viewBox, so at a 32-36px render it is ~4px tall and unreadable. The header now pairs the mark with a real HTML wordmark ("Quotable"); do not remove it again. Also tightened stacked bottom padding (panel 40->28, wrap 40->20/24) that left ~80px dead below the answers; `#feedback`'s min-height is deliberate and stays, it reserves the answer-feedback line so the layout doesn't jump.

## Daily Quote (v2)
`daily.js` picks one quote per UTC day from a fixed shuffled walk of the bank, so every player gets the same board and nothing repeats until the bank is used up. Day 1 is 2026-10-19. The streak counts days in a row answered right. `?daily` in the URL opens it (share links). Changing `quotes.json` reshuffles future days, which is fine; changing the epoch or the seed would change today's quote for players mid-day, so do not.

## iOS/macOS sync
**iOS is a native SwiftUI app now, not a web wrapper.** The only file shared with the web game is `quotes.json`, copy it to `ios/Quotable/Resources/quotes.json` whenever the root one changes, and nothing else. The genre palette in `ios/Quotable/Theme.swift` mirrors the `--g-*` vars in `style.css`; keep the two in step by hand.

macOS shares the iOS sources outright: `macos/project.yml` points at `../ios/Quotable/{Game,Quote,Theme,ContentView}.swift`. Do not fork those four files, `ContentView` branches on `#if os(macOS)` and `Theme.canvas` picks the right window ground per platform. Only `QuotableApp.swift`, `Info.plist` and `Resources/quotes.json` are macOS-local.

## Pages
`index.html` is the **landing page**, `play.html` is the game. (Before v1.7.0 the game was at `index.html`.) The landing page is self-contained, its own inline `<style>`, no `style.css`, no `game.js`. Keep it that way: `game.js` wires its handlers at parse time and throws if any game element id is missing, so it must never be loaded on a page without the full game markup.

The landing page mirrors the Bookrank landing page (`nulljosh/bookrank` `index.html`) on purpose, same hero/features/closing structure, same drifting image wall. Two deliberate differences from that reference: album art is tagged `.square` (`aspect-ratio: 1/1`) so 1:1 iTunes art is not center-cropped into a 2:3 poster shape, and the reduced-motion rule is written as `.wall-col.up, .wall-col.down`, at the bare `.wall-col` specificity Bookrank uses, the `animation` shorthand on `.wall-col.up` wins and the wall keeps moving for users who asked it not to.

The hero wall is the one sanctioned exception to the standing "no gradients" rule: `.hero::after` is a legibility scrim over the art, not decoration. The game UI keeps flat backgrounds.

`play.html` has its own `#backdrop` mosaic of the same artwork, built by `buildBackdrop()` in `game.js` off the quotes.json fetch that is already there, do not add a second fetch. Two deliberate differences from the hero wall: it is **static**, because the speed round is a timed attention task and drifting posters behind a 10-second clock fight the clock; and it holds legibility with low opacity alone (0.14 light / 0.22 dark) rather than a scrim, so the game UI keeps its flat backgrounds and the no-gradients rule stays intact there. Tune those two numbers if real artwork reads too busy. It sits at `z-index: -2`, below `#art-flash` at `-1`, so the answer-reveal flash still lands on top.

## Brand (2026-10-18)
`brand/BRAND.md` is the rulebook, `brand/index.html` the live kit (quotestreak.jaybulb.com/brand/). The short version:

- **Colour:** marquee yellow `#ffcc00` on night ink. Red and green are reserved for wrong and right, which is why the old red brand and the stray blue UI accent are both gone. Text on yellow is always ink. One yellow primary per screen; secondary actions are outlined.
- **Icon:** two opening quote marks on a streak (speed lines), yellow on an ink tile. `Quotestreak.icon` (Icon Composer) is the app icon on iOS and macOS (`ASSETCATALOG_COMPILER_APPICON_NAME: Quotestreak`); the asset catalogs only hold a flattened fallback. Regenerate everything with the brand skill's `make_brand.py`, never by hand. **The tail stays longer than the ball**: a short tail reads as a speech bubble, wedges read as a pause button. Keep the HTML wordmark in the topbar; the mark alone does not name the product.
- **Quip**, the mascot: the mark come to life. `brand/mascot.py` writes four poses (idle, cheer, oops, streak), a `-dark` twin of each with cream limbs, and `brand/Quip.xcassets` (switches by appearance). On the web, pick the twin with `<picture>` or `data-theme`.
- **Quip Sans** is the face, on purpose (Joshua asked for a custom face 2026-10-18, overriding the fleet's system-font rule for this app). `scripts/gen_font.py` builds it from Hanken Grotesk (OFL): renamed, curly quotes redrawn as the mark, figures made proportional. Run `--check` after any change. Web loads it from `brand/tokens.css`; the apps register the bundled TTFs at first use (`Theme.fontsRegistered`) and use `Font.quip(...)`. There is no italic, so quotes are upright Semibold.
- The built app is **Quotestreak.app** (`PRODUCT_NAME`); target, scheme and bundle ids keep the Quotable name. If the Dock shows an old icon after a rebuild, that is LaunchServices caching the bundle id: `lsregister -f` the new app.

All icons must be **opaque, no alpha channel** (ITMS-90717). A new icon reaches the store only with a new build.

## Deploy
GitHub Pages via `.github/workflows/deploy.yml` (Settings → Pages → Source: GitHub Actions).

## iOS
`ios/`, native SwiftUI, rewritten 2026-08-23 from the old WKWebView shell (a wrapper is a guaranteed Guideline 4.2 rejection; see the 5.6 suspension history). Four files:

- `Game.swift`: the whole game loop ported from `game.js`: scoring, streaks, the speed-round clock. `@Observable`, no SwiftUI imports, so it is testable headless.
- `ContentView.swift`: menu / round / game-over, plus the timer ring and the answer reveal.
- `Quote.swift`: decodes the shared `quotes.json`.
- `Theme.swift`: genre palette mirroring `style.css`.

Answer buttons deliberately use `.allowsHitTesting(false)` rather than `.disabled(true)` after a pick, a disabled button renders its tint washed out, which hides the green/red reveal.

Self-check (no XCTest, no framework):

```
swiftc -o /tmp/quotablecheck ios/Quotable/Quote.swift ios/Quotable/Game.swift ios/Quotable/SharedStore.swift ios/Checks/main.swift && /tmp/quotablecheck quotes.json
```

It validates the whole quote bank (4 unique options, answer present, no duplicate quotes, movies have years) and the scoring paths (streaks, the speed multiplier, timeout-as-miss).

## App Store
Listed as **Quotestreak** (app id `6804394619`, bundle `com.heyitsmejosh.quotable`), "Quotable", "Quotely", "Quipster", "Recite" and "Cueline" are all taken by other accounts.

**The product is Quotestreak everywhere** (2026-08-28). The web game used to keep the Quotable name while only the store listing was Quotestreak; that split is gone, every user-facing string on the site now reads Quotestreak. Three things deliberately still say "quotable" and must NOT be renamed:

- `CNAME` / `quotable.heyitsmejosh.com`, the live domain. Changing it is a DNS move, not a rename.
- `quotable_high_score`, `quotable_sfx_on`, `quotable_sfx_vol`, localStorage keys on players' machines. Renaming them silently wipes every existing high score and sound setting.
- `window.quotable*`: the globals `webmcp.js` binds to. Renaming breaks the agent tools for nothing.

The bundle id `com.heyitsmejosh.quotable` is likewise fixed; it is bound to ASC record 6804394619, and changing it means a new app record, not a rename.

Ship with `asc workflow run ship-ios VERSION:x.y.z` (see `.asc/workflow.json`).

## macOS
`macos/`, native SwiftUI, rewritten 2026-08-23 off the same shared sources as iOS. Sandboxed, bundle `com.heyitsmejosh.quotable.mac`. Builds clean.

**Shipped.** The "not submitted yet, deliberately / no ASC record exists" note here was stale, `roadmap.md` records iOS 1.0 and macOS 1.0 both APPROVED and live as of 2026-08-23 on the shared Universal Purchase record 6804394619. The landing page links both store pages (`?mt=12` for Mac); if either listing is ever pulled, drop the matching hero button.

## The loop
A /loop works down "Road to v100" in `roadmap.md`. Read `docs/LOOP-HANDOFF.md` first; it has the current state and the restart prompt.

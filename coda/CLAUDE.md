# Coda

Quote guessing game: movies, TV, games, songs, books. Static site on Cloudflare Pages plus native SwiftUI. Two Workers behind it: `duel/` (live duels and spectators, Durable Objects) and the shared jaybulb-api (accounts, scores, friends, clubs, hit rates). Badges, stats and high score stay on the device.

## Stack
Plain HTML/CSS/JS, classic scripts sharing top-level bindings, one file per feature (see `docs/ARCHITECTURE.md` for the map). `quotes.json`, the core bank, has 1,697 lines: 272 hand-seeded, the rest harvested by `scripts/harvest-*.mjs` + `scripts/merge-harvest.mjs`, each harvested line carrying `character` and `source`. 661 lines carry `actor` (matched against the cast list on their Wikiquote page, unambiguous matches only; `scripts/harvest-actors.mjs` + `merge-actors.mjs`) and 895 films carry `director` (Wikidata P57 through the film's Wikipedia article, film and year checked; `harvest-directors.mjs` + `merge-directors.mjs`). 89 songs carry `song`, `album`, `albums` (the artist's other studio albums) and `year` (`harvest-music.mjs`: hand-named songs confirmed on Wikidata or the song's Wikipedia infobox, never Apple's catalog, whose compilations carry wrong dates). Mode keys must be unique: `album` is Album reveal, so Which album is `record`. `scripts/build-site.sh` copies an explicit file list into `dist/`, so new scripts go on that list. `quotes-more.json` (v100) holds 12,737 more Wikiquote lines with their character and page (`scripts/harvest-more*.mjs`, `harvest-deepen.mjs`, `merge-more.mjs`); it loads after the first round and joins `quotes`, while `core` stays fixed for the Daily and archive. Bump `quotestreak-vNN` in `sw.js` every release. Tests: `for t in *.test.js; do node $t; done`. The pre-commit hook rejects files over about 5,000 tokens; split rather than grow `game.js`.

## Features since v58
`docs/FEATURES.md` explains each one (family mode, access, languages, offline packs, sync, profiles, verified bank, submissions, new releases, seasons, sports, speeches). Rules that bite: every new interface string ships in all 19 languages through `node scripts/i18n-add.mjs`; keep axe at 0 violations (`scripts/axe-check.mjs`); `play.html` is at the size limit, so new panels inject their markup from their own script; new release lines live in `recent.json`, never the bank, so the Daily never reshuffles.

## Accounts and friends (Cloudflare only)
Every platform signs in against jaybulb-api (api.jaybulb.com, Workers + D1). No Supabase anywhere: the native apps dropped supabase-swift on 2026-10-19. Web: `auth.js` on `spark.js` (email and password, Apple via the shared Services ID `com.heyitsmejosh.websignin`, Google Identity Services on the jaybulb-signin web client, delete account in two taps). Native: `Account.swift` (same methods; Google is OAuth code + PKCE in `webAuthenticationSession` with the iOS client Atlin also uses; refresh token in the Keychain). Friends: a friend code is the first 8 hex digits of the user id; adding a code links both people at once. The RPCs (`quotestreak_my_code`, `quotestreak_add_friend`, `quotestreak_remove_friend`, `quotestreak_friends`) and the `quotestreak_friends` table live in jaybulb-api; delete account clears friend links too.

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
`brand/BRAND.md` is the rulebook, `brand/index.html` the live kit (coda.jaybulb.com/brand/). The short version:

- **Colour:** marquee yellow `#ffcc00` on night ink. Red and green are reserved for wrong and right, which is why the old red brand and the stray blue UI accent are both gone. Text on yellow is always ink. One yellow primary per screen; secondary actions are outlined.
- **Icon:** two opening quote marks on a streak (speed lines), yellow on an ink tile. `Coda.icon` (Icon Composer) is the app icon on iOS and macOS (`ASSETCATALOG_COMPILER_APPICON_NAME: Coda`); the asset catalogs only hold a flattened fallback. Regenerate everything with the brand skill's `make_brand.py`, never by hand. **The tail stays longer than the ball**: a short tail reads as a speech bubble, wedges read as a pause button. Keep the HTML wordmark in the topbar; the mark alone does not name the product.
- **Quip**, the mascot: the mark come to life. `brand/mascot.py` writes four poses (idle, cheer, oops, streak), a `-dark` twin of each with cream limbs, and `brand/Quip.xcassets` (switches by appearance). On the web, pick the twin with `<picture>` or `data-theme`. Outfits (v66): `mascot.py` also writes `brand/outfits/quip-{pose}-{outfit}{,-dark}.svg` (six outfits, unlocked by badges); `dress.js` swaps the chosen one into every Quip by rewriting src/srcset, so new Quip images need no extra code. Hats take the limb ink; bowtie and shades stay ink on the yellow.
- **Themes (v67):** Marquee (default), Noir (wall and reveal flash in black and white) and Drive-in (always night, brighter wall). The head script in `play.html` sets `data-look` and `data-theme` before paint, so changing it reloads; yellow stays the one colour in every theme.
- **Quip Sans** is the face, on purpose (Joshua asked for a custom face 2026-10-18, overriding the fleet's system-font rule for this app). `scripts/gen_font.py` builds it from Hanken Grotesk (OFL): renamed, curly quotes redrawn as the mark, figures made proportional. Run `--check` after any change. Web loads it from `brand/tokens.css`; the apps register the bundled TTFs at first use (`Theme.fontsRegistered`) and use `Font.quip(...)`. There is no italic, so quotes are upright Semibold.
- The built app is **Coda.app** (`PRODUCT_NAME`); target, scheme and bundle ids keep the Quotable name. If the Dock shows an old icon after a rebuild, that is LaunchServices caching the bundle id: `lsregister -f` the new app.

All icons must be **opaque, no alpha channel** (ITMS-90717). A new icon reaches the store only with a new build.

## Deploy
Cloudflare Pages: `sh scripts/build-site.sh` then `npx wrangler pages deploy`. Duels: `cd duel && npx wrangler deploy`. A push deploys nothing.

## iOS
`ios/`, native SwiftUI, rewritten 2026-08-23 from the old WKWebView shell (a wrapper is a guaranteed Guideline 4.2 rejection; see the 5.6 suspension history). Four files:

- `Game.swift`: the whole game loop ported from `game.js`: scoring, streaks, the speed-round clock. `@Observable`, no SwiftUI imports, so it is testable headless.
- `ContentView.swift`: menu / round / game-over, plus the timer ring and the answer reveal.
- `Quote.swift`: decodes the shared `quotes.json`.
- `Theme.swift`: genre palette mirroring `style.css`.

Answer buttons deliberately use `.allowsHitTesting(false)` rather than `.disabled(true)` after a pick, a disabled button renders its tint washed out, which hides the green/red reveal.

`ios/Widget/CodaWidget.swift` (v31) is a WidgetKit extension on iOS (small, medium, lock screen) and macOS (small, medium), target `QuotableWidget`, bundle `com.heyitsmejosh.quotable.widget`. It bundles its own `quotes.json` and works the day's line out with `Daily.swift`, a bit-for-bit port of `daily.js` (mulberry32 with UInt32 wrapping for Math.imul), so it needs no app group. It never shows the answer.

Live duels (v33): `Duel.swift` speaks the same room protocol as `duel-client.js` over `URLSessionWebSocketTask`, so the apps and the web duel each other; `DuelViews.swift` is the start/join sheet. On iPhone each duel runs as a Live Activity (`DuelActivity.swift` attributes, drawn by `DuelLiveActivity` in the widget extension; `NSSupportsLiveActivities` in Info.plist). Duel scores stay off the leaderboard, like the web.

Siri (v39): `Intents.swift` has two App Intents ("Give me a quote", "Start a speed round") and the App Shortcuts phrases; the speed round reaches ContentView through the `quotestreak_launch` default. Handoff (v40): ContentView publishes `Game.handoff` (unanswered quote ids, score, streak) as an NSUserActivity of type `com.heyitsmejosh.quotable.game` (listed in each Info.plist) and `Game.resume` picks it up; duels are not handed off.

iMessage (v49): `ios/Messages/` is a Messages extension (`QuotableMessages`, bundle `.messages`). Play five lines, send the score as a bubble whose link is the web challenge link (`ChallengeLink.swift`, the Swift twin of challenge.js); tapping a friend's bubble plays the same lines. The store needs an iMessage app icon set before this ships.

Self-check (no XCTest, no framework):

```
node scripts/daily-expect.mjs > /tmp/daily.json && swiftc -o /tmp/quotablecheck ios/Quotable/Quote.swift ios/Quotable/Game.swift ios/Quotable/SharedStore.swift ios/Quotable/Daily.swift ios/Quotable/ChallengeLink.swift ios/Checks/main.swift && /tmp/quotablecheck quotes.json /tmp/daily.json
```

It checks that the Swift Daily Quote matches `daily.js` day for day, and validates the whole quote bank (4 unique options, answer present, no duplicate quotes, movies have years) and the scoring paths (streaks, the speed multiplier, timeout-as-miss).

## App Store
Renamed Quotestreak to **Coda** on 2026-10-19. The store listing (app id `6804394619`, bundle `com.heyitsmejosh.quotable`) still says Quotestreak until 1.3.0 clears review; then probe Coda with asc-name-creator and rename it. The Pages project (`quotestreak`), `quotestreak_*` storage keys, RPCs and tables, and the `quotestreak-duel` Worker keep the old name on purpose: renaming them wipes players' data or breaks the API. quotestreak.jaybulb.com still serves the site. "Quotable", "Quotely", "Quipster", "Recite" and "Cueline" are all taken by other accounts.

**The product is Coda everywhere** (2026-08-28). The web game used to keep the Quotable name while only the store listing was Coda; that split is gone, every user-facing string on the site now reads Coda. Three things deliberately still say "quotable" and must NOT be renamed:

- The live domain is `coda.jaybulb.com` (Cloudflare Pages). `quotable.heyitsmejosh.com` lapsed with the old domain on 2026-10-13.
- `quotable_high_score`, `quotable_sfx_on`, `quotable_sfx_vol`, localStorage keys on players' machines. Renaming them silently wipes every existing high score and sound setting.
- `window.quotable*`: the globals `webmcp.js` binds to. Renaming breaks the agent tools for nothing.

The bundle id `com.heyitsmejosh.quotable` is likewise fixed; it is bound to ASC record 6804394619, and changing it means a new app record, not a rename.

Ship with `asc workflow run ship-ios VERSION:x.y.z` (see `.asc/workflow.json`).

## Apple TV (v34)
`tvos/`, a SwiftUI host for party games: `PartyHost.swift` opens a party room (`/duel/party`, the `Party` Durable Object in `duel/worker.js`), shows a code and a QR code, and phones join at `buzz.html` in any browser. The TV deals ten quotes, sends each question's options to the phones, collects buzzes and scores (10 for right, 5 more for the fastest right). Same bundle id as iOS, so it joins the universal purchase. Type sizes come from the tvOS branch of `Theme.quipSize`. There is no tvOS simulator runtime on this Mac; the screens were checked by rendering the views with ImageRenderer.

## Vision Pro (v35)
`visionos/`, the full game in a window from the same shared sources as macOS, plus `PosterWall.swift`: an ImmersiveSpace with three rings of TMDB posters, 3.2 m out, opened from the menu (`PosterWallButton`, the only `#if os(visionOS)` in ContentView). visionOS 26 minimum, for `sensoryFeedback`. Same bundle id, so it joins the universal purchase. No visionOS simulator device on this Mac; the build is verified, the wall is not seen yet.

## macOS
`macos/`, native SwiftUI, rewritten 2026-08-23 off the same shared sources as iOS. Sandboxed, bundle `com.heyitsmejosh.quotable.mac`. Builds clean.

**Shipped.** The "not submitted yet, deliberately / no ASC record exists" note here was stale, `roadmap.md` records iOS 1.0 and macOS 1.0 both APPROVED and live as of 2026-08-23 on the shared Universal Purchase record 6804394619. The landing page links both store pages (`?mt=12` for Mac); if either listing is ever pulled, drop the matching hero button.

## The loop
A /loop works down "Road to v100" in `roadmap.md`. Read `docs/LOOP-HANDOFF.md` first; it has the current state and the restart prompt.

# Quotestreak

Quote guessing game: movies, TV, games, songs, books. Static site on Cloudflare Pages plus native SwiftUI. Two Workers behind it: `duel/` (live duels and spectators, Durable Objects) and the shared jaybulb-api (accounts, scores, friends, clubs, hit rates). Badges, stats and high score stay on the device.

## Stack
Plain HTML/CSS/JS, classic scripts sharing top-level bindings, one file per feature (see `docs/ARCHITECTURE.md` for the map). `quotes.json` has 1,597 lines in 15 genres: 272 hand-seeded, the rest harvested by `scripts/harvest-*.mjs` + `scripts/merge-harvest.mjs`, each harvested line carrying `character` and `source`. 661 lines carry `actor` (matched against the cast list on their Wikiquote page, unambiguous matches only; `scripts/harvest-actors.mjs` + `merge-actors.mjs`) and 895 films carry `director` (Wikidata P57 through the film's Wikipedia article, film and year checked; `harvest-directors.mjs` + `merge-directors.mjs`). 89 songs carry `song`, `album`, `albums` (the artist's other studio albums) and `year` (`harvest-music.mjs`: hand-named songs confirmed on Wikidata or the song's Wikipedia infobox, never Apple's catalog, whose compilations carry wrong dates). Mode keys must be unique: `album` is Album reveal, so Which album is `record`. `scripts/build-site.sh` copies an explicit file list into `dist/`, so new scripts go on that list. Bump `quotestreak-vNN` in `sw.js` every release. Tests: `for t in *.test.js; do node $t; done`. The pre-commit hook rejects files over about 5,000 tokens; split rather than grow `game.js`.

## Family mode (v60)
`family.js` decides kid-safe from data, never taste: films rated G (or PG when the bank calls them cartoons), games rated Everyone / Everyone 10+ / Kids to Adults, TV only if Wikidata says children's series (none yet), songs and book first lines, and a word list on every line. Unrated = out. Ratings come from `scripts/harvest-ratings.mjs` (Wikidata MPA P1657 and ESRB P852 through the title's Wikipedia article) as `rating` in the bank. In family mode the shared modes (Daily, Duel, Cup, Big screen, Library, Champions) hide, since they deal the same unfiltered lines to everyone, and the poster wall shows family titles only. `scripts/clean-bank.mjs` removed harvested junk (cast-list rows, mid-sentence fragments, two-speaker exchanges).

## Access (v59)
`scripts/axe-check.mjs` runs axe-core over every screen of `dist/`, light and dark; keep it at 0 violations. The question and the result are `aria-live`; keys 1 to 4 answer; High contrast (Settings, or the system's Increase Contrast) swaps to pure ink and white with no poster wall. Yellow as text on the light ground uses `--accent-text` (#8a6412), never `--accent-deep`, which fails contrast. Native: the round scrolls at the largest Dynamic Type sizes, the timer ring reads as one value, revealed answers say right or wrong.

## Languages (v58)
`i18n.js` translates the web game into twenty languages without touching the game code: `locales/<code>.json` maps each English interface string (the key) to its translation, and every text node, placeholder and aria-label is translated as it appears, including text the game sets later (a MutationObserver). Templates use `{n}` for numbers and `{x}` for names or titles, which pass through (and are themselves translated when they are interface text, like a badge title). Content never matches a key; `#quote` is `translate="no"`. `i18n/ui.json` is the master list, collected from the screens by `scripts/i18n-collect.mjs` (interface = words found in the page and script source, not in the data files). Add a string: `node scripts/i18n-add.mjs strings.json` with { English: { code: translation } } for all 19 languages; it refuses mismatched placeholders. Every new interface string ships translated. Arabic and Hebrew set `dir="rtl"` and isolate Latin names. The native apps still use `i18n/strings.json` and `Localizable.xcstrings` (four languages).

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
`brand/BRAND.md` is the rulebook, `brand/index.html` the live kit (quotestreak.jaybulb.com/brand/). The short version:

- **Colour:** marquee yellow `#ffcc00` on night ink. Red and green are reserved for wrong and right, which is why the old red brand and the stray blue UI accent are both gone. Text on yellow is always ink. One yellow primary per screen; secondary actions are outlined.
- **Icon:** two opening quote marks on a streak (speed lines), yellow on an ink tile. `Quotestreak.icon` (Icon Composer) is the app icon on iOS and macOS (`ASSETCATALOG_COMPILER_APPICON_NAME: Quotestreak`); the asset catalogs only hold a flattened fallback. Regenerate everything with the brand skill's `make_brand.py`, never by hand. **The tail stays longer than the ball**: a short tail reads as a speech bubble, wedges read as a pause button. Keep the HTML wordmark in the topbar; the mark alone does not name the product.
- **Quip**, the mascot: the mark come to life. `brand/mascot.py` writes four poses (idle, cheer, oops, streak), a `-dark` twin of each with cream limbs, and `brand/Quip.xcassets` (switches by appearance). On the web, pick the twin with `<picture>` or `data-theme`. Outfits (v66): `mascot.py` also writes `brand/outfits/quip-{pose}-{outfit}{,-dark}.svg` (six outfits, unlocked by badges); `dress.js` swaps the chosen one into every Quip by rewriting src/srcset, so new Quip images need no extra code. Hats take the limb ink; bowtie and shades stay ink on the yellow.
- **Quip Sans** is the face, on purpose (Joshua asked for a custom face 2026-10-18, overriding the fleet's system-font rule for this app). `scripts/gen_font.py` builds it from Hanken Grotesk (OFL): renamed, curly quotes redrawn as the mark, figures made proportional. Run `--check` after any change. Web loads it from `brand/tokens.css`; the apps register the bundled TTFs at first use (`Theme.fontsRegistered`) and use `Font.quip(...)`. There is no italic, so quotes are upright Semibold.
- The built app is **Quotestreak.app** (`PRODUCT_NAME`); target, scheme and bundle ids keep the Quotable name. If the Dock shows an old icon after a rebuild, that is LaunchServices caching the bundle id: `lsregister -f` the new app.

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

`ios/Widget/QuotestreakWidget.swift` (v31) is a WidgetKit extension on iOS (small, medium, lock screen) and macOS (small, medium), target `QuotableWidget`, bundle `com.heyitsmejosh.quotable.widget`. It bundles its own `quotes.json` and works the day's line out with `Daily.swift`, a bit-for-bit port of `daily.js` (mulberry32 with UInt32 wrapping for Math.imul), so it needs no app group. It never shows the answer.

Live duels (v33): `Duel.swift` speaks the same room protocol as `duel-client.js` over `URLSessionWebSocketTask`, so the apps and the web duel each other; `DuelViews.swift` is the start/join sheet. On iPhone each duel runs as a Live Activity (`DuelActivity.swift` attributes, drawn by `DuelLiveActivity` in the widget extension; `NSSupportsLiveActivities` in Info.plist). Duel scores stay off the leaderboard, like the web.

Siri (v39): `Intents.swift` has two App Intents ("Give me a quote", "Start a speed round") and the App Shortcuts phrases; the speed round reaches ContentView through the `quotestreak_launch` default. Handoff (v40): ContentView publishes `Game.handoff` (unanswered quote ids, score, streak) as an NSUserActivity of type `com.heyitsmejosh.quotable.game` (listed in each Info.plist) and `Game.resume` picks it up; duels are not handed off.

iMessage (v49): `ios/Messages/` is a Messages extension (`QuotableMessages`, bundle `.messages`). Play five lines, send the score as a bubble whose link is the web challenge link (`ChallengeLink.swift`, the Swift twin of challenge.js); tapping a friend's bubble plays the same lines. The store needs an iMessage app icon set before this ships.

Self-check (no XCTest, no framework):

```
node scripts/daily-expect.mjs > /tmp/daily.json && swiftc -o /tmp/quotablecheck ios/Quotable/Quote.swift ios/Quotable/Game.swift ios/Quotable/SharedStore.swift ios/Quotable/Daily.swift ios/Quotable/ChallengeLink.swift ios/Checks/main.swift && /tmp/quotablecheck quotes.json /tmp/daily.json
```

It checks that the Swift Daily Quote matches `daily.js` day for day, and validates the whole quote bank (4 unique options, answer present, no duplicate quotes, movies have years) and the scoring paths (streaks, the speed multiplier, timeout-as-miss).

## App Store
Listed as **Quotestreak** (app id `6804394619`, bundle `com.heyitsmejosh.quotable`), "Quotable", "Quotely", "Quipster", "Recite" and "Cueline" are all taken by other accounts.

**The product is Quotestreak everywhere** (2026-08-28). The web game used to keep the Quotable name while only the store listing was Quotestreak; that split is gone, every user-facing string on the site now reads Quotestreak. Three things deliberately still say "quotable" and must NOT be renamed:

- The live domain is `quotestreak.jaybulb.com` (Cloudflare Pages). `quotable.heyitsmejosh.com` lapsed with the old domain on 2026-10-13.
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

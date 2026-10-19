# Architecture

Quotestreak is a static web game plus native SwiftUI apps. Two Workers sit behind them: `quotestreak-duel` for live duels and spectators, and the shared `jaybulb-api` for accounts, scores, friends, clubs and per-quote hit rates. See `architecture.svg`.

## Web

`play.html` loads classic scripts in order. They share top-level bindings, so later files can read `quotes`, `score`, `run` and the rest from `game.js`. `auth.js` is the only ES module; it exposes `window.quotableRpc`, `quotableBoard`, `quotableSignedIn` and `quotableDisplayName`.

| File | Owns |
|---|---|
| `game.js` | The loop: load the bank, filters, rounds, scoring, streaks, speed clock, daily, end screen |
| `modes.js` | Era 3 ways to guess: each mode turns a bank entry into a question (`display`, `prompt`, `answer`, `options`) |
| `hints.js`, `match.js` | Hints, and forgiving matching for typed answers |
| `daily.js` | One quote per UTC day from a fixed shuffle |
| `difficulty.js` | Quote ids (FNV-1a of the text) and easy/medium/hard from real hit rates |
| `challenge.js` | Ten-quote challenge links |
| `duel-client.js` | Live duels over `/duel/ws` |
| `spectate.js` | `?watch=CODE`, a read-only view of a duel |
| `cup.js`, `cup-ui.js` | The weekly cup bracket |
| `clubs.js` | Clubs and the club board |
| `badges.js`, `badges-ui.js` | Fifty badges, toasts, the Badges screen |
| `stats.js`, `stats-ui.js` | Hit rates by genre and decade, the history graph |
| `sharecard.js` | The share card image |
| `season.js`, `season-ui.js` | Quarterly seasons: tiers, medals, the ladder (`quotestreak_season` RPC) |
| `art.js` | The poster backdrop and the answer flash |
| `auth.js`, `spark.js` | Sign-in, friends, leaderboards against jaybulb-api |
| `webmcp.js` | Agent tools, see `API.md` |
| `sw.js` | Offline cache. Bump `quotestreak-vNN` every release |

Pure modules (`daily`, `hints`, `match`, `difficulty`, `challenge`, `cup`, `badges`, `stats`, `sharecard`, `season`, `modes`) work in Node too and each has a `*.test.js` next to it.

`scripts/build-site.sh` copies an explicit file list into `dist/`. A new script has to be added there or it 404s in production.

## Workers

`duel/worker.js` routes `quotestreak.jaybulb.com/duel/*` to a Durable Object per room. Players are tagged `player` (two at most), spectators `watch`. Each player's score, question and name ride on the socket attachment, so hibernation loses nothing. Deploy with `cd duel && npx wrangler deploy`.

jaybulb-api lives in its own folder. The Quotestreak tables are `quotestreak_scores`, `_friends`, `_stats`, `_clubs` and `_club_members`, with RPCs under `POST /rpc/quotestreak_*`.

## Native

`ios/Quotable/`: `Game.swift` (the loop, headless), `ContentView.swift`, `Quote.swift`, `Theme.swift`, `Account.swift` (jaybulb-api, Keychain refresh token), `AccountViews.swift`. macOS points at the same sources through `macos/project.yml`. `watchos/` reads the iPhone's last game from the App Group. `kmp/` and `tui/` are smaller clients over the same `quotes.json`.

## Gotchas

- `quotable_*` localStorage keys and `window.quotable*` globals keep the old name on purpose. Renaming them wipes players' scores and breaks the agent tools.
- `game.js` throws if a game element is missing, so it never loads on the landing page.
- Pre-commit rejects files over about 5,000 tokens. Split new UI into its own file instead of growing `game.js`.
- The bundle id `com.heyitsmejosh.quotable` is tied to ASC record 6804394619 and never changes.

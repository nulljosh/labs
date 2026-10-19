# Architecture

Quotestreak is a static web game plus native SwiftUI apps. Two Workers sit behind them: `quotestreak-duel` for live duels and spectators, and the shared `jaybulb-api` for accounts, scores, friends, clubs and per-quote hit rates. See `architecture.svg`.

## Web

`play.html` loads classic scripts in order. They share top-level bindings, so later files can read `quotes`, `score`, `run` and the rest from `game.js`. `auth.js` is the only ES module; it exposes `window.quotableRpc`, `quotableBoard`, `quotableSignedIn` and `quotableDisplayName`.

| File | Owns |
|---|---|
| `game.js` | The loop: load the bank, filters, rounds, scoring, streaks, speed clock, daily, end screen |
| `improv.js` | Said or written: famous lines that were improvised or scripted, with the documented reason (v52) |
| `misquotes.js` | Famous misquotes and the real lines (v23) |
| `modes.js` | Era 3 ways to guess: each mode turns a bank entry into a question (`display`, `prompt`, `answer`, `options`) |
| `hints.js`, `match.js` | Hints, and forgiving matching for typed answers |
| `daily.js` | One quote per UTC day from a fixed shuffle |
| `difficulty.js` | Quote ids (FNV-1a of the text) and easy/medium/hard from real hit rates |
| `challenge.js` | Ten-quote challenge links |
| `duel-client.js` | Live duels over `/duel/ws` |
| `reveal.js` | Poster and album reveal: the blurred art that sharpens |
| `speak.js` | Read quotes aloud with on-device speech (v28) |
| `voice.js` | Answer by voice: listens and picks the option you say (v29) |
| `buzz.html`, `buzz.js` | The phone buzzer for party games on a big screen (v34) |
| `party.html`, `party.js` | The big-screen host in a browser, the web twin of tvos/PartyHost.swift (v42) |
| `packs.js` | Custom packs: the maker, and playing a pack from its link (#pack=, deflated base64url) (v44) |
| `library.js` | Pack library: approved community packs, sending a pack in, and the owner's review queue (v45) |
| `classroom.js` | Classroom packs (speeches, Shakespeare, first lines) and the teacher's CSV results (v46) |
| `stream.html`, `stream.js` | Stream mode: Twitch chat votes, read anonymously from the public chat socket (v47) |
| `champions.js` | Champions: last season's top eight in a bracket of live duels, scores reported by both players (v50) |
| `passplay.js` | Pass and play: turns for two to eight people on one device (v41) |
| `settings.js` | Settings panel and synthesized sound |
| `story.js` | The story card: the title's Wikipedia summary after an answer, holding the game while open (v51) |
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

Pure modules (`daily`, `hints`, `match`, `difficulty`, `challenge`, `cup`, `badges`, `stats`, `sharecard`, `season`, `modes`, `passplay`, `party`, `packs`, `classroom`, `stream`, `champions`, `story`) work in Node too and each has a `*.test.js` next to it.

`scripts/build-site.sh` copies an explicit file list into `dist/`. A new script has to be added there or it 404s in production.

## Workers

`duel/worker.js` routes `quotestreak.jaybulb.com/duel/*` to a Durable Object per room. Players are tagged `player` (two at most), spectators `watch`. Each player's score, question and name ride on the socket attachment, so hibernation loses nothing. A second class, `Party`, at `/duel/party`, routes one big screen and up to eight phones: buzzes go to the screen, questions and reveals go to the phones. Deploy with `cd duel && npx wrangler deploy`.

jaybulb-api lives in its own folder. The Quotestreak tables are `quotestreak_scores`, `_friends`, `_stats`, `_clubs` and `_club_members`, with RPCs under `POST /rpc/quotestreak_*`.

## Native

`ios/Quotable/`: `Game.swift` (the loop, headless), `ContentView.swift`, `Quote.swift`, `Theme.swift`, `Account.swift` (jaybulb-api, Keychain refresh token), `AccountViews.swift`. macOS points at the same sources through `macos/project.yml`. `watchos/` reads the iPhone's last game from the App Group. `kmp/` and `tui/` are smaller clients over the same `quotes.json`.

## Gotchas

- Anything that isn't a real bank game sets `window.quotableOffBoard`: game.js then skips the leaderboard and the high score. Questions that aren't one bank quote carry `noTally` so they don't skew difficulty.

- `quotable_*` localStorage keys and `window.quotable*` globals keep the old name on purpose. Renaming them wipes players' scores and breaks the agent tools.
- `game.js` throws if a game element is missing, so it never loads on the landing page.
- Pre-commit rejects files over about 5,000 tokens. Split new UI into its own file instead of growing `game.js`.
- The bundle id `com.heyitsmejosh.quotable` is tied to ASC record 6804394619 and never changes.

# Quotestreak features, v58 onward

The how and why behind each web feature since v58, moved out of `CLAUDE.md` to keep it under the size limit. One section per milestone or pair.

## Family mode (v60)
`family.js` decides kid-safe from data, never taste: films rated G (or PG when the bank calls them cartoons), games rated Everyone / Everyone 10+ / Kids to Adults, TV only if Wikidata says children's series (none yet), songs and book first lines, and a word list on every line. Unrated = out. Ratings come from `scripts/harvest-ratings.mjs` (Wikidata MPA P1657 and ESRB P852 through the title's Wikipedia article) as `rating` in the bank. In family mode the shared modes (Daily, Duel, Cup, Big screen, Library, Champions) hide, since they deal the same unfiltered lines to everyone, and the poster wall shows family titles only. `scripts/clean-bank.mjs` removed harvested junk (cast-list rows, mid-sentence fragments, two-speaker exchanges).

## Offline packs (v68)
`offline.js` saves the chosen genres' poster and album art, plus the game's own files, into the `quotestreak-offline` cache, which `sw.js` keeps across releases. The service worker serves cross-origin images from it first (art never changes) and falls back to it for same-origin files and the shared jaybulb tokens only when the network fails, so a release never runs on stale scripts. The poster wall's thumbnails are not saved.

## Sync without an account (v69)
Native: `SharedStore.cloudHigh` keeps the best score in iCloud key-value storage (`com.apple.developer.ubiquity-kvstore-identifier`, shared id `$(TeamIdentifierPrefix)com.heyitsmejosh.quotable` on iOS, macOS and visionOS), higher score wins. The iCloud capability was added to bundle id YDHCC4J3S2 on 2026-10-19, so the next archive needs fresh provisioning profiles (`asc signing fetch`). Web: `transfer.js` puts every `quotable_*`/`quotestreak_*` key in a `#sync=` link (the hash never reaches a server); opening it asks first, replaces, and keeps the higher best score.

## Verified bank and submissions (v71, v72)
`scripts/verify-bank.mjs` checks every line without a source against its title's Wikiquote page (80% of its five-word runs must appear) and `--merge` writes the page in as `source`; 1,472 of 1,597 lines now carry one, and the reveal shows a Source link. The first run caught ten bad hand-seeded lines (an ad slogan filed under Twins, a Yogi Berra line under A League of Their Own, misquotes, a theme song) and they were replaced in place with checked lines, so the Daily order held. The 31 film lines still unsourced are real but bleeped or reworded to hide the title; songs have no lyric source we can use. Subtitle checks need a licensed source (OpenSubtitles key), not done. Players suggest lines in Suggest a line (`submit.js`, jaybulb-api `quotestreak_suggest_quote`, five waiting each); the owner approves in the same panel; `scripts/pull-submissions.mjs` folds approved lines into the three bank copies.

## New releases and seasons (v73, v74)
`recent.json` holds lines from this year's and last year's films (`scripts/harvest-recent.mjs`, rerun weekly; no slurs, f-words or stage directions), kept apart from the bank so the Daily never reshuffles. New this week (`recent.js`) deals the same ten to everyone from Monday to Monday UTC. Seasons (`seasons.js`): films tagged `seasons` in the bank by `scripts/harvest-seasons.mjs` (Wikidata genre and release month; Halloween also needs a Wikipedia horror-films category, since Wikidata calls Apocalypse Now horror). The menu shows the Halloween pack Oct 1 to Nov 2, the holiday pack Dec 1 to Jan 6, the summer pack Jun 1 to Aug 31; `?season=holiday` opens one any time. Both packs are ten lines and stay off the leaderboard.

## Sports calls and speeches (v75, v76)
`shelves.js` holds two hand-picked shelves: twelve commentary calls (answer is the moment, checked on its Wikipedia article) and 21 speech lines (answer is the speaker, checked on their Wikiquote page). Lines that failed the five-word-run check stayed out (Mandela's 1964 line, FDR's infamy speech, Clinton's Beijing line, Elizabeth I at Tilbury). Each plays as ten lines off the leaderboard, with its own genre colour set from the script.

## Family profiles (v70)
`profiles.js` keeps several players on one browser. The active player's progress stays in the usual keys, so nothing else changes; switching files those keys under `quotestreak_profiles`, restores the other player's, and reloads. Sound, language, theme, contrast and offline packs belong to the device; family mode belongs to the player. Web only for now.

## Access (v59)
`scripts/axe-check.mjs` runs axe-core over every screen of `dist/`, light and dark; keep it at 0 violations. The question and the result are `aria-live`; keys 1 to 4 answer; High contrast (Settings, or the system's Increase Contrast) swaps to pure ink and white with no poster wall. Yellow as text on the light ground uses `--accent-text` (#8a6412), never `--accent-deep`, which fails contrast. Native: the round scrolls at the largest Dynamic Type sizes, the timer ring reads as one value, revealed answers say right or wrong.

## Languages (v58)
`i18n.js` translates the web game into twenty languages without touching the game code: `locales/<code>.json` maps each English interface string (the key) to its translation, and every text node, placeholder and aria-label is translated as it appears, including text the game sets later (a MutationObserver). Templates use `{n}` for numbers and `{x}` for names or titles, which pass through (and are themselves translated when they are interface text, like a badge title). Content never matches a key; `#quote` is `translate="no"`. `i18n/ui.json` is the master list, collected from the screens by `scripts/i18n-collect.mjs` (interface = words found in the page and script source, not in the data files). Add a string: `node scripts/i18n-add.mjs strings.json` with { English: { code: translation } } for all 19 languages; it refuses mismatched placeholders. Every new interface string ships translated. Arabic and Hebrew set `dir="rtl"` and isolate Latin names. The native apps still use `i18n/strings.json` and `Localizable.xcstrings` (four languages).

## Anime (v77)
`scripts/harvest-anime.mjs` takes two lines per title from Wikiquote's Category:Anime and Studio Ghibli pages (same filters as the new-release harvest), film or series and year from Wikipedia categories. Hand fixes after the run: Your Name, The Girl Who Leapt Through Time and The War of the Rohirrim are films; Underworld: Endless War (not anime), Moetan and a voice-cast row came out. The genre is `anime`, sakura pink with ink text, mirrored in `Theme.swift`. It is not part of the all-genres badge, so nobody loses that badge.

## Stand-up (v78)
Thirty classic one-liners from thirteen comics (Hedberg, Wright, Dangerfield, Rivers, Carlin, Rock, Mulaney, Izzard, Groucho, Youngman, Emo Philips, Rudner, Handey), the third shelf in `shelves.js`. Automatic picks were too often interview answers or crude, so `scripts/harvest-standup.mjs` only prints candidates and a person picks; every pick was then found word for word on the comic's Wikiquote page. Podcasts have no usable quote source yet.

## Live show (v81)
`show.js`: every Sunday at 18:00 UTC, twelve questions on one clock (15 seconds to answer, 5 to see the answer). Nothing drives it from a server: each browser works out the live question from the time, corrected by the server's Date header, so late joiners land on the live question. A right answer scores 10 plus up to 10 for speed; the total goes to mode `show-<date>` and the board shows under the panel. The twelve lines are a seeded walk of the whole bank keyed by the date, so the show hides in family mode like the cup. `/play?show=now` runs a practice show at once, off the board.

## Guest packs (v82)
The owner can feature any approved pack in the Pack library (`quotestreak_feature_pack`, a `featured` column added by ALTER TABLE on 2026-10-19). Featured packs lead the list with a dot and the maker's leaderboard name as the credit. The French, German, Italian and Portuguese "1 play" strings had made the line count singular too; fixed.

## Invite links (v83)
Challenge links now go to `/c?c=&s=&n=` (`functions/c.js`), a landing page rendered on the server so link previews in Messages, Discord and WhatsApp say who scored what and show the first line. Take the challenge goes to `/play` with the same query. The web share and the native `ChallengeLink.url` both build `/c` links; old `/play?c=` links still work.

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

## Press kit (v84)
The brand kit page has a Press section: a fact paragraph, a 15-second gameplay video, six screenshots and downloads, all in `brand/press/`. `scripts/press-kit.mjs` regenerates them from the live site (pre-earned badges so no toast lands in a shot, family mode so no sworn line does, the first two seconds of video trimmed). Reviewing its first run caught a junk Riven line and a speaker prefix in Metal Gear; both fixed in the bank.

## Embed (v85)
`/embed` is today's Daily Quote as an iframe card (`functions/embed.js`), playable in place, cached until midnight UTC, `frame-ancestors *`. The snippet is in `docs/API.md` and on the brand page's Press section.

## Daily quote by email (v86)
The Daily result screen has an opt-in form (`newsletter.js`). jaybulb-api (`src/qs-newsletter.js`) stores the address as pending and mails a confirm link; the link opens a page with a button and only that POST turns mail on, so link scanners can't sign anyone up. Links are HMACs of the address; nothing secret is stored. One confirm mail per address per hour, and the subscribe call shares the per-IP auth limiter. The send rides the daily jobs call that atlin's GitHub Actions makes at 16:00 UTC (the Cloudflare account is out of free cron triggers): if that workflow stops, so does the mail. At most 90 a day (Resend's free tier); move to a Resend broadcast past a few hundred. `test/qs-newsletter.mjs` in jaybulb-api checks the whole flow against `wrangler dev`. Still owed: one real signup to see the mail land.

## Fair play (v87)
Scores are checked on the server (jaybulb-api `src/qs-fairplay.js`). A game takes a signed token when it starts (`quotestreak_game_start`, board `normal`, `speed`, `cup-<week>` or `show-<date>`) and hands in its run at the end (`quotestreak_submit_score`: line id, pick and points per question). The server refuses a forged, foreign or reused token, a pace faster than the game's own 1.1 s between questions, point values the board can't award, points that don't add up, repeated lines, and in classic rounds any point for a pick that isn't the bank's answer. Other ways to guess and typed answers get the structural checks only, since their answers differ from the bank's or are fuzzy. Direct writes to `quotestreak_scores` are closed. The web hook is `window.quotableGameToken` (not `quotableStartGame`, which is the WebMCP binding). Native `Game.run` and `Account.beginGame/submit` do the same and ship with the next build.

## Moderation (v88)
jaybulb-api (`src/qs-moderation.js`) checks every public text a player writes: a rude club name or pack title is refused ("pick another name"), a rude board name still scores but shows as Player. The word list is short (slurs and the worst words), matched as whole words after folding look-alike characters, so Scunthorpe and class pass. The owner gets a Moderation button (`moderation.js`, hidden for everyone else) listing board names and clubs, each with Rename. Packs and suggested lines already wait in the owner's review queues (v45, v72).

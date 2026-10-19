# Coda features, v58 onward

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

## Guest packs (v82)
The owner can feature any approved pack in the Pack library (`quotestreak_feature_pack`, a `featured` column added by ALTER TABLE on 2026-10-19). Featured packs lead the list with a dot and the maker's leaderboard name as the credit. The French, German, Italian and Portuguese "1 play" strings had made the line count singular too; fixed.

## Invite links (v83)
Challenge links now go to `/c?c=&s=&n=` (`functions/c.js`), a landing page rendered on the server so link previews in Messages, Discord and WhatsApp say who scored what and show the first line. Take the challenge goes to `/play` with the same query. The web share and the native `ChallengeLink.url` both build `/c` links; old `/play?c=` links still work.

## Press kit (v84)
The brand kit page has a Press section: a fact paragraph, a 15-second gameplay video, six screenshots and downloads, all in `brand/press/`. `scripts/press-kit.mjs` regenerates them from the live site (pre-earned badges so no toast lands in a shot, family mode so no sworn line does, the first two seconds of video trimmed). Reviewing its first run caught a junk Riven line and a speaker prefix in Metal Gear; both fixed in the bank.

## Embed (v85)
`/embed` is today's Daily Quote as an iframe card (`functions/embed.js`), playable in place, cached until midnight UTC, `frame-ancestors *`. The snippet is in `docs/API.md` and on the brand page's Press section.

## Fair play (v87)
Scores are checked on the server (jaybulb-api `src/qs-fairplay.js`). A game takes a signed token when it starts (`quotestreak_game_start`, board `normal`, `speed` or `show-<date>`) and hands in its run at the end (`quotestreak_submit_score`: line id, pick and points per question). The server refuses a forged, foreign or reused token, a pace faster than the game's own 1.1 s between questions, point values the board can't award, points that don't add up, repeated lines, and in classic rounds any point for a pick that isn't the bank's answer. Other ways to guess and typed answers get the structural checks only, since their answers differ from the bank's or are fuzzy. Direct writes to `quotestreak_scores` are closed. The web hook is `window.quotableGameToken` (not `quotableStartGame`, which is the WebMCP binding). Native `Game.run` and `Account.beginGame/submit` do the same and ship with the next build.

## Moderation (v88)
jaybulb-api (`src/qs-moderation.js`) checks every public text a player writes: a rude pack title is refused ("pick another name"), a rude board name still scores but shows as Player. The word list is short (slurs and the worst words), matched as whole words after folding look-alike characters, so Scunthorpe and class pass. The owner gets a Moderation button (`moderation.js`, hidden for everyone else) listing board names and clubs, each with Rename. Packs and suggested lines already wait in the owner's review queues (v45, v72).

## Fast (v91)
Cold start on production went from about 400 ms to about 240 ms (navigation to a playable menu, measured with a fresh cache; about 230 to 320 ms at 4x CPU throttle). The shared jaybulb tokens were a cross-origin `@import` that held every script until ~300 ms; they are now `brand/jaybulb-tokens.css`, refreshed from jaybulb.com at each build with the last good copy committed, and the CSS chain is preloaded. The bank ships minified and preloaded from the head; the poster wall decodes async at low priority. The 53 scripts stay separate on purpose: one bundle would let a single feature that throws on an old browser take the whole game down.

## Sync that never loses (v92)
A transfer link now merges instead of replacing (`transfer.js` `combine`): best score and every counter keep the larger, accuracy pairs keep each side's larger count, lists (watchlist) join one of each, the daily streak keeps the later day, profiles join with this device's player still active, and this device keeps its own settings while missing ones come over. Native keeps the larger best score through iCloud on every sync.

## Audit (v93)
See `docs/AUDIT.md`: escaping checked at every markup sink, security headers and a script CSP on every static page, the answer tally limited to real lines and 120 a minute, and the privacy page brought up to date.

## Motion and sound (v94)
`docs/MOTION.md` writes the system down: three motion speeds and one curve as tokens in `brand/tokens.css`, used by the game's animations; a global reduced-motion rule (the seven-second reveal is exempt, since it is the game); and a sound kit, `sound.js`, of six named cues (right, streak, wrong, tick, badge, over) that replace the two raw beeps.

## Quip lives (v95)
`quip-live.js` draws Quip in code, a line-for-line port of `brand/mascot.py`; its test checks all eight pose files match byte for byte, so the brand can't drift. A small Quip sits in the round card's corner: he blinks while you think (not with reduced motion), cheers a right answer, leans in on every fifth in a row, sweats a miss, and goes wide-eyed in a speed round's last three seconds. Outfits stay on the image Quips.

## Archive (v96)
Past dailies (`archive.js`, from the Daily result screen) lists every Daily Quote so far, newest first, each the same line everyone got that day (`Daily.quoteFor`). Playing one never touches the daily streak, the board or the difficulty tally; the archive keeps its own right or missed per day. Day one has no past, so the list fills from 2026-10-20. Wrappers of `window.quotableBadge` must load after `badges-ui.js`, which sets the base hook; archive.js first loaded before it and was silently dropped.

## The book (v99)
`WHITEPAPER.md` is in its second edition, rewritten at v99 for the game as it is now: the checked bank, the ways to guess, shared clocks with no server state, fair scores, the device, the languages and open data, security and privacy. `/roadmap` is the public roadmap, built from `roadmap.md`'s Road to v100 section on every deploy (`scripts/build-roadmap.mjs`), filled dots for live milestones, notes under the blocked ones.

## Coda 100 (v100)
The bank passes ten thousand: `quotes-more.json` holds 12,737 lines on top of the core 1,697. Films come from every page in Wikiquote's year categories since 1930 (`harvest-more.mjs`), shows and games from its decade and year categories (`harvest-more-tv.mjs`), and two deepen passes take more lines from titles already in either bank (`harvest-deepen.mjs`). `merge-more.mjs` builds the file: wrong answers share type and genre, a seeded walk so reruns match, and it drops cast rows, fragments, shouting, drawn-out noises and lines that name their own title. The game loads it after the first round (at once for challenge, duel and watch links, which may point at it), and `core` stays fixed so the Daily never reshuffles. Fair play on jaybulb-api checks answers against both banks. `event.js` runs the birthday: on October 18 (or `?birthday`) Quip wears a party hat and confetti falls.

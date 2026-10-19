# Coda Roadmap

- [ ] Verify iPad layout visually on simulator -- 2026-09-02. `TARGETED_DEVICE_FAMILY = "1,2"`
  already set; iOS `ContentView` uses `NavigationStack` with flexible frames throughout
  (only card/button-level fixed widths, not page-level), so it should scale reasonably, but
  nobody has actually seen it on an iPad screen. This machine's Xcode only has the iOS 26.5
  SDK with the iOS 26.2 runtime downloaded, so `xcodebuild` won't recognize any simulator
  destination even by explicit UDID -- needs the matching platform component installed,
  then a screenshot check (menu, round, game-over, speed-round clock).

## Road to v100

One major version per milestone. Each one ships on the web first (deploy the same day), then iOS and Mac in the next store batch. Only one store build is in review at a time, so native majors queue and go out together. A milestone is done when it is live, tested, and its line is checked here.

### Era 1: a deeper game (2 to 10)
- [x] **v8 First lines.** Name the book from its opening sentence.
- [x] **v9 Decades.** Filter by decade, from the 1930s to now.
- [x] **v10 Real difficulty.** Easy, medium and hard, ranked from what players actually get right.

### Era 2: play with people (11 to 20)
- [x] **v11 Challenge link.** Send ten quotes to a friend; they play the same ten and see your score.
- [x] **v12 Live duels.** Real-time one on one through a Durable Object lobby.
- [x] **v13 Friends.** Add friends and see a friends-only leaderboard.
- [x] **v14 Weekly cup.** Built, then removed on 2026-10-19: it needs a crowd the game does not have yet.
- [x] **v15 Clubs.** Built, then removed on 2026-10-19: it needs a crowd the game does not have yet.
- [x] **v16 Badges.** Fifty achievements drawn in Quip's style.
- [x] **v17 Stats.** Accuracy by genre and decade, best streaks, a history graph.
- [x] **v18 Share cards.** A generated image per game with the right Quip pose.
- [x] **v19 Spectate.** Watch a live duel.
- [x] **v20 Seasons.** A ranked ladder each quarter with cosmetic Quip rewards.

### Era 3: new ways to guess (21 to 30)
- [x] **v21 Who said it.** Name the character, not the movie.
- [x] **v22 Finish the line.** Fill in the missing word.
- [x] **v23 Misquotes.** Spot the famous line everyone gets wrong.
- [x] **v24 Timeline.** Which of four came out first?
- [x] **v25 Poster reveal.** A blurred poster sharpens until you name it.
- [x] **v26 Album reveal.** The same for album covers.
- [x] **v27 Name the year.** Pick the release year from four.
- [x] **v28 Quip reads it.** On-device speech reads each quote aloud.
- [x] **v29 Answer out loud.** Voice answers for hands-free play.
- [x] **v30 Marathon.** One long run through every genre with three lives.

### Era 4: every screen (31 to 40)
- [x] **v31 Widgets.** The daily quote on the iPhone, iPad and Mac home screen.
- [x] **v32 Watch.** Play the daily quote on Apple Watch.
- [x] **v33 Live Activities.** Live duels on the apps, with both scores on the lock screen and in the Dynamic Island. (The cup joins it once the apps have the cup.)
- [x] **v34 Apple TV.** A living-room game with phones as buzzers.
- [x] **v35 Vision Pro.** The poster wall around you.
- [ ] **v36 Google Play.** The Android app in the Play Store. *Waiting on a Play developer account.*
- [ ] **v37 Microsoft Store.** The Windows app in the Store. *Waiting on a Microsoft developer account.*
- [ ] **v38 Flathub.** The Linux app on Flathub. *Waiting on the Flathub submission.*
- [x] **v39 Siri and Shortcuts.** "Give me a quote" and "start a speed round".
- [x] **v40 Handoff and sync.** Start on the phone, finish on the Mac.

### Era 5: parties (41 to 50)
- [x] **v41 Pass and play.** Up to eight players on one device.
- [x] **v42 Room codes.** Phones join a big-screen game with a four-letter code.
- [x] **v43 Quiz night.** Rounds, a host screen and a final scoreboard.
- [x] **v44 Custom packs.** Build a quote pack and share it by link.
- [x] **v45 Pack library.** Browse and play moderated community packs.
- [x] **v46 Classroom.** Literature and speech packs with a teacher view.
- [x] **v47 Stream mode.** Built, then removed on 2026-10-19: it needs a crowd the game does not have yet.
- [ ] **v48 Discord.** A Discord Activity. *Waiting on a Discord developer application.*
- [x] **v49 iMessage.** Play a round inside a conversation.
- [x] **v50 Champions.** Built, then removed on 2026-10-19: it needs a crowd the game does not have yet.

### Era 6: know more (51 to 60)
- [x] **v51 The story.** After each answer, a card on the scene and why the line stuck.
- [x] **v52 Said or written.** Which famous lines were improvised.
- [x] **v53 Actor mode.** Name who delivered it.
- [x] **v54 Director mode.** Name who directed it.
- [x] **v55 Album and year.** Deeper music questions.
- [x] **v56 Phrases.** Lines that entered everyday speech, with their origins from Wordroot.
- [x] **v57 Original languages.** Italian and French films in their own words. (Spanish, German, Japanese and Korean wait on enough films on their Wikiquotes.)
- [x] **v58 Twenty languages.** The whole interface, with fonts that cover every script.
- [x] **v59 Access for all.** VoiceOver play, Switch Control, the largest text sizes and a high-contrast theme.
- [x] **v60 Family mode.** A bank safe for kids.

### Era 7: it learns you (61 to 70)
- [x] **v61 Practice.** Missed quotes come back until you know them.
- [x] **v62 Suggestions.** Know 80s action? Try 80s comedy.
- [x] **v63 Watchlist.** Movies you missed saved to a list you can export.
- [x] **v64 Taste card.** Your genres and decades on one card.
- [x] **v65 Year in quotes.** An end-of-year recap.
- [x] **v66 Dress Quip.** Hats and outfits, always on brand.
- [x] **v67 Themes.** Marquee, noir and drive-in, each within the brand.
- [x] **v68 Offline packs.** Download packs for flights.
- [x] **v69 Sync without an account.** iCloud for players who never sign in.
- [x] **v70 Family profiles.** Several players on one device.

### Era 8: the content engine (71 to 80)
- [x] **v71 Verified bank.** Every line checked against subtitles, with its source shown.
- [x] **v72 Submissions.** Players suggest quotes through a review queue.
- [x] **v73 New releases.** A pack of recent films every week.
- [x] **v74 Seasons of film.** Halloween, holiday and summer packs.
- [x] **v75 Sports.** Famous commentary calls.
- [x] **v76 Speeches.** History in its own words.
- [x] **v77 Anime.** An anime category.
- [x] **v78 Stand-up.** Comedy specials and podcasts.
- [x] **v79 Open API.** The quote of the day and the bank through /api and /mcp.
- [x] **v80 Open data.** Publish the verified metadata where the licence allows.

### Era 9: a show (81 to 90)
- [x] **v81 Live show.** Built, then removed on 2026-10-19: nobody asked for it.
- [x] **v82 Guest packs.** Featured packs from creators.
- [x] **v83 Invite links.** A landing page for every challenge.
- [x] **v84 Press kit.** Brand kit two with video and screenshots.
- [x] **v85 Embed.** A daily-quote widget for any website.
- [x] **v86 Newsletter.** Built, then removed on 2026-10-19: it needs a crowd the game does not have yet.
- [x] **v87 Fair play.** Scores checked on the server.
- [x] **v88 Moderation.** Tools for packs, names and clubs.
- [ ] **v89 Supporter pack.** An optional one-dollar cosmetic pack, nothing locked. *Waiting on payments: a $1 web checkout and a $0.99 in-app purchase need setting up first.*
- [ ] **v90 Store in twenty languages.** Localized listings and screenshots. *Waiting on App Review: the listings can change once 1.3.0 is out, with the next version.*

### Era 10: the hundred (91 to 100)
- [x] **v91 Fast.** Cold start under 300 ms and a smooth wall on old devices.
- [x] **v92 Sync that never loses.** Conflict handling across every device.
- [x] **v93 Audit.** Security and privacy review, start to finish.
- [x] **v94 Motion and sound.** A written motion system and a sound kit.
- [x] **v95 Quip lives.** Quip reacts everywhere, drawn in code.
- [x] **v96 Archive.** Every past daily quote playable.
- [x] **v97 Hall of fame.** Built, then removed on 2026-10-19: it needs a crowd the game does not have yet.
- [ ] **v98 Certified access.** A full outside accessibility audit. *Waiting on an outside auditor. The internal WCAG 2.2 pass is done and its fixes are live (docs/ACCESSIBILITY.md).*
- [x] **v99 The book.** Whitepaper two and a public roadmap page.
- [x] **v100 Coda 100.** Ten thousand verified quotes and Quip's birthday.

## TODO, next time you are at a real Mac

Left over from the 2026-09-01 art-flash fix. None of it can run in a Claude Code web
session (no Swift toolchain; TMDB/iTunes/mzstatic are refused by the egress policy).

- [ ] `TMDB_API_KEY=... node scripts/fetch-tmdb-art.mjs`, the 3 remaining movie-side
      gaps are TV series; the script now falls through to /search/tv.
- [ ] Ship as 1.2: `asc workflow run ship-ios VERSION:1.2.0`.

## App Store status
1.1 (2026-08-31) brings the native apps to parity with the web game: sound effects with a volume
slider, the album/poster art flash on a correct answer, the points earned in the feedback line,
the four locales, and the correct share URL (it pointed at the dead github.io page).

v1.0 is **READY_FOR_SALE** on both platforms. v1.1 (the web-parity release) was submitted
2026-08-31 on the shared Universal Purchase record 6804394619; **macOS is APPROVED** (review
completed 2026-09-01, submission 47cc07eb-4fec-46e6-aac0-658d45e49ffc), iOS still in review.

The art-flash reliability fixes are **not in the 1.1 builds**, they land in 1.2. In 1.1 the
flash often does not appear: the native `ArtFlash` only started its fetch once the answer was
picked, giving it under a second to pull a full-size poster, and back-to-back correct answers
let the previous dismiss timer cancel the new flash. Both are fixed on the branch, unbuilt.
Blockers solved: generated full ICNS appiconset with 512pt@2x (Mac App Store requirement exceeds iOS),
captured macOS screenshots via CGWindowListCopyWindowInfo window ID lookup (no AppleScript
System Events). Both submitted 2026-08-23 (iOS build 202608230326, macOS build 202608230338).

## Localization
One source, `i18n/strings.json`, generates both `locales/*.json` (web) and
`ios/Quotable/Localizable.xcstrings` (iOS + macOS) via `node scripts/i18n-gen.mjs`. en/fr are
complete; zh/pa cover 8 of 22 keys and fall back to English for the rest.

## Quote bank
272 entries (178 movie, 94 music). Movie art backfills via
`TMDB_API_KEY=... node scripts/fetch-tmdb-art.mjs`; music `art` uses iTunes Search URLs. `art` is
optional, both `game.js` and the native `ArtFlash` no-op when absent, which is exactly the
problem: 48 entries (45 music, 3 movie) have no `art`, so ~18% of correct answers flash nothing.
Close that with `node scripts/fetch-itunes-art.mjs` (music, no API key) and a re-run of
`fetch-tmdb-art.mjs` (the 3 stragglers are TV series, and the script now falls through to
TMDB's /search/tv, which is why /search/movie never matched them). Both need network, so
neither runs in a Claude Code web session.

Remaining gaps from the original dad-pass note: spaghetti westerns beyond The Good, the Bad and
the Ugly; more Merle Haggard / Waylon Jennings on the country side.

Run the self-check after any bank edit, it catches duplicate quotes, which the bank had 32 of
before 2026-08-23:

```
swiftc -o /tmp/quotablecheck ios/Quotable/Quote.swift ios/Quotable/Game.swift ios/Checks/main.swift && /tmp/quotablecheck quotes.json
```

## Ideas, unscheduled
- Game Center leaderboard for the speed round. Deliberately skipped for 1.0, content depth was
  the cheaper answer to 4.2 than a new subsystem.
- Grow the bank from a free quotes dataset rather than hand-seeding.

## WebMCP + REST API rollout -- shipped 2026-08-27

Done. 5 tools: `get_high_score`, `get_game_state`, `start_game`,
`answer_question`, `next_question`. Nothing gated -- worst case is a
restarted game.

See `docs/API.md` for the full tool table, linked from the README.

## /api + /mcp blocked on hosting

Cannot ship Cloudflare Pages Functions here: quotable.heyitsmejosh.com serves from GitHub
Pages (`server: GitHub.com`), and there is no `quotestreak` Cloudflare Pages project. The
`random_quote` / `list_tags` pair is ready to write against quotes.json the moment the site
moves to Pages, see conway (2026-08-31) for the template. Migrating hosting is the
prerequisite, not the endpoint work.
# Roadmap

> Everything above about the API being blocked on hosting is SUPERSEDED by the section
> below: the move to Cloudflare Pages happened on 2026-08-31 and the endpoints are live.

## /api + /mcp surface, SHIPPED 2026-08-31

Live at `quotable.heyitsmejosh.com/api` and `/mcp`. Tools: `list_genres`, `random_quote`,
`search_quotes`, all reading `quotes.json` out of the bundle. Both surfaces call `callTool()`
in `src/lib/tools.js`. Check: `node src/lib/tools.test.mjs`.

The blocker was the host, not the code: the site was on GitHub Pages, which runs no
Functions. It now lives on the Cloudflare Pages project `quotestreak`,
quotable.heyitsmejosh.com repointed, and GitHub Pages plus its deploy workflow are gone so
there is exactly one live site. Deploy with `sh scripts/build-site.sh && npx wrangler pages
deploy` from the repo root, wrangler needs the root for `functions/`, and `dist/` is the
web subset (the repo root also holds ios/, macos/, metadata/).

Pages serves extensionless URLs, so `/play.html` now 308s to `/play`. Old links still work.

- [ ] ship-ios workflow: export step fails on App Groups with the stale manual profile; drop --export-options and add `--xcodebuild-flag -allowProvisioningUpdates` (done by hand for 1.2.1)

## Accounts + leaderboard (web live 2026-09-02)
Supabase (shared `spark` project): table `quotestreak_scores` (RLS: anyone reads, only own inserts), view
`quotestreak_leaderboard` (best score per user per mode). Web has email/password + Google. `auth.js`, wired
from `game.js` at game over.

- [ ] Apple sign-in on WEB: needs a Services ID + .p8-signed secret on spark (authorize returns 400).
      Blocked on Joshua (Apple Developer portal). Runbook in ~/Documents/Code/roadmap.md "Apple sign-in on WEB".
- [ ] 1.2.2 ship attempt 2026-09-03 (iOS Settings sheet UI change) BLOCKED on signing: iOS automatic-signing
      archive still resolves to "iOS Team Provisioning Profile" (dev-team default), which lacks Sign In with
      Apple / com.apple.developer.applesignin, even after `asc signing fetch --create-missing` made a fresh
      IOS_APP_STORE profile with the entitlement and it was dropped in
      ~/Library/MobileDevice/Provisioning\ Profiles/. Automatic signing (`CODE_SIGN_STYLE: Automatic` in
      ios/project.yml) doesn't pick it up from disk, it wants Xcode's own account-managed profile, which
      means the Sign In with Apple capability isn't actually enabled on the App ID in the Apple Developer
      portal (App IDs > com.heyitsmejosh.quotable > capabilities). macOS archive fails separately: no Mac
      App **Development** profile exists at all (only the App Store one asc created), needed even for an
      archive build under automatic signing. Blocked on Joshua: enable Sign In with Apple on the iOS App ID
      in the portal, and either flip both targets to manual signing (point directly at the asc-fetched
      profiles) or let Xcode auto-generate a Mac dev profile once signed into the Apple ID in Xcode.
- [ ] Scores are client-reported; no anti-cheat. Add a server-side check only if the board gets gamed.

## TUI pilot (2026-09-05)
- `quotestreak-tui` SwiftPM target (SwiftTUI). `swift build && ./.build/debug/quotestreak-tui` pulls one round from /api/random and shows the quote + marked answer. Not a guessing loop. Needs a real TTY.

## Ingested 2026-10-05
- [ ] QA

## Ingested 2026-10-16
- [ ] Stale App Store screenshots. (screenshot: notes/attachments/2026-10-16/app-store-screenshots-3.png)

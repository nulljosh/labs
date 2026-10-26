# Horula roadmap

v1 is live: full iOS Clock parity (see `GAPS.md`, 22 of 22). Every version below ships on its own: tested headless at 390px in light and dark, deployed with `./deploy.sh`, `CACHE` bumped in `sw.js`, tagged `horula-vN.0.0` (`clock-v1` to `v5` before the rename). Web only, no build, no dependencies, no account. Every version also closes the open `GAPS.md` round 2 lines (iOS 26 and macOS Clock) that fit it.

## v2: a floor under it
- [x] `node --test` suite for the pure parts: repeat text, next alarm, sunrise and sunset, timer end times, lap best and worst.
- [x] Accessibility pass: every control labelled, visible focus ring, reduced motion stops the sweep glide, ringing view traps focus.
- [x] Version shown in a new Settings sheet, read from one constant.
- [x] Four tabs like iOS Clock (World Clock, Alarms, Stopwatch, Timers), each with an icon and a label; the clock face leads World Clock.
- [x] Round header buttons like iOS, one header height on every tab, spacing on the 8 point grid.
- [x] System type: SF, then Lato, then Helvetica. Bundled fonts removed.

## v3: world clock you can plan with
- [x] Each city shows day or night (sun or moon from its real sunrise, coordinates from IANA zone.tab) next to its offset, like iOS.
- [x] Scrub: drag a slider and every city's time moves with it, to find a meeting hour.
- [x] Tap a city to see its sunrise, sunset and hours of daylight.

## v4: alarms you trust
- [x] Alarm sound fades in over 30 seconds instead of starting loud.
- [x] Skip just the next ring of a repeating alarm.
- [x] Vibrate on phones that allow it.
- [x] Warn once, in plain words, that a closed tab cannot ring.
- [x] Snooze length from 1 to 15 minutes, Edit mode deletes alarms, iOS sleep row with Change. Fixed: Delete in the sheet could overwrite another alarm.

## v5: your clock, backed up
- [x] Export everything (alarms, cities, timers, sleep) to one file and import it on another device.
- [x] Links that do things: `app.html#timer=10m` starts a timer, `#alarm=07:30` adds an alarm, so Shortcuts and bookmarks can drive it.
- [x] Keyboard shortcuts on every tab, listed behind `?`.

## v5.1: landing that moves
- [x] Header gets a real background, sections scroll with parallax art.
- [x] Feature rows show the app working (live demo mode, looping), not still art.

## v6: native on the App Store
- [x] Find a name Apple accepts: Horula (Latin, "little hour"; Clock was taken). One name everywhere: store, site, folder.
- [x] SwiftUI app for iPhone and Mac with the same tabs, alarms that ring when the app is closed (AlarmKit), timers, stopwatch. iPad later (needs its own screenshot set).
- [x] Widgets: Home Screen, Lock Screen and StandBy (world clocks, next alarm), Live Activity for snooze and timers.
- [ ] Apple Watch app: built (world clock, stopwatch, timers, face widgets), screenshots taken (apple/shots/watch-up, gitignored). Ships in 6.1 right after 6.0 is approved: embed HorulaWatch in the iOS target, bump, upload, add the Watch Ultra set, submit.
- [x] Icon Composer icon, screenshots, privacy, submitted for review. iPhone 2026-10-25; Mac 2026-10-25 evening (shots via scripts/mac-tour.sh).

## v7: everywhere else
- [ ] Windows: installable from the Microsoft Store (packaged web app). Parked: needs Joshua's Microsoft Partner Center account.
- [ ] Linux: Flatpak and a .deb that open the same app.
- [ ] Joshua Tree: a native Horula for the Joshua Tree OS.

## v8: nightstand faces
- [x] Choose a face: big digits, analog, or a sun dial that tracks the day.
- [x] Pixels drift a little every minute so a screen left on all night does not burn in.
- [x] Dim slider right on the nightstand.

## v9: timers that do more
- [x] Preset timers you name and pin (tea 4:00, pasta 9:00).
- [x] Interval timer: work and rest rounds with a different sound for each.
- [x] Copy or download stopwatch laps as a table.

- [x] Native parity for v9: presets, intervals and lap copy in the iPhone and Mac app.

## v10: every language
- [x] UI text in English, French, Spanish, German, Japanese, Chinese, Portuguese, Korean, Italian, Dutch, Arabic, Hindi.
- [x] Right to left layout for Arabic.
- [x] City search works in the local language, and cities show in it (15.2.0: cities/<code>.js from CLDR and Wikidata, scripts/gen_cities.mjs).
- [x] The native app shows and searches cities in the reader's language too, from the same tables (apple/Shared/cities-<code>.json, ships in 6.1).

## v11: a clock for other pages
- [x] `embed.html?city=Tokyo` gives a small live clock any site can drop in.
- [x] Countdown embed to a date, for launches and birthdays.
- [x] Embeds follow light and dark and need no script on the host page.

## v12: done right
- [x] Lighthouse 100 on performance, accessibility, best practices and SEO for both pages. The app got there in 15.1.0 by loading only the reader's language file.
- [x] Landing refreshed for everything v2 to v11 added, with new art where a section needs it.
- [x] README, WHITEPAPER and CLAUDE.md current.
- [x] Launch kit in horula/launch/: Product Hunt, Show HN, X and three Reddit drafts, a gallery and a checklist. Posting is Joshua's.

## v13: a map of the day
- [x] World Clock has a map, like macOS Clock: every known city as a dot, night shaded by the real line between day and night, your cities named with their time.
- [x] Same map in the Mac app.

## v14: the stopwatch dial, like iOS
- [x] Analog stopwatch gets a small minute dial and a blue lap hand, like the iOS analog stopwatch.
- [x] The iPhone and Mac app get the analog stopwatch too (tap the digits to switch, like the web).

## v15: hear it before you pick it
- [x] Choosing an alarm or timer sound plays it once, like iOS.
- [x] Two more sounds, drawn in Web Audio like the others.

## v16: native in every language
- [x] The iPhone and Mac app in the same twelve languages, from a String Catalog.
- [x] App Store listing text in the same languages (docs/store, one file per locale, for 6.1).

## v17: tell people
- [x] Launch kit in horula/launch/: Product Hunt, Show HN, X and three Reddit drafts, a gallery and a checklist. Posting is Joshua's.

## v18: the World face
- [x] Nightstand gets StandBy's fourth face, World: every city as a dot, bright where the sun is up, you marked, the time below (GAPS 35). Web and native.

## v19: the Watch catches up
- [x] Timers open on a grid of quick timers, like watchOS (GAPS 36).
- [x] Alarms on the Watch: list, switches, ring by notification (GAPS 37).

## v20: the Watch gets the rest
- [x] Custom tile on the Watch timer grid, hours and minutes (GAPS 38).
- [x] Analog stopwatch on the Watch, the same dial as the phone, now in Shared (GAPS 39).

## Gap matrix (/mobbin, 2026-10-25)
App Store screens of Alarmy, Rise, Sleep Cycle, MultiTimer, Timer+, World Clock Time Widget, timeanddate World Clock and Flip Clock, set beside ours. Skipped: ads, paywalls, sleep tracking by microphone, social, per-timer colours (blue only). One row per minor version, web and native together. 22.0.0 ships when every row is done and the apple skill's checks pass on every screen.

| v | Gap | Who has it | Size | Status |
|---|---|---|---|---|
| 21 | +1 min on a running timer | Timer+ | S | done |
| 21.1 | Your own name for a city ("Mum", "Office") | World Clock Time Widget | S | done |
| 21.2 | Count down to a date ("Vacation, 1 month 29 days") | Timer+, MultiTimer | M | done |
| 21.3 | Daylight saving dates in the city detail | timeanddate | S | done |
| 21.4 | Watch: edit an alarm (time, repeat, label, snooze) and a city detail with sunrise and sunset, like watchOS Clock | watchOS Clock | S | done |
| 21.5 | Hourly chime on the nightstand | Flip Clock | S | done |
| 21.6 | Flip digits face on the nightstand | Flip Clock | M | done |
| 21.7 | Spoken interval cues ("Rest. Up next: work") | Timer+ | S | done |
| 21.8 | Wake up check: a second ring a few minutes after you stop an alarm unless you confirm | Alarmy, Rise | M | done |
| 21.9 | Routines: named timer steps that run in order | Timer+ | M | done |
| 21.10 | Sleep sounds made on device (rain, brown noise) with a sleep timer | Alarmy, Sleep Cycle, Flip Clock | M | done |
| 21.11 | Alarm missions (solve a sum to stop) | Alarmy, Rise | L | done |

## v21: one more minute
- [x] +1 min on every running or paused timer, web, iPhone, Mac and Watch (matrix row 21).

## v21.1: your own name for a city
- [x] A Name field in the city sheet, web, iPhone and Mac; rows, the map, the Watch and backups carry it, empty goes back to the real name (matrix row 21.1).
- [x] Fixed the Settings Language row, which sat indented inside its group.

## v21.2: count down to a date
- [x] Countdowns under the timers, web, iPhone and Mac: a label and a day, shown as "1 month, 29 days", "Today" or "24 days ago", in backups (matrix row 21.2).
- [x] Web backups now carry timer presets too; they were left out.

## v21.2.1: Liquid Glass pass
- [x] Web tab bar is the glass twin (blur, saturate, brightness, bright top edge, soft shadow) and turns solid under Reduce Transparency; nothing in the content layer is glass.
- [x] World Clock toolbar in two groups (views, then Add City) with a spacer; the nightstand's floating controls sit on regular glass.

## v21.3: daylight saving dates
- [x] The city sheet shows the next clock change ("Clocks go back, Sun, Nov 1, 2:00 AM") on web, iPhone and Mac, hidden where clocks never change (matrix row 21.3). Vancouver has no row now: BC keeps daylight time all year from 2026.

## v21.4: the Watch pushes like watchOS Clock
- [x] Tap an alarm on the Watch for its time, repeat days, label, snooze and Delete Alarm (matrix row 21.4).
- [x] Tap a city on the Watch for its time, sunrise, sunset, length of day and next clock change.

## v21.5: hourly chime
- [x] A Chime switch on the nightstand, web, iPhone and Mac: a soft Chimes on the hour while it is up, never on opening, off until turned on (matrix row 21.5). The native tone is made on the device, like the web's.

## v21.6: flip face
- [x] A Flip face on the nightstand, web, iPhone and Mac: hours and minutes on two split cards that turn when they change, red at night, still under reduced motion (matrix row 21.6).

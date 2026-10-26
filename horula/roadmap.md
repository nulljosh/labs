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
- [ ] Icon Composer icon, screenshots, privacy, submitted for review. iPhone done 2026-10-25; Mac waits on screenshots (the Mac app's self-snapshot needs an unlocked screen).

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
- [ ] City search works in the local language (needs a translated city list; the web UI is translated, city names are still English).
- [ ] Native app in the same 12 languages with a String Catalog.

## v11: a clock for other pages
- [x] `embed.html?city=Tokyo` gives a small live clock any site can drop in.
- [x] Countdown embed to a date, for launches and birthdays.
- [x] Embeds follow light and dark and need no script on the host page.

## v12: done right
- [ ] Lighthouse 100 on performance, accessibility, best practices and SEO for both pages. Landing is 100 on all four; the app is 99/100/100/100 (throttled first paint 1.3 s, largest paint 1.9 s). Next step: inline the shell CSS.
- [x] Landing refreshed for everything v2 to v11 added, with new art where a section needs it.
- [x] README, WHITEPAPER and CLAUDE.md current.
- [ ] Launch kit (Product Hunt, HN, X posts) in launch/horula/.

## v13: a map of the day
- [x] World Clock has a map, like macOS Clock: every known city as a dot, night shaded by the real line between day and night, your cities named with their time.
- [x] Same map in the Mac app.

## v14: the stopwatch dial, like iOS
- [x] Analog stopwatch gets a small minute dial and a blue lap hand, like the iOS analog stopwatch.
- [ ] The iPhone and Mac app get the analog stopwatch too (tap the digits to switch, like the web).

## v15: hear it before you pick it
- [x] Choosing an alarm or timer sound plays it once, like iOS.
- [x] Two more sounds, drawn in Web Audio like the others.

## v16: native in every language
- [ ] The iPhone and Mac app in the same twelve languages, from a String Catalog.

## v17: tell people
- [ ] Launch kit in launch/horula/: Product Hunt, Show HN and X posts, with the embed as the hook.


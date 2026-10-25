# Clock roadmap

v1 is live: full iOS Clock parity (see `GAPS.md`, 22 of 22). Every version below ships on its own: tested headless at 390px in light and dark, deployed with `./deploy.sh`, `CACHE` bumped in `sw.js`, tagged `clock-vN.0.0`. Web only, no build, no dependencies, no account.

## v2: a floor under it
- [ ] `node --test` suite for the pure parts: repeat text, next alarm, sunrise and sunset, timer end times, lap best and worst.
- [ ] Accessibility pass: every control labelled, visible focus ring, reduced motion stops the sweep glide, ringing view traps focus.
- [ ] Version shown at the bottom of the app, read from one constant.

## v3: world clock you can plan with
- [ ] Each city shows day or night and the offset in words ("Tomorrow, 8 hours ahead").
- [ ] Scrub: drag a slider and every city's time moves with it, to find a meeting hour.
- [ ] Tap a city to see its sunrise and sunset.

## v4: alarms you trust
- [ ] Alarm sound fades in over 30 seconds instead of starting loud.
- [ ] Skip just the next ring of a repeating alarm.
- [ ] Vibrate on phones that allow it.
- [ ] Warn once, in plain words, that a closed tab cannot ring.

## v5: your clock, backed up
- [ ] Export everything (alarms, cities, timers, sleep) to one file and import it on another device.
- [ ] Links that do things: `app.html#timer=10m` starts a timer, `#alarm=07:30` adds an alarm, so Shortcuts and bookmarks can drive it.
- [ ] Keyboard shortcuts on every tab, listed behind `?`.

## v6: nightstand faces
- [ ] Choose a face: big digits, analog, or a sun dial that tracks the day.
- [ ] Pixels drift a little every minute so a screen left on all night does not burn in.
- [ ] Dim slider right on the nightstand.

## v7: timers that do more
- [ ] Preset timers you name and pin (tea 4:00, pasta 9:00).
- [ ] Interval timer: work and rest rounds with a different sound for each.
- [ ] Copy or download stopwatch laps as a table.

## v8: every language
- [ ] UI text in English, French, Spanish, German, Japanese, Chinese, Portuguese, Korean, Italian, Dutch, Arabic, Hindi.
- [ ] Right to left layout for Arabic.
- [ ] City search works in the local language.

## v9: a clock for other pages
- [ ] `embed.html?city=Tokyo` gives a small live clock any site can drop in.
- [ ] Countdown embed to a date, for launches and birthdays.
- [ ] Embeds follow light and dark and need no script on the host page.

## v10: done right
- [ ] Lighthouse 100 on performance, accessibility, best practices and SEO for both pages.
- [ ] Landing refreshed for everything v2 to v9 added, with new art where a section needs it.
- [ ] README, WHITEPAPER and CLAUDE.md current; launch kit ready.

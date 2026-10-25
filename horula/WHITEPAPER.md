# Horula Technical Whitepaper

**v1.0** | October 2026

A clock for any browser. World clocks, alarms, a bedtime schedule, a stopwatch, timers and a
nightstand mode in one static page, with no account and no server behind it.

The iPhone Clock app is the best small tool on the phone and it does not exist anywhere else.
Horula is the same set of tools as a page you can open on a Mac, a Windows laptop or an Android
phone, and install like an app. It is plain HTML, CSS and JavaScript, about 550 lines in all.

## How time is kept

One loop drives everything (`app.js`). `requestAnimationFrame` calls `frame()` on every paint.
The second hand is redrawn each frame from seconds plus milliseconds, so it glides. Everything
else redraws only when the second changes: the digital time, the date, the nightstand, running
timers and the alarm check. Stopwatch digits redraw each frame, but only while that tab is open.

A background tab stops getting frames, so a separate one-second `setInterval` keeps timers and
alarms firing there. An alarm that fires while the tab is hidden still rings and still shows a
notification if you allowed them.

## Alarms and sleep

An alarm is a time, a set of weekdays, a label and a sound (`alarms.js`). `fireTimes()` finds the
next moment it should ring from the current date, so daylight saving never skips or doubles one.
A one-time alarm switches itself off after it rings. Snooze is nine minutes. Ringing is a full
screen view whose sound repeats every two seconds until you stop it, and gives up after ten
minutes. Sleep is two times, bedtime and wake, plus a wind-down reminder. The wake time is an
alarm like any other, and the hours of sleep are the gap between the two.

Sound comes from the Web Audio API, so there are no audio files to load. Browsers only allow
audio after a tap, so the first interaction with the page unlocks it.

## Cities and sun

World clocks use `Intl.DateTimeFormat` with an IANA zone, so every offset and every daylight
saving rule comes from the browser, never from a table in the app. Cities are searched by name
and mapped to zones. Sunrise and sunset use the NOAA approximation and run only if you allow
location, and only on the device.

## State and offline

All state is `localStorage` on the device, behind a four line `store` that survives a blocked or
full store by falling back to defaults. Nothing syncs between devices. Sync would need an account,
which is the one thing Horula is built to avoid.

`sw.js` caches the shell on first visit and serves it from cache after that, refreshing in the
background. The page works with no signal. Changing the cache name in `sw.js` is how a release
reaches installed copies.

## Brand and type

One accent, blue, for actions, links, the second hand and the icon. The icon is one idea, a sweep
arc with a single hand. Type is the system sans: San Francisco on Apple devices, then Lato, then
Helvetica, so nothing downloads. Tokens, the 8 point grid and the radius set live in `tokens.css`, shared by the
landing page and the app. The landing runs the real app on the page with no frame around it.

## Limits

No cross-device sync, no push alarms when the browser is closed, and no sound when the OS silences
the tab. A web page cannot wake a sleeping phone. For a real wake-up alarm, use the phone's own.

MIT. Written by Joshua Trommel.

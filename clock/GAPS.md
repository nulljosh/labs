# Clock vs iOS Clock: gaps

Compared 2026-10-25 against the iOS Clock app (World Clock, Alarms, Stopwatch, Timers, Sleep, StandBy). One line per gap. Ticked means closed and tested headless in light and dark at 390px.

## World Clock
- [x] 1. Add a city by searching its name, not by picking a raw time zone id.
- [x] 2. Edit mode: remove and reorder cities. Rows stay clean outside edit mode.

## Alarms
- [x] 3. Tap an alarm to edit it in a sheet: time, repeat days, label, sound, snooze, delete.
- [x] 4. Repeat days (Weekdays, Weekends, Every day, or any set). One-time alarms switch off after they ring.
- [x] 5. iOS style on/off switch instead of a checkbox.
- [x] 6. Full screen ringing view with Snooze (9 minutes) and Stop. The sound repeats until stopped.
- [x] 7. "Alarm in 7 hours 12 minutes" toast after saving an alarm.
- [x] 8. Choice of alarm sound.

## Sleep
- [x] 9. Sleep | Wake Up: bedtime and wake time, days, hours of sleep shown, wind-down reminder before bed, wake alarm with snooze.

## Stopwatch
- [x] 10. Live current lap at the top of the lap list, best lap green and worst lap red.
- [x] 11. Start green, Stop red, Lap / Reset on the left, like iOS.
- [x] 12. Analog stopwatch face, tap the readout to switch.
- [x] 13. Keeps running across reloads.

## Timers
- [x] 14. Hours, minutes and seconds pickers (native wheels on iPhone).
- [x] 15. Several timers at once, each with a progress ring, pause, cancel and its end time.
- [x] 16. Timer label and end sound.
- [x] 17. Recents: one tap restarts a past timer.
- [x] 18. Full screen "Timer done" view with Stop and Repeat.
- [x] 19. Timers keep running across reloads.

## StandBy
- [x] 20. Nightstand mode: full screen giant clock, date and next alarm, screen kept awake, red night tint from 22:00 to 07:00.

## App
- [x] 21. Installable to the home screen and works offline (manifest, icon, service worker).
- [x] 22. Keyboard: Space starts and stops the stopwatch, L laps or resets.

## Platform limit (not a gap in this page)
A web page cannot ring after it is closed or the phone is locked. iOS alarms can. Closing that needs the native app, tracked as its own project, not here.

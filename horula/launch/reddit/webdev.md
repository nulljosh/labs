Title: I rebuilt the iPhone Clock app as one static page: no build step, no dependencies

Horula is world clocks, alarms, a stopwatch and timers in plain HTML, CSS and JS. Things that might interest this sub:

- One requestAnimationFrame loop. The second hand redraws every frame so it glides; everything else once a second.
- Sounds are Web Audio oscillators, no files.
- The world map is about 450 cities from the IANA zone table drawn as dots, with night shaded by the NOAA terminator. No map data.
- Twelve languages through one tr() helper and a file per language. A node test fails if any language misses a string.
- Lighthouse 100/100/100/100 on the landing.

https://horula.jaybulb.com and the source is linked from the page. Happy to talk about any of it.

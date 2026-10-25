<img src="icon.svg" width="80" height="80" alt="Clock icon">

![license](https://img.shields.io/badge/license-MIT-green)

A clock that does what the iPhone clock does, in a browser tab.

World clocks, alarms, a bedtime schedule, a stopwatch, timers and a nightstand mode. It loads once, works offline and installs to your home screen or dock. No account, no tracking, one small page.

**[clock.jaybulb.com →](https://clock.jaybulb.com)** · **[Open the app →](https://clock.jaybulb.com/app)**

## Features

- **World clocks.** Add a city by name. Edit mode removes and reorders. Sunrise and sunset show if you allow your location.
- **Alarms.** Repeat days, label, sound and snooze. Ringing takes the whole screen and repeats until you stop it.
- **Sleep.** A bedtime, a wake time and a wind-down reminder. Hours of sleep are counted for you.
- **Stopwatch and timers.** Laps, and as many timers as you want side by side.
- **Nightstand.** Big digits, dimmed at night, screen kept awake.
- **Sweep hand.** The second hand glides every frame instead of ticking.

## Run it

```
python3 -m http.server 8000     # then open localhost:8000
./deploy.sh                      # Cloudflare Worker at clock.jaybulb.com; a push deploys nothing
```

No build step and no dependencies. State lives in `localStorage` on the device.

## Brand

Icon, tokens and type are in `brand/BRAND.md`. The halftone art comes from `scripts/gen_art.py`. Remaining gaps against the iOS Clock are in `GAPS.md`.

MIT. See `WHITEPAPER.md` for how it works and `SECURITY.md` for reporting.

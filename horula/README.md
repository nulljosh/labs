<img src="icon.svg" width="80" height="80" alt="Horula icon">

![license](https://img.shields.io/badge/license-MIT-green)

# Horula

A clock that does what the iPhone clock does, in a browser tab. Horula is Latin for "little hour". Formerly Clock.

World clocks, alarms, a bedtime schedule, a stopwatch, timers and a nightstand mode. It loads once, works offline and installs to your home screen or dock. No account, no tracking, one small page.

**[horula.jaybulb.com →](https://horula.jaybulb.com)** · **[Open the app →](https://horula.jaybulb.com/app)**

## Features

- **World clocks.** Add a city by name. Edit mode removes and reorders. Sunrise and sunset show if you allow your location.
- **Alarms.** Repeat days, label, sound and snooze. Ringing takes the whole screen and repeats until you stop it.
- **Sleep.** A bedtime, a wake time and a wind-down reminder. Hours of sleep are counted for you.
- **Stopwatch and timers.** Laps, and as many timers as you want side by side.
- **Nightstand.** Big digits, dimmed at night, screen kept awake.
- **Sweep hand.** The second hand glides every frame instead of ticking.

## Put a clock on your page

One iframe, no script on your side. It follows light and dark on its own.

```html
<iframe src="https://horula.jaybulb.com/embed?city=Tokyo" width="320" height="120" style="border:0"></iframe>
<iframe src="https://horula.jaybulb.com/embed?to=2026-12-25T00:00&label=Christmas" width="320" height="140" style="border:0"></iframe>
```

Add `&face=digital` to drop the dial, `&theme=dark` or `&theme=light` to pin a theme, `&bg=none` for a see-through background.

## Run it

```
python3 -m http.server 8000     # then open localhost:8000
./deploy.sh                      # Cloudflare Worker at horula.jaybulb.com; a push deploys nothing
```

No build step and no dependencies. State lives in `localStorage` on the device.

## Brand

Icon, tokens and type are in `brand/BRAND.md`. The halftone art comes from `scripts/gen_art.py`. Remaining gaps against the iOS Clock are in `GAPS.md`.

MIT. See `WHITEPAPER.md` for how it works and `SECURITY.md` for reporting.

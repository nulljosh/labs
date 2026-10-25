# Clock

iOS Clock on the web: world clocks, alarms, sleep, stopwatch, timers, nightstand. Plain HTML, CSS and JS, no build, no dependencies. Live at clock.jaybulb.com. Lives in the labs monorepo at `clock/`.

- `index.html` is the landing, `app.html` is the app, served as `/app` (the manifest `start_url`). Link to `app`, never `app.html`: the host redirects it, and a cached redirect breaks the installed app. The landing runs the real app in an iframe, no device frame.
- One frame loop in `app.js`: the sweep hand redraws every frame, everything else once a second. Keep it that way, the hand must glide, not tick, except under reduced motion, where it ticks once a second on purpose.
- State is `localStorage` only, through `store` in `core.js`. No account, no server. Sync would need jaybulb-api, build it only if asked.
- Deploy: `./deploy.sh` (Worker `clock`, assets from `.`, `.assetsignore` keeps scripts and brand out). A push deploys nothing.
- Pure helpers live in `lib.js` (no DOM), tested by `node --test` in `test/`. `VERSION` lives there too.
- Bump `CACHE` in `sw.js` to `clock-<VERSION>` on every release or installed copies keep the old shell, and add any new shell file to `SHELL` there.
- `GAPS.md` is the parity checklist against iOS Clock. Close a gap, tick it, test headless at 390px in light and dark.
- `roadmap.md` runs v2 to v10. One version per release: tick its lines, bump `CACHE`, deploy, tag `clock-vN.0.0` in labs.

## The loop
A `/loop` ships `roadmap.md` one version at a time until v10. Each tick: build the next open version, `node --test`, headless QA at 390px light and dark, deploy, commit, push, tag.

## Brand
- Blue accent `#0a5fd6`, gradient `#3d9bff` to `#0a5fd6`. Glyph is a sweep arc and one hand, source `Clock.icon`, flat copy `icon.svg`. It was vermilion for an hour on 2026-10-25 and Joshua wanted blue, never orange or red.
- Type is the system sans: SF, then Lato, then Helvetica. No bundled fonts (Joshua asked for this on 2026-10-25, replacing the earlier Inter faces). Tabular digits only on readouts that tick. Tokens in `tokens.css`, mirrored to `brand/tokens.css`. Doc in `brand/BRAND.md`.
- Landing follows Bugle's: white page, thin rule down both edges, one blue band, halftone art from `scripts/gen_art.py` (drawn, nothing borrowed). Re-run `make_brand.py` and it overwrites `brand/BRAND.md` and `brand/tokens.css`, so restore both after.
- No emojis in UI, no em dashes in copy.

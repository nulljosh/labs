# Horula

iOS Clock on the web: world clocks, alarms, sleep, stopwatch, timers, nightstand. Plain HTML, CSS and JS, no build, no dependencies. Live at horula.jaybulb.com. Lives in the labs monorepo at `horula/`. Formerly Clock, renamed 2026-10-25 because Apple had Clock taken.

## Still on the old name on purpose
- Worker `clock` and host clock.jaybulb.com (both hosts serve), bundle id `com.nulljosh.clock`, SKU `CLOCK2026`.
- Backup files carry `app: 'clock'`; import accepts only that marker, so old backups keep working. Never change it.
- The plain word clock and the tab name World Clock are not the product name.

- `index.html` is the landing, `app.html` is the app, served as `/app` (the manifest `start_url`). Link to `app`, never `app.html`: the host redirects it, and a cached redirect breaks the installed app. The landing runs the real app in an iframe, no device frame.
- One frame loop in `app.js`: the sweep hand redraws every frame, everything else once a second. Keep it that way, the hand must glide, not tick, except under reduced motion, where it ticks once a second on purpose.
- UI text goes through `tr()` in `lib.js`. Translations live in `lang/<code>.js`, one file per language, keyed by the English string; `i18n.js` picks the language and translates the static page. A new string needs a row in every file, and the test fails until it has one.
- `embed.html` (served as `/embed`) is the iframe clock and countdown. It loads only `lib.js`.
- State is `localStorage` only, through `store` in `core.js`. No account, no server. Sync would need jaybulb-api, build it only if asked.
- Deploy: `./deploy.sh` (Worker `clock`, assets from `.`, `.assetsignore` keeps scripts and brand out). A push deploys nothing.
- Pure helpers live in `lib.js` (no DOM), tested by `node --test` in `test/`. `VERSION` lives there too.
- Bump `CACHE` in `sw.js` to `horula-<VERSION>` on every release or installed copies keep the old shell, and add any new shell file to `SHELL` there.
- `GAPS.md` is the parity checklist against iOS Clock. Close a gap, tick it, test headless at 390px in light and dark.
- `roadmap.md` runs v2 to v12 and grows from `GAPS.md`. One version per release: tick its lines, bump `CACHE`, deploy, tag `horula-vN.0.0` in labs.

## Native app (`apple/`, v6 and up)
- SwiftUI, one codebase for iPhone and Mac (`xcodegen generate` in `apple/`; the `.xcodeproj` and `build/` are not committed). App Store record 6826916379, bundle `com.nulljosh.clock` on both platforms (universal purchase), app group `group.com.nulljosh.clock`.
- `Shared/Clockwork.swift` is `lib.js` ported line for line; `Tests/ClockworkTests.swift` runs the same cases as `test/lib.test.js`. Change one, change both.
- Alarms: AlarmKit on iPhone (iOS 26.1+, rings closed and on silent); Mac and Watch have no AlarmKit and use notifications. `AlarmScheduler.sync` cancels and reschedules everything from the Store.
- Native text comes from `Shared/Localizable.xcstrings`, generated from the web's `lang/*.js` plus a short native-only table by `node scripts/gen_xcstrings.mjs`. Rerun it after any lang change; a node test checks every string has all eleven languages. Pass `LocalizedStringKey` or `String(localized:)`, never a plain `String`, to anything the reader sees.
- Backups use the web format (`app: 'clock'`, recents in milliseconds), so web and native import each other.
- `apple/` is in `.assetsignore`: never let native source deploy. Curl one native path after a deploy and expect 404.
- Native gates, not the web ones: Swift tests pass, generic builds pass for every platform, `asc validate`, then the first `asc review submit` (the real gate). Tag `horula-native-vN.0.0`.

## The loop
A `/loop` ships `roadmap.md` one version at a time and extends it toward v100. Each tick: build the next open version, `node --test`, headless QA at 390px light and dark, deploy, commit, push, tag.

## Brand
- Blue accent `#0a5fd6`, gradient `#3d9bff` to `#0a5fd6`. Glyph is a sweep arc and one hand, source `Horula.icon`, flat copy `icon.svg`. It was vermilion for an hour on 2026-10-25 and Joshua wanted blue, never orange or red.
- Type is the system sans: SF, then Lato, then Helvetica. No bundled fonts (Joshua asked for this on 2026-10-25, replacing the earlier Inter faces). Tabular digits only on readouts that tick. Tokens in `tokens.css`, mirrored to `brand/tokens.css`. Doc in `brand/BRAND.md`.
- Landing follows Bugle's: white page, thin rule down both edges, one blue band, halftone art from `scripts/gen_art.py` (drawn, nothing borrowed). Re-run `make_brand.py` and it overwrites `brand/BRAND.md` and `brand/tokens.css`, so restore both after.
- No emojis in UI, no em dashes in copy.

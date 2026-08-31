# labs

![license](https://img.shields.io/badge/license-MIT-green) [![GitHub](https://img.shields.io/badge/GitHub-nulljosh%2Flabs-black?logo=github)](https://github.com/nulljosh/labs)

`~/Documents/Code` itself is this repo. Product repos live here as nested git repos with their own remotes and are gitignored; what labs actually tracks is the small experiments:

- [`bank`](./bank) — neobank prototype (accounts + stock trading, sandbox only)
- [`canlii-app`](./canlii-app) — CanLII case lookup app (frozen; merged into litigate as a Case Law tab)
- [`credis`](./credis) — Redis-protocol (RESP) server in C
- [`swing`](./swing) — random 1:1 video chat (Workers + one Durable Object lobby), live at swing.heyitsmejosh.com
- [`agent-101`](./agent-101) — agent scratch work
- [`video-speed-ext`](./video-speed-ext) — browser extension for video playback speed

`homeward` and `roost` used to live here too; both were extracted to their own repos on 2026-08-30 and are now nested + gitignored like the other products.

Plus the shared docs: `CLAUDE.md` (codebase notes), `roadmap.md`, `GTM.md` (revenue ledger), `PROGRESS.md`. CI lives in `.github/workflows/native-release.yml`, which builds `.msi`/`.deb`/`.apk` for any app with a `kmp/` module.

Subfolders were merged with `git subtree`, so `git log --follow <subfolder>` still shows original history. The original repos are archived on GitHub.

# BCGD / Doorstock

Two things in one repo for Best Choice Garage Doors. `src/web` is the customer site at bcgd.heyitsmejosh.com. `src/ios` and `src/macos` are the stock dashboard, shipped on the App Store as **Doorstock** (ASC 6791106082). Use the Doorstock name in listings and the bcgd name in code.

- Metadata lives in `metadata/` (canonical asc JSON). bcgd has two app-infos, so pass `--app-info 390b0de9-9a6f-4264-b5b4-725e4a44a1e8` on pulls
- Ship: `asc workflow run ship-ios VERSION:x.y.z`
- iOS 1.0 is REJECTED under the 4.3(a) wave with appeals filed. Never resubmit into it. macOS 1.0 is live
- Tests: `node --test` in `src/web`
- `marketing/` holds the Instagram and Google ad work for the business (plan, palette, finished ads). It ships nothing. Start at `marketing/README.md`

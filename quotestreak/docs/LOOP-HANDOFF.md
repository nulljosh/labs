# Quotestreak loop handoff (2026-10-19, morning)

## What the loop is
Work down "Road to v100" in `roadmap.md`, one major version per tick. Each milestone ships on the web the same day (`sh scripts/build-site.sh` then `wrangler pages deploy`), gets its line checked, and bumps the web version. Native work rides along in the shared SwiftUI files and goes to the App Store in batches, because only one build can be in review at a time. `docs/FEATURES.md` explains every feature since v58; `/roadmap` is the public page built from `roadmap.md`.

## Where things stand
- Web is at v99: The Book is live, with the second whitepaper edition and the public `/roadmap`. Everything from v2 to v99 is live except the seven milestones below that wait on someone else.
- v100 (Quotestreak 100) is in progress and uncommitted. The extended bank of more than 10,000 harvested Wikiquote lines is in, a deepen pass is still running, and the birthday and live-event banner and lazy loading are in the working tree.
- 1.3.0 is WAITING_FOR_REVIEW on iOS and Mac (submitted 2026-10-18). The next store build carries a large native batch: widget, watch daily, Live Activity duels, tvOS party host, visionOS wall, Siri, Handoff, iMessage, Cloudflare accounts, iCloud best score, fair-play runs, the anime genre, the sound kit, invite links.
- jaybulb-api checks fair-play answers against both Quotestreak banks (shipped 2026-10-19).
- Store builds need `-allowProvisioningUpdates` and automatic export signing. The iCloud capability was added to bundle YDHCC4J3S2 on 2026-10-19, so fetch fresh profiles before the next archive.

## Waiting on Joshua
- v36 Google Play, v37 Microsoft Store, v48 Discord: his developer accounts. v38 Flathub: a public pull request from his GitHub.
- v89 Supporter pack: a live $1 Stripe Payment Link and a $0.99 App Store IAP. Live Stripe writes are his, and the live checkout still shows the old business name (Opticon), a Stripe setting.
- v90 Store in twenty languages: after 1.3.0 clears, with the next version.
- v98 Certified access: hire an outside auditor; `docs/ACCESSIBILITY.md` is their starting point.
- The iMessage extension needs its icon set before it can ship. The daily email still owes one real signup to see it land.

## Next, in order
1. Finish v100. When the deepen pass ends, merge the harvested bank, test it (the build-data tests and the web checks), update the line counts in `roadmap.md` and the docs, check off v100, and ship it the same way as every milestone: `sh scripts/build-site.sh`, then `wrangler pages deploy`. There is no `ship.sh` in the repo.
2. When 1.3.0 clears, batch the native changes into the next App Store build, with fresh provisioning profiles.

## Restart prompt
```
/loop to v50 then 100!
```

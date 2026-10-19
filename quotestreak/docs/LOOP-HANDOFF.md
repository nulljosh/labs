# Quotestreak loop handoff (2026-10-19)

## What the loop is
Work down "Road to v100" in `roadmap.md`, one major version per tick. Each milestone ships on the web the same day (`sh scripts/build-site.sh` then `wrangler pages deploy`), gets its line checked, and bumps the web version. Native work rides along in the shared SwiftUI files and goes to the App Store in batches, because only one build can be in review at a time. `docs/FEATURES.md` explains every feature since v58; `/roadmap` is the public page built from `roadmap.md`.

## Where things stand
- Web is at v99. Everything from v2 to v99 is live except the eight milestones below that wait on someone else, and v100.
- 1.3.0 is WAITING_FOR_REVIEW on iOS and Mac (submitted 2026-10-18). The next store build carries a large native batch: widget, watch daily, Live Activity duels, tvOS party host, visionOS wall, Siri, Handoff, iMessage, Cloudflare accounts, iCloud best score, fair-play runs, the anime genre, the sound kit, invite links.
- Store builds need `-allowProvisioningUpdates` and automatic export signing. The iCloud capability was added to bundle YDHCC4J3S2 on 2026-10-19, so fetch fresh profiles before the next archive.

## Waiting on Joshua
- v36 Google Play, v37 Microsoft Store, v48 Discord: his developer accounts. v38 Flathub: a public pull request from his GitHub.
- v89 Supporter pack: a live $1 Stripe Payment Link and a $0.99 App Store IAP. Live Stripe writes are his, and the live checkout still shows the old business name (Opticon), a Stripe setting.
- v90 Store in twenty languages: after 1.3.0 clears, with the next version.
- v98 Certified access: hire an outside auditor; `docs/ACCESSIBILITY.md` is their starting point.
- The iMessage extension needs its icon set before it can ship. The daily email still owes one real signup to see it land.

## Next
v100 Quotestreak 100: ten thousand verified quotes, a live event, and Quip's birthday. Then the next store build once 1.3.0 clears.

## Restart prompt
```
/loop ship the next unchecked "Road to v100" milestone in quotestreak/roadmap.md: build it web-first, test it, deploy, check it off and bump the version; batch native changes into the next App Store build once the current review clears; keep re-arming until v100
```

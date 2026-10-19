# Coda loop handoff (2026-10-19, morning)

## What the loop is
Work down "Road to v100" in `roadmap.md`, one major version per tick. Each milestone ships on the web the same day (`sh scripts/build-site.sh` then `wrangler pages deploy`), gets its line checked, and bumps the web version. Native work rides along in the shared SwiftUI files and goes to the App Store in batches, because only one build can be in review at a time. `docs/FEATURES.md` explains every feature since v58; `/roadmap` is the public page built from `roadmap.md`.

## Where things stand
- Road to v100 is done. Coda 100 (commit c62dd99eb) is live: a bank of 14,434 Wikiquote lines (the core stays fixed and the extra lines load after the first round), Quip's birthday hat, a banner for the first live show, and fair play checks answers against both banks. QA is clean on production.
- 1.3.0 is WAITING_FOR_REVIEW on iOS and Mac (submitted 2026-10-18). The next store build carries a large native batch: widget, watch daily, Live Activity duels, tvOS party host, visionOS wall, Siri, Handoff, iMessage, Cloudflare accounts, iCloud best score, fair-play runs, the anime genre, the sound kit, invite links.
- jaybulb-api checks fair-play answers against both Coda banks (shipped 2026-10-19).
- Store builds need `-allowProvisioningUpdates` and automatic export signing. The iCloud capability was added to bundle YDHCC4J3S2 on 2026-10-19, so fetch fresh profiles before the next archive.

## Waiting on Joshua
- v36 Google Play, v37 Microsoft Store, v48 Discord: his developer accounts. v38 Flathub: a public pull request from his GitHub.
- v89 Supporter pack: a live $1 Stripe Payment Link and a $0.99 App Store IAP. Live Stripe writes are his, and the live checkout still shows the old business name (Opticon), a Stripe setting.
- v90 Store in twenty languages: after 1.3.0 clears, with the next version.
- v98 Certified access: hire an outside auditor; `docs/ACCESSIBILITY.md` is their starting point.
- The iMessage extension needs its icon set before it can ship. The daily email still owes one real signup to see it land.

## Next, in order
1. Blocked milestones, waiting on Joshua: v36, v37, v38, v48, v89, v90 and v98 (see above).
2. The native batch rides the next App Store build, once 1.3.0 clears. Fetch fresh provisioning profiles first.
3. Rename to Coda (Joshua said "you decide", 2026-10-19). Clear in App Store search, coda.jaybulb.com and nulljosh/coda are free. Once 1.3.0 clears review, run the real ASC duplicate check (asc-name-creator probe.sh), then do the full rename: store listing, landing, domain, docs. Taken: Quip, Ditto, Encore, Cue, Riff, Verbatim, Rosebud, Yorick, Cameo, Matinee, Stella, Motif. Rejected by Joshua: Quoth, Quotient, Cita, Bonmot.

## Restart prompt
```
/loop to v50 then 100!
```

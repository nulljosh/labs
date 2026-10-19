# Quotestreak loop handoff (2026-10-18, night)

## What the loop is
Work down "Road to v100" in `roadmap.md`, one major version per tick. Each milestone ships on the web the same day (`sh scripts/build-site.sh` then `wrangler pages deploy`), gets its line checked, and bumps the web version. Native work rides along in the shared SwiftUI files and goes to the App Store in batches, because only one build can be in review at a time.

## Where things stand
- 1.3.0 (new brand, Quip, Quip Sans, confetti) is WAITING_FOR_REVIEW on iOS and Mac, submitted 2026-10-18.
- The web is live at quotestreak.jaybulb.com with the brand kit at /brand/.
- The iOS 27 simulator runtime is installed; `QS-iPhone` and `QS-iPad` exist for screenshots. The debug-only `-shot question|reveal|speed` launch flag opens straight onto a screen.
- Store builds need `-allowProvisioningUpdates` and automatic export signing; the old manual Mac profile lacks Sign in with Apple.

## Next, in order
1. v29 Answer out loud, then down the list. v2 to v28 are live on the web. Duels: `cd duel && npx wrangler deploy`. Native carries accounts on Cloudflare, the new media types, decades and difficulty for the next store build.
2. When 1.3.0 clears review, cut the next store build with every native change since, new screenshots if the UI moved, and What's New in the house voice.

## Restart prompt
```
/loop ship the next unchecked "Road to v100" milestone in quotestreak/roadmap.md: build it web-first, test it, deploy, check it off and bump the version; batch native changes into the next App Store build once the current review clears; keep re-arming until v100
```

# Doorstock loop handoff (2026-10-21, 23:13 PDT)

## What the loop is

The QA and submit loop for Doorstock, the stock and jobs app for Best Choice Garage Doors (ASC app 6791106082). It walks every screen and function of the iPhone app (src/ios, run on the simulator) and the Mac app (src/macos), keeps screenshots, and fixes what it finds until the UI reads as A+. Each tick it also checks whether Mac 2.0 has cleared App Review, and submits 4.0 once the slot is free. Joshua gives the yes on any Apple submission; the loop never answers Apple on its own. Usage-conscious: no subagents, small steps.

## Where things stand

- Mac 2.0 (build 202610211815, Jony Ive pass: tiles, jobs board, status track; no accounts) is WAITING_FOR_REVIEW. Apple takes one pending Mac version at a time, so nothing else goes to Mac review until it clears.
- Doorstock 3.0 Today tab is built and pushed on Mac and iPhone: each tech's jobs in time order, a Route in Maps button on each job, parts to load with shortages in red.
- Doorstock 4.0 is built and pushed on Mac and iPhone, not submitted: the owner assigns a job to a crew member, and it sorts first on that person's Today tab.
- Shop accounts are live on jaybulb-api (src/doorstock.js, tested by test/doorstock.mjs). Local QA runs `wrangler dev --local` and launches the apps with `-apiBase http://127.0.0.1:8799` (plus `-skipLock YES` on iOS).
- iPhone is still held under the 4.3(a) appeal. Do not resubmit the rejected build.
- QA so far: every iPhone screen was walked on the simulator, screenshots are in docs/SCREENS.md, and storyboard.svg was redrawn with the Today tab. Not yet tested: the assign picker (needs a signed-in shop) and the Mac window.
- Dashboard (src/dashboard) looks sparse now that Today has moved out of it.

## Next, in order

1. When Mac 2.0 clears review, submit Mac 4.0 (Joshua's yes first), then tag it.
2. QA the assign picker against a local Worker (`-apiBase http://127.0.0.1:8799`): assign a job, confirm it sorts first on the crew member's Today tab.
3. Mac screenshots and a walk of the Mac window, same bar as the iPhone pass.
4. Fill the Dashboard so it is not sparse since Today moved out.
5. Keep the iPhone screens at A+ as they are touched; nothing goes to the store while the 4.3(a) appeal is open.

## Restart prompt

```
/loop QA every screen and function of bcgd Doorstock (src/ios on iPhone sim, src/macos) with screenshots; fix issues until the UI is A+ (feedback_a_plus_bar, apple skill rules); also each tick check if Mac 2.0 cleared review (asc app 6791106082) and submit 4.0 when free. Usage-conscious, no subagents, small steps.
```

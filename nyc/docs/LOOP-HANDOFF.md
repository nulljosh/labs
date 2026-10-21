# NYC Survive loop handoff (2026-10-21, 09:32 PT)

## What the loop is

The NYC Survive loop is a continuous QA and refinement cycle on the Mac build, the web port and the landing. The headless bot (`scripts/playthrough.sh`) and the `-demo` run are its checks. It is stopped right now. Joshua's weekly usage hit 89 percent, so the loop was halted and nothing is running. Restart it only when Joshua says so.

## Where things stand

iOS 1.1.0 has been live since 2026-10-06 03:30 PT. macOS 1.1.0 was in review at the last full check; re-check it with `asc` before relying on it.

Today's Mac QA pass (ROADMAP "QA 2026-10-21") is done. New Game went from a 7.7 second freeze to 0.05 seconds with a bitmap and BFS pathfinder. Map clicks no longer get lost to hand jitter. The tutorial works end to end, the HUD is readable, and the minimap draws the city. The menu sits over a live city, with capsule buttons, hover, NYC Sans, a new Empire State icon, the Dock name "NYC Survive", a resizable window and a Full screen switch in Settings.

Balance is the open question. The roadmap item is marked done: the web XP curve plus 1 XP per harvest wins 3 of 3 worlds on days 21 to 23 in `scripts/playthrough.sh`. But the earlier 200-day headless run averaged level 5.2 of the 8 needed, so the win is not yet proven across a full run.

The landing was rebuilt but is not deployed. Joshua graded it C-.

## Next, in order

1. Balance: run `scripts/playthrough.sh 200` and confirm the average run wins, not only 3 of 3 worlds on days 21 to 23. See ROADMAP "QA 2026-10-21".
2. The -demo video: once it can win, run `"NYC Survive.app/Contents/MacOS/NYC Survive" -demo 200` and record the window with `screencapture -v -R`. Send the video.
3. Settings QA: the Full screen switch goes stale if the green window button is used. Check save slots, sound and appearance. Also fix the first click into an inactive window, which only focuses it.
4. Design system: in-app Theme.accent is still #0071e3 next to brand blue #3d7bff, and the HUD mixes yellow, cyan and red. Fix the accent and record the NYC Sans override in CLAUDE.md and brand/BRAND.md, the way Coda does.
5. Landing to A+: rebuild against the Hermes landing, load NYC Sans from landing/fonts, add the missing dist copy step, deploy, and check nyc.jaybulb.com live.
6. README and the other markdowns refreshed.
7. Switch LICENSE to Apache 2.0, and add a privacy policy page (web/privacy.html exists; check it and link it).

## Restart prompt

```
/loop NYC Survive. Work the QA 2026-10-21 list in nyc/docs/LOOP-HANDOFF.md in order, starting with balance: run scripts/playthrough.sh 200 and confirm the average run wins, not only 3 of 3 worlds on days 21 to 23. Then the -demo video, Settings QA, the design system accent, the landing to A+, the README and markdowns, Apache 2.0 and the privacy page. Commit each step from the labs root by exact path with git commit -o, never git add -A. Do not submit to App Review or deploy anything users see without Joshua's yes.
```

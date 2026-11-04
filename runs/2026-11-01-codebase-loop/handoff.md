# Codebase loop handoff (2026-11-01, late morning)

Loop prompt (re-arm verbatim with ScheduleWakeup): finish the open roadmap lines across the codebase, one project at a time, in tier order. No subagent fan-out. Check ~/.claude/scripts/usage.sh each tick. A+ means verified live, no leftovers. Never send an Apple reply, submit a build, or change a live store listing without Joshua's yes.

## Where things stand

- Open roadmap lines are about 530 across the repos, down from 672 this morning. Long-range plans moved to the wiki pages icelus.md, bcgd.md and labs.md. Stale August lines are gone.
- Shipped on 2026-11-01: Echo's dictation stays warm and its landing leads with the tagline; Epiphany v6.3.0 (growth calculator removed, swipeable ticker, review queue fixes); Machaon uses the system font; Nimble's mascot is a lightbulb on every platform; Eponym v2.0.1 with a wide web tab bar; Talli v4.0.1; Melete v3.1.0; Costanza's Kotlin apps stay signed in; Scrounger's deal search works again; new house-layout landings for Airwell, Numen, Plank and Turing; Cyllene, Pan and Echo heroes now use the tagline, not the app name; keyrate-tui 2.0.0 is on the Homebrew tap; Duke's dead login item is removed; kernel CI is green; plank CI is green.
- Blocked and waiting: Apple web sign-in is throttled (503 three times today), so no asc login until it clears. Six App Store rejections are still unanswered. Coda, Pan and Temida have draft versions and need a build and Joshua's yes to submit. Epiphany people search needs a Brave Search or Google CSE key from Joshua. Naming items are tagged blocked for nimble, icelus and noema until Joshua picks.
- Issue mirror (roadmap-to-issues) is not in use. Joshua denied it on 2026-11-01.

## Rules that bite

- Stage by exact path. Never git add -A. Labs has untracked noise.
- Hero H1 is the tagline, never the app name (feedback_h1_is_cta).
- Pushing deploys nothing. Deploy each site with its own command from its CLAUDE.md, then check it live.
- Versioning is honest semver: feature is minor, fix is patch, major only on Joshua's call.

## Next, in order

1. Retry Apple sign-in once the throttle clears, then answer the six open rejections as drafts first.
2. Coda, Pan and Temida: build and submit only on Joshua's yes.
3. Work the open roadmap lines tier by tier, one project per tick, with QA and a screenshot on any UI change.
4. Joshua only: the App Store seller name, the people search key, and the naming picks.

## Restart prompt

```
/loop finish the open roadmap lines across ~/Documents/Code in tier order, one project per tick, no subagent fan-out; QA each change live, never submit or reply to Apple without Joshua's yes; stop and ask on naming and major versions
```

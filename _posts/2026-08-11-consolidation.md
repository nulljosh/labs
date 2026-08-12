---
layout: post
title: "Consolidation"
date: 2026-08-11 12:00:00 -0700
categories: journal daily
---

![August 11](/assets/2026-08-11-consolidation.svg)

## Tuesday (August 11)

Spent the evening doing a full inventory of the codebase and found how much duplication has crept in. About 15 directories exist in both the top level and inside labs—roost and missing-pets are 400K stale stubs of much larger copies, and wiretext and grapher are outdated remnants from a split. Six repos are maintaining their own copies of the design tokens while four others correctly import the shared stylesheet. The app duplication is worse: fengshui is one chapter of bookrank, etyma is a lookup box that nimble already ships as a finished product, and lexly is holding copies of bookrank summaries that will just rot. Sketched out a four-phase consolidation plan (delete the duplicate directories, unify token imports, retire the thin apps, set up a shared app registry so future renames don't require hand-editing eight separate places). Saved it, but this session was mostly the inventory and planning—nothing landed yet.

Earlier today: wrapped up book summaries (The Optimist chapters eight through ten finished), refreshed App Store screenshots across multiple apps with real account data instead of empty demo states, and pruned roadmaps to mark finished work. Later, I stripped em dashes from the portfolio site and iOS app copy—name/descriptor pairs are now commas, date ranges are plain hyphens. Also closed the Nullfolio App Store track; the portfolio iOS app was stuck on Guideline 4.2 (Minimum Functionality) because it just mirrors what's on the website and opens Safari links from there, so building a real app makes no sense. Keeping the Xcode target as a personal build instead.

Tonight built native iOS and macOS reader apps for the newsline API I shipped earlier this week. Both targets use one shared source tree with NavigationSplitView showing stories with bias bars and blindspot flags, a flat latest feed, and saved stories—everything caches offline to Caches as JSON so the app works without network. Deferred App Store submission until August 18 (account-wide submission freeze under Guideline 5.6), but the pre-submission checklist with ASC registration, screenshots, and metadata is queued.

Evening: ran `/work start` to ingest 17 Apple Notes into 10 project roadmaps across the wiki, which landed well—notes got organized into each app's backlog, the archive cleared to zero, and the roadmap got a working list of priorities. After that, tried to parallelize 9 forks to tackle some of the imported work, but the machine got laggy and the token budget burned through ~70% in minutes, so killed all 9 mid-flight. Lesson: cap parallel forks at 2–3, not 9. The wip commits landed locally but will stay unpushed until the partial work gets reviewed.

**Apps.** Epiphany, Talli, Healstack, Bookrank, Journal, Voxprint, Newsline, Nimble, and others across the portfolio received fixes or received ingest-stage roadmap entries. The Optimist summary work added to Bookrank. Portfolio site copy cleaned up. Newsline iOS and macOS apps built. Newsline and Nimble got marketing landing pages deployed.

## Wednesday (August 12)

Started by deleting the nested labs clone that existed at Code/labs/—turned out the entire codebase is the labs repository itself, so the second copy was just a stale 1GB pile of duplicate history sitting inside itself. Freed up 1GB of disk and cleaned up the redundancy. Found a few client files that only existed there, rescued those, and also dropped the stale pre-rename copies sitting around (the old braingraph and etyma folders).

Then spent the evening reading rejection reasons directly from the App Store Resolution Center after running asc-login. Eight apps got rejected; the reasons collapse into three categories. Four apps (Curvely, NYC, Transcriptly, Wiretext) all hit a blanket Guideline 5.6 suspension—no app-specific defect, just a developer code-of-conduct review that freezes the entire account until August 18. Three apps (Healstack, Sparkjar, Lexly Mac) failed Guideline 2.1(a) because their sign-in flows were broken at review time. One Lexly Mac record failed Guideline 5.2.5 because the word "Mac" in the app name technically violates Apple's trademark rules (that's metadata-only, trivial to fix). Copied the verbatim text into each app's roadmap so the path forward is clear.

Found the recorded state everywhere was wrong—I had four apps marked "waiting for review" that were actually rejected. Ran asc versions list on all 17 app records and corrected the Ship Status section in the main CLAUDE.md, then went through and fixed nine separate roadmaps, five memory files, and the wiki's blocked-on-joshua page to match reality. Also diagnosed why the sign-in rejections happened: Sparkjar's demo account was created August 4, one day after review started, so it didn't exist when the reviewer tried to sign in. Healstack's fix already exists in the codebase but was never built and uploaded—the latest ASC build is from before the fix landed. Both are waiting on rebuilds.

Wired up Wiretext's missing entitlements configuration. The ios/Wiretext.entitlements file existed since August 3, but the build system never actually used it because project.yml was never told to load it. Fixed that in the config.

**Apps.** Updated roadmap and wiki status across Curvely, NYC, Wiretext, Healstack, Sparkjar, Lexly, Talli, Litigate, and BCGD. Consolidated what was known into a real Ship Status that the live API now confirms. No new features shipped, but the plan is much clearer now.

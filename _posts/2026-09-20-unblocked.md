---
layout: post
title: "Unblocked"
date: 2026-09-20 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-09-20-unblocked.svg %}

{% include graphs/2026-09-20-unblocked.svg %}

## Friday

Finished setup for the stalled-loop diagnosis in pwnlingo: recorded the XP baseline, bounded repeated challenge retries, fixed language tile matching, and checkpointed the lesson fixes in place. The solver had been silent about what was breaking it.

## Saturday

Cracked the stalled-loop bug after the solver got stuck in 1033 identical cycles with zero XP for 23 hours, fixing forceQuitOnOpen to dismiss stalled stories and rotation to skip blacklisted tracks, plus transliterationAssist and patternTapComplete challenge shapes with DOM instrumentation. Runner restarted, 46 tests green, XP flowing. Joshua Tree kernel shipped glossy icon tiles, real syscalls with file writes and argv, progress graph fixes, lazy-loaded v86 demo perf, and a real back buffer. Onboarding slides went live across 11 apps for signed-out visitors, and Lexly added Unit 1 worked examples. Updated stale dock positions in the checks after pinning Stocks, but GitHub CI exposed more test problems and is still red.

## Sunday

All eight shipped iOS apps built against iOS 27; epiphany needed a smaller chart expression to get past Swift's type checker, and I fixed the roadmap issue sync after it created 25 junk titles. Joshua Tree gained Search, a pinned Stocks icon, contrast fixes, release notes, a shorter roadmap, and an interactive landing page while I chased dock animation lag. I protected its main branch with required CI and pull requests, but the suite kept exposing brittle checks after the dock changed; the latest fix waits for the desktop before clicking, and all eleven apps passed locally. GitHub still has not finished checking the PR, the issue remains open, and the repository still has stale beta and stable branches.

**Apps**: pwnlingo, joshuatree, lexly, bookrank, costanza, curbfind, curvely, dream, epiphany, healstack, roost, sidewise, sparkjar, dotfiles

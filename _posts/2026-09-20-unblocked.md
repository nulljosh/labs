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

Cracked the stalled-loop bug after the solver got stuck in 1033 identical cycles with zero XP for 23 hours, fixing forceQuitOnOpen to dismiss stalled stories and rotation to skip blacklisted tracks, plus transliterationAssist and patternTapComplete challenge shapes with DOM instrumentation. Runner restarted, 46 tests green, XP flowing. Joshua Tree kernel shipped glossy icon tiles, real syscalls with file writes and argv, progress graph fixes, lazy-loaded v86 demo perf, and a real back buffer. Onboarding slides went live across 11 apps for signed-out visitors, and Lexly added Unit 1 worked examples.

## Sunday

Wrapped up environment verification and QA pass across all 8 shipped iOS apps; epiphany, nimble, sparkjar, healstack, lexly, curvely, siftbox, and breathe all build clean against the iOS 27 SDK. Found one real Swift compiler issue in epiphany's StockDetailView (a 140-line Chart body with a complex ternary blew the type-checker budget), split the chart logic into two @ChartContentBuilder helpers to bring it under the budget, and pushed the fix. Fixed roadmap-to-issues.py to generate proper GitHub issue titles from the first sentence instead of hard-cutting the raw roadmap line at 200 chars; the earlier sync created 25 junk issues which got cleaned up. Epiphany's roadmap still has all 72 open items pending sync to GitHub.

**Apps**: pwnlingo, joshuatree, lexly, bookrank, costanza, curbfind, curvely, dream, epiphany, healstack, roost, sidewise, sparkjar, dotfiles

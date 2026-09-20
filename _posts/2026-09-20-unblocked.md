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

Cracked the stalled-loop bug after the solver got stuck in 1033 identical cycles with zero XP for 23 hours, fixed by setting forceQuitOnOpen to dismiss stalled stories and making rotation skip blacklisted tracks. Also fixed transliterationAssist and patternTapComplete challenge shapes and added DOM instrumentation for unknown challenges. Runner restarted, 46 tests green, XP flowing. Shipped step 4 to checkpoint: roadmap-to-issues.py mirrors each repo's roadmap into GitHub issues.

**Apps**: pwnlingo, dotfiles

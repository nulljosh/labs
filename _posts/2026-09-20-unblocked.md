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

Fixed pwnlingo's 23-hour stalled loop (1033 cycles, zero XP) by dismissing stalled stories, skipping blacklisted tracks, and fixing challenge shapes; 46 tests green. Shipped Joshua Tree kernel with glossy tiles, real syscalls, graphs, lazy v86 loading, and back buffer; onboarding went live on 11 apps, Lexly added worked examples. Updated dock check positions after pinning Stocks, but exposed a cascade: landing terminal gibberish, header out of sync, CI red (PR #6 pending), checks failing randomly, everything laggy, weather dead. Spent this morning debugging it and got frustrated; Joshua Tree broke and needs real fixes plus green CI before it's usable.

## Sunday

All eight shipped iOS apps built against iOS 27; Joshua Tree gained Search, a pinned Stocks icon, contrast fixes, and an interactive landing page; Stocks and Epiphany merged to main. Shipped first-run onboarding across eleven native apps so new users see the product instead of a blank screen. Fixed pwnlingo's 23-hour stalled loop and shipped it; the Apps folder was throwing away mouse clicks during redraw because the dock test assumed 10 icons instead of 11. Pushed checkpoint automation so GitHub issues stay in step with the roadmap, and the framework now delegates parallel work without blocking the main session.

**Apps**: pwnlingo, joshuatree, lexly, bookrank, costanza, curbfind, curvely, dream, epiphany, healstack, roost, sidewise, sparkjar, dotfiles

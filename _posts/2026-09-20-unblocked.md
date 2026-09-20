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

All eight shipped iOS apps built against iOS 27, with epiphany fixing a chart expression; Joshua Tree gained Search, a pinned Stocks icon, contrast fixes, and an interactive landing page. The week's CI failure turned out to be the Apps folder loop throwing away mouse clicks during redraw; tests assumed a 10-icon dock, and the test job stopped at the first failure, hiding everything after. Removed dock hover zoom, fixed weather showing stale data due to a proxy issue, added dock slot guards; Stocks and Epiphany merged to main with all CI green, with Chat redesign, keyboard buffer, weather window, and wallpaper fix in flight. Next is ship 1.0.

**Apps**: pwnlingo, joshuatree, lexly, bookrank, costanza, curbfind, curvely, dream, epiphany, healstack, roost, sidewise, sparkjar, dotfiles

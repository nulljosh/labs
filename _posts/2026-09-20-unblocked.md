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

All eight iOS apps built against iOS 27; Joshua Tree gained Search, pinned Stocks, and an interactive landing page; Stocks and Epiphany merged to main. Shipped first-run onboarding across eleven native apps and pushed checkpoint automation so GitHub issues sync with the roadmap. Fixed Epiphany's bitcoin valuation bug (ticker resolving to Grayscale ETF) and a portfolio sync bug where iOS, macOS, and web overwrote each other; unified to one row shape, added back real account data, and renamed signal labels. Deployed the engraved design system live with satellite wallpaper, fixed the landing bug, synced as a Claude Design project, and have weather and wallpaper PRs open; next is 1.0 for Joshua Tree.

**Apps**: pwnlingo, joshuatree, lexly, bookrank, costanza, curbfind, curvely, dream, epiphany, healstack, roost, sidewise, sparkjar, dotfiles

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

All eight shipped iOS apps built against iOS 27; Joshua Tree gained Search, a pinned Stocks icon, contrast fixes, and an interactive landing page; Stocks and Epiphany merged to main. Shipped first-run onboarding across eleven native apps, fixed pwnlingo's 23-hour stalled loop (the Apps folder was throwing away mouse clicks during redraw because the dock test assumed 10 icons instead of 11), and pushed checkpoint automation so GitHub issues stay in step with the roadmap. Deployed the engraved design system live (black ink on cream paper, hatching shades, satellite wallpaper), fixed the landing black-wallpaper bug, and synced as a new Claude Design project. Chat redesigned as an LLM console and keyboard buffer expanded, both merged and live on the site; weather window open in PR 53 with big temperature, feels-like, humidity, wind, five-day forecast; PR 52 landed satellite wallpaper keeping colour with cream wash instead of monochrome, and boot logo joints that are seamless; next is ship 1.0.

**Apps**: pwnlingo, joshuatree, lexly, bookrank, costanza, curbfind, curvely, dream, epiphany, healstack, roost, sidewise, sparkjar, dotfiles

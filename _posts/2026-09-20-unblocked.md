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

Pushed Joshua Tree toward 1.0: icon, Weather window, save test, and landing page all landed; six more pieces pending, plus built a Pixelmator logo tool and recreated my dad's Best Choice logo in six seconds. Committed the fleet to monetization: eight apps moved to 99 cents (still free on their websites) with MONEY.md and GTM.md across the fleet, launch kits for all 23 apps, and Voxprint shipped with the paywall live.

**Apps**: joshuatree, voxprint

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

Shipped first-run onboarding to eleven native apps with GitHub issue sync; fixed Epiphany's valuation and portfolio sync; deployed the engraved design system. Finished fleet docs pass across 52 repos (progress graphs, architecture diagrams, SHIPPING.md with every asc command), updated CI with cancel-stale-runs and a docs linter. Went through issue trackers fleet-wide: open issues dropped from 168 to 120; closed duplicates on epiphany (11), nimble, cadence, lexly, homeward, healstack, labs, curvely; sidewise shipped saved stories + Saved tab + accessibility (108 tests); sparkjar cleared all 18 (16 were drift alert dupes); tripwire fixed root cause (skip alerts within 30 days). Closed gaps on bcgd: added three service areas, homeowner tip, six blog posts, coupon PDF.

**Apps**: bcgd, pwnlingo, joshuatree, lexly, bookrank, costanza, curbfind, curvely, dream, epiphany, healstack, roost, sidewise, sparkjar, dotfiles

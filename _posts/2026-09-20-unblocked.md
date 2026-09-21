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

Shipped first-run onboarding to eleven native apps with GitHub issue sync; fixed Epiphany's valuation and portfolio sync, deployed the engraved design system, and started Joshua Tree 1.0. Finished fleet docs pass: progress graphs traced across 52 repos, architecture diagrams in costanza and pwnlingo, and SHIPPING.md with every asc command; also updated CI with stale-run cancellation and a docs linter that caught epiphany's roadmap link bug and fixed sparkjar's playwright test placement. Closed gaps on bcgd's site to match the source: added three service areas (Port Coquitlam, Pitt Meadows, Mission) with linked tags, the missing garage-gear homeowner tip, six fresh linked blog posts, and a direct coupon PDF link.

**Apps**: bcgd, pwnlingo, joshuatree, lexly, bookrank, costanza, curbfind, curvely, dream, epiphany, healstack, roost, sidewise, sparkjar, dotfiles

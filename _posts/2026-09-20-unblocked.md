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

Joshua Tree landed icon redesign, Weather forecast, saved-file persistence, landing headline fix, and roadmap prune; six PRs staged awaiting CI with Activity Monitor, shell bare names, Chat defaulting to Qwen, repo cleanup, wallpaper and boot logo, and landing contrast. Releases tagged retrospectively; a Bonsai 2 worker wiring Chat; still hunting for OS names: Matsu, Tupelo, Pinekoi, Barkoi, Plumkoi. Also shipped pixelmator-skill: a tool for building logos live in Pixelmator Pro from JSON specs; 56 unit tests, arc_text curves, CI on ubuntu and macOS, recreated dad's Best Choice garage door logo in six seconds.

**Apps**: joshuatree

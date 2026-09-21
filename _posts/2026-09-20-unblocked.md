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

Joshua Tree landed icon redesign (#60), Weather forecast (#53), saved-file persistence check (#61), landing headline fix (#63), and roadmap prune (#59). Six more PRs staged with auto-merge awaiting CI: Activity Monitor with kill button (#62), shell running by bare name (#64), Chat defaulting to Qwen with real reply working (#65), repo cleanup (#66), colour wallpaper and boot logo seamless (#67), landing page contrast via clrs.cc (#68). Releases tagged retrospectively; a Bonsai 2 worker wiring Chat as default. Still hunting for OS name to replace Joshua Tree; candidates Matsu, Tupelo, Pinekoi, Barkoi, Plumkoi.

Also shipped pixelmator-skill v1.0.0: a tool that builds logos live inside Pixelmator Pro from a JSON spec. Wrote 56 unit tests, added an arc_text helper for text on curves and shape recipes, and wired up CI for ubuntu and macOS. Recreated dad's Best Choice Garage Doors logo in about six seconds; he texted back asking how long that would take in Flash.

**Apps**: joshuatree

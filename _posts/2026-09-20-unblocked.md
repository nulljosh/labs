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

I spent the day pushing Joshua Tree toward a real 1.0: the new icon finally looks like the tree, the Weather window and a proper save test landed, and the landing page headline stopped vanishing when you click the demo. Six more pieces are lined up behind the tests: an Activity Monitor, typing a program's name to run it, Chat talking to Qwen with Bonsai being wired in behind it, a cleaned up repo with a roadmap a person can read, the colour wallpaper and clean boot logo, and colour back on the landing page. JoshuaTree.com is taken so I am still hunting for a name, something short like Koi or Bonsai. I also built a little tool that draws logos live in Pixelmator from a spec and used it to recreate my dad's Best Choice garage door logo in six seconds.

**Apps**: joshuatree

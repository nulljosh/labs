---
layout: post
title: "Unattended"
date: 2026-09-11 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-09-11-unattended.svg %}

{% include graphs/2026-09-11-unattended.svg %}

## Friday

Runner ran unattended overnight, earned zero XP: two invisible bugs thrived because success paths log nothing. First: detector tested only n.disabled but Duolingo sets aria-disabled="true" on unanswered word banks, so every challenge read as answered and clicked dead button before solver ran. Second: solver answered all 12 questions then discarded the lesson because DuoRadio skip heuristic matched the lesson-complete screen. Fixed both bugs, verified +15 XP on post-fix lesson, also deleted four shadowed duplicate definitions in math.js (62 lines), ported grid clustering from pwnlingo into seamark, and fixed stalled tracks persisting across restarts. Key finding: lesson-end log now carries per-cycle detector tally, which made both bugs findable in minutes after 7.5 hours of empty logs.

## Apps

Pwnlingo: aria-disabled and skip-heuristic bugs fixed, zero XP recovery, per-cycle detector tally logging. Seamark: grid clustering engine ported. All runners live and unattended.

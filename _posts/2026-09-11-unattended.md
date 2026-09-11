---
layout: post
title: "Unattended"
date: 2026-09-11 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-09-11-unattended.svg %}

{% include graphs/2026-09-11-unattended.svg %}

## Friday

Runner ran unattended overnight, earned zero XP because two invisible bugs thrived in silent success paths. The detector tested only n.disabled but Duolingo sets aria-disabled="true", so every challenge read as answered; the solver then answered all 12 questions before the skip heuristic matched the lesson-complete screen and discarded everything. Fixed both bugs and verified +15 XP on the next lesson, plus deleted shadowed definitions, ported grid clustering into seamark, and fixed stalled tracks. Jekyll build broke because the post referenced a missing header SVG, so added it matching house style and verified the build passes.

## Apps

Pwnlingo: aria-disabled and skip-heuristic bugs fixed, zero XP recovery, per-cycle detector tally logging. Seamark: grid clustering engine ported. All runners live and unattended.

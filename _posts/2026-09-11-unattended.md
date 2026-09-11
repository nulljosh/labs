---
layout: post
title: "Unattended"
date: 2026-09-11 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-09-11-unattended.svg %}

{% include graphs/2026-09-11-unattended.svg %}

## Friday

Runner ran unattended overnight, earned zero XP because two invisible bugs thrived in silent success paths: detector tested only n.disabled but Duolingo sets aria-disabled="true", so every challenge read as answered; solver answered all 12 questions before the skip heuristic matched lesson-complete and discarded everything. Fixed both bugs, verified +15 XP on next lesson, and found two more gaps dangerous once the solver worked: process.exit(0) on out-of-hearts kills the unattended session with no restart, and clickByText still tested only .disabled (same aria-disabled bug in the helper). Fixed both plus XP counter that silently zeroed on every restart because it captured xp0 at process start, hiding the day's real gain; now measure against persisted daily baseline matching Duolingo's rollover. Fixes holding: plus 660 XP today and climbing at 40/min with 5/5 hearts perfect accuracy, Czech progressed from 1 level to 10 (0.2% to 1.8% complete).

Also audited the nulljosh repos for README badge consistency, patching 11 repos missing licenses or GitHub badges, and reviewed the journal blog to scope out four improvements: a per-app index, tags for navigation, a site-wide streak graph, and an RSS link in the footer, none yet built.

## Apps

Pwnlingo: aria-disabled and skip-heuristic bugs fixed, zero XP recovery, per-cycle detector tally logging, docs synced. Seamark: grid clustering engine ported. Epiphany: version bump + screenshots + App Review resubmission. All runners live and unattended.

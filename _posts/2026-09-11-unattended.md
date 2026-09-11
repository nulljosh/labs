---
layout: post
title: "Unattended"
date: 2026-09-11 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-09-11-unattended.svg %}

{% include graphs/2026-09-11-unattended.svg %}

## Friday

Runner ran unattended overnight, earned zero XP because two invisible bugs thrived in silent success paths: detector tested only n.disabled but Duolingo sets aria-disabled="true", so every challenge read as answered; solver answered all 12 questions before the skip heuristic matched lesson-complete and discarded everything. Fixed both bugs, verified +15 XP on next lesson, and found two more gaps dangerous once the solver worked: process.exit(0) on out-of-hearts kills the unattended session with no restart, and clickByText still tested only .disabled (same aria-disabled bug in the helper). Fixed both plus XP counter that silently zeroed on every restart because it captured xp0 at process start, hiding the day's real gain; now measure against persisted daily baseline matching Duolingo's rollover. Fixes holding: plus 660 XP today and climbing at 40/min with 5/5 hearts perfect accuracy, Czech progressed from 1 level to 10 (0.2% to 1.8% complete). Also fixed Epiphany's landing page bug where the screenshot skill was committing new images to git but never deploying, so the site showed stale images; built, deployed, and edited the skill to add an explicit deploy step with a note that landing pages share screenshots with the README.

## Apps

Pwnlingo: aria-disabled and skip-heuristic bugs fixed, zero XP recovery, per-cycle detector tally logging, docs synced. Seamark: grid clustering engine ported. Epiphany: landing page screenshot deploy fixed + skill patched. Homeward: native email/password auth landed on iOS via Swift SDK, Android/macOS/Windows via KMP Ktor client. All runners live and unattended.

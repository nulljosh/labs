---
layout: post
title: "Unattended"
date: 2026-09-11 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-09-11-unattended.svg %}

{% include graphs/2026-09-11-unattended.svg %}

## Friday

Runner ran unattended overnight, earned zero XP because two invisible bugs thrived in silent success paths: detector tested only n.disabled but Duolingo sets aria-disabled="true", so every challenge read as answered; solver answered all 12 questions before the skip heuristic matched lesson-complete and discarded everything. Fixed both bugs, verified +15 XP on next lesson, and found two more gaps dangerous once the solver worked: process.exit(0) on out-of-hearts kills the unattended session with no restart, and clickByText still tested only .disabled (same aria-disabled bug in the helper). Fixed both plus XP counter that silently zeroed on every restart because it captured xp0 at process start, hiding the day's real gain; now measure against persisted daily baseline matching Duolingo's rollover. Fixes holding: plus 660 XP today and climbing at 40/min with 5/5 hearts perfect accuracy, Czech progressed from 1 level to 10 (0.2% to 1.8% complete). Also debugged Epiphany's landing page (screenshots stopped deploying), GitHub OAuth (credentials went stale), and X/Twitter (wrong provider key), fixed all three, then wired social sign-in across the fleet: all four providers to co-stanza, Apple/Google to roost and healstack, Google plus deletion to sparkjar and quotestreak, Face ID and password reset to lexly and bookrank, and Apple/Google/password reset/deletion to homeward on iOS/macOS, then re-synced Epiphany's components to Claude Design for visual editing.

## Apps

Pwnlingo: aria-disabled and skip-heuristic bugs fixed, zero XP recovery, per-cycle detector tally logging, docs synced. Seamark: grid clustering engine ported. Epiphany: landing page screenshot deploy fixed + skill patched. Co-stanza: profile view, avatars, all four OAuth providers, Face ID, account deletion. Roost: Apple/Google sign-in added. Healstack: Google button wired on iOS, Apple gate fixed on macOS. Sparkjar: macOS Apple sign-in. Quotestreak: Google sign-in + deletion. Lexly: password reset + Face ID. Bookrank: Face ID convenience login. Homeward: native email/password auth landed on iOS, Apple/Google/password reset/deletion on iOS/macOS, KMP Ktor client for Android/Windows. All auth flows live and unattended.

---
layout: post
title: "Unattended"
date: 2026-09-11 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-09-11-unattended.svg %}

{% include graphs/2026-09-11-unattended.svg %}

## Friday

Unattended runner hit two critical bugs overnight where the detector wasn't checking aria-disabled and the solver didn't properly detect lesson-end, throwing away every result. Fixed both, plus a silent XP counter bug that was resetting at process start instead of measuring against a persisted baseline. Wired social sign-in across the fleet: all four providers to co-stanza, Apple/Google to roost and healstack, plus Google plus Face ID/password reset scattered across sparkjar, quotestreak, lexly, bookrank, and homeward on both platforms. Also reviewed the portfolio site, fixed three missing app entries and a stale Charwork domain link, debugged the Toroid landing page where site-wide security headers were blocking the demo iframe (relaxed frame-ancestors for /play.html to allow SAMEORIGIN), and spotted the CanLII search should fold into Litigate.

## Apps

Pwnlingo: aria-disabled and skip-heuristic bugs fixed, zero XP recovery, per-cycle detector tally logging, docs synced. Seamark: grid clustering engine ported. Epiphany: landing page screenshot deploy fixed + skill patched. Co-stanza: profile view, avatars, all four OAuth providers, Face ID, account deletion. Roost: Apple/Google sign-in added. Healstack: Google button wired on iOS, Apple gate fixed on macOS. Sparkjar: macOS Apple sign-in. Quotestreak: Google sign-in + deletion. Lexly: password reset + Face ID. Bookrank: Face ID convenience login. Homeward: native email/password auth landed on iOS, Apple/Google/password reset/deletion on iOS/macOS, KMP Ktor client for Android/Windows. Toroid: landing page iframe headers relaxed for live demo. All auth flows live and unattended.

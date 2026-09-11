---
layout: post
title: "Unattended"
date: 2026-09-11 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-09-11-unattended.svg %}

{% include graphs/2026-09-11-unattended.svg %}

## Friday

Unattended runner had two critical bugs overnight: the detector wasn't checking aria-disabled and the solver didn't detect lesson-end properly, throwing away every result. Fixed those plus a silent XP counter bug that reset at process start instead of tracking against a persisted baseline. Wired social sign-in across the fleet: all four providers to co-stanza, Apple/Google to roost and healstack, plus Face ID and password reset scattered across sparkjar, quotestreak, lexly, bookrank, and homeward on both platforms. Spent the afternoon polishing the fleet's landing pages: trimmed oversized hero headers on blockframe, numen, wordroot, curvely, inkpress, quotestreak, sidewise, keyrate, dream, bookrank, and seamark to focus on the app preview, migrated nyc off Vercel onto Cloudflare Workers, and removed duplicate device-frame text from voxprint and a redundant iframe demo from weather. Then fixed the iframe previews: six apps were showing their titles twice, once as the landing caption and again inside the embedded app, so I added an embed mode that hides the in-app headers when running in the device frame.

## Apps

Pwnlingo: aria-disabled and skip-heuristic bugs fixed, zero XP recovery, per-cycle detector tally logging, docs synced. Seamark: grid clustering engine ported. Epiphany: landing page screenshot deploy fixed + skill patched. Co-stanza: profile view, avatars, all four OAuth providers, Face ID, account deletion. Roost: Apple/Google sign-in added. Healstack: Google button wired on iOS, Apple gate fixed on macOS. Sparkjar: macOS Apple sign-in. Quotestreak: Google sign-in + deletion. Lexly: password reset + Face ID. Bookrank: Face ID convenience login. Homeward: native email/password auth landed on iOS, Apple/Google/password reset/deletion on iOS/macOS, KMP Ktor client for Android/Windows. Toroid: landing page iframe headers relaxed for live demo. All auth flows live and unattended.

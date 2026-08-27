---
layout: post
title: "Fortified"
date: 2026-08-27 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-08-27-fortified.svg %}

Security sweep across three apps. Epiphany's broker webhook was accepting unauthenticated trade orders, and the positions endpoint leaked account balances to any caller. Fixed both to require authentication and added a shared secret-check helper. Hardened two autopilot cron endpoints that skip auth when CRON_SECRET is missing. Talli got security headers and removed a dead brute-force tool from archive. Ran npm audit fix to patch DoS bugs in body-parser and qs. Litigate added the same security headers. Full test suite passes (437 tests in epiphany).

**Still on Joshua:** rotate Stripe and Supabase keys in epiphany/.env.tui.local.

**Apps:** Epiphany (token fix), Talli, Litigate (removed), Curvely, NYC, Lexly updated; security fixes and submissions.

## Thursday

Ran a full security sweep across three repos: Epiphany's broker webhook was placing real Alpaca trades for anyone (fixed to require auth), positions endpoint leaked account balances (same fix), and two autopilot cron handlers ran unprotected when CRON_SECRET wasn't set (hardened both). Talli got security headers, npm audit fix for DoS bugs (body-parser, qs), and I deleted a dead brute folder. Litigate added the same security headers and regenerated WEBHOOK_SECRET/CRON_SECRET. Also pushed five app submissions: Epiphany's critical Apple token verification fix, Curvely's graph layout, NYC macOS with real screenshots, and Lexly's final pass, then discovered Litigate's live version exposed case data in the store and removed it from sale pending the patched build. Ingested 25 Apple Notes into roadmaps and wiki.

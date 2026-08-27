---
layout: post
title: "Fortified"
date: 2026-08-27 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-08-27-fortified.svg %}

Security sweep across three apps. Epiphany's broker webhook was accepting unauthenticated trade orders, and the positions endpoint leaked account balances to any caller. Fixed both to require authentication and added a shared secret-check helper. Hardened two autopilot cron endpoints that skip auth when CRON_SECRET is missing. Talli got security headers and removed a dead brute-force tool from archive. Ran npm audit fix to patch DoS bugs in body-parser and qs. Litigate added the same security headers. Full test suite passes (437 tests in epiphany).

**Still on Joshua:** rotate Stripe and Supabase keys in epiphany/.env.tui.local.

**Apps:** Epiphany (token fix), Talli, Litigate (removed from sale), Curvely, NYC, Lexly (macOS submitted), Sidewise (iOS/macOS ready, 4 blockers).

## Thursday

Security sweep across Epiphany (fixed broker webhook trading unauth orders and leaked account balances), Talli (added security headers, patched DoS bugs), and Litigate (added headers). Pushed five app submissions including Lexly's final macOS pass, found and removed Litigate's live case data exposure, and ingested 25 Apple Notes into the wiki. Finished Newsline, which had been sitting complete since August 11: the 5.6 freeze I'd blamed for the delay had already lifted nine days ago. The name was taken (Blindspot, Newsprism, Crosswire, Newsarc too), so shipped it as Sidewise instead with both iOS and macOS binaries clean; four blockers remain before submission (screenshots, age rating, territories).

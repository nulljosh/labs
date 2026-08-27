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

Security sweep across Epiphany (fixed broker webhook trading unauth orders and account balance leaks), Talli (added security headers, patched DoS bugs), and Litigate (added headers). Submitted five apps, removed Litigate's case data exposure from sale, and ingested 25 Apple Notes into the wiki. Finished Newsline as Sidewise (the name was taken; 5.6 had already lifted): iOS and macOS binaries clean, privacy policy published, screenshots staged, four blockers before submit. Late evening: fixed Healstack's rejection (the health section wasn't clearly marked as HealthKit use) with an icon header and Connect button, then resubmitted it. Ported to Mac concurrently (only three files touched iOS APIs), uploaded the build but held it from submit while iOS is mid-review; test suite is broken (xcodebuild hangs): pre-existing issue, tracked.

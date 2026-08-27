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

Ran a full security sweep: Epiphany's broker webhook was trading real Alpaca orders for anyone (fixed to require auth), positions endpoint leaked account balances (same fix), and two autopilot cron handlers ran unprotected when CRON_SECRET wasn't set (hardened both). Talli got security headers, npm audit fix for DoS bugs, and a dead brute folder deleted. Litigate added the same security headers and regenerated secrets. Pushed five app submissions (Epiphany's Apple token fix, Curvely's graph layout, NYC macOS with real screenshots, Lexly's final pass), discovered Litigate's live version exposed case data and removed it from sale, then ingested 25 Apple Notes into roadmaps and wiki. Built four new science courses for Lexly already live on the web (iOS/macOS app's content directory symlinked to repo root, so they came along with rebuild), submitted the macOS build to review; iOS archived and uploaded but blocked by an earlier version still in flight.

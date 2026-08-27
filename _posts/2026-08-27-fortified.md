---
layout: post
title: "Fortified"
date: 2026-08-27 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-08-27-fortified.svg %}

Security sweep across three apps. Epiphany's broker webhook was accepting unauthenticated trade orders, and the positions endpoint leaked account balances to any caller. Fixed both to require authentication and added a shared secret-check helper. Hardened two autopilot cron endpoints that skip auth when CRON_SECRET is missing. Talli got security headers and removed a dead brute-force tool from archive. Ran npm audit fix to patch DoS bugs in body-parser and qs. Litigate added the same security headers. Full test suite passes (437 tests in epiphany).

**Still on Joshua:** rotate Stripe and Supabase keys in epiphany/.env.tui.local.

**Apps:** Epiphany, Talli, Litigate ship with security fixes.

## Thursday

Ran a full security sweep across three repos. Epiphany's broker webhook was placing real Alpaca trade orders for anyone hitting the endpoint, and positions endpoint leaked account balances - fixed both to require a session or secret, then hardened two autopilot cron handlers (impact-test, morning-run) that ran unprotected when CRON_SECRET wasn't set. Talli got security headers, npm audit fix for DoS bugs (body-parser, qs), and I deleted a dead "brute" folder with a login tool and password lists. Litigate added the same security headers, tested everything locally, and pushed all changes; later regenerated WEBHOOK_SECRET and CRON_SECRET into .env.tui.local and committed a roadmap note on pending Stripe and Supabase key rotation.

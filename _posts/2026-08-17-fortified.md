---
layout: post
title: "Fortified"
date: 2026-08-17 22:00:00 -0700
categories: journal daily
---

![August 17](/assets/2026-08-17-fortified.svg)

## Sunday (August 17)

Ran a security sweep across 29 repos in the codebase to find anything broken that hadn't made it onto a roadmap. Found two critical issues: lexly's `/school` gate was forged via a browser cookie, fixed with Basic auth that now denies when SCHOOL_PASSWORD is unset. Nimble's public Workers AI proxy had no auth or rate-limiting, added a per-IP 20 requests/minute limit in wrangler.jsonc and deployed. Everything else checked out — sparkjar, healstack auth verified solid, and all the Cloudflare Pages sites running clean. Found one gotcha worth recording: lexly's Cloudflare Pages project has no git connection, only scripts/deploy.sh pushes it (bypassing the usual git→Pages automation), which is fine once you know to expect it.

Registered for LECSS Pre-Calculus 12 Section 53 (online, Sep 14 2026 – Jun 23 2027) — chose it over Section 55 based on instructor preference. Had to fill a blank Graduated Student Learning Plan PDF programmatically (pypdf + reportlab overlay, no AcroForm fields), populated name/DOB/contact/course-goals/plan-expiry, signed and dated it. Converted HEIC photos to JPG and uploaded scanned BC driver's licence and Canadian passport via Claude in Chrome for identity verification. All profile documents now submitted; registration pending office review, documents accepted 2026-08-17.

Spent the afternoon migrating the last two big projects off Vercel. Missing-pets got renamed to Homeward and moved to Cloudflare Pages (static export, every page is `"use client"` against Supabase, dynamic `/listing/[id]` became `/listing?id=` because static segments can't work without `generateStaticParams`). Kept the old `pets.heyitsmejosh.com` domain as an alias so links don't break. Epiphany was the bigger one — the API is actually one serverless function dispatching over several routes, so it was feasible to port to Workers. Deployed to `epiphany.trommatic.workers.dev` for verification before cutting DNS over (production still on Vercel). Swapped jsdom for linkedom to cut the bundle from 95% to a reasonable size, switched `node:dns` and `node:net` to Cloudflare's DoH and regex guards, and mirrored Vercel's blob storage via Workers KV. Three upstream APIs started rejecting Workers egress IPs (CoinGecko, CNN), so added fallbacks: Kraken for crypto prices, Coinbase for spot, stale KV cache + graceful empty for fear-greed. Crons are deliberately disarmed (Vercel still runs the real broker trades). Status-code parity looked good until we hit the blocker: 22 of 57 Vercel env vars are marked sensitive (write-only), so `vercel env pull` returned the literal string `[SENSITIVE]` for OAuth secrets, Resend, FMP, Yelp, SnapTrade, and OpenSky keys. These got uploaded to the Worker broken. Cutover is blocked until those are recovered from their respective provider dashboards. Recovered what we could (OAuth client IDs from production's own redirect URLs, Stripe price ID from Stripe API), but the client secrets and API keys need manual re-entry. The Vercel downgrade from 18 projects to 2 (tally and epiphany) is done; Epiphany is ported and tested but not ready to flip.

## Apps Summary

**Security fixes deployed (2026-08-17):** lexly (cookie-forgery closed), nimble (proxy rate-limited). **Infrastructure work:** Homeward (formerly missing-pets) migrated to Cloudflare Pages + renamed across web/iOS, Epiphany API ported to Cloudflare Workers (BLOCKED ON ENV RECOVERY). **Live:** Epiphany, Voxprint, Talli, Inkpress, Lexly (iOS + macOS), Litigate (iOS), Bookrank (macOS), plus all Cloudflare Pages sites. Vercel now at 2 projects (down from 18).

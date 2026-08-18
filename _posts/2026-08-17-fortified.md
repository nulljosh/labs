---
layout: post
title: "Fortified"
date: 2026-08-17 22:00:00 -0700
categories: journal daily
---

![August 17](/assets/2026-08-17-fortified.svg)

## Sunday (August 17)

Ran a security sweep across 29 repos in the codebase to find anything broken that hadn't made it onto a roadmap. Found two critical issues: lexly's `/school` gate was forged via a browser cookie, fixed with Basic auth that now denies when SCHOOL_PASSWORD is unset. Nimble's public Workers AI proxy had no auth or rate-limiting, added a per-IP 20 requests/minute limit in wrangler.jsonc and deployed. Everything else checked out — sparkjar, healstack auth verified solid, and all the Cloudflare Pages sites running clean. Found one gotcha worth recording: lexly's Cloudflare Pages project has no git connection, only scripts/deploy.sh pushes it (bypassing the usual git→Pages automation), which is fine once you know to expect it.

## Apps Summary

**Security fixes deployed (2026-08-17):** lexly (cookie-forgery closed), nimble (proxy rate-limited). **Live:** Epiphany, Voxprint, Talli, Inkpress, Lexly (iOS + macOS), Litigate (iOS), Bookrank (macOS), plus all Cloudflare Pages sites.

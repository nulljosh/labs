---
layout: post
title: "Fortified"
date: 2026-08-17 22:00:00 -0700
categories: journal daily
---

{% include headers/2026-08-17-fortified.svg %}

## Sunday (August 17)

Ran a security sweep across the whole codebase and found two issues: a school page whose gate was forgeable via browser cookie, and a public AI proxy with no auth or rate limiting. Both fixed and deployed. Registered for Pre-Calculus 12 later, filling a scanned form with no actual fields by drawing text on top.

Spent the afternoon moving the last two big projects off the old host. The finance API was the awkward one, since three upstream services quietly refuse traffic from the new platform, so it now falls back to other sources when needed.

## Tuesday (August 18)

Submitted Wordroot and caught a missing encryption declaration on BCGD that would have bounced at submission. Rebuilt Curvely, Wiretext, and Healstack after verifying their defects were fixed, then validated all six staged versions clean. Cleared two stray review submissions stuck in the ASC API layer and fixed Bookrank's live listing. Found Voxprint's "Echo Pro" branding leak was stale Jul 3 screenshots plus a silent test guard; fixed the test to fail loudly and renamed the IAP to "Voxprint Pro". Healstack's landing page was white in dark mode because Cloudflare was serving a stale build, so I rebuilt, deployed, and swapped hardcoded white on the buttons for a theme variable.

## Wednesday (August 19)

Fixed Talli's hardcoded PWD/CDB amounts on both platforms and resubmitted Lexly's macOS build. Bookrank went live on iOS, macOS in review. Audited Wordroot's codebase and found four defects with a stored XSS where user input went unescaped to innerHTML; fixed that, added Wiktionary attribution to the apps, and surfaced network errors. Stripe audit showed four apps (epiphany, healstack, sparkjar, talli) already working; the reauthorization claim was stale, but the bottleneck is Apple's unsigned Paid Apps Agreement and account-matching. Voxprint ($7.99) and Epiphany ($1) pricing set but gated on that agreement.

## Apps

Bookrank iOS live, macOS in review. Wordroot, Curvely, Wiretext, Healstack, and Lexly macOS in review. Sparkjar, BCGD, and Wordroot macOS staged. Epiphany and Talli's App Privacy flagged. Inkpress code-ready.

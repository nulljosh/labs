---
layout: post
title: "Fortified"
date: 2026-08-17 22:00:00 -0700
categories: journal daily
---

{% include headers/2026-08-17-fortified.svg %}

## Monday (August 17)

Ran a security sweep and found two issues: a forgeable school-page gate and an unprotected AI proxy. Fixed both. Moved the last two big projects off the old host, with the finance API falling back to other sources when upstream services refuse the new platform.

## Tuesday (August 18)

Submitted Wordroot, caught missing encryption on BCGD. Rebuilt Curvely, Wiretext, Healstack after fixing defects, validated six versions. Cleared two stray submissions stuck in ASC, fixed Bookrank's live listing. Fixed Voxprint's stale "Echo Pro" branding (Jul 3 screenshots). Fixed Healstack's landing page (Cloudflare stale build with hardcoded white buttons invisible in dark mode).

## Wednesday (August 19)

Fixed Talli, resubmitted Lexly macOS, and got Bookrank iOS live. Resolved the bank-account routing-number blocker. Evening was documentation: updated Epiphany's whitepaper, wrote three new whitepapers, added whitepaper links to 21 READMEs, and sketched Epiphany's landing-page redesign (swap static hero for live demo, flip interactive after signup). Diagnosed why the live app shows an old icon: shipped build predates the fix. Verified ASC review state (Curvely, Wiretext, Wordroot iOS, Healstack waiting for verdicts; Lexly macOS in review) and resolved a stale claim that the developer agreement blocks submissions (it doesn't).

## Saturday (August 22)

Shipped app fixes (Curvely, Epiphany, Healstack, Lexly, Sparkjar), swept 29 Apple Notes, redesigned bookrank with sticky header, live search, 127 covers, sort, hovers, search shortcut. Pruned App Store (nullfolio scrapped, newsline held, nimble approved), fixed sparkjar, cleaned bookrank.

Nimble built the ASC pipeline (.asc/workflow.json + ExportOptions) but hit a blocker: the record must exist before `asc xcode export` can mint profiles. Session stopped at 84% usage; Joshua creates the record via browser next, fills IOS_APP_ID, screenshots, upload. Submission gated on three approvals; running apps caught rendering bugs (nimble letterboxing, Healstack indices).

## Apps

Bookrank iOS live, macOS in review. Wordroot, Curvely, Wiretext, Healstack iOS, Lexly macOS, Sparkjar macOS in review. BCGD, Wordroot macOS staged. Epiphany and Talli flagged. Inkpress code-ready. LEC scaffolded.

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

Submitted Wordroot and caught a missing encryption declaration on BCGD that would have bounced at submission. Rebuilt Curvely, Wiretext, and Healstack after verifying their defects were fixed, then validated all six staged versions clean. Cleared two stray review submissions stuck in the ASC API layer and fixed Bookrank's live listing. Found Voxprint's "Echo Pro" branding leak was stale Jul 3 screenshots plus a silent test guard; fixed the test to fail loudly and renamed the IAP to "Voxprint Pro". Healstack's landing page was white in dark mode because Cloudflare was serving a stale build, so I rebuilt, deployed, and swapped hardcoded white on the buttons for a theme variable.

## Wednesday (August 19)

Fixed Talli, resubmitted Lexly macOS, and got Bookrank iOS live. Resolved the bank-account routing-number blocker. Evening was documentation: updated Epiphany's whitepaper, wrote three new whitepapers, added whitepaper links to 21 READMEs, and sketched Epiphany's landing-page redesign (swap static hero for live demo, flip interactive after signup). Diagnosed why the live app shows an old icon: shipped build predates the fix. Verified ASC review state (Curvely, Wiretext, Wordroot iOS, Healstack waiting for verdicts; Lexly macOS in review) and resolved a stale claim that the developer agreement blocks submissions (it doesn't).

## Saturday (August 22)

Chased a Claude Code banner issue. The running session had launched via an older binary through a cmux shim, so it reported an update was pending even though the latest was on disk. A full `/exit` and relaunch cleared it. Also shipped a UI fix to bookrank hiding the overdue badge when past due.

## Apps

Bookrank iOS live, macOS in review. Wordroot, Curvely, Wiretext, Healstack, Lexly macOS in review. Sparkjar, BCGD, Wordroot macOS staged. Epiphany and Talli flagged. Inkpress code-ready. LEC scaffolded.

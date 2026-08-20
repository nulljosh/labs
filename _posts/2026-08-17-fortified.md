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

Fixed Talli, resubmitted Lexly macOS, and got Bookrank iOS live. Resolved the bank-account routing-number blocker so both tax forms filed. Pulled a quarter gig of junk builds out of nine repos and fixed Lexly's skip-all-questions exploit. Evening was documentation: updated Epiphany's whitepaper with current shipping status, wrote three new whitepapers (Cadence, Fengshui, Portfolio), and added whitepaper links to 21 README files. Diagnosed why the live Epiphany app still shows an old icon: shipped build predates the fix by six hours, so needs a new build and submission.

## Apps

Bookrank iOS live, macOS in review. Wordroot, Curvely, Wiretext, Healstack, and Lexly macOS in review. Sparkjar, BCGD, and Wordroot macOS staged. Epiphany and Talli's App Privacy flagged. Inkpress code-ready. LEC scaffolded (network layer + tests).

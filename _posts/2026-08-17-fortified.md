---
layout: post
title: "Fortified"
date: 2026-08-17 22:00:00 -0700
categories: journal daily
---

{% include headers/2026-08-17-fortified.svg %}

## Sunday (August 17)

Ran a security sweep across the whole codebase and found two things worth finding: a school page whose gate could be forged with a browser cookie, and a public AI proxy with no auth or rate limiting at all. Both fixed and deployed. Registered for Pre-Calculus 12 in the evening, which meant filling a scanned form that had no actual form fields in it, so I drew the text on top of the page instead.

Spent the afternoon moving the last two big projects off the old host. The finance API was the awkward one, since three of the upstream services it depends on quietly refuse traffic from the new platform, so it now falls back to other sources when they do.

## Tuesday (August 18)

Submitted Wordroot, rebuilt Curvely, Wiretext, and Healstack after verifying their defects were fixed, and caught a missing encryption declaration on BCGD that would have bounced at submission. Validated all six staged versions clean and held the submission line at one app per verdict rather than dumping a batch on day one off the suspension. Cleared two stray review submissions stuck in the ASC API layer and fixed Bookrank's live listing metadata. Found the "Echo Pro" branding leak on Voxprint was stale Jul 3 screenshots plus a test with silent guards; fixed the test to fail loudly and renamed the in-app purchase to "Voxprint Pro", but screenshot regeneration failed due to a fastlane and Xcode 26 toolchain mismatch. Late on, Healstack's landing page was still white in dark mode, and the code was already right - Cloudflare was just serving a stale build, so I rebuilt and deployed, and swapped the invisible hardcoded white on the buttons for a theme variable while I was in there.

## Apps

Wordroot, Curvely, Wiretext, and Healstack in review. Sparkjar iOS and macOS, BCGD iOS and macOS, Wordroot macOS, and Lexly macOS all validated and held for staged submission. Epiphany and Talli's App Privacy declarations flagged for review. Inkpress is code-ready but needs an archive and upload.

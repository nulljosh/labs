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

Submitted Wordroot, rebuilt Curvely, Wiretext, and Healstack post-defect verification, and fixed App Privacy issues on Epiphany and Talli. Caught a missing encryption declaration on BCGD's iOS and macOS builds that would have bounced at submission, and validated all six remaining staged versions clean. Held the submission line at one app per verdict rather than dumping the whole queue on day one off the suspension, then un-rotted thirteen roadmaps that had been marked blocked until today.

Cleared two stray review submissions stuck on Curvely and BCGD (turns out they were API-started drafts with zero items, not submissions, so the normal cancel command couldn't touch them but the dashboard delete action could). Fixed Bookrank's live listing (was showing Uprighty with dead domain links), created new version rows, updated description and support URL.

## Apps

Wordroot, Curvely, Wiretext, and Healstack in review. Sparkjar iOS and macOS, BCGD iOS and macOS, Wordroot macOS, and Lexly macOS all validated and held for staged submission. Epiphany and Talli's App Privacy declarations flagged for review. Inkpress is code-ready but needs an archive and upload.

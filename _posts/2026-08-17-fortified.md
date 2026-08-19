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

Submitted Wordroot and rebuilt Curvely, Wiretext, and Healstack after defect verification. Caught a missing encryption declaration on BCGD that would've bounced, validated all staged versions clean, and held the submission line to one app per verdict. Spent the evening refactoring the landing pages for Sparkjar and Talli to use the full viewport width: moved Sparkjar's screenshot into a hero column and widened Talli's shell to put copy and a payment preview side by side. Also cleared two stray review submissions stuck in the API layer and fixed Bookrank's live listing.

## Friday (August 18)

Fixed Healstack's landing page dark mode - the Cloudflare Pages build was serving stale code with hardcoded white backgrounds, so I rebuilt and deployed the current source. Also fixed the CTA buttons that were invisible on cream, swapping the hardcoded white for a variable that follows the theme. Verified the live site now serves the right CSS.

## Apps

Wordroot, Curvely, Wiretext, and Healstack in review. Sparkjar iOS and macOS, BCGD iOS and macOS, Wordroot macOS, and Lexly macOS all validated and held for staged submission. Epiphany and Talli's App Privacy declarations flagged for review. Inkpress is code-ready but needs an archive and upload.

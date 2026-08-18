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

Submitted Wordroot to review and verified Curvely and Wiretext's 5.6 defects were fixed (both native SwiftUI now), so held them in review. Fixed production bugs on Sparkjar: Apple auth was 500ing from a missing env var after the Cloudflare migration, and password reset was broken by route injection. Understood Healstack's rejection via Apple's screenshot (a Supabase error that isn't reproducing), cancelled the stuck submission. Set BCGD pricing and App Privacy, uploaded screenshots. Refined the journal: posts had bloated past the cap, so rewrote all twelve to spec and restyled the SVG headers to the house format (800×500 frame, one-word title, repos touched, what happened, held items, date).

## Apps

Wordroot, Curvely, and Wiretext in review. Sparkjar's auth fixed and live. Healstack's stuck submission cleared. BCGD pricing set, screenshots live. Journal posts refined to spec.

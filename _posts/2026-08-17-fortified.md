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

Submitted Wordroot to review and verified Curvely and Wiretext's 5.6 defects were fixed (both native SwiftUI). Fixed production bugs on Sparkjar (Apple auth 500ing from missing env var, password reset broken by route injection), understood Healstack's rejection (Supabase server error now resolved), and cancelled the stuck submission. Rebuilt all four apps and staged them: Sparkjar, Healstack (with Apple sign-in gated off), BCGD (fixed hardcoded version string on both platforms), Wordroot macOS (missing app category was the real blocker). Healstack submitted as the first post-freeze app with demo account verified against production. Audited App Privacy declarations and found Epiphany and Talli still claim zero data collection despite connecting real accounts.

## Apps

Wordroot, Curvely, and Wiretext in review. Sparkjar, Healstack, BCGD, and Wordroot macOS all rebuilt and staged (VALID, not submitted). Epiphany and Talli's App Privacy declarations flagged for review.

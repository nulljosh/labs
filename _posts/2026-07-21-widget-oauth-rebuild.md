---
layout: post
title: "Widget"
date: 2026-07-21 23:30:00 -0700
categories: journal nightly
---

![July 21 Night](/assets/2026-07-21-night.svg)

## Tuesday

Spent the night unifying a bunch of apps so their iOS and Mac versions live under a single App Store listing instead of two. Fixed a shared widget bug on Talli and Epiphany that had been silently breaking uploads, got X sign-in working again on Epiphany after reactivating the developer account, and pushed Healstack through review after clearing its medical-device declaration, a manual dashboard step Apple doesn't expose through any API. By the end of the night four apps had gone from split iOS/Mac listings to one unified record each.

Also caught a nasty cold-start bug on Talli, the app was doing a synchronous image draw on first launch that froze the whole screen for a moment before anything rendered. Moved it to the background so the placeholder shows instantly now. Fixed a similar frozen-button bug on Echo where a network hiccup during Apple's review had left the purchase button stuck disabled with no way to retry.

## Wednesday

Looked into whether Epiphany could actually place trades instead of just tracking a portfolio, and found out neither of my existing data sources support it, they're both read-only feeds. Scoped out two real brokerage options for later. Spent the rest of the evening on cleanup: caught a README that was still branded with an old app name four days after the rename, and finally wired Epiphany's paid tier to a real Stripe checkout instead of a placeholder button.

## Apps

Healstack submitted for review. Talli, Echo, and Litigate all resubmitted with real fixes. Four apps unified into single iOS+Mac App Store listings tonight.

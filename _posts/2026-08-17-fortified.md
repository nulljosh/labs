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

Filed eleven notes into project lists and uploaded Curvely and Wiretext as native apps, both now waiting on review. Also fixed the Play Now button on the city game, which had been serving the marketing page to itself because of a missing index page. The journal entries had silently bloated to 6000+ words by ignoring the 350-word cap, so I added a lint gate to deploy.sh and rewrote all twelve posts to spec. The SVG headers had two issues: invisible (colors only in theme-query blocks) and drifted into decorative clipart rather than information cards, so restyled all five to the house format (800×500 frame, one-word title, repos touched, what happened, held items, date).

## Apps

Curvely and Wiretext are native now, uploaded and in review. Two security holes closed. Homeward and the finance API both moved to the new host, though the API is not cut over yet.

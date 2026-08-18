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

Filed eleven notes from my phone into the right project lists and cleared the inbox. Then fixed the real gap left by the app freeze ending: the two apps I rewrote as native on Friday had never actually been built, so the store still held the rejected web-view versions. Building and uploading those was the whole job, and both are now waiting on review.

Also fixed the Play Now button on the city game, which had been quietly serving the marketing page back to itself because the app folder had no index page in it.

## Apps

Curvely and Wiretext are native now, uploaded and in review. Two security holes closed. Homeward and the finance API both moved to the new host, though the API is not cut over yet.

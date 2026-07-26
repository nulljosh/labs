---
layout: post
title: "Finish the Details"
date: 2026-07-25 12:00:00 -0700
categories: journal weekly
---

![Week of July 25](/assets/2026-07-25-finish-the-details.svg)

## Friday (July 25)

Spent the evening polishing half a dozen apps: removed the "LIVE" badges and gradient shine from Epiphany's landing page (they felt like placeholder copy), fixed Healstack's navbar safe-area overlap and completed the Dose → Healstack rename by adding the missing display name in Info.plist, cleaned up Lexly's subject navigation to horizontal-scroll-only and fixed a 404 on the school dashboard link, moved Talli's personal info fields from Reports into Settings with keychain persistence for the phone number, redesigned Quotable's icon as a text-free geometric mark, and fixed footer contrast on BCGD to meet WCAG AA.

Most time tonight went to the portfolio DNS and Animoji avatar issues that had been burning cycles over the past week. Turns out the apex CNAME for heyitsmejosh.com was pointing at a stale Cloudflare Pages project while GitHub Pages was actually hosting the real build — pushes were going through fine but the domain kept serving old builds. Repointed it via the Cloudflare API. The avatar's "white outline in dark mode" mystery resolved too: the white matte wasn't a rendering bug, but 41 near-white anti-aliased edge pixels that were baked into the old PNG (the current asset has zero). That fix landed back on July 22 in the commit history, just never got served due to the DNS issue. Closed those items out.

Also ran a machine cleanup: DerivedData was taking up 18GB, cleared it out and freed about 27GB of disk space total.

## Apps Summary

**In review:** Talli v3.5.8 (submitted 07-22), Echo v1.3.3 iOS (submitted 07-22), Echo v1.3.3 Mac (submitted 07-21), Lexly v1.1.1 iOS + Mac (submitted 07-19), Litigate v1.0.1 build 4 (resubmitted 07-22), Healstack v1.0 (submitted 07-21), Inkpress v1.0.2 (approved 07-22, live).

**Live:** Epiphany v2.6.1 (Pro tier, Yelp venues, Stripe fixes), Sparkjar v2.2.0 (Mac live), Newsline v0.2.0 (15-outlet RSS reader), Spine (Cloudflare Pages; book summaries live), Quotable (icon redesigned 07-25).

**Pending:** BCGD footer contrast fixed 07-25, icon redesign verified 07-22, ASC upload ready. Portfolio iOS icon fixed 07-19, awaiting submission attempt. Healstack navbar overlap fixed 07-25.

**Blockers:** Same as before — Sparkjar bundle ID rename pending, Epiphany SnapTrade phantom holdings disabled, Twitter/X sign-in removed. Orphaned Mac records (Echo Transcribe Mac, Lexly Mac) pending Apple support.

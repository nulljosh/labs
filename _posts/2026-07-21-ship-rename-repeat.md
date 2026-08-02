---
layout: post
title: "Ship"
date: 2026-07-21 09:00:00 -0700
categories: journal monthly
---

![July 11-21](/assets/2026-07-21-week.svg)

## Saturday to Monday (July 11-13)

Spent the weekend on a bunch of small fixes: confirmed Epiphany already supported Interactive Brokers and just needed the settings copy updated, cleaned up Healstack's visual clutter, and fixed a Lexly bug where course taps kept failing because the build had flattened the folders they relied on. Also finished summarizing all of Pre-Calculus for Dummies and restyled the portfolio site with a warmer serif-and-sans look I'm calling fredrika, complete with a light/dark toggle.

## Tuesday to Wednesday (July 14-15)

Long stretch of night-owl cleanup across most of my active apps. Talli's widget kept drifting out of sync with the app version and getting bounced by Apple, so I fixed it to read the version from build settings instead of a hardcoded number, and separately caught garbage side-nav text leaking into the app as if it were real messages. BCGD got its first real iOS companion app. Newsline's RSS reader went live with bias tabs and a section for stories only one side was covering. I also tracked down a stale Cloudflare token that had been silently keeping wrangler logged out every session.

Also dug into why Epiphany's account sync kept going stale: reconnecting a brokerage more than once was leaving duplicate fragments behind, so for now it needs a manual disconnect and clean reconnect rather than a code fix.

## Thursday to Friday (July 16-17)

Lexly shipped streak freezes and weekly quests after looking at what Duolingo does well. Fixed Casewright's login screen (it was stacking sideways instead of vertically) and switched its public branding over from the old name.

Rewrote my resume, since it still claimed I was enrolled at UVic when really I'm self-taught and applying there. Reordered it to lead with the eight apps I've actually shipped instead of burying them under old jobs. Poked at auto-applying to jobs at scale and hit a wall fast, no recruiter emails in any of the data, and the handful of Canada-eligible postings all wanted years of experience I don't have. The honest move is direct outreach to companies I actually want to work at, not volume.

Added an animated avatar bubble to the portfolio header, and spent a chunk of the week finishing three books (Becoming Steve Jobs, most of Apple's history) into the summary site.

## Weekend push (July 18-19)

Big one. Renamed Books to Spine after burning through a dozen taken names, fixed two real Mac upload bugs along the way (a missing sandbox entitlement and a missing app category), and merged duplicate App Store records for Spark and Books so builds land in one place instead of two. Un-paywalled all of Lexly's courses since the Stripe gate never actually worked, reframing Pro as a perk instead of a lock. Renamed Brief to Casewright to Litigate (yes, twice), fixed its icon which had a badge baked into the actual artwork, and merged in the old CanLII case-search app as a tab instead of leaving it half-finished.

Got a Yelp key set up so Epiphany's venue reviews finally went live after weeks of silently doing nothing, and shipped Pro-tier gating across Epiphany and Lexly with real Stripe fixes. Ran an accessibility pass with a new review skill across eighteen apps and fixed the real bugs it found: dead VoiceOver labels, a spinner that ignored Reduce Motion, an alert that could never dismiss.

Also tried teaching a local model to code overnight on its own while I sleep. It wrote fine code when I reviewed it by hand, but kept failing to actually call its tools when left alone, so that idea's shelved until it's more reliable.

## Monday to Tuesday (July 20-21)

Closed out account-deletion support across every app that needed it, a real App Store requirement I'd missed on three of them. Then kicked off the big one: moved twelve apps and their domains off Vercel onto Cloudflare Pages, since Vercel was redundant with DNS I already had there. Held back Epiphany, Sparkjar, Healstack, and Talli since those need real Stripe/KV rewrites, not a quick move. Also finally split the Journal and Inkpress repos apart into what they should always have been: a blog and an RSS reader, connected only in that one can subscribe to the other.

## Apps

Shipped or in review this stretch: Lexly (streak freezes, free courses), Talli (icon rebrand, widget fix), Litigate (renamed, account deletion added), Healstack (metadata + medical device declaration cleared), Inkpress (rebuilt as a real multi-feed reader), Echo Mac, Journal split into its own repo. Twelve apps moved to Cloudflare Pages. Epiphany's SnapTrade phantom-holdings bug is still open.

---
layout: post
title: "Finish the Details"
date: 2026-07-25 12:00:00 -0700
categories: journal weekly
---

![Week of July 25](/assets/2026-07-25-finish-the-details.svg)

## Saturday (July 25)

Spent the evening polishing half a dozen apps: removed the "LIVE" badges and gradient shine from Epiphany's landing page (they felt like placeholder copy), fixed Healstack's navbar safe-area overlap and completed the Dose → Healstack rename by adding the missing display name in Info.plist, cleaned up Lexly's subject navigation to horizontal-scroll-only and fixed a 404 on the school dashboard link, moved Talli's personal info fields from Reports into Settings with keychain persistence for the phone number, redesigned Quotable's icon as a text-free geometric mark, and fixed footer contrast on BCGD to meet WCAG AA.

Most time tonight went to the portfolio DNS and Animoji avatar issues that had been burning cycles over the past week. Turns out the apex CNAME for heyitsmejosh.com was pointing at a stale Cloudflare Pages project while GitHub Pages was actually hosting the real build — pushes were going through fine but the domain kept serving old builds. Repointed it via the Cloudflare API. The avatar's "white outline in dark mode" mystery resolved too: the white matte wasn't a rendering bug, but 41 near-white anti-aliased edge pixels that were baked into the old PNG (the current asset has zero). That fix landed back on July 22 in the commit history, just never got served due to the DNS issue. Closed those items out.

Also ran a machine cleanup: DerivedData was taking up 18GB, cleared it out and freed about 27GB of disk space total. Wrapped the night by simplifying the wiki index — trimmed it from 726 to ~300 words with a cleaner `title — description` format, collapsing the 30-entry `*-readme` sources wall into a single `*-readme.md` line documenting that those are read-only per-repo README snapshots, and updated the index rules to forbid status/versions/dates from showing anywhere (all detail lives on the entity pages instead).

Ran a visual verification pass on the UI changes afterward (builds had all passed, so no blockers were obvious). Actually looking at the work found two real bugs that the build verification had hidden entirely. Quotable's earlier "too much whitespace" fix from earlier the same night didn't work — the panel was a small island in a massive void with the grid producing 3 columns for 4 answers, leaving an orphan row and a dead gap below. Reworked it with minmax(min(100%,320px),1fr) for proper responsive layout and switched justify-content from center to flex-start, which was the real cause of the centering problem. Also caught that the scifi genre badge was straight purple, a standing-rule violation, and swapped it to cyan. Talli's Settings tab had content sitting behind the FloatingTabBar capsule — the keychain footnote and Log Out button were both clipped. The Settings view was the only tab missing the 90pt bottom safeAreaInset its siblings already had. Fixed it to match. Lexly's horizontal scroll fix confirmed working: subject nav scrollHeight is 43 (equal to clientHeight), and scrollWidth is 730 (well above the 358 clientHeight), so vertical scrolling is gone but horizontal still works. School dashboard link now returns 200 instead of 404. Noted two items deliberately left open: Talli's Settings fix builds clean but visual re-confirmation is still pending (sim scrolling failed and we hit the usage cap), and Quotable still has about 90px of unexplained dead space below the answers that needs investigation next time we can run the simulator.

## Sunday (July 26)

Woke up and spent the morning fixing the `/work` command — it used to demand `start|stop|dump` as the first word and only worked in the cwd, so targeting a repo from the home directory found nothing. Rewrote it to take a project name directly (`/work epiphany` or `/work talli fix-the-spinner`), resolve that against ~/Documents/Code, and make that the whole scope. Fixed a real data-loss bug in the Notes pipeline too: notes were getting deleted *before* they were filed into the roadmap, which would've destroyed unread content if a note didn't parse cleanly. Now they delete only after being durably written. Killed the duplicate headless Chrome export and switched to plaintext reads. Ported the filename case trap (roadmap.md == ROADMAP.md on macOS) and git hygiene rules into `/work` so both `/work` and `/ingest` handle the same edge cases consistently. Updated the ingest skill to dedupe before appending, documented the `/ingest <folder>` pattern, and fixed notes-list.sh dying on one locked/attachment-only note that broke the whole run.

## Apps Summary

**In review:** Talli v3.5.8 (submitted 07-22), Echo v1.3.3 iOS (submitted 07-22), Echo v1.3.3 Mac (submitted 07-21), Lexly v1.1.1 iOS + Mac (submitted 07-19), Litigate v1.0.1 build 4 (resubmitted 07-22), Healstack v1.0 (submitted 07-21), Inkpress v1.0.2 (approved 07-22, live).

**Live:** Epiphany v2.6.1 (Pro tier, Yelp venues, Stripe fixes), Sparkjar v2.2.0 (Mac live), Newsline v0.2.0 (15-outlet RSS reader), Spine (Cloudflare Pages; book summaries live), Quotable (icon redesigned 07-25).

**Pending:** BCGD footer contrast fixed 07-25, icon redesign verified 07-22, ASC upload ready. Portfolio iOS icon fixed 07-19, awaiting submission attempt. Healstack navbar overlap fixed 07-25.

**Blockers:** Same as before — Sparkjar bundle ID rename pending, Epiphany SnapTrade phantom holdings disabled, Twitter/X sign-in removed. Orphaned Mac records (Echo Transcribe Mac, Lexly Mac) pending Apple support.

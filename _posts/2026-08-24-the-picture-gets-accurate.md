---
layout: post
title: "Accurate"
date: 2026-08-24 12:00:00 -0700
categories: journal quarterly
---

{% include headers/2026-08-17-fortified.svg %}

August was the month I stopped trusting my own notes. It started with a full inventory of the codebase that found directories existing in two places, six repos with private copies of design tokens, and apps that were just chapters of other apps. A nested clone had been inside itself; deleting it freed a gigabyte. I sketched cleanup phases and left them rather than starting a full rewrite.

Then I read the actual App Store rejection reasons, and eight rejections collapsed into three causes: suspension, sign-in failures, and naming. Four marked as waiting had been rejected weeks earlier. The three sign-in failures weren't related: corrupted test data, a dead domain, one required debugging. Lesson: check rejections against shipped code before trusting existing theory.

That pattern was everywhere: untracked production bugs across eleven repos, this journal not publishing because of duplicate Pages projects, even system updates breaking silently.

Plenty did ship. Apple flagged two apps for quality, so I rewrote both from webview shells into native code. Quotestreak and Bookrank shipped with redesigned interfaces. Newsline turned from a website into something code can call. A security sweep fixed a forgeable school gate and an unprotected AI proxy, and moved two big projects off the old host.

Every API key on disk is dead, rotated months ago and never copied over. The backlog taught me to run two or three workers, not nine.

By the end of the month the board finally matched reality: Talli and Lexly and Curvely shipped, Bookrank and Voxprint live, and Sparkjar, BCGD, Quotestreak, Wordroot and the Times Square game in review. No dramatic features, but the picture is accurate for the first time.

The last thing I did was consolidate the journal itself. Fourteen scattered entries got merged into this quarterly post, each rewritten into plain prose instead of tool-spam. Codified the rules: natural English only, no AI voice, no commit hashes or build numbers. A linting gate now enforces it, so a bloated post cannot publish.

The rest of the month was landing things properly. Landing pages got hero art: Times Square game drifting behind a scrim, Nimble's questions in a ticker, Epiphany's live map refreshing flights. The portfolio list toggled overflow, showing eight always.

I audited sign-in and added GitHub to three apps. Inkpress shipped with sixteen curated feeds; testing exposed a date-parsing bug in the feeds themselves.

Two mysteries closed by reading rather than coding. Lexly Mac bounced twice until I found it: selling book content in China needs a license. Removing that territory sent it to review. Healstack's was similar, a health section that never said it was using Apple's data. A button fixed it, and I ported it to Mac the same night.

The last week was security. Epiphany's broker webhook and account endpoint were accepting requests from anyone. Both now require authentication, along with two scheduled jobs that had been skipping checks. Talli and Litigate got response headers, dependencies patched, and Litigate came off sale until its data is properly gated. Tests still pass.

On Wednesday I verified the global language support work on Wordroot (twelve locales, thirty word languages, all tests green). Thursday found a subtle timing issue in Lexly where iOS shipped without four new courses that arrived after the build archived; fixed by renaming the version in place and resubmitting without rebuilding. Late Thursday I noticed Sparkjar's landing page rendering in serif, fixed it to shared system fonts, then swept through six projects standardizing everything. Also fixed Curvely's hero animation (sub-pixel paths) and swapped NYC Survive's icon.

## Wednesday (2026-08-26)

Built a dream journal at dream.heyitsmejosh.com with deterministic recurrence detection. Lexly's CI workflow deployed; push to main now publishes automatically. Built Homeward into native iOS and macOS apps from one SwiftUI target with live Supabase and search across name/species/color/location. Tested end to end; blockers are landing page, ASC record, icons, OAuth, and a shared read-policy security issue.

## Thursday (2026-08-27)

Registered the Google OAuth client and got sign-in buttons onto healstack, litigate, lexly and bookrank, and the Chrome blocker I had been stuck on turned out to be nothing more than an unpaired browser session. Apple's version wants a Services ID and a hand signed token where Google needs one client ID, so that is still waiting, and Facebook is out until Meta verifies the business. Later I put a proper front door on Roost, a landing page with a slow wall of property photos drifting behind the pitch the way Bookrank does it, live now at roost.heyitsmejosh.com. Before that the site was rendering completely blank because the Supabase client refuses to start without its keys and took the whole page down with it, so a missing config just disables sign-in now.


## Friday (2026-08-28)

Spam wave hit six apps with 4.3(a) flags; filed appeals, fixed Epiphany's iPad layout, renamed Newsline to Sidewise and Wiretext to Charwork, and refreshed architecture diagrams across many repos. Added portfolio animations on Cloudflare Pages (NYC gameplay, Litigate vibe, Healstack glyphs, App Store badges), deployed Voxprint live, and built Inkpress macOS with a web reader. Joshua wanted native Windows and Android apps instead of Nimble's PWA; I built them from Kotlin Compose Multiplatform, porting the Swift QueryEngine and shipping MSI and APK, then fixed CI deployment with Cloudflare credentials. Checked Epiphany's new rejection notice, but Apple's web was down.

Also fixed Charwork's build system (which was wiping dist on each rebuild) and submitted Inkpress iOS for review with the overflow fix.

## Saturday (2026-08-29)

Shipped Inkpress Mac release with iOS submission, re-shot Healstack, filled NYC listing, audited GTM (CRA form is the real revenue blocker), diagnosed flights map as geofencing, and fixed Toroid's availability. Joshua pushed back on Lexly's repositioning, so I reverted it; the real fix for the 4.3(a) rejection is new screenshots and a Resolution Center reply. Built a mobbin skill pulling app designs via Chrome automation, /duolingo for Lexly's data import (45,160 XP, 143-day streak, 25 courses), /compass to check transit card balance ($13.70, AutoLoad), and drafted an SFU application statement. Fixed Voxprint's landing page (hero animation on mobile, repo link updated), bookrank's GitHub link (still pointing at old spine domain), conway's GitHub page (conway.heyitsmejosh.com), litigate.heyitsmejosh.com's service worker (was pinning old CSS, rewrote to network-first), and missing CSP headers (web/_headers wasn't in deploy.sh's PUBLISH, added and verified live), then deployed. One earlier flag proved false: the style.css theme rules work fine.

## Sunday (2026-08-30)

Pulled metadata for four apps where I dropped China, shipped macOS versions of Charwork and Curvely using APIs ported from Sidewise, reverse engineered Craigslist's sapi endpoint into a browser for web, iOS and macOS, and gave Cadence the icon it never had. Built a French bulldog breeder's site with responsive design, and cleaned up Xcode's cache to free twenty-six gigs of disk space.

Fixed Epiphany's landing map, which had gone blank after adding security headers. The Content Security Policy needed blob: for MapLibre's worker and frame-src for Stripe; deployed and verified live.

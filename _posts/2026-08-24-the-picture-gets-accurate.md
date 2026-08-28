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

Spam wave hit six apps with 4.3(a) flags; filed appeals for three plus Healstack. Fixed Epiphany's sign-in error, renamed Wiretext to Charwork, resubmitted Sidewise to review at Joshua's direction, and audited the portfolio for stale names. Found the real problem in the evening: a catch-all .gitignore had excluded entire live directories, so committed untracked source from credis, scripts, agent-101, and roost, then cleaned up the repo tree. Landing pages got their animation: NYC shows live attract-mode gameplay, Litigate has the house vibe with bulb-block hero and docket animation, Healstack cycles health glyphs, Curvely's curve wall visible, and Voxprint swapped to neutral ink, all pure CSS on Cloudflare Pages. Added Litigate README architecture diagram and deployed to Cloudflare Pages; live at litigate.heyitsmejosh.com with leak tests passing.

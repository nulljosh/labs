---
layout: post
title: "Accurate"
date: 2026-08-24 12:00:00 -0700
categories: journal quarterly
---

{% include headers/2026-08-17-fortified.svg %}

August was the month I stopped trusting my own notes. It started with a full inventory of the codebase that found directories existing in two places, six repos with private copies of design tokens, and apps that were just chapters of other apps. A nested clone had been inside itself; deleting it freed a gigabyte. I sketched cleanup phases and left them rather than starting a full rewrite.

Then I read the actual App Store rejection reasons, and eight rejections collapsed into three causes: suspension, sign-in failures, and naming. Lesson: check rejections against shipped code before trusting existing theory.

Plenty did ship. Apple flagged two apps for quality, so I rewrote both from webview shells into native code. Quotestreak and Bookrank shipped with redesigned interfaces. Newsline turned from a website into something code can call. A security sweep fixed a forgeable school gate and an unprotected AI proxy, and moved two big projects off the old host.

Every API key on disk is dead, rotated months ago and never copied over. The backlog taught me to run two or three workers, not nine.

By month's end the board matched reality: Talli, Lexly and Curvely shipped; Bookrank and Voxprint live; Sparkjar, BCGD, Quotestreak, Wordroot and the Times Square game in review. No dramatic features, but the picture is accurate for the first time.

The last thing I did was consolidate the journal itself. Fourteen scattered entries got merged into this quarterly post, each rewritten into plain prose instead of tool-spam. A linting gate enforces it now, so a bloated post cannot publish.

The rest of the month was landing things properly. Landing pages got hero art: Times Square game drifting behind a scrim, Nimble's questions in a ticker, Epiphany's live map refreshing flights. The portfolio list toggled overflow, showing eight always.

I audited sign-in and added GitHub to three apps. Inkpress shipped with sixteen curated feeds.

Two mysteries closed by reading rather than coding. Lexly Mac bounced: selling book content in China needs a license. Healstack had the same problem, an unlabeled health section using Apple's data. A button fixed both and I ported Healstack to Mac that night.

Security took the last week. Epiphany's webhook and account endpoint were open to anyone; both now require auth along with two jobs that had skipped checks. Talli and Litigate got response headers and dependency patches; Litigate came off sale until its data is properly gated. Tests still pass.

On Wednesday I verified the global language support work on Wordroot (twelve locales, thirty word languages, all tests green). Thursday found a subtle timing issue in Lexly where iOS shipped without four new courses that arrived after the build archived; fixed by renaming the version in place and resubmitting without rebuilding. Late Thursday I noticed Sparkjar's landing page rendering in serif, fixed it to shared system fonts, then swept through six projects standardizing everything. Also fixed Curvely's hero animation (sub-pixel paths) and swapped NYC Survive's icon.

The last week of August was sign-in and native apps. Google sign-in went onto four apps in one afternoon, and the Chrome blocker I had been stuck on for days turned out to be an unpaired browser session. Apple's version still waits on a hand signed token and Facebook waits on Meta. Roost got a front door and stopped rendering blank when its keys were missing. Then a spam wave hit six apps with the same generic rejection on the same day. I filed appeals, reverted a repositioning I had talked myself into for Lexly, and left the rest alone, because resubmitting into a wave just adds to it.

I also stopped accepting web wrappers as coverage. Nimble and Homeward got real Windows, Android and desktop builds from one shared Kotlin codebase, with CI that turns out installers for any app that carries the module. Homeward came out of the monorepo into its own repo, seeded with lost cat posters copied off street poles, and grew reward and shelter fields. Numen, Charwork and Curvely got native Mac apps. Two evening audits found the fleet missing tests, CI and callable endpoints, so twelve repos got CI and a handful got an API and an MCP surface, which is how Bookrank was caught ranking the same book twice.

The first days of September were mostly finishing. Quotestreak 1.2 went to review on both platforms with a poster mosaic behind it. Seamark, which had been Sextant, shipped in six languages on every platform. Tripwire, a small watcher that notices when Stripe, GitHub, Resend or Supabase quietly change their APIs, got built and pointed at all four. Thirty-five repos got badges, licences and proper descriptions in one pass. Nimble's landing page became the real app, with a hundred and twenty six checked example questions cycling through and each answer linking back to where it came from. Epiphany got a light mode that follows the system, Conway became Toroid, Sparkjar's email finally sends, and the CRA business number is in the mail, which is the one thing gating every dollar of iOS revenue.

Where things sit: Nimble, Quotestreak and Toroid in review. Dream live with voice entry. Epiphany live with an appeal open. Homeward live with real cases. The board still matches reality, which after this month is the part I care about.

Today I audited the production app tool stack and found the core was solid: GitHub for code, Cloudflare for edge and DNS, Supabase for auth and data, Stripe for payments, Upstash for ephemeral state. Missing were error tracking, uptime alerts, and a Resend key that had expired. I built authmail, a new Worker that brands each Supabase auth email with the app's name and colors, then sends it through Resend. I configured DKIM, SPF and DMARC on Cloudflare and wired the worker into both Supabase projects. I also set up a GitHub Actions workflow that curls forty subdomains every thirty minutes and emails me if anything responds with a non-200 status. Finally I enabled observability on nine Workers that power the sites and apps, so now the infrastructure watches itself instead of waiting for a user report.

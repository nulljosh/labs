---
layout: post
title: "Accurate"
date: 2026-08-24 12:00:00 -0700
categories: journal quarterly
---

{% include headers/2026-08-17-fortified.svg %}

August was the month I stopped trusting my own notes. It started with a full inventory of the codebase that found directories existing in two places, six repos with private copies of design tokens, and apps that were just chapters of other apps. A nested clone had been inside itself; deleting it freed a gigabyte. I sketched cleanup phases and left them rather than starting a full rewrite.

Then I read the actual App Store rejection reasons instead of guessing at them, and eight rejections collapsed into three causes: account suspension, sign-in failures, and an app using "Mac" in its name. Four apps marked as waiting had in fact been rejected weeks earlier. The three sign-in failures weren't related: one had corrupted test data, one pointed at a dead domain, the third took debugging. The lesson: check rejections against shipped code before trusting existing theory.

The same pattern showed everywhere. Production bugs across eleven repos never made it onto any list: Litigate's light mode broken, Sparkjar's account deletion errored, Talli's sync wedged for months. This journal wasn't publishing because two Pages projects shared nearly the same name and the deploy script hit the wrong one. Even system updates broke silently.

Plenty did actually ship. Apple flagged two apps for quality, so I rewrote both from web-view shells into real native ones, which meant writing my own expression parser to replace the maths library and checking it against several thousand results from the original. Quotable got the same treatment and went out as Quotestreak on phone and desktop under one purchase, with the quote bank grown from a hundred and ninety three entries to two hundred and seventy two. Bookrank went live and got a proper redesign with a sticky header, live search, sorting and a hundred and twenty seven covers. Newsline turned from a website into something other people's code can call. A security sweep found a forgeable school-page gate and an unprotected AI proxy, both fixed, and the last two big projects moved off the old host.

All the API keys on disk are dead now, rotated months ago but never copied over. And four book chapters are one-paragraph stubs from deleted photos. The backlog taught me to run two or three workers instead of nine.

By the end of the month the board finally matched reality: Talli and Lexly and Curvely shipped, Bookrank and Voxprint live, and Sparkjar, BCGD, Quotestreak, Wordroot and the Times Square game all sitting in review. No dramatic new features in there, but the picture is accurate for the first time in a while, which turned out to be the thing that was actually broken.

The last thing I did was consolidate the journal itself. Fourteen scattered entries from the month got merged into this quarterly post and the two that came before it, each rewritten into plain prose instead of the tool-spam that had been creeping in. Codified the rules too: natural English only, no AI voice, no commit hashes or build numbers or function names in the prose. A linting gate now enforces it, so a bloated post cannot publish. The portfolio got the latest posts synced over, and the Inkpress link points at its landing page now instead of the app store. The picture is accurate because I kept checking it.

The rest of the month was landing things properly. Two landing pages got real hero art: the Times Square game drifting behind a scrim, and Nimble's questions scrolling in opposite directions like an editorial ticker. Epiphany's landing page went further and now runs the actual live map behind the copy, with real flights and incidents refreshing while you read, inert until you sign in so it never asks for your location. The portfolio's project list had grown to nineteen and looked bloated on a phone, so eleven of them fold away behind a toggle and eight stay visible. Plain markup, no scripting.

I audited sign-in across everything and added GitHub as an option on three apps, with checks that probe endpoints to prevent dead buttons. Inkpress went out with sixteen curated feeds, and testing exposed a date bug that had been invisible with one: feeds with named time zones failed to parse and pinned to the top.

Two long-running mysteries closed by reading rather than coding. Lexly's Mac version had bounced twice with no explanation until I got into the resolution centre, and the blocker was never the code: selling book content in China needs a Chinese publishing licence. Removing that one country sent it straight into review. Healstack's rejection was similar, a health section that never said plainly it was using Apple's health data. An icon and a connect button fixed it, and I ported it to the Mac the same night after realising the reason I had held that back was a rule I invented.

The last week was security. Epiphany's broker webhook was accepting trade orders from anyone who asked, and the endpoint listing positions handed out account balances to any caller. Both now require authentication, and the same check went into two scheduled jobs that had been quietly skipping it whenever their secret was missing. Talli and Litigate got proper response headers, dependencies got patched, and Litigate came off sale entirely until its case data is behind a real gate. Everything still passes its tests, which was the point of writing them.

Small domestic win: Telus will knock ten dollars a month off the bill for paying from a bank account instead of a card. Hundred and twenty dollars a year for reading messages properly, roughly the theme of the whole month.

On Wednesday I verified the global language support work on Wordroot that had never been built. Twelve interface locales and thirty word languages now compile, with Arabic mirroring right-to-left and French showing full etymology chains. I cut dead code probing extra Wiktionary editions, removing obsolete actors and races, minus forty-six lines with all tests still green.

Thursday found a subtle build timing issue in Lexly. The app was in review with a thirteen-minute-old build, but four new science courses got added thirteen minutes after that build archived. iOS shipped without them while macOS had the newer build with all four; both were going to review mismatched. Fixed without rebuilding: renamed the version in place (screenshots stayed), attached the correct uploaded build, rewrote the changelog, and resubmitted. Both platforms matched for the first time.

Also Thursday evening, Curvely's landing page had an invisible hero animation. The generated SVG curve paths used a hairline stroke at sub-pixel width, so the whole drifting wall of curves was effectively invisible behind the text. Bumped the stroke width up, lightened the scrim overlay, raised the wall opacity, and sped up the drift. The backdrop now reads and doesn't fight the copy.

Thursday evening I swapped out the NYC Survive icon. The old one was a pair of teal and pink skyline bars — fine as a sketch but didn't feel like the game itself. Replaced it with a solid industrial gear in amber on a dark background, regenerated all fourteen PNG sizes from icon.svg, and pushed copies to the landing page, web app, and distribution assets. The icon now reads at a distance and doesn't need any explanation.

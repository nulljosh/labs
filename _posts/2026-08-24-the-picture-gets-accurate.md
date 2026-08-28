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

On Wednesday I verified the global language support work on Wordroot that had never been built. Twelve interface locales and thirty word languages now compile, with Arabic mirroring right-to-left and French showing full etymology chains. I cut dead code probing extra Wiktionary editions, removing obsolete actors and races, minus forty-six lines with all tests still green.

Thursday found a subtle build timing issue in Lexly. The app was in review with a thirteen-minute-old build, but four new science courses got added thirteen minutes after that build archived. iOS shipped without them while macOS had the newer build with all four. Fixed without rebuilding: renamed the version in place (screenshots stayed), attached the correct uploaded build, rewrote the changelog, and resubmitted. Also cleaned up the landing page: removed a duplicate App Store button fighting the Smart App Banner.

Also Thursday evening, Curvely's hero animation was invisible: the curve paths were drawn at sub-pixel width, so the whole drifting wall vanished behind the text. Thicker strokes, a lighter scrim and a faster drift brought it back.

Thursday evening I swapped NYC Survive's icon for a solid industrial gear in amber on dark. The old skyline bars never felt like the game, and the new one reads at a distance.

Late Thursday I noticed Sparkjar's landing page rendering in serif. The font stack was falling back because the webfont reference went dead. Fixed it to use the shared system font token, then swept through six projects standardizing everything else. Removed stray serif definitions from old stylesheets and updated the shared font token. The stylesheet fix needed a second pass: the landing page shows generated images, so I had to re-screenshot both themes and redeploy. Everything's Helvetica now.

Thursday evening fixed Inkpress's landing page. Screenshots were stretching vertically because the height attribute locked the aspect ratio while CSS width constrained it; adding `height: auto` fixed that. Added an animated hero matching Bookrank's style with drifting feed-headline cards and a scrim, plus a prefers-reduced-motion guard. Deployed to Cloudflare Pages.

## Wednesday (2026-08-26)

Built a dream journal at dream.heyitsmejosh.com with deterministic recurrence detection. Lexly's CI workflow deployed; push to main now publishes automatically. Built Homeward into native iOS and macOS apps from one SwiftUI target with live Supabase and search across name/species/color/location. Tested end to end; blockers are landing page, ASC record, icons, OAuth, and a shared read-policy security issue.

## Thursday (2026-08-27)

Registered the Google OAuth client and got sign-in buttons onto healstack, litigate, lexly and bookrank, and the Chrome blocker I had been stuck on turned out to be nothing more than an unpaired browser session. Apple's version wants a Services ID and a hand signed token where Google needs one client ID, so that is still waiting, and Facebook is out until Meta verifies the business. Later I put a proper front door on Roost, a landing page with a slow wall of property photos drifting behind the pitch the way Bookrank does it, live now at roost.heyitsmejosh.com. Before that the site was rendering completely blank because the Supabase client refuses to start without its keys and took the whole page down with it, so a missing config just disables sign-in now.

## Friday (2026-08-28)

Pointed the thing at my Notes inbox and most of what was in there turned out to be
screenshots of App Store rejection emails. The useful part was realising the five separate
rejections are one problem wearing five hats, an account level spam flag from submitting
five apps in a day, so there is nothing to fix in the code and one appeal to write instead.
Finally got into Resolution Center and read why Epiphany got knocked back, which nobody had
done before. Two things: sign in with Apple failing inside Apple's own sheet on an iPad, and
paying on the website unlocking features inside the app, which Apple does not allow. Fixed
the second one properly and picked Charwork as the new name for Wiretext.

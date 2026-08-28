---
layout: post
title: "Accurate"
date: 2026-08-24 12:00:00 -0700
categories: journal quarterly
---

{% include headers/2026-08-17-fortified.svg %}

August was the month I stopped trusting my own notes. It started with a full inventory of the codebase that found directories existing in two places, six repos with private copies of design tokens, and apps that were just chapters of other apps. A nested clone had been inside itself; deleting it freed a gigabyte. I sketched cleanup phases and left them rather than starting a full rewrite.

Then I read the actual App Store rejection reasons, and eight rejections collapsed into three causes: suspension, sign-in failures, and naming. Four marked as waiting had been rejected weeks earlier. The three sign-in failures weren't related: corrupted test data, a dead domain, one required debugging. Lesson: check rejections against shipped code before trusting existing theory.

That pattern was everywhere: production bugs across eleven repos never tracked (Litigate's light mode, Sparkjar's account deletion, Talli's sync), this journal wasn't publishing due to duplicate Pages projects, even system updates broke silently.

Plenty did ship. Apple flagged two apps for quality, so I rewrote both from webview shells into native code. Quotestreak went out on phone and desktop under one purchase, with the quote bank grown from 193 to 272 entries. Bookrank launched with 127 covers and a redesigned interface. Newsline turned from a website into something code can call. A security sweep fixed a forgeable school gate and an unprotected AI proxy, and the last two big projects moved off the old host.

All the API keys on disk are dead now, rotated months ago but never copied over. The backlog taught me to run two or three workers instead of nine.

By the end of the month the board finally matched reality: Talli and Lexly and Curvely shipped, Bookrank and Voxprint live, and Sparkjar, BCGD, Quotestreak, Wordroot and the Times Square game in review. No dramatic features, but the picture is accurate for the first time.

The last thing I did was consolidate the journal itself. Fourteen scattered entries got merged into this quarterly post, each rewritten into plain prose instead of tool-spam. Codified the rules: natural English only, no AI voice, no commit hashes or build numbers. A linting gate now enforces it, so a bloated post cannot publish.

The rest of the month was landing things properly. Two landing pages got real hero art: the Times Square game drifting behind a scrim, and Nimble's questions scrolling like an editorial ticker. Epiphany's landing page runs the live map behind the copy, with real flights refreshing while you read. The portfolio project list folded away overflow behind a toggle, eight always visible.

I audited sign-in and added GitHub to three apps. Inkpress shipped with sixteen curated feeds; testing exposed a date-parsing bug in the feeds themselves.

Two long-running mysteries closed by reading rather than coding. Lexly's Mac version had bounced twice with no explanation until I got into the resolution centre, and the blocker was never the code: selling book content in China needs a Chinese publishing licence. Removing that one country sent it straight into review. Healstack's rejection was similar, a health section that never said plainly it was using Apple's health data. An icon and a connect button fixed it, and I ported it to the Mac the same night after realising the reason I had held that back was a rule I invented.

The last week was security. Epiphany's broker webhook and account endpoint were accepting requests from anyone. Both now require authentication, along with two scheduled jobs that had been skipping checks. Talli and Litigate got response headers, dependencies patched, and Litigate came off sale until its data is properly gated. Tests still pass.

On Wednesday I verified the global language support work on Wordroot that had never been built. Twelve interface locales and thirty word languages now compile, with Arabic mirroring right-to-left and French showing full etymology chains. I cut dead code probing extra Wiktionary editions, removing obsolete actors and races, minus forty-six lines with all tests still green.

Thursday found a subtle build timing issue in Lexly. The app was in review with a thirteen-minute-old build, but four new science courses got added thirteen minutes after that build archived. iOS shipped without them while macOS had the newer build with all four. Fixed without rebuilding: renamed the version in place (screenshots stayed), attached the correct uploaded build, rewrote the changelog, and resubmitted. Also cleaned up the landing page: removed a duplicate App Store button fighting the Smart App Banner.

Also Thursday evening, Curvely's landing page had an invisible hero animation. The generated SVG curve paths used a hairline stroke at sub-pixel width, so the whole drifting wall of curves was effectively invisible behind the text. Bumped the stroke width up, lightened the scrim overlay, raised the wall opacity, and sped up the drift. The backdrop now reads and doesn't fight the copy.

Thursday evening I swapped out the NYC Survive icon. The old skyline bars were fine as a sketch but didn't feel like the game. Replaced it with a solid industrial gear in amber on dark, regenerated all PNG sizes, and pushed to landing, web, and distribution. The icon now reads at a distance.

Late Thursday I noticed Sparkjar's landing page rendering in serif. The font stack was falling back because the webfont reference went dead. Fixed it to use the shared system font token, then swept through six projects standardizing everything else. Removed stray serif definitions from old stylesheets and updated the shared font token. The stylesheet fix needed a second pass: the landing page shows generated images, so I had to re-screenshot both themes and redeploy. Everything's Helvetica now.

Early Wednesday found five iOS apps rejected for Guideline 4.3(a) Design: Spam (Sparkjar, NYC, Talli, Curvely, Doorstock). Apple flagged an account-level pattern in the listings, not the code. Wrote an appeal draft verifying each app's actual purpose and rewrote Doorstock's listing copy to eliminate shared phrases. Decided to appeal all five; macOS builds of NYC and Sparkjar were unaffected.

Thursday evening fixed Inkpress's landing page. Screenshots were stretching vertically because the height attribute locked the aspect ratio while CSS width constrained it; adding `height: auto` fixed that. Added an animated hero matching Bookrank's style with drifting feed-headline cards and a scrim, plus a prefers-reduced-motion guard. Deployed to Cloudflare Pages.

## Wednesday (2026-08-27)

Built a dream journal at dream.heyitsmejosh.com with deterministic recurrence detection. Lexly's CI workflow deployed; push to main now publishes automatically. Built Homeward into native iOS and macOS apps from one SwiftUI target with live Supabase and search across name/species/color/location. Tested end to end; blockers are landing page, ASC record, icons, OAuth, and a shared read-policy security issue.

## Thursday (2026-08-27)

Audited sign-in across all apps; the long-standing Chrome blocker was just a dead browser session. Fixed it and registered the Google OAuth client (client ID ready, new secret minted). Three apps already have sign-in buttons wired; Google went live in Supabase, though the consent screen still says "epiphany". Rebuilt Roost from BC-only real estate into worldwide property browser: place search, per-country market tables with currency and bands, for-sale/for-rent toggle, and 26-language UI mirrored right-to-left. Price filters auto-scale off local comps instead of fixed CAD; tests pass.

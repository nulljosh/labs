---
layout: post
title: "Accurate"
date: 2026-08-24 12:00:00 -0700
categories: journal quarterly
---

{% include headers/2026-08-17-fortified.svg %}

August was the month I stopped trusting my own notes. It started with a full inventory of the codebase that found fifteen directories existing in two places at once, six repos keeping private copies of design tokens that four others correctly share, and a few apps that are really just one chapter of another app. A nested clone of the entire codebase had been sitting inside itself and gave back a gigabyte when I deleted it. I sketched a four phase cleanup and left it there rather than starting a rewrite I did not have room for.

Then I read the actual App Store rejection reasons instead of guessing at them, and eight rejections collapsed into three causes. Four were a blanket account-level suspension with no defect in the app at all, three were sign-in failing at review time, and one was the word Mac in an app name. Four apps I had marked as waiting for review had in fact been rejected weeks earlier. I had also been carrying a tidy theory that the three sign-in failures shared one root cause, and they did not: one had a corrupted demo account row, one shipped pointing at a domain that no longer resolves, and the third took longer still. The lesson I want to keep is to check a rejection against the shipped code and its history before trusting whatever theory is already written down.

The same pattern showed up everywhere once I started looking. I spent a day fixing production bugs across eleven repos that had never made it onto any list: Litigate's light mode had never worked, Sparkjar's account deletion errored out, and Talli's sync had been wedged for months while cheerfully reporting fresh timestamps. In every case the roadmap said done and it had never shipped. This journal itself had not been publishing, because two hosting projects share nearly the same name and the deploy script pointed at the one with no domain attached, so every deploy printed success while the live site sat weeks behind. Epiphany's store screenshots were stuck on an empty demo account while the real login sat unused in the repo. Even system updates lied: two package upgrades raced each other, Go lost its install directory and vanished from my path, and nothing failed loudly enough for me to notice.

Plenty did actually ship. Apple flagged two apps for quality, so I rewrote both from web-view shells into real native ones, which meant writing my own expression parser to replace the maths library and checking it against several thousand results from the original. Quotable got the same treatment and went out as Quotestreak on phone and desktop under one purchase, with the quote bank grown from a hundred and ninety three entries to two hundred and seventy two. Bookrank went live and got a proper redesign with a sticky header, live search, sorting and a hundred and twenty seven covers. Newsline turned from a website into something other people's code can call. A security sweep found a forgeable school-page gate and an unprotected AI proxy, both fixed, and the last two big projects moved off the old host.

Two things worth recording as losses. Every API key on this machine is dead, because a rotation months ago updated the hosting provider and never touched the copies on disk. And four book chapters ended up as one-paragraph stubs, because the checks passed them before the source photos were deleted and the book went back to the library on the eleventh. Those are gone unless I borrow it again.

I also learned to run fewer things at once. Nine parallel workers on the imported backlog made the machine crawl and burned most of the budget in minutes. Two or three from now on.

By the end of the month the board finally matched reality: Talli and Lexly and Curvely shipped, Bookrank and Voxprint live, and Sparkjar, BCGD, Quotestreak, Wordroot and the Times Square game all sitting in review. No dramatic new features in there, but the picture is accurate for the first time in a while, which turned out to be the thing that was actually broken.

The last thing I did was consolidate the journal itself. Fourteen scattered entries from the month got merged into this quarterly post and the two that came before it, each rewritten into plain prose instead of the tool-spam that had been creeping in. Codified the rules too: natural English only, no AI voice, no commit hashes or build numbers or function names in the prose. A linting gate now enforces it, so a bloated post cannot publish. The portfolio got the latest posts synced over, and the Inkpress link points at its landing page now instead of the app store. The picture is accurate because I kept checking it.

One last piece: the NYC landing page got animated hero art with a game tile drifting behind a scrim. Rebuilt and shipped to Cloudflare Pages. The live game stays out of iframes (autoplay is banned), so the hero is a static backdrop.

Also reworked the Nimble hero to show questions scrolling behind a scrim - things like "sqrt(1764)", "define quixotic", "population of Canada". First try used rounded chips, so I redid it as rows drifting in opposite directions like an editorial ticker. Fixed a gap on wide screens where the marquee looped. Shipped live.

Audited auth across the codebase and shipped GitHub sign-in to Litigate, Lexly, and Bookrank. Wired a check that probes the authorize endpoint, so broken buttons can't ship again.

Refreshed Epiphany's App Store screenshots with real data and fixed test bugs. Cross-checked landing pages and found four apps with no store links, fixed them. Set developer website fields on Healstack and Quotestreak. Audited launch screens: all nineteen apps have one. Kept Bookrank, Fengshui, and Uprighty on their own design tokens. Pruned the roadmap to forty open items.

Tuesday, submitted Inkpress to the App Store with sixteen curated news feeds from newsline. Testing that many feeds exposed a date parser bug: it only understood time zones as numeric offsets, not names like EDT or GMT. Unparsed entries defaulted to "now" and pinned themselves to the top, invisible with one feed but glaring with seventeen. Also untracked five nested repos from labs that each have their own upstream, and moved Nimble's duplicate tokens and icon into one source file.

Later that morning, I finally read what Apple actually said about Lexly's Mac rejection. Two rounds of code fixes had both been rejected, but with the 2FA code I could read the Resolution Center for the first time. The real blocker was not code at all - Apple requires a Chinese Internet Publishing License for any app with book content sold in mainland China, which only registered Chinese companies can get. The rejection notice never mentioned territories, so it looked like a code problem the entire time. The fix was just removing China from the app's availability instead. It went straight into review, turning weeks of wrong-diagnosis code fixes into an expensive lesson in reading error messages before guessing at the cure.

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

One last piece: animated hero art for two landing pages. NYC got a game tile drifting behind a scrim, kept as a static backdrop since the live game cannot sit in an iframe. Nimble got questions scrolling behind a scrim, redone as rows drifting in opposite directions like an editorial ticker after rounded chips looked wrong. Both shipped to Cloudflare Pages.

Audited auth across the codebase and shipped GitHub sign-in to Litigate, Lexly, and Bookrank. Wired a check that probes the authorize endpoint, so broken buttons can't ship again.

Refreshed Epiphany's App Store screenshots with real data and fixed test bugs. Cross-checked landing pages, found four apps with no store links and fixed them. Set developer website fields on Healstack and Quotestreak. All nineteen apps have a launch screen. Pruned the roadmap to forty open items.

Tuesday, submitted Inkpress with sixteen curated news feeds from newsline. Testing that many feeds exposed a date parser bug: it read time zones as numeric offsets but not names like EDT or GMT, so unparsed entries defaulted to now and pinned themselves to the top. Invisible with one feed, glaring with seventeen. Also untracked five nested repos from labs and merged Nimble's duplicate tokens and icon into one source.

Later that morning I finally read what Apple actually said about Lexly's Mac rejection. Two rounds of code fixes had both bounced, but with the 2FA code I could open the Resolution Center for the first time. The blocker was not code at all. Apple requires a Chinese publishing licence for any app with book content sold in mainland China, and only registered Chinese companies can get one. The notice never mentioned territories, so it looked like a code problem the whole time. The fix was removing China from where the app sells, and it went straight into review. Weeks of wrong diagnosis, and the cure was reading the error message.

Closed two loose ends. Healstack's version had drifted from what Apple has in review, now fixed and build verified. Bookrank's listing still promises summaries that moved to the web, and Apple will not edit live text, so it waits for the next release. The build failure that surfaced it traced back to a wrong note in my own docs, written months ago off a search that quietly returned nothing. A search finding nothing is a claim, not proof.

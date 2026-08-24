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

---
layout: post
title: "Details"
date: 2026-07-25 12:00:00 -0700
categories: journal weekly
---

![Week of July 25](/assets/2026-07-25-finish-the-details.svg)

## Saturday

Polish night across half a dozen apps: cleaned up some placeholder-feeling badges on Epiphany's landing page, fixed a navbar overlap in Healstack, tightened Lexly's navigation, moved Talli's personal info fields into Settings where they belong, and gave Quotable a cleaner icon. Also finally solved a DNS mystery that had been bugging me for a week, my portfolio domain was pointing at a stale deployment while the real build sat unseen, and a "haunted avatar" bug turned out to be leftover white pixels baked into an old image export.

Actually looked closely at the changes afterward instead of trusting that a clean build meant a clean UI, and found two real bugs the build had hidden: a card layout that looked fine in theory but left an ugly gap in practice, and a settings screen where the tab bar was covering the log-out button.

## Sunday

Fixed my `/work` command so it actually understood which project I meant instead of only working from whatever folder I happened to be in. Also caught a nasty bug in my notes-filing tool, it was deleting notes before confirming they'd actually been saved somewhere, which could've silently destroyed anything that didn't parse right. Fixed that ordering.

Bigger one: realized journal posts had quietly stopped deploying. I'd write and commit an entry and the live site just wouldn't update, because the deploy step only ran when I remembered to run it by hand. Wired it into a git hook so every commit to a post now deploys automatically, no more silent stalls.

Spent the rest of the night clearing App Store rejections. Healstack finally got its real name showing instead of an old placeholder. Lexly's rejection turned out to be a genuinely broken support page, so I built a real one with actual account and privacy content instead of just pointing at the marketing homepage. Fixed a recurring update-notes popup that was forcing a fixed height on five different apps regardless of how much text was actually in it. And registered proper App Store names for three more apps that had been waiting.

## Apps

Talli resubmitted after a version-numbering hiccup. Lexly and Healstack both back in review with real fixes. Portfolio DNS finally serving the current build. Journal deploys are now automatic.

---
layout: post
title: "Consolidation"
date: 2026-08-11 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-08-11-consolidation.svg %}

## Tuesday (August 11)

Took a full inventory of the codebase and found how much duplication has crept in. Fifteen directories exist in two places at once, six repos keep private copies of design tokens that four others correctly share, and a few apps are really just one chapter of another app. Sketched a four phase plan to clean it up and left it at that. Also tried running nine parallel workers on the imported backlog, which made the machine crawl and burned most of the budget in minutes, so I killed them. Two or three from now on.

## Wednesday (August 12)

Deleted a nested clone of the whole codebase that had been sitting inside itself, which gave back a gigabyte, then read the actual App Store rejection reasons instead of guessing, and eight rejections collapsed into three causes. Four were a blanket account level suspension with no app specific defect, three were broken sign in at review time, and one was the word Mac in an app name.

Worth recording that my own notes were wrong: four apps I had marked as waiting for review had actually been rejected. I had also been carrying a tidy theory that the three sign in failures shared one root cause, and they did not. One had a corrupted demo account row, one shipped pointing at a dead domain, and the third is still unexplained.

## Apps

Healstack and Sparkjar rebuilt and valid, waiting on the freeze. Portfolio restyled to warm parchment and deep blue. Newsline reader apps built for phone and desktop. No new features, but the picture is finally accurate.

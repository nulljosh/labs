---
layout: post
title: "Foundation"
date: 2026-09-13 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-09-13-foundation.svg %}

{% include graphs/2026-09-13-foundation.svg %}

## Saturday

Restarted the LLM project (Turing with model Samantha, a fine-tune of Qwen2.5-0.5B on the docs) by running six training passes until discovering a 0.5B model memorizes style but can't learn facts; pivoted to retrieval instead, wiring Samantha into brain's RAG-over-notes to answer from real indexed docs. Score jumped from one correct out of 28 to 14, with extraction shortcuts now 100% correct; polished chat.py to trim artifacts and added --json to ask.py. Fixed a brain bug in the deployed Worker and widened doc coverage; Turing's landing page is live with a loss chart. Retried Qwen3.5-0.8B training and confirmed it crashes from clean 6.4GB-free (hardware ceiling, not tuning), then built a Craigslist skill that automates post.craigslist.org, handles HEIC-to-JPG, and extracts confirmation links from Mail; sold an old Canon printer with it, now live at vancouver.craigslist.org, then expanded the skill to cover Facebook Marketplace and Kijiji with untested form sections on the same Chrome-driven flow.

**Apps**: turing, brain, craigslist-post.

## Sunday

Spent the night building a kernel from actual nothing with Claude, going through interrupts, memory paging, task switching, disk drivers, filesystems, and a text-mode file browser, verifying each part against real disk images. Landed on Joshua Tree as the name, fixed the landing page demo by swapping it for a real recorded boot, and clarified that Gato stays its own separate voice project. Debugged Gato's voice recording to replace the hard 5-second window with silence detection that stops after 1.2 seconds of quiet, capped at 15 seconds, using sox for audio. Also picked back up Conveyer's Factorio automation with an unattended bootstrap run working end to end.

**Apps**: joshuatree, gato, conveyer.

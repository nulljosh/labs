---
layout: post
title: "Foundation"
date: 2026-09-13 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-09-13-foundation.svg %}

{% include graphs/2026-09-13-foundation.svg %}

## Saturday

Restarted the LLM project (Turing with model Samantha, a fine-tune of Qwen2.5-0.5B on the docs) by running six training passes until discovering a 0.5B model memorizes style but can't learn facts; pivoted to retrieval instead, wiring Samantha into brain's RAG-over-notes to answer from real indexed docs. Score jumped from one correct out of 28 to 14, with extraction shortcuts now 100% correct; polished chat.py to trim artifacts and added --json to ask.py. Fixed a brain bug in the deployed Worker and widened doc coverage; Turing's landing page is live with a loss chart. Retried Qwen3.5-0.8B and confirmed it crashes on clean 6.4GB (hardware ceiling); then built a Craigslist skill for Chrome automation of post.craigslist.org, Facebook Marketplace, and Kijiji, with HEIC-to-JPG and mail confirmation extraction, testing it by posting a Canon printer across all three marketplaces and refining with real learnings like combobox handling and postal-code typeahead.

**Apps**: turing, brain, craigslist-post.

## Sunday

Built Joshua Tree kernel with interrupts, paging, task switching, disk drivers, filesystems, and file browser, then replaced the landing demo with live in-browser boot, fixed palette and Dock, added dmesg and full Mac polish. Fixed canvas-coordinate bugs, debugged Gato voice recording, picked up Conveyer work, and added pwnlingo voice mode; debugged why Korean lessons got stuck at zero XP and found the tile matcher was reading glued text instead of the vocab word from a data attribute, accounting for thousands of failures; fixed that plus voice toggle persistence and dash artifacts, added tests, confirmed working live. Mac disk critical (1.8GB free) so buying an external SSD. Restarted Turing LLM project, pivoting from memorization to retrieval via brain's RAG when discovery showed the 0.5B model can't learn facts; fixed real bugs (prep_data.py iCloud hangs, missing general_knowledge calls), built QA scorer and FAQ matcher (10→22/28), added Wikidata officeholder lookup and extraction shortcuts, retrained on doubled data with real instruction examples from git commits, and wired up versioning and CI.

**Apps**: turing, brain, joshuatree, gato, conveyer, pwnlingo.

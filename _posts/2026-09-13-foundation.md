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

Built Joshua Tree kernel boot with interrupts, paging, task switching, disk drivers, filesystems, and file browser; swapped landing demo for live in-browser boot, fixed palette and Dock pictograms, added dmesg and full Mac polish. Fixed canvas-coordinate bugs affecting clicks and swipes, plus a stuck-app hang; debugged Gato voice recording, picked up Conveyer Factorio work, added pwnlingo voice mode.

Fixed pwnlingo voice-toggle by killing a stale node process that hadn't picked up new code; auto-restart reloaded current version and toggle works now. Mac disk critical (1.8GB free); real work legitimately hogs space, buying external SSD tonight.

**Apps**: joshuatree, gato, conveyer, pwnlingo.

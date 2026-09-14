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

Built Joshua Tree (an i386 kernel from actual nothing) going through interrupts, paging, task switching, disk drivers, filesystems, and a file browser; landed on the name and swapped the landing page demo for a real live in-browser boot instead of a recording. Fixed the v86-emulator DAC palette bug, redesigned the Dock to real pictograms with anti-aliased edges, added dmesg, booted straight to GUI, and did a full Mac polish pass (gradient wallpaper, tree logo, gloss effects, dock shadow, smaller overlay). Fixed two real bugs from looking at screenshots: canvas-coordinate-mapping affecting clicks and swipes, plus a stuck-app-can't-close hang. Debugged Gato's voice recording for silence detection (stops after 1.2 seconds quiet, capped 15 seconds), picked back up Conveyer's Factorio automation, and added voice mode to pwnlingo with aloud question reading and automatic speak-challenge solving.

**Apps**: joshuatree, gato, conveyer, pwnlingo.

---
layout: post
title: "Foundation"
date: 2026-09-13 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-09-13-foundation.svg %}

{% include graphs/2026-09-13-foundation.svg %}

## Saturday

Restarted the LLM project (previous one Arthur was abandoned), calling this one Turing with model Samantha, a LoRA fine-tune of Qwen2.5-0.5B on the project's docs. Ran six training passes that each fixed a real bug until the key discovery: a 0.5B model memorizes style but can't learn facts, so I pivoted to retrieval instead, wiring Samantha into brain's RAG-over-notes project to answer from real indexed docs rather than guessing weights. Score jumped from one correct out of 28 to 14 out of 28, with categories like license now 100% correct via direct extraction. Fixed a bug in brain's deployed Cloudflare Worker and widened per-repo doc coverage; Turing's landing page is live with a loss chart, though precision beyond the extraction shortcuts needs a bigger base model.

**Apps**: turing, brain.

## Sunday

Spent the night building a kernel from actual nothing with Claude, going through interrupts, memory paging, task switching, disk drivers, filesystems, and a text-mode file browser, verifying each part against real disk images. Landed on Joshua Tree as the name, fixed the landing page demo by swapping it for a real recorded boot, and clarified that Gato stays its own separate voice project. Debugged Gato's voice recording to replace the hard 5-second window with silence detection that stops after 1.2 seconds of quiet, capped at 15 seconds, using sox for audio. Also picked back up Conveyer's Factorio automation with an unattended bootstrap run working end to end.

**Apps**: joshuatree, gato, conveyer.

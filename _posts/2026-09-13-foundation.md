---
layout: post
title: "Foundation"
date: 2026-09-13 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-09-13-foundation.svg %}

{% include graphs/2026-09-13-foundation.svg %}

## Sunday

Spent the night building a kernel from actual nothing with Claude, going through interrupts, memory paging, task switching, disk drivers, filesystems, and a text-mode file browser, verifying each part against real disk images. Landed on Joshua Tree as the name, fixed the landing page demo by swapping it for a real recorded boot, and clarified that Gato stays its own separate voice project. Debugged Gato's voice recording to replace the hard 5-second window with silence detection that stops after 1.2 seconds of quiet, capped at 15 seconds, using sox for audio. Also picked back up Conveyer's Factorio automation with an unattended bootstrap run working end to end.

**Apps**: joshuatree, gato, conveyer.

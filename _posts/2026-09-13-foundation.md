---
layout: post
title: "Foundation"
date: 2026-09-13 12:00:00 -0700
categories: journal quarterly
---

{% include headers/2026-09-13-foundation.svg %}

{% include graphs/2026-09-13-foundation.svg %}

Restarted the LLM project (Turing with model Samantha, a fine-tune of Qwen2.5-0.5B on the docs) by running six training passes until discovering a 0.5B model memorizes style but can't learn facts; pivoted to retrieval instead, wiring Samantha into brain's RAG-over-notes to answer from real indexed docs. Score jumped from one correct out of 28 to 14, with extraction shortcuts now 100% correct; polished chat.py to trim artifacts and added --json to ask.py. Fixed a brain bug in the deployed Worker and widened doc coverage; Turing's landing page is live with a loss chart. Retried Qwen3.5-0.8B and confirmed it crashes on clean 6.4GB (hardware ceiling); then built a Craigslist skill for Chrome automation of post.craigslist.org, Facebook Marketplace, and Kijiji, with HEIC-to-JPG and mail confirmation extraction, testing it by posting a Canon printer across all three marketplaces and refining with real learnings like combobox handling and postal-code typeahead.

**Apps**: turing, brain, craigslist-post.

Built Joshua Tree kernel with interrupts, paging, task switching, disk drivers, filesystems, and file browser, then replaced the landing demo with live in-browser boot, fixed palette and Dock, added dmesg and full Mac polish. Fixed canvas-coordinate bugs, debugged Gato voice recording and pwnlingo; Korean lessons were stuck at zero XP because the tile matcher was reading glued text instead of the vocab word from a data attribute, so I fixed that plus voice persistence and artifacts. Mac disk critical (1.8GB free) so buying an external SSD. Restarted Turing LLM, pivoting from memorization to retrieval via brain's RAG when the 0.5B model proved it can't learn facts; fixed bugs, built QA scorer and FAQ matcher, added Wikidata officeholder lookup and extraction shortcuts, retrained on doubled data with real instruction examples, and wired up versioning and CI. Got Conveyer running after machine restart by restarting colima, killing runner.py that was fighting agent.py, fixing belt skill bugs where it assumed pickup_position on all entities (only inserters have it), adding None-guards to place_inserter/belt/smelt/auto_feed, bumping step cap from 50 to 500, and adding persistent base memory and curriculum to keep the local model on task.

**Apps**: turing, brain, joshuatree, gato, conveyer, pwnlingo.

I also checked the app fleet against what was actually live. I tested Swing alone with two fake-camera callers; both sides carried audio and video, and the call controls worked. Reports now persist and repeated reports can ban someone. TURN is still off because the available Cloudflare credentials cannot create its key. Roost kept its warm brown but gained a simpler page, clearer controls, and map labels that no longer pile up. That refresh is live. Dream got a delete-all control, then I set it aside.

Ingested "The Contrarian" (Max Chafkin's Peter Thiel biography) by photographing the book with my phone, then summarizing each section: Intro through Chapter 4 all converted from raw HEIC files to markdown summaries, synced to Supabase, and the book got a badge in books.json. Started on "Trading For Canadians For Dummies" and read through all 14 chapter-sections into individual summary files in iCloud, but haven't yet merged those summaries into a single book file or shipped them to Supabase; that's pickup work for next session.

**Apps**: bookrank.

Tonight I polished Joshua Tree with 20+ real fixes: menu bar now shows a real macOS-style clock (weekday/month/day/12-hour time), added a serial console driver for kernel debugging, redesigned every icon with full-color glyphs instead of white symbols on chips, widened AA falloff for smoother edges. Fixed real corner-notch bugs in the icon glyphs (dark notches from mismatch in gui_draw_gloss), added a gui_draw_capsule primitive to kill jagged sun-icon rays, soft drop shadows on dock icons, and dark bubbles at the dock tray corners. Shipped a real Notes text editor (8th dock app), verified with a real FAT16 disk image round-trip test across two QEMU boots. Boot screen now shows a hand-plotted cursive hello in 1984 Macintosh nod (echoed as watermark on wallpaper), landing page meta changed from "kernel" to "a new custom OS", palette swapped to Mojave desert browns (clrs.cc named colors) applied across kernel, landing page, and progress chart. Replaced procedural wallpaper with a genuine public-domain National Park Service photo of an actual Joshua tree (Wikimedia Commons), composited with real 8-bit pixel-art Joshua trees that went through multiple revisions (first read as tombstones, then sticks, finally landed as fuller tufts with staggered branches). Real Apple-menu-style dropdown off the tree logo (About/Files/Notes/Restart/Shut Down) with live memory/uptime from pmm. Every icon/font/tree change verified against screendumps before shipping; several early attempts caught as wrong via zoomed captures and revised.

**Apps**: joshuatree.

Spun up Hormuz, a geopolitics and commodities tracker for the Strait of Hormuz oil choke point; REST API with live oil prices, full-stack landing with long/short signals refreshing every 60 seconds. UI lives as a glass-background map with dark Helvetica typography; accessibility pass added iframe titles, canvas aria-labels with text alts, aria-pressed tabs, and prefers-reduced-motion support. Cloudflare Worker backend deployed and GitHub repo live with a skill at ~/.claude/skills/hormuz/. KMP cross-platform client follows the cadence pattern for Android, desktop, and iOS.

**Apps**: hormuz.

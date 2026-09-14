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

Polished Joshua Tree with 20+ real fixes: menu bar now shows a macOS-style clock, redesigned every icon with full-color glyphs and real supersampling for smooth edges, shipped a Notes text editor verified with a real FAT16 disk image round-trip test. Boot screen shows a hand-plotted cursive hello in 1984 Macintosh nod; palette swapped to Mojave desert browns applied across kernel, landing page, and progress chart. Replaced procedural wallpaper with a genuine National Park Service photo of a Joshua tree, composited with real 8-bit pixel-art versions. Real Apple-menu-style dropdown off the tree logo with live memory/uptime. Every change verified against screendumps before shipping; caught early attempts as wrong via zoomed captures and revised.

**Apps**: joshuatree.

Spun up Hormuz, a geopolitics and commodities tracker for the Strait of Hormuz oil choke point; REST API with live oil prices, full-stack landing with long/short signals refreshing every 60 seconds. UI lives as a glass-background map with dark Helvetica typography; accessibility pass added iframe titles, canvas aria-labels with text alts, aria-pressed tabs, and prefers-reduced-motion support. Cloudflare Worker backend deployed and GitHub repo live with a skill at ~/.claude/skills/hormuz/. KMP cross-platform client follows the cadence pattern for Android, desktop, and iOS.

**Apps**: hormuz.

Spent the night deep in Conveyer's skill layer (the deterministic Factorio automation logic), finding and fixing eight real bugs. The `belt` skill assumed every entity had `pickup_position` (only inserters do; furnaces/assemblers don't), so I widened the code to place extraction inserters on the source when needed. The inserter-placement logic kept creating duplicate inserters instead of reusing one already there, so I added a reuse-check, then had to loosen its coordinate matching from exact equality to a tolerance since RCON float noise never matched exactly, then widened that tolerance further for multi-tile footprints and fixed it matching the wrong nearby inserter. The `smelt` skill was using a fragile direct drop-catch (ore falling precisely into a furnace) instead of the more reliable inserter-belt method that `auto_feed` already did correctly, so I unified them and removed the redundant skill. The `peek` skill crashed calling `.fuel_inventory` on electric assemblers, which don't have that attribute, so I added a guard. Finally, the local model kept typing Factorio's internal kebab-case names (iron-plate, transport-belt) instead of FLE's PascalCase Prototype enums (IronPlate, TransportBelt), crashing episodes; added case/hyphen normalization in the skill render function. The actual goal (full ore to furnace to gear-wheel craft in one episode) still isn't achieved by qwen3:8b, blocked on the model making small mistakes even with the skill layer now solid. Left a restart loop running overnight for 20 episodes unattended; it ran but made no progress toward the goal.

**Apps**: conveyer.

Spent the night really grilling Turing's Samantha model with actual questions instead of just auditing the code, and it kept catching itself lying in new and increasingly funny ways. Asked it "is this project blocked" and got an article about internet censorship in China; asked about the model and got a food donation law; another follow-up landed on an article about a comedian. Every detour traced back to a real root cause, not a fluke: the keyword patterns were missing "project"/"repo"/"repository" and "model", the pronoun-based memory wasn't remembering follow-ups like "what is its first model called", and a silent failure on the word "current" broke the entire Wikidata lookup. Fixed all nine bugs, added regression tests, and shipped them as separate releases. Updated the landing page to show real before/after transcripts from these fixes.

**Apps**: turing.

Shipped real Desmos parity work on Curvely: typed `a = 3` as an equation row to get a draggable slider, other equations referencing `a` update live on the graph. Added hover coordinate tracing to read exact points. Built implicit equation support (circles, vertical lines, etc.) via marching squares on the web, then ported to Swift for iOS and macOS; both native targets verified with xcodebuild. Submitted both platforms to App Review with sliders, hover-coords, and implicit equations.

**Apps**: curvely.

Fixed the portfolio; design tokens weren't wired up. Only tokens.css loaded, hairlines showed Jaybulb's yellow instead of black/white. Added tokens-lovefrom.css link and pushed live.

**Apps**: nulljosh.github.io.

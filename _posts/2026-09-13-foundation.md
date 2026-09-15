---
layout: post
title: "Foundation"
date: 2026-09-13 12:00:00 -0700
categories: journal quarterly
---

{% include headers/2026-09-13-foundation.svg %}

{% include graphs/2026-09-13-foundation.svg %}

Restarted the LLM project (Turing + Samantha) discovering a 0.5B model memorizes style but can't learn facts; pivoted to retrieval via brain's RAG. Score jumped from one to 14 correct, with extraction shortcuts at 100%. Fixed brain's Worker bug, widened doc coverage, added Qwen3.5-0.8B hardware ceiling, built a Craigslist skill for Chrome automation (post, Marketplace, Kijiji), and tested it posting a Canon printer across all three with real learnings on UX bugs.

**Apps**: turing, brain, craigslist-post.

Built Joshua Tree kernel with real interrupts, paging, task switching, disks, filesystems, and file browser; replaced the landing demo with live in-browser boot and full Mac polish. Fixed Gato voice recording and pwnlingo (Korean vocab tile was reading glued text instead of the data attribute; fixed voice persistence and artifacts too). Restarted Conveyer after machine restart, killed runner.py fighting agent.py, fixed belt skill bugs (pickup_position assumption, None-guards, step cap), added persistent base memory and curriculum.

**Apps**: joshuatree, gato, conveyer, pwnlingo.

Tested Swing with two fake callers; audio and video carried both ways, controls worked. Roost got clearer page and non-overlapping map labels (live now). Dream got a delete-all control. Ingested "The Contrarian" and started "Trading For Canadians" as book badges. Polished Joshua Tree with 20+ fixes: macOS clock, icon redesign with supersampling, Notes editor, 1984-style boot hello, Mojave palette, real NPS wallpaper, Apple-menu dropdown. Spun up Hormuz: oil-price tracker with live geopolitics signals, glass-background map, Cloudflare backend, KMP client. Fixed eight Conveyer skill bugs: belt/inserter/smelt logic, fuel attribute guards, case normalization. Grilled Turing and found hilarious bugs: "project blocked" returned censorship articles, model questions got food donations; fixed keyword/memory/current-word issues, added regression tests.

**Apps**: swing, roost, dream, bookrank, joshuatree, hormuz, conveyer, turing.

Shipped real Desmos parity work on Curvely: typed `a = 3` as an equation row to get a draggable slider, other equations referencing `a` update live on the graph. Added hover coordinate tracing to read exact points. Built implicit equation support (circles, vertical lines, etc.) via marching squares on the web, then ported to Swift for iOS and macOS; both native targets verified with xcodebuild. Submitted both platforms to App Review with sliders, hover-coords, and implicit equations.

**Apps**: curvely.

Fixed the portfolio; design tokens weren't wired up. Only tokens.css loaded, hairlines showed Jaybulb's yellow instead of black/white. Added tokens-lovefrom.css link and pushed live.

**Apps**: nulljosh.github.io.

Fixed pwnlingo's Settings button opening behind the app (runs as menu-bar-only .accessory so nothing brings the Settings window forward); added NSApp.activate(ignoringOtherApps: true) before opening it. Changed sound effects default from on to off in two places since AppStorage defaults need to match.

**Apps**: pwnlingo.

Hit a wall: the main SSD was 100% full with only 128MB free, blocking Mail. Cleanup freed nothing, so I hunted and found the culprit: 19GB of Ollama models, half stale. Deleted the unused qwen2.5-coder variants, kept active ones (qwen3:8b and llama3.1:8b). Borrowed a 2TB LaCie from my dad, migrated models/Movies/Music there with symlinks; SSD jumped to 27GB free. Ran mailbox triage: deleted junk (SaasHunt, CodeRabbit, Upvote spam), cleared stale ASC review emails and receipts, left active PRs and a Namecheap payment-issue for Joshua. Fixed Lucarne macOS rejection: the support URL was transiently down, the minimum-functionality pushback was wrong (tabs and chrome are native), and the app crashed on last-window-close. Added AppDelegate to quit cleanly, appealed with a real feature walkthrough, bumped build, and resubmitted; cancelled the stuck submission. Then came the naming saga: Lucarne wasn't sticking. Tried Fenster (German for window; Joshua said too angry sounding), then Ikkuna (Finnish; he liked it, but taste shifted), then Janela (Portuguese; kind of mid), finally landed on Madobe (Japanese, "by the window"; confirmed good). Rippled the rename everywhere: App Store listing, Swift source, Xcode project, GitHub repo (now nulljosh/madobe), Cloudflare Worker, custom domain (madobe.heyitsmejosh.com). Bundle ID stayed com.nulljosh.lucarne (swapping it needs a new ASC record, not worth it). Repo folder stayed lucarne to match windgate/breathe. macOS build still pending review, unaffected by the display-name-only changes. asc-name-creator skill got a lesson captured from the hunt.

**Apps**: madobe.

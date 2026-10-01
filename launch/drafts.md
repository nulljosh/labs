# Launch month drafts, Oct 2026

Approved by Joshua 2026-10-01. One approval covers this whole file. After that each item posts on its date without asking again.
Every link carries `?ref=<channel>` so Cloudflare Web Analytics shows which channel works.

Already on Product Hunt (never repost): Notate (as Voxprint), Doorstock, Bookrank, Curvely, Talli, Inkpress, Quotestreak, Wordroot, Lexly, Epiphany, Sparkjar, NYC Survive, Blockframe, Sidewise. Those 14 launches in September made $0, so PH is not the main bet this month. HN with Joshua Tree is.

Waits until approved in the store: Windgate, Siftbox, Madobe, Lexly iOS, Sidewise iOS, Plaintxt iOS, Curbfind iOS.

## Calendar

| Date | PH (12:01 AM PT) | HN (8 AM PT) | Reddit (one a day max) | X | Other |
|---|---|---|---|---|---|
| Fri Oct 2 | | | | | Notify-me form, email capture, OG tags |
| Mon Oct 5 | | | | | Directories batch 1: Toroid, Plaintxt, Nimble, Curvely, Notate |
| Tue Oct 6 | Toroid | | r/cellular_automata: Toroid | Toroid | |
| Wed Oct 7 | | Show HN: Joshua Tree | | Joshua Tree | Journal post 1 live (kernel) |
| Thu Oct 8 | Plaintxt | | r/osdev: Joshua Tree | Plaintxt | Newsletter pitches go to you |
| Mon Oct 12 | | | r/macapps: Plaintxt | | Directories batch 2: JT, Plank, Curbfind, Healstack |
| Tue Oct 13 | Nimble Answers | | r/rss: Inkpress | Nimble | |
| Wed Oct 14 | | Show HN: Plank | | Plank | |
| Thu Oct 15 | Joshua Tree | | r/ProgrammingLanguages: Plank | Joshua Tree | |
| Fri Oct 16 | | | r/SideProject: the 15-app story | | |
| Tue Oct 20 | Curbfind | | r/Craigslist: Curbfind | Curbfind | |
| Wed Oct 21 | Plank | | r/indiehackers: month-one numbers | Plank | Journal post 2 live (15 apps) |
| Tue Oct 27 | Healstack | | r/macapps already used, skip | Healstack | |
| Wed Oct 28 | | (spare slot: one app, only if JT or Plank landed) | | | |

Every Reddit sub gets its rules and pinned self-promo thread read the day before. If a sub bans it, that day is skipped, not moved to another sub.

## Show HN, Wed Oct 7, 8 AM PT

**Title:** Show HN: Joshua Tree, an i386 OS I built from scratch that runs in a browser tab

**URL:** https://github.com/nulljosh/joshuatree?ref=hn

**Text:**
I wanted one computer where I understand the whole thing, from the first instruction the CPU runs to the pixels on the screen. Joshua Tree is that: a 32-bit kernel in C with no libc, its own paging, interrupts, scheduler with per-process page tables, a FAT16 driver, a network stack, and a desktop with 26 apps on top.

It boots to a shell in about 260 ms in QEMU on my Mac Mini, and you can try it in the browser at joshuatree.heyitsmejosh.com without installing anything. There's also an ISO you can dd to a USB stick.

I built it with Claude Code doing a lot of the typing. Nothing ships until it's shown working: ./check.sh boots it, and other scripts open every app in an emulator and check the pixels. What's missing: no SMP, no 64-bit, drivers only for QEMU's emulated hardware so far, and I haven't booted it on a real machine yet. Happy to answer anything about how it works.

## Show HN, Wed Oct 14, 8 AM PT

**Title:** Show HN: Plank, a compiled language whose whole compiler is one Python file

**URL:** https://github.com/nulljosh/plank?ref=hn

**Text:**
Most language tutorials stop at a tree-walking interpreter. I wanted to see the part where it makes a real binary, so Plank goes straight to machine code. The whole compiler is one Python file on top of llvmlite. LLVM does register allocation and optimization, the file does lexing, parsing, type checking and IR.

It has strings with interpolation, lists, dicts, structs with methods, enums with an exhaustive match, optionals, closures with map and filter, imports, try and catch, and a garbage collector, and it makes native binaries on macOS and Linux. The repo has six real programs written in it, including a calculator with its own parser, and the test suite runs them on every push. `plank emit` prints the LLVM IR if you want to see what your code turns into. It's meant to be read, forked and taught from. What's missing, on purpose or not yet: generics, threads, a package manager and a REPL.

## Product Hunt

Same rules for every one: real screenshots from `launch/gallery/`, first comment posted as you the second it goes live, never ask for upvotes.

**Tue Oct 6, Toroid**
Tagline: Conway's Game of Life on a grid that never dies at an edge
First comment: `conway/launch/producthunt.md` as written (glider-hits-the-wall story, two engines held to the same tests). Last line: "Toroid is $0.99 on iPhone, iPad and Mac, free on the web."

**Thu Oct 8, Plaintxt**
Tagline: A text editor that writes no editor code
First comment: `plain/launch/producthunt.md`, with two fixes: it's on Mac only in the store right now (iOS is in review) Also add one line it's missing: "On the Mac, ⌘↩ in a code file asks a local model through Ollama to fill in at the cursor."

**Tue Oct 13, Nimble Answers**
Tagline: Ask a question. Get one sentence back.
First comment: `nimble/launch/producthunt.md` as written. Free.

**Thu Oct 15, Joshua Tree**
Tagline: A whole computer, built from nothing, in a browser tab
Description: A from-scratch i386 operating system: its own kernel, desktop, network stack and 26 apps, written in C with no libc. Boot it in your browser or from a USB stick. Free and open source.
First comment:
Every computer I've used was someone else's decisions stacked a thousand deep, and I couldn't see any of them. I wanted one machine where I understand the whole thing. So I started from the first instruction the CPU runs and kept going until there was a desktop.

It has its own memory management, interrupts, a scheduler where each process gets its own page tables, a FAT16 disk driver, a network stack, and on top of that a dock, a terminal, Mail, Calendar, Stocks, 26 apps in all. It boots to a shell in about a quarter of a second in QEMU. The easiest way to try it is the browser link, nothing to install.

The longer goal is hardware: this software on a small machine I build, with no cloud in the loop. If that sounds like something you'd want, there's a notify-me form on the site. It's free and open source.

**Tue Oct 20, Curbfind**
Tagline: Craigslist, without the 2003-era clutter
First comment: `curbfind/launch/producthunt.md`, minus the iOS/Android mentions (Mac and web only right now). Free.

**Wed Oct 21, Plank**
Tagline: A compiled language you can read in an evening
Description: Plank is a small compiled language whose whole compiler is one Python file. Structs, enums with match, optionals, closures, lists and dicts, a garbage collector, and native binaries through LLVM on macOS and Linux. Free and open source.
First comment:
Building a language sounds like a year of work and most tutorials quit right before the part that makes a binary. I wanted the opposite: the smallest thing that's still a real compiler. Plank is one Python file on llvmlite. It has what you reach for in Python or Swift: strings with interpolation, lists, dicts, structs with methods, enums with an exhaustive match, optionals, closures with map and filter, imports, try and catch, and a garbage collector. `plank emit` shows you the LLVM IR, which is the best way I've found to learn what a compiler actually does. The repo has six real programs written in it, including a calculator with its own parser, and the test suite runs them on every push. It's free and meant to be read, forked and taught from.

**Tue Oct 27, Healstack**
Tagline: Know what you took, when, and what it's still doing
First comment: `healstack/launch/producthunt.md` as written. Pricing line: free on iPhone and the web, $1 one-time CSV export on the web.

## Reddit

**r/cellular_automata, Tue Oct 6**
Title: I made a Game of Life where the board wraps, so gliders never hit a wall
Body: Every Game of Life app I used had a hard edge, and every glider walked into it and died. So I made the board a torus: off the right edge, back in on the left, same for top and bottom. Gosper's gun runs forever without eating itself on a wall. The engine is written twice, JavaScript for the web and Swift for iPhone and Mac, and both are held to the same tests so they can't drift. It's free in the browser: toroid.heyitsmejosh.com?ref=reddit (the native app is $0.99). I'm the maker. Curious which patterns behave differently on a wrapped board, I haven't found many yet.

**r/osdev, Thu Oct 8**
Title: My hobby i386 OS now boots to a desktop with 26 apps, and runs in a browser tab
Body: I've been building Joshua Tree for a while: C, no libc, its own paging with per-process page tables, IRQ handling, a scheduler with real process isolation, FAT16 on a real disk image, a network stack, and a desktop on top. It boots to a shell in about 260 ms in QEMU. Repo: github.com/nulljosh/joshuatree. Live in the browser: joshuatree.heyitsmejosh.com?ref=reddit. Honest gaps: no SMP, 32-bit only, drivers mostly target QEMU's emulated devices, and I haven't booted it on real hardware yet. I'd love to hear what you'd tackle next, I'm leaning toward a real NIC driver for actual hardware.

**r/macapps, Mon Oct 12** (check the pinned self-promo thread first, post there if required)
Title: Plaintxt: a free native Mac text editor that's just NSTextView, no Electron, no subscription
Body: I missed when text editors were small. Plaintxt is SwiftUI's DocumentGroup and the system text view, so autosave, versions, iCloud, tabs, undo and VoiceOver all come from macOS. On top it adds a monospaced toggle, font size, a word/line/character count, light colouring for Markdown and code, and ⌘↩ to ask a local Ollama model to fill in code at the cursor, nothing leaves the Mac. It's free on the Mac App Store, and there's a web version too: plain.heyitsmejosh.com?ref=reddit. I'm the dev. No line numbers yet, tell me if that's a dealbreaker.

**r/rss, Tue Oct 13**
Title: I built a small RSS and Atom reader for iPhone, Mac and the web
Body: Inkpress does one thing: add feeds, read them. No account, no algorithm, no "for you." I built it because the readers I liked either went subscription or got heavy. It's $0.99 on iPhone and Mac and free on the web: inkpress.heyitsmejosh.com?ref=reddit. I'm the maker. What do you want from a reader that nobody does well?

**r/ProgrammingLanguages, Thu Oct 15**
Title: Plank: a tiny compiled language, the whole compiler is one Python file on llvmlite
Body: I wanted a teaching-sized compiler that skips the tree-walking interpreter and goes straight to native code. Plank has structs with methods, enums with an exhaustive match, optionals, closures, lists, dicts, try/catch and a garbage collector. Lexer, parser, type checker and IR generation all live in one file; LLVM does register allocation and optimization. `plank emit` dumps the IR. The garbage collector is the newest and least tested piece, so that's where I'd most like eyes. github.com/nulljosh/plank (I'm the author.)

**r/SideProject, Fri Oct 16**
Title: I'm on disability and I've shipped 20-odd apps to the App Store this year with Claude Code. Revenue so far: $0
Body: Real numbers, because the "I made $10k MRR" posts don't help anyone. I'm on BC disability, and building things is what I do with my days. With Claude Code doing a lot of the typing, I've put 20 apps in the App Store and a from-scratch operating system on GitHub. 14 went on Product Hunt in September. Total revenue: zero. This month I'm trying to fix the part that isn't code: pricing, distribution, asking. Everything's at nulljosh.github.io?ref=reddit. If you've gone from zero to first sale, what actually moved it?
(Revenue line gets updated to the real number the morning it posts.)

**r/Craigslist, Tue Oct 20** (only if self-promo allowed)
Title: I made a photo-grid view of Craigslist for Mac and the web
Body: Craigslist has the best local listings and the worst way to browse them. Curbfind reads Craigslist's own search and lays it out as a photo grid with price and distance filters across 700 cities, plus a "best deals" sort that compares each listing to the median price of the same search. Free, no account: curbfind.heyitsmejosh.com?ref=reddit. I'm the maker.

**r/indiehackers, Wed Oct 21**
Title: Three weeks of launching 20 small apps: what moved and what didn't
Body: Written the morning it posts, from GTM.md numbers only. No draft until there's data.

## X, one post per launch day

- Oct 6: Made a Game of Life where the board wraps, so gliders never die at the edge. Toroid is on Product Hunt today. producthunt.com/... (link filled when live)
- Oct 7: I built an operating system from scratch. Kernel, desktop, 26 apps, no libc. Runs in your browser. On Hacker News today. joshuatree.heyitsmejosh.com?ref=x
- Oct 8: Plaintxt is a Mac text editor made of almost nothing: the system text view and three settings. Free. (PH link)
- Oct 13: Nimble Answers: ask a question, get one sentence back, not ten links. Free. (PH link)
- Oct 14: Plank: a compiled language with structs, enums and closures, and the compiler is one Python file. Show HN today. (HN link)
- Oct 15: Joshua Tree is on Product Hunt. A whole computer built from nothing. (PH link)
- Oct 20: Curbfind: Craigslist as a photo grid. Free. (PH link)
- Oct 21: Plank on Product Hunt. (PH link)
- Oct 27: Healstack: know what you took and what it's still doing. (PH link)

## Directories (one listing each, reused across sites)

Name, one-liner, two-sentence description and links come straight from each app's `launch/directories.md`. Sites: AlternativeTo, Uneed, MicroLaunch, Fazier, Peerlist, SaaSHub, Indie Hackers products, MacUpdate (Mac apps only). Every URL gets logged in GTM.md.

## Newsletter pitches (you send these, Oct 8)

To Console.dev, TLDR, Hacker Newsletter, OSNews, plus a Lobsters submission if you get an invite:

Subject: From-scratch i386 OS that boots in a browser tab
Hi, I'm Joshua. I built Joshua Tree, a 32-bit operating system written from nothing: its own kernel, scheduler, FAT16 driver, network stack and a desktop with 26 apps, in C with no libc. It boots to a shell in about 260 ms and you can run it in your browser without installing anything: joshuatree.heyitsmejosh.com. Source is Apache 2.0 at github.com/nulljosh/joshuatree. Thought it might fit your readers. Thanks for reading. Joshua

## Journal posts (journal.heyitsmejosh.com, cross-posted to dev.to and Hashnode with canonical link)

1. Oct 7, "How I built an i386 kernel from scratch". Drafted from the JT whitepaper in your voice, sent to you before it goes up.
2. Oct 21, "Shipping 20 apps on disability with Claude". Same.

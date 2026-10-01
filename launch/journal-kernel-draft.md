---
layout: post
title: "How I built an i386 kernel from scratch"
date: 2026-10-07 08:00:00 -0700
categories: essay
---

Every computer I have ever used was someone else's decisions, stacked a thousand deep. I couldn't see any of them. I wanted one machine where I understand the whole thing. Not trust the abstraction. Actually know why that bit is set in that page table.

So I started at the bottom. The first instruction the CPU runs. Then I kept going until there was a desktop.

That's Joshua Tree. You can boot it in your browser right now at joshuatree.heyitsmejosh.com. Nothing to install.

## What's in it

A kernel for a 32-bit Intel machine, written in C with no libc. It sets up its own memory management, its own interrupts, and its own scheduler, where every task gets its own page tables. It reads files off a real FAT16 disk or a RAM disk.

It found the network card by walking the PCI bus itself. Then it built Ethernet, ARP, IPv4, UDP, DNS, TCP and HTTP out of raw bytes on the wire. That stack is what pulls live weather into the menu bar and a real topographic map of where you are for the wallpaper. The map tiles are PNGs, so there's a PNG decoder in the kernel too.

On top of all that sits a desktop. A dock, a terminal, Mail, Calendar, Stocks, Notes, a file browser, a Trash you can restore from. Twenty-six apps. It boots to a shell in about a quarter of a second in QEMU on my Mac Mini.

## The parts that were harder than they look

**Drawing.** The desktop is laid out at 960 by 540 and drawn at 1920 by 1080. Every normal pixel write fills a 2 by 2 block, so no app has to know. Icons, text and the wallpaper write real pixels directly, which is why they're sharp and nothing else had to change.

There's no double buffer. A full repaint is something you'd see. So nothing repaints the full screen unless it has to. Moving the cursor touches about 340 pixels. Hovering the dock redraws one strip from cached tiles. Only opening an app repaints everything.

**The mouse.** A tap should land exactly where your finger is. Relative mouse movement drifts. So at boot the kernel asks the emulator, through a VMware backdoor, whether it can just tell it where the pointer is. QEMU and the browser emulator both say yes. Real hardware won't answer, so it falls back to plain PS/2.

**The browser demo.** The landing page runs this exact kernel inside a JavaScript x86 emulator. A real BIOS sets up text mode, the keyboard, the colour palette and the font before an OS ever runs. The emulator's doesn't. So the kernel learned to do all four itself.

## How I know it works

Nothing ships because it compiled. It ships when it's shown working. One script boots it. Another opens every app in a real emulator and checks the pixels. Another drives the browser demo as an iPhone and taps an icon.

The bugs that mattered most were found by instruments, not by thinking hard. A serial probe found the missing font. A pixel dump found corners drawn from the wrong centre. A macro photo of the screen found a bezel nobody could see at normal size.

## Who wrote it

Me, with Claude Code doing a lot of the typing. I'm on disability, and building things is what I do with my days. This is the biggest thing I've built. I decide what it should be, I check that it is, and I throw away what isn't.

## What it isn't yet

It has never booted on a real machine. Everything is verified headless in QEMU. There's no USB storage, no AHCI or NVMe driver, no SMP, no 64-bit. The syscall gate is real but small, and a general syscall interface with more than one program using it is what 1.0 means. Most apps are still full-screen. The Trash empties on reboot.

## Where it goes

The longer goal is a computer I built end to end. This software, on a small board, talking to a model running on the same machine, no cloud in the loop. If that's something you'd want on your desk, there's a notify-me form on the site.

The code is Apache 2.0 at github.com/nulljosh/joshuatree. Boot it, break it, tell me what broke.

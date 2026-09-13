---
layout: post
title: "Foundation"
date: 2026-09-13 12:00:00 -0700
categories: journal daily
---

{% include headers/2026-09-13-foundation.svg %}

{% include graphs/2026-09-13-foundation.svg %}

## Sunday

Spent the night building Joshua Tree kernel from v0 through v5: physical memory management, paging, cooperative task switching, disk drivers, FAT16 filesystem, heap, and text-mode file browser; the landing page swapped from a broken v86 demo to a real recorded QEMU boot GIF. The project got renamed several times (os through tuatara, draco, and hatchling to finally Joshua Tree), redesigned with a terracotta icon and a native menu bar monitor; Leopard Gecko is now reserved as the future distro name once Joshua Tree becomes fully graphical. Also completed Conveyer's game automation for vanilla Factorio: expanded the skill library from 6 to 20 real routines, built a hot-reloading driver for fast iteration, and wrote an unattended bootstrap script that found and fixed five real bugs (sleep timing, feed overflow, stone shortage). Fixed the Gato naming mess by reverting Leopard Gecko back to plain Gato, keeping the distro name reserved for Joshua Tree; rolled whitepaper refreshes and roadmap pruning across 54 repos fleet-wide.

**Apps**: joshuatree, conveyer, gato, plus 54 fleet updates.

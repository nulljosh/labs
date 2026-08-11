---
layout: post
title: "Consolidation"
date: 2026-08-11 12:00:00 -0700
categories: journal daily
---

![August 11](/assets/2026-08-11-consolidation.svg)

## Tuesday (August 11)

Spent the evening doing a full inventory of the codebase and found how much duplication has crept in. About 15 directories exist in both the top level and inside labs—roost and missing-pets are 400K stale stubs of much larger copies, and wiretext and grapher are outdated remnants from a split. Six repos are maintaining their own copies of the design tokens while four others correctly import the shared stylesheet. The app duplication is worse: fengshui is one chapter of bookrank, etyma is a lookup box that nimble already ships as a finished product, and lexly is holding copies of bookrank summaries that will just rot. Sketched out a four-phase consolidation plan (delete the duplicate directories, unify token imports, retire the thin apps, set up a shared app registry so future renames don't require hand-editing eight separate places). Saved it, but this session was mostly the inventory and planning—nothing landed yet.

Earlier today: wrapped up book summaries (The Optimist chapters eight through ten finished), refreshed App Store screenshots across multiple apps with real account data instead of empty demo states, and pruned roadmaps to mark finished work.

**Apps.** Epiphany, Talli, Healstack, Bookrank, Journal, Voxprint all got fixes or polish. The Optimist summary work added to Bookrank.

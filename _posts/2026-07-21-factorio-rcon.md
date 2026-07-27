---
layout: post
title: "Factorio"
date: 2026-07-21 22:30:00 -0700
categories: journal nightly
---

## Tuesday

Tried building a live-spectate mode for Claude playing Factorio in your own world. Got the RCON control working and had Claude actually mining iron ore autonomously via LuaSocket commands, then hit a hard wall: the FLE tool's script injection breaks Factorio's multiplayer map sync. The moment a real player (you) tried to join the server, the deserialization crashed on unserializable Lua functions. Confirmed this is an architecture limitation, not fixable without a different approach (async screenshot mode instead of live client join). Abandoned it—pointless without live spectate. Enjoyed the technical deep dive though.

## Apps Summary

No new app changes tonight (session was all-external sandbox work, no commits).

**Shipped:** (unchanged from 2026-07-21 morning wrap)
**In flight:** (unchanged)
**Blockers:** (unchanged)


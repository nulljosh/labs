# Video Speed Control Technical Whitepaper

**v1.0.0** | August 2026

Every video, at your speed.

A Chrome extension that speeds up or slows down any HTML5 video from the keyboard,
with a small badge to show the rate. Netflix, Prime Video, YouTube, anything with a
`<video>` element.

## Problem

Netflix and Prime Video have no playback-speed control. YouTube has one, but it
is three clicks deep and quantized to a fixed menu. The underlying capability , 
`HTMLMediaElement.playbackRate`, is standard and unrestricted; only the player
UI is missing.

## The Sticky-Rate Problem

Setting `playbackRate` once is not enough. Players reset it whenever the source
changes: a new episode, an ad break, a quality switch. The extension therefore
holds one rate per tab session and re-applies it on source change, so the
setting survives what would otherwise silently revert it. That reapplication is
the only non-obvious part of the extension.

One global rate covers every video on the page rather than per-element state , 
a page with two videos playing at different speeds is not a real case, and the
state it would require is not worth carrying.

## Implementation

`content.js`, 43 lines, injected at `document_idle` into all frames (players
are frequently in an iframe). Rate is clamped to 0.1×–4× in 0.1 steps. The
badge is a single fixed-position div at max z-index with `pointerEvents: none`,
fading after 900ms so it never intercepts a click on the player beneath it.

Manifest V3, content script only, no background service worker, no popup, no
options page, no permissions beyond `<all_urls>` matching.

## Privacy

No network requests, no storage, no telemetry. The extension reads nothing off
the page and sends nothing anywhere; it sets one property on `<video>` elements.

## License

MIT 2026, Joshua Trommel

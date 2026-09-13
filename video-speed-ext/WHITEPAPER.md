# Video Speed Control Technical Whitepaper

**v1.0.0** | August 2026

Every video, at your speed.

A Chrome extension that speeds up or slows down any HTML5 video from the keyboard,
with a small badge to show the rate, because reaching for a mouse to change speed
defeats the point of watching faster. Netflix, Prime Video, YouTube, anything with a
`<video>` element.

## Problem

Netflix and Prime Video have no playback-speed control. YouTube has one, but it
is three clicks deep and quantized to a fixed menu, which is friction enough
that most people never touch it. The underlying capability, 
`HTMLMediaElement.playbackRate`, is standard and unrestricted; only the player
UI is missing, so the fix is a UI, not a workaround.

## The Sticky-Rate Problem

Setting `playbackRate` once is not enough. Players reset it whenever the source
changes: a new episode, an ad break, a quality switch, silently, with nothing
telling the viewer their rate got reverted. The extension therefore
holds one rate per tab session and re-applies it on source change, so the
setting survives what would otherwise silently revert it. That reapplication is
the only non-obvious part of the extension.

One global rate covers every video on the page rather than per-element state,
because a page with two videos playing at different speeds is not a real case,
and the state it would require is not worth carrying for a case that doesn't
happen.

## Implementation

`content.js`, 43 lines, injected at `document_idle` into all frames (players
are frequently in an iframe, and a rate set only on the top frame would miss
the actual video). Rate is clamped to 0.1×–4× in 0.1 steps, past which video
and audio stop being watchable at all. The badge is a single fixed-position
div at max z-index with `pointerEvents: none`, fading after 900ms so it never
intercepts a click on the player beneath it.

Manifest V3, content script only, no background service worker, no popup, no
options page, no permissions beyond `<all_urls>` matching, because none of
those pieces do anything a keyboard shortcut on the page itself can't.

## Privacy

No network requests, no storage, no telemetry. The extension reads nothing off
the page and sends nothing anywhere; it sets one property on `<video>` elements,
because changing playback speed is the entire job and nothing else needs to
happen for it.

## License

MIT 2026, Joshua Trommel

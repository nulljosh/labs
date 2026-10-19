# Coda brand kit and design system

A quote mark on a streak. Coda is a quick, loud game, so the brand is a cinema marquee: yellow light on night ink. Green and red belong to right and wrong, so the brand never uses them.

The live kit is at `brand/index.html` (coda.jaybulb.com/brand/).

## The mark
Two opening quote marks, ball low and tail sweeping up, leaning forward with three speed lines behind them. Marquee yellow on a night-ink tile. No text, no outline, no emblem.

- `../Coda.icon` is the source of truth (Icon Composer), wired into the iOS and macOS targets as the app icon. The asset catalogs hold a flattened fallback.
- `../icon.svg` is the flat copy for READMEs (80 px). `icon-1024.png` is the App Store icon, no alpha. `icon-tile.svg` is the square master the web icons are cut from.
- `mark.svg` is the glyph alone in `currentColor`.
- The tail is always longer than the ball. A short tail reads as a speech bubble, a wedge reads as a pause button.
- Clear space is one ball's width. Smallest size 16 px; it holds at 29 px.

## Quip
The mascot is the mark come to life: the ball is the body, the tail is the cowlick. `mascot.py` draws four poses, each with a `-dark` twin whose limbs are soft white (`#f5f5f7`) instead of ink.

| Pose | When |
|---|---|
| `idle` | Menus, empty states, a finished game with a score |
| `cheer` | A new high score, a big moment, the landing's closing call |
| `oops` | A finished game with no score, errors |
| `streak` | Marketing, share cards, anything about speed |

Quip is always yellow with an ink face. Never recolour, outline or stretch Quip, and never put words in its mouth on screen. On light grounds use the plain file, on dark grounds the `-dark` one. In the apps, `Quip.xcassets` switches by appearance on its own.

## Colour
| Role | Value |
|---|---|
| Accent, marquee yellow | `#ffcc00` |
| Accent deep (strokes and rings on light) | `#e0a800` |
| Accent text (yellow as text on light, 5.9:1) | `#8a6412` |
| Text on accent | `#15161a`, always ink, never white |
| Night ink (tile, dark cards) | `#15161a` to `#2e3039` |
| Right | `#248a3d` light, `#34c759` dark |
| Wrong | `#d70015` light, `#ff453a` dark |
| Ground, surface, hairline (light) | `#ffffff`, `#f5f5f7`, `#e5e5ea` |
| Ground, surface, hairline (dark) | `#0f1013`, `#1c1d22`, `#2c2d33` |

Yellow is for the one primary action on a screen, the mark, and Quip. Everything else is ink on white or white on ink. The ground is white on purpose: the shared jaybulb tokens are cream paper, and `brand/tokens.css` overrides them, because cream under a wall of posters read orange and brown (Joshua, 2026-10-18: "make it white again"). Yellow text never sits on the light ground; links there are ink with a deep-yellow underline.

## Type
**Quip Sans**, built by `scripts/gen_font.py` from Hanken Grotesk (SIL OFL 1.1, the license ships in `fonts/OFL.txt`). It sits between Helvetica's grotesk, SF's screen clarity and Lato's warmth. Two things are ours: the curly quotes are redrawn as the mark, so every quote in the game wears the logo, and the figures are proportional.

- Weights: Regular 400, Medium 500, Semibold 600, Bold 700.
- Web stack: `"Quip Sans", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif` (`--font-brand`).
- Apps: `Font.quip(.style, weight:)` in `Theme.swift`, which follows Dynamic Type. Fonts register from the bundle, no Info.plist list.
- Quotes are set in Semibold, upright, between curly marks. No italics: the face has none and a fake slant is worse than none.
- Scale (iOS points): 34 bold, 22 semibold for the quote, 20, 17, 15, 13. macOS runs a notch above AppKit's defaults.

## Space and shape
- 8 point grid: 4, 8, 12, 16, 24, 32, 48. Reading column 560 in the apps, 720 on the web.
- Radii: panels 16, answer cards 14, controls fully round, icon 22 percent.
- Controls are 48 points tall. Primary is a yellow capsule with ink text. Secondary is a capsule outlined in accent deep. One primary per screen.
- Answers are full-width cards with a hairline. A revealed answer fills green or red with white text; the others fade to half.

## Motion
- The poster wall drifts, slower on each column, and freezes for the speed round so it never fights the clock.
- A right answer throws confetti in yellow, white, pink, green and orange. Every fifth in a row throws a bigger burst; a new high score throws the biggest.
- The streak flame bounces when it grows. Quip bobs.
- All of it stops under reduced motion.

## Voice
Short and a little cocky, like a friend who knows every line. "5 in a row!", "Nope, it was Titanic". No exclamation marks on errors, no emojis anywhere.

`tokens.css` holds everything above that the web needs. `Theme.swift` mirrors it for the apps.

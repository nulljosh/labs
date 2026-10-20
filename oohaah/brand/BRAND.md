# Oohaah brand kit and design system

Oohaah is the noise a monkey makes to say hello, and the noise you make when a stranger surprises you. Fifteen seconds of video with someone new. The mark is Momo's face.

## The mark
Momo's face in white on a purple to navy tile: round head, two round ears, a tuft, and the heart-shaped face cut out so the tile shows through, with eyes and a smile. No text, no outline.

- `../Oohaah.icon` is the source of truth (Icon Composer). Light and dark fills are set in it.
- `../icon.svg` is the flat copy for READMEs (shown at 80 px). `icon-1024.png` is the App Store icon, no alpha.
- `mark.svg` is the glyph alone in `currentColor` for your own background.
- Clear space equal to one ear's width. Smallest size 16 px.

## The mascot
`mascot.svg` is Momo, a small orange monkey with white wings, cheerful, never a cartoon face alone. Flat shapes in a circle on a pale purple disc. Use it at 28 px in a nav, 112 px over a section, and on the empty and waiting screens. Never with text inside it, never traced from a photo.

## Colour
Built on [clrs.cc](https://clrs.cc) purple, with clrs.cc navy deepening the icon tile.

| Role | Light | Dark |
|---|---|---|
| Accent (actions, links, buttons) | purple `#B10DC9` | `#DA8BE6` links, `#B10DC9` buttons |
| Band (full-bleed sections) | purple `#B10DC9` | `#6e0880` |
| Engravings on the band | `#e9b9f0` | `#d58ce0` |
| Icon tile | `#B10DC9` to `#001F3F` | deeper navy |
| Background | `#fdfdfd` | `#070b14` |
| Surface | `#f4f2f7` | `#10162a` |
| Line | `#e0dce6` | `#232b45` |
| Text | `#1a1a1a` | `#f2f5f3` |
| Secondary text | `#5d5866` | `#a7a3b5` |

## Type
Headlines and labels use Oohaah Display (Antonio, SIL Open Font License): thin condensed caps. Everything else is the system font: `-apple-system, BlinkMacSystemFont, "SF Pro Text", Lato, "Helvetica Neue", Helvetica, Arial, sans-serif`.

## Art
Wood engravings of primates from Brehms Tierleben (1890 to 1893, public domain), dithered to line masks in `web/art/` and tinted lavender on the purple band.

## Space and shape
- Space on the 8 point grid: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Landing buttons are 48 points tall with 2 point corners, set in display caps. Radii elsewhere: cards 28, rows 8, icon 22.5 percent.
- Focus is a 3 point ring at 30 percent accent.
- Motion is 0.2 s ease and honours reduced motion.

`web/tokens.css` is the single source; the native `Theme.swift` mirrors it.

# Clock brand kit and design system

time, one hand sweeping

## The mark
One bold flat white glyph on an accent gradient tile. No text, no outline, no emblem.

- `../Clock.icon` is the source of truth (Icon Composer). Light and dark fills are set in it.
- `../icon.svg` is the flat copy for READMEs (shown at 80 px). `icon-1024.png` is the App Store icon, no alpha.
- `mark.svg` is the glyph alone in `currentColor` for your own background.
- Clear space equal to the width of the glyph's thickest stroke. Smallest size 16 px.

## Colour
| Role | Light | Dark |
|---|---|---|
| Accent, links, buttons, band | `#0a5fd6` blue | `#4da3ff` (buttons `#0a62d8`, band `#0a4aa8`) |
| Icon gradient | `#3d9bff` to `#0a5fd6` | same |
| Text | `#1d1d1f` | `#f5f5f7` |
| Secondary text | `#6e6e73` | `#98989d` |
| Background | `#ffffff` | `#000000` |
| Surface | `#f5f5f7` | `#1c1c1e` |

The accent is for actions, links, the second hand and the icon. Never brown, beige, purple or teal.

## Type
System sans only, nothing to download: San Francisco, then Lato, then Helvetica.

- **Titles** use SF Pro Display bold, tracked a little tight (-0.022em).
- **The big readouts** (clock, stopwatch, timers) are light (300), the way iOS Clock draws them.
- **Everything else** is SF Pro Text. Digits are proportional, except readouts that tick every second, which use tabular figures so they do not jump.

## Art
Halftone dot masks of clockwork (a face, gears, a globe, a bell, an hourglass, a stopwatch, a pendulum, the moon), drawn by `scripts/gen_art.py`, nothing borrowed. Tinted with the band art colour.

## Space and shape
- Space on the 8 point grid: 4, 8, 12, 16, 24, 32, 48. Side margin 20. Reading column 680.
- Radii: cards 28, grouped lists 20, controls fully round, icon 22 percent.
- Controls are 48 points tall capsules, one height in a row. Focus is a 4 point ring at 30 percent accent.
- Motion is 0.2 s ease and honours reduced motion.

`tokens.css` (also at the repo root) is the full set the landing and the app use.

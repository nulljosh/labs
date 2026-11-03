# Keyrate brand kit and design system

A typing test with one number. The mark is a keyboard, keys staggered like the real thing.

## The mark
One bold flat white glyph on an accent gradient tile. No text, no outline, no emblem.

- `../Keyrate.icon` is the source of truth (Icon Composer). Light and dark fills are set in it.
- `../icon.svg` is the flat copy for READMEs (shown at 80 px). `icon-1024.png` is the App Store icon, no alpha.
- `mark.svg` is the glyph alone in `currentColor` for your own background.
- Clear space equal to the width of the glyph's thickest stroke. Smallest size 16 px.

## Colour
| Role | Value |
|---|---|
| Accent | `#e69a00` |
| Gradient top | `#ffd23a` |
| Text | `#1f1b16` light, `#f3ede0` dark (shared warm ink) |
| Background | `#ffffff` light, `#1c1a17` dark |
| Surface (chips, selected mode) | `#f5f5f7` light, `#26231f` dark |
| Error | `#c0392b` light, `#d9503f` dark |

Light mode is white, not the shared cream: the words are the only thing on the page and white gives them the most contrast. Dark mode is the shared warm dark. Web (`app/index.html`), SwiftUI (`Palette` in `ContentView.swift`) and the splash all use these values.

The accent is for actions, links and the icon. Never brown, beige, purple or teal.

## Type
The system font: `-apple-system, BlinkMacSystemFont, "SF Pro Text", Lato, "Helvetica Neue", Helvetica, Arial, sans-serif`. Scale 34/41 bold, 22/28, 17/24, 15/20, 13/18.

## Space and shape
- Space on the 8 point grid: 4, 8, 12, 16, 24, 32, 48. Side margin 20. Reading column 680.
- Radii: cards 28, grouped lists 20, controls fully round, icon 22 percent.
- Buttons are 48 points tall capsules, one height in a row. The mode chips in the floating bar are the one exception: 32 points, so the bar stays one line on a phone in landscape and on every Mac and iPad. Focus is a 4 point ring at 30 percent accent.
- Motion is 0.2 s ease and honours reduced motion.

`tokens.css` holds the app's accent. Everything else comes from the shared token file.

## Layers
The mode bar is the only glass: it floats over the words (Liquid Glass on iOS and macOS 26, the regular material before, a solid fill under Reduce Transparency). Words, result and history stay flat on the background. The caret and the WPM curve use the accent; nothing else does.

## Motion
Launch splash: the mark draws in, fills with the accent, scales away, about 1.1 s, once per launch, a plain fade under Reduce Motion.

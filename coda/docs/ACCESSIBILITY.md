# Coda accessibility

Where Coda stands against WCAG 2.2 AA, for the outside audit (v98) to start from. Checked 2026-10-19 on the web game.

## What is tested on every release
- axe-core over every screen, light and dark (`scripts/axe-check.mjs`): 0 violations.
- Keyboard only: Tab reaches every control with a visible focus ring, Enter starts a round, keys 1 to 4 answer.
- Reflow at 320 CSS pixels: no sideways scrolling on the menu, a round, Settings, Offline packs and Suggest a line.
- Target size: every control is at least 24 by 24 pixels, or sits inside a larger label.

## How the game meets it
The question and the result are live regions, so a screen reader hears each new line and whether you were right. Right and wrong are said in words, not only shown in green and red. High contrast (Settings, or the system's Increase Contrast) switches to pure ink and white and drops the poster wall. Reduced motion stops every animation except the reveal's slow unblur, which is the game itself, and confetti is not drawn. Hints, the clock and typed answers are all optional; the speed round's clock can be avoided by playing Classic. Twenty languages, with right-to-left layout for Arabic and Hebrew. The apps support Dynamic Type up to the largest sizes and read the timer as one value.

## Known gaps for the auditor to look at
- The speed round is timed by design (2.2.1 allows it for real-time games); Classic is the untimed equivalent.
- Poster and album reveals are visual by nature; screen reader users can play every other way to guess.
- No one with a disability has tested it yet. That is what the outside audit is for.

## Fixed in the v98 pass
Settings overflowed by 39 pixels at 320 wide (a button now drops under its label), the settings button was 20 pixels tall (now 32) and checkboxes were 13 pixels (now 20).

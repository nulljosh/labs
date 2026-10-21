# Best Choice and Doorstock brand kit

One kit, two faces. Best Choice Garage Doors is the business, and the website wears its real look. Doorstock is the shop's stock app, and it keeps its own blue.

## Best Choice (the website)
It matches bcgaragedoors.ca. Never swap in the portfolio look.

| Role | Token | Value |
|---|---|---|
| Brand, buttons, links | `--bc-teal` | `#1B5959` |
| Headings, dark bands, footer | `--bc-deep` | `#134040` |
| Body text, top bar, call button | `--bc-charcoal` | `#3A3E40` |
| Nav bar, muted accents | `--bc-sage` | `#8DA6A6` |
| Cards and light bands | `--bc-surface` | `#F2F2F2` |
| Text on sage (nav, sage cards), 5.5:1 | `--bc-ink` | `#0E3030` |

Type: **Choice Display** for headings, in sentence case, 700 (600 for subheads). It is our own cut of Barlow Condensed: renamed, tracking opened 16/1000 em for big headlines, numbers proportional, Latin only, about 15 KB per weight, self-hosted from `src/web/fonts/`. Rebuild it with `python brand/fonts/make.py` (needs fonttools and brotli). Licence: SIL OFL 1.1, in `brand/fonts/OFL.txt`. Open Sans for everything else, from Google Fonts.

Parts:
- Top bar: charcoal, white round social icons, a call capsule and a book capsule.
- Nav: sage bar, uppercase Open Sans, the current page underlined in teal.
- Buttons: 50 px capsules with a phone glyph. Call is charcoal, Book is teal.
- Hero: dark wood photo, white heading, a slanted bottom edge.
- Cards: surface grey, a deep teal line along the bottom, a round teal icon.
- Copy: one headline and one short line per section. No prices, times or claims the business has not made.

Photos come from the business's own site. The logo is the charcoal oval in `src/web/img/bcgd-logo.png`.

## Doorstock (the apps)
- `../Doorstock.icon` is the source of truth (Icon Composer). `../icon.svg` is the flat copy for READMEs.
- Accent `#1b4fc4`, gradient top `#3a86ff`. System font. Text `#1d1d1f` light, `#f5f5f7` dark.
- 8 point grid, cards 28 radius, grouped lists 20, 48 point capsule controls.

## Files
`tokens.css` holds both sets. `src/web/index.html` copies the `--bc-*` block into its `:root`, and `node --test` fails if they drift.

# Plan

Joshua's ten-year education and career roadmap. One static page, live at
plan.heyitsmejosh.com, repo public since 2026-09-05. Created 2026-07-27 from a
one-off HTML file.

## Files
- `index.html` — the entire site. Inline `<style>`, one small inline script that
  builds the 120-month hero grid, inline SVG chart. Pulls
  `https://heyitsmejosh.com/tokens-lovefrom.css` for the house tokens.
- `icon.svg` — favicon and README icon (month grid, one blue square).
- `wrangler.toml` + `.assetsignore` — Cloudflare Worker static assets. Deploy with
  `npx wrangler deploy` (token in `~/.config/fish/secrets.fish`).
- `architecture.svg` — project map for the README.

## The decision this file encodes
**SFU Computing Science BSc** (Burnaby) → work → **engineering** (2033–36) with a
**Beedie Finance minor** along the way and an optional finance major or MSc Finance
in the late 30s. All inside Joshua's 30s. Superseded: Capilano paralegal (dropped
2026-07-06), UVic CS (not Lower Mainland), KPU MATQ for Pre-Calc (replaced by LECSS
Section 53, Sep 14 2026 – Jun 23 2027, registered). Don't reintroduce any as current.

## Design rules
- Tokens come from the portfolio's `tokens-lovefrom.css`: near-white ground, black
  ink, faint hairlines, small sans type, italic links with no underline. No yellow,
  no radius, no shadows.
- One accent, `--plan: #0074D9` (clrs.cc blue), used only for elapsed months, the
  counter, and the sweep.
- The token file does NOT define `--ease`; keep easing curves inline or animations
  silently die.
- Hero is full viewport, sections snap-scroll (`scroll-snap-type: y proximity`).

## Editing rules
- Numbers are cited — tuition, PWD rates, CSG-D/CSG-DSE caps, salary bands. Change a
  figure, update the matching Sources entry.
- The net-worth chart is hand-plotted SVG `points`; recompute from the formula in the
  HTML comment above the `<polyline>` (`y = 280 - (value/1100)*260`).
- Keep it one file. No framework, no bundler, no CSS extraction.

## Roadmap
See `roadmap.md`.

## Privacy note
The page shows transcript grades, disability funding detail, and income numbers.
Joshua chose to publish it anyway on 2026-09-05 ("it doesn't really matter").

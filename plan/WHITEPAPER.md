# Plan Technical Whitepaper

**v1.0** | August 2026

Plan is a single static page holding an education and career roadmap: SFU
Computing Science, finished with a Beedie finance credential, costed out and
projected. It is a document that happens to be a website.

## Why a Page and Not a Doc

The plan has numbers in it — tuition, disability funding, income while
studying, salary progression — and those numbers need a chart and a table, not
prose. It also needs to be linkable and re-readable from a phone, since a real
plan gets revisited, not read once and filed. A static page does both; a PDF
does neither well and a spreadsheet hides the reasoning behind each number,
which matters here as much as the numbers themselves.

## The Plan

| Stage | What |
|-------|------|
| Step 0 | **Pre-Calculus 12** via KPU MATQ upgrading — free, continuous intake. The only admission gap. |
| Degree | **SFU Computing Science BSc**, Burnaby. Calculus and physics in year 1 to keep engineering optional. |
| Finance | **Beedie Finance minor** — no extra years or tuition, declared end of year 2. |
| Optional | **MSc Finance** at Beedie, ~12–16 months post-BSc. Decided after 1–2 years working. |

Ruled out, with reasons recorded rather than left implicit: UVic (not Lower
Mainland), KPU (no real CS degree), BCIT (vocational — closes the engineering
door).

## Structure

- `index.html` — the entire plan: school choice, the Pre-Calc 12 gap, the
  finance track, costs, disability funding, income while studying, salary
  progression, and a net-worth projection chart.
- `roadmap.md` — open actions.

The projection chart is inline SVG with the series values written directly in
the markup. No chart library, no build step, no data file: with one chart that
changes a few times a year, a dependency would be more maintenance than the
markup it replaces, and the whole page is meant to still work untouched a
decade from now with no library to go stale.

## Privacy

Static, no backend, no analytics. The page contains personal financial
projections and is published deliberately, not incidentally, on the view that
the plan is worth more shared than hidden — nothing is collected from anyone
reading it.

## License

MIT 2026, Joshua Trommel

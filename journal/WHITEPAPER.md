# Journal Technical Whitepaper

**v2.4.0** | August 2026

My journal. A weekly changelog reads like a commit log and nobody wants to
read that back a year later, so this is a Jekyll blog with a few big entries
a year instead, shipped as prebuilt static files. The host never runs Ruby,
because a static file can't go down from a broken gem or a Ruby version
mismatch on the server, only from the edge itself being down. Live at
[journal.heyitsmejosh.com](https://journal.heyitsmejosh.com), with a companion
iOS app (Inkpress).

## Build and Deploy Path

The only publish path is `./scripts/deploy.sh`: it runs Jekyll locally, then
ships the resulting `_site` directory to the Cloudflare Pages project
`journal-heyitsmejosh`. The host never runs Ruby or Bundler, it only serves
the static output handed to it, which is the same reasoning as above pushed
into the deploy step. A plain `git push` does not deploy; the script is
required, so there is one path to production and no chance of a build that
silently diverges from what's live.

## Content Model

The remote is `inkpress.git`, shared with the iOS reader that publishes from
the same history.

Posts live in `_posts/` as `YYYY-MM-DD-slug.md`. The URL is derived from the
filename's slug portion, not the `title:` front matter, so a URL never
changes just because a title got reworded later; `2026-04-13-week.md` ships
at `/2026/04/13/week/` regardless of what the post's title says. Filename
date and front-matter `date:` must match. Cadence is one post per calendar
month (changed from weekly in 2026-07, weekly posts read as changelog spam
rather than something worth writing); if multiple posts land in the same
month they get merged into one and the extras deleted, because the point is
a few entries someone would actually read, not a complete record.

## Design

Shares the portfolio's design tokens (`heyitsmejosh.com/tokens.css`) for
color/spacing, keeping the blue `--accent` and text-hierarchy variables in
sync across sites so a visual change made once doesn't have to be
rediscovered here, but keeps body text in Geist rather than the portfolio's
monospace, because a monospace face is fine for a code-flavored portfolio
and tiring to read in long paragraphs.

## Companion App

| Platform | Framework | Notes |
|----------|-----------|-------|
| iOS |: | Inkpress, reads the same published content |

## Security / Privacy

Fully static output, no backend, no user accounts, no data collection.

## License

MIT 2026, Joshua Trommel

<img src="icon.svg" width="80">

# Journal

![version](https://img.shields.io/badge/version-v2.4.0-blue) ![license](https://img.shields.io/badge/license-MIT-green) [![GitHub](https://img.shields.io/badge/GitHub-nulljosh%2Fjournal-black?logo=github)](https://github.com/nulljosh/journal)

My journal. A Jekyll blog, a few big entries a year.
Live at [journal.heyitsmejosh.com](https://journal.heyitsmejosh.com).

Split out of `inkpress` on 2026-07-21. This is the blog only. The Inkpress iOS app,
a general RSS reader, lives at [github.com/nulljosh/inkpress](https://github.com/nulljosh/inkpress)
and can subscribe to this blog's `feed.xml` like any other feed. That is the whole
connection.

## Features
- `bundle exec jekyll serve` runs it at `http://localhost:4000/`.
- Posts live in `_posts/` as `YYYY-MM-DD-title.md`. Front matter template included. Write like a person.
- `./scripts/deploy.sh` is the only way to publish. It builds locally into `_site/` and deploys the prebuilt output. No GitHub Pages. No remote build. A plain `git push` deploys nothing.

## Run
```bash
bundle install
bundle exec jekyll serve
./scripts/deploy.sh
```

## Roadmap
- [ ] Add a drafts workflow that previews unpublished posts without shipping.
- [ ] Add automatic image optimization for post assets.

## Changelog
v2.4.0
- Split out of the `inkpress` repo into its own repo (2026-07-21), see Inkpress's own README for the RSS reader app side.

v2.3.0
- Journal now shares the portfolio's design tokens (`heyitsmejosh.com/tokens.css`); blue accent used for links, hover states, and theme toggle.

v2.2.0
- Switched to Vercel prebuilt deployment via `./scripts/deploy.sh`. No GitHub Actions, no gh-pages.
- Fixed light-mode `.dim` CSS in Apr 26, May 1, May 8 SVG headers (was `rgba(255,255,255,0.25)`, now `rgba(0,0,0,0.25)`).

v2.1.0
- Weekly SVG headers switched to monochrome palette with `prefers-color-scheme` theming to match the site CSS.
- Post URL note: slug derives from filename, not title. Name files `YYYY-MM-DD-slug.md` with the slug you want in the URL.

v2.0.0
- Documented local Jekyll serve workflow and localhost preview.
- Defined post naming, front matter, and writing guidance for entries.
- Added a ship script that validates posts, builds cleanly, previews today, and publishes to `main` and `gh-pages`.

## License
MIT 2026 Joshua Trommel

## Whitepaper

[Technical whitepaper](WHITEPAPER.md)

## Architecture

<img src="architecture.svg" width="600">

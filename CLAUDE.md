# Journal
v2.4.0

## Rules
- Project is a personal Jekyll blog. Split out of the `inkpress` repo 2026-07-21 — that repo now holds only the Inkpress iOS app (RSS reader). No shared code between the two; the only connection is that Inkpress can subscribe to this blog's `feed.xml` like any other feed.
- URL slug comes from the filename, not the `title:` front matter. Filename format: `YYYY-MM-DD-slug.md` — the slug portion is what appears in the URL (e.g., `2026-04-13-week.md` ships at `/2026/04/13/week/`).
- Journal shares the portfolio's design tokens (`heyitsmejosh.com/tokens.css`, linked in `_layouts/default.html` before `main.css`). The blue `--accent` is used for link/hover states. `--text-secondary`/`--text-tertiary`/`--subtle` map to the shared `--text2`/`--text3`/`--border2`. Body font stays Geist (not the portfolio's mono) for reading comfort. SVG headers live in `_includes/headers/` and are inlined into posts with `{% include headers/<name>.svg %}`, never `<img>`. Every shape uses `currentColor` and carries no `<style>` block, so the art inherits the page's colour and follows the theme toggle. Do not give an SVG colour its only definition inside a `prefers-color-scheme` block: an `<img>`-loaded SVG cannot see the page's `data-theme`, and an undefined colour computes to `none`, which is why the old headers rendered invisible.
- **Header SVGs are an information card summarizing the entry, never decorative icons.** This is the house style and it is not optional: an 800x500 rounded border frame, the one-word title at 42px weight 300, a lowercase subtitle line, a hairline rule, the repos touched, four or five short lines of what actually happened, a right-hand panel (200x280 at x=560) holding a label, one big number, and the in-flight or held-back items, then the date bottom left. See `_includes/headers/2026-07-03-week.svg` and `2026-08-17-fortified.svg` as the reference. Do not draw shields, locks, puzzle pieces, magnifying glasses or any other clipart, and do not fall back to a big title word on a 1200x200 banner: both are drift that happened before and got reverted 2026-08-18.
- Live site is `journal.heyitsmejosh.com`.
- Posts live in `_posts/`.
- `./scripts/deploy.sh` is the only publish path. It builds Jekyll locally and ships `_site` to the **Cloudflare Pages project `journal-heyitsmejosh`** (`wrangler pages deploy _site --project-name journal-heyitsmejosh --branch=main`). There is a second Pages project named plain `journal` with no custom domain — deploying to it reports success and changes nothing live; that bug kept the site on an Aug 6 build until 2026-08-11. No GitHub Pages flow, no remote build; a plain `git push` does not deploy. Verify by curling the live post URL, not by trusting wrangler's success line.
- One post per month by default (changed 2026-07-04 from weekly). **Size/staleness exception (2026-07-21):** if the current post exceeds ~20KB or today is more than ~10 days past its frontmatter `date:`, start a new post instead of appending further, even mid-month — split at a clean `##` day-heading boundary. (2026-07-03-june-july.md hit 157KB/18 days stale before this rule existed and had to be split retroactively.)
- Filename date and front matter date must match.
- Write in natural English, not tool-name spam.
- Post titles are ONE WORD. No commas, no ampersands, no "X and Y". Write a label, not a sentence.
- Posts cap at ~350 words (500 for `categories: journal monthly`). Two or three day sections of 2-4 sentences each, plus a short Apps line. Say what a change means, not what the code does: no function names, regexes, commit hashes, or build numbers.
- **`scripts/lint-posts.py` enforces all of the above and runs from `deploy.sh`, so a bloated post cannot publish.** Run it before committing. These rules were written here twice and ignored twice; the gate is why they hold now. `--selftest` checks the linter itself.
- No em dashes.
- No filler phrases.
- No emojis.
- Fix errors immediately when they appear; do not leave obvious breakages for a later prompt.
- Break substantial work into smaller verifiable steps and keep the user informed.
- Never rewrite git history unless the user explicitly asks for it.
- Read docs or current local config before changing setup; back up high-risk config or scripts before editing them.
- When you learn something durable about how the user works or what they want, write it down in `CLAUDE.md` immediately.

Post front matter template:
```markdown
---
layout: post
title: "Title"
date: 2026-03-11 12:00:00 -0800
categories: journal daily
---
```

## Run
```bash
cd ~/Documents/Code/journal
bundle install
bundle exec jekyll serve   # local preview
./scripts/deploy.sh        # build locally + ship _site to Cloudflare Pages
```

## /journal shortcut
Repo: `nulljosh/journal` on GitHub (split out of `nulljosh/inkpress` 2026-07-21, which now holds only the iOS RSS reader app).
`/journal` (skill at `~/.claude/skills/journal/SKILL.md`) creates or bumps the current entry, then builds and deploys:
```bash
/journal              # create/update the current entry (interactive)
/journal <date>       # create entry for specific date (YYYY-MM-DD)
/journal push         # ./scripts/deploy.sh (build + ship to Cloudflare Pages)
/journal open         # open current entry in browser
```

## Key Files
- `_posts/` - Published entries, one per date, with front matter.
- `scripts/deploy.sh` - Only publish path; builds Jekyll locally and deploys `_site` to Cloudflare Pages project `journal-heyitsmejosh`.
- `_config.yml` - Jekyll site configuration.
- `index.html` - Site entry point.

## Related
[[inkpress]] — the RSS reader iOS app this repo used to share a folder with. Can subscribe to journal.heyitsmejosh.com/feed.xml.

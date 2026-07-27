# Journal
v2.4.0

## Rules
- Project is a personal Jekyll blog. Split out of the `inkpress` repo 2026-07-21 — that repo now holds only the Inkpress iOS app (RSS reader). No shared code between the two; the only connection is that Inkpress can subscribe to this blog's `feed.xml` like any other feed.
- URL slug comes from the filename, not the `title:` front matter. Filename format: `YYYY-MM-DD-slug.md` — the slug portion is what appears in the URL (e.g., `2026-04-13-week.md` ships at `/2026/04/13/week/`).
- Journal shares the portfolio's design tokens (`heyitsmejosh.com/tokens.css`, linked in `_layouts/default.html` before `main.css`). The blue `--accent` is used for link/hover states. `--text-secondary`/`--text-tertiary`/`--subtle` map to the shared `--text2`/`--text3`/`--border2`. Body font stays Geist (not the portfolio's mono) for reading comfort. SVG headers should use `var(--text)`/`var(--border)` with `prefers-color-scheme` media queries so they follow the same palette.
- Live site is `journal.heyitsmejosh.com`.
- Posts live in `_posts/`.
- `./scripts/deploy.sh` is the only publish path. It builds Jekyll locally and ships `_site` to the Vercel `journal` project via the Build Output API (`vercel deploy --prebuilt`), so Vercel never runs Ruby/bundler. There is no GitHub Pages / gh-pages flow and no remote build; a plain `git push` does not deploy.
- One post per month by default (changed 2026-07-04 from weekly). **Size/staleness exception (2026-07-21):** if the current post exceeds ~20KB or today is more than ~10 days past its frontmatter `date:`, start a new post instead of appending further, even mid-month — split at a clean `##` day-heading boundary. (2026-07-03-june-july.md hit 157KB/18 days stale before this rule existed and had to be split retroactively.)
- Filename date and front matter date must match.
- Write in natural English, not tool-name spam.
- Post titles are ONE WORD. No commas, no ampersands, no "X and Y". Write a label, not a sentence.
- Posts cap at ~350 words. Two or three day sections of 2-4 sentences each, plus a short Apps line. Say what a change means, not what the code does — no function names, regexes, commit hashes, or build numbers.
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
./scripts/deploy.sh        # build locally + ship prebuilt static to Vercel
```

## /journal shortcut
Repo: `nulljosh/journal` on GitHub (split out of `nulljosh/inkpress` 2026-07-21, which now holds only the iOS RSS reader app).
`/journal` (skill at `~/.claude/skills/journal/SKILL.md`) creates or bumps the current entry, then builds and deploys:
```bash
/journal              # create/update the current entry (interactive)
/journal <date>       # create entry for specific date (YYYY-MM-DD)
/journal push         # ./scripts/deploy.sh (build + ship to Vercel)
/journal open         # open current entry in browser
```

## Key Files
- `_posts/` - Published entries, one per date, with front matter.
- `scripts/deploy.sh` - Only publish path; builds Jekyll locally and deploys `_site` to Vercel with `--prebuilt`.
- `_config.yml` - Jekyll site configuration.
- `index.html` - Site entry point.

## Related
[[inkpress]] — the RSS reader iOS app this repo used to share a folder with. Can subscribe to journal.heyitsmejosh.com/feed.xml.

# Journal
v2.4.0

Personal Jekyll blog at `journal.jaybulb.com`, repo `nulljosh/journal`. Split out of `inkpress` 2026-07-21; Inkpress (iOS RSS reader) can subscribe to `feed.xml`, nothing else is shared.

## Posts
- Live in `_posts/` as `YYYY-MM-DD-slug.md`. The URL comes from the filename slug, not `title:`. Filename date and front matter date must match.
- One post per few months (weekly, then monthly, before 2026-08-24). Append to the current quarter's post; start a new one only when the period ends. If entries pile up, merge them down.
- Title is ONE WORD, a label, not a sentence.
- Cap: ~350 words, 500 for `journal monthly`, 1200 for `journal quarterly`. Quarterly is flowing prose, no function names, regexes, hashes or build numbers. Say what a change means, not what the code does.
- Plain natural English. No em dashes, emojis, filler, or AI voice ("delve", "leverage", "seamlessly", "it's not just X, it's Y").
- `scripts/lint-posts.py` enforces all of this and runs from `deploy.sh`. `--selftest` checks the linter.

```markdown
---
layout: post
title: "Title"
date: 2026-03-11 12:00:00 -0800
categories: journal quarterly
---
```

## Header SVGs
Inlined with `{% include headers/<name>.svg %}`, never `<img>`. Every shape is `currentColor`, no `<style>` block, so it follows the theme toggle (an `<img>` SVG can't see `data-theme`, which made old headers invisible).

House style, not optional: an information card summarizing the entry. 800x500 rounded frame, one-word title at 42px weight 300, lowercase subtitle, hairline rule, repos touched, four or five short lines of what happened, a right panel (200x280 at x=560) with a label, one big number and the in-flight items, date bottom left. References: `_includes/headers/2026-07-03-week.svg`, `2026-08-17-fortified.svg`. No clipart, no big word on a 1200x200 banner (reverted 2026-08-18).

## Graphs
`scripts/graphs.py` writes `{% include graphs/<post>.svg %}` (placed after the header) from git history across `~/Documents/Code`, plus `graphs/year.svg`, `graphs/streak.html` and `assets/og/<post>.png` (needs rsvg-convert). It runs from `deploy.sh`. Never hand-edit a graph; rerun the script.

## Style
Shares the portfolio's tokens (`jaybulb.com/tokens.css`, linked before `main.css`); blue `--accent` for links. Body font is Geist, not mono.

## Publish
```bash
bundle exec jekyll serve   # local preview
./scripts/deploy.sh        # lint, graphs, build, ship _site
```
`deploy.sh` is the only publish path: it ships to Cloudflare Pages project **`journal-heyitsmejosh`**. A second project named plain `journal` has no domain; deploying there reports success and changes nothing (kept the site stale until 2026-08-11). A `git push` deploys nothing. Verify by curling the live post URL.

`/journal` (skill `~/.claude/skills/journal/SKILL.md`) creates or bumps the entry, then deploys. `/journal push` deploys, `/journal open` opens it.

## Native
`kmp/` is the Android + desktop reader (Compose Multiplatform). It parses `feed.xml` and is a list and a reader, nothing more. Needs JDK 17: `JAVA_HOME=/opt/homebrew/opt/openjdk@17 ./gradlew :shared:jvmTest :composeApp:desktopJar`.

## Working rules
- Fix breakages when they appear. Small verifiable steps.
- Never rewrite git history unless asked.
- Back up high-risk config before editing.
- Write durable user preferences into this file immediately.

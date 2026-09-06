#!/usr/bin/env bash
# Publish the journal to Cloudflare Pages.
# Jekyll builds locally, then we ship _site via wrangler pages deploy.
set -euo pipefail
cd "$(dirname "$0")/.."

# Gate: post rules are checked mechanically, not just written in CLAUDE.md.
python3 scripts/graphs.py
python3 scripts/lint-posts.py

bundle exec jekyll build

# journal.heyitsmejosh.com is attached to the `journal-heyitsmejosh` project, NOT
# `journal` -- deploying to `journal` succeeds and changes nothing live.
npx wrangler pages deploy _site --project-name journal-heyitsmejosh --branch=main

./scripts/sync-portfolio.sh

#!/usr/bin/env bash
# Publish the journal to Cloudflare Pages.
# Jekyll builds locally, then we ship _site via wrangler pages deploy.
set -euo pipefail
cd "$(dirname "$0")/.."

bundle exec jekyll build

npx wrangler pages deploy _site --project-name journal

./scripts/sync-portfolio.sh

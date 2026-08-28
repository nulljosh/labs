#!/bin/bash
# ponytail: one-way copy of each repo's README.md into the Obsidian wiki as
# pages/<repo>-readme.md. Run manually after doc updates — no cron per house rule.
set -euo pipefail

CODE_DIR="$HOME/Documents/Code"
WIKI_PAGES="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Code/wiki/pages"

for repo in "$CODE_DIR"/*/; do
  name=$(basename "$repo")
  readme="$repo/README.md"
  [ -f "$readme" ] || continue
  {
    echo "---"
    echo "type: source"
    echo "tags: [readme, $name]"
    echo "updated: $(date +%Y-%m-%d)"
    echo "---"
    echo
    echo "> Synced from \`$name/README.md\`. Do not edit here — edit the repo README and re-run sync."
    echo
    cat "$readme"
  } > "$WIKI_PAGES/${name}-readme.md"
done

echo "Synced README.md → wiki/pages for repos that have one."

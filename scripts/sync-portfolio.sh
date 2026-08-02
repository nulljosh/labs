#!/usr/bin/env bash
# Regenerate the portfolio's "Writing" list from the 4 latest journal posts.
# ponytail: sed between HTML markers instead of a templating system, only 4 items.
set -euo pipefail
cd "$(dirname "$0")/.."

PORTFOLIO=../nulljosh.github.io/index.html
[ -f "$PORTFOLIO" ] || { echo "portfolio repo not found at $PORTFOLIO" >&2; exit 1; }

items=""
count=0
for f in $(ls -1 _posts/*.md | sort -r); do
  [ "$count" -ge 4 ] && break
  date=$(basename "$f" | cut -c1-10)
  slug=$(basename "$f" .md | cut -c12-)
  title=$(grep -m1 '^title:' "$f" | sed -E 's/^title: *"?([^"]*)"?$/\1/')
  year=${date:0:4}
  month=${date:5:2}
  day=${date:8:2}
  monthname=$(date -j -f "%Y-%m-%d" "$date" "+%b %d" 2>/dev/null || echo "$date")
  span=""
  [ "$count" -eq 0 ] && span="<span class=\"year\">$year</span>"
  items="${items}    <li><a href=\"https://journal.heyitsmejosh.com/${year}/${month}/${day}/${slug}/\">${span}<span class=\"name\">${title}</span><time class=\"meta\" datetime=\"${date}\">${monthname}</time></a></li>
"
  count=$((count + 1))
done

items_file=$(mktemp)
printf "%s" "$items" > "$items_file"
awk -v items_file="$items_file" '
  /<!-- journal-sync:start -->/ { print; while ((getline line < items_file) > 0) print line; skip=1; next }
  /<!-- journal-sync:end -->/ { skip=0 }
  !skip
' "$PORTFOLIO" > "$PORTFOLIO.tmp" && mv "$PORTFOLIO.tmp" "$PORTFOLIO"
rm -f "$items_file"

echo "synced $count posts into $PORTFOLIO"

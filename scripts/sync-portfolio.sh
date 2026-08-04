#!/usr/bin/env bash
# Regenerate the portfolio's "Writing" list from every journal post, then ship it.
# Fills two surfaces from one source (_posts): the website and the iOS app.
# The portfolio is a separate repo: writing the file is not publishing it, so this
# commits and pushes too. Without that the two sites silently drift apart.
# ponytail: sed between markers instead of a templating system.
set -euo pipefail
cd "$(dirname "$0")/.."

REPO=../nulljosh.github.io
PORTFOLIO=$REPO/index.html
IOSAPP=$REPO/ios/Sources/PortfolioApp.swift
[ -f "$PORTFOLIO" ] || { echo "portfolio repo not found at $PORTFOLIO" >&2; exit 1; }

html=""
swift=""
count=0
lastyear=""
for f in $(ls -1 _posts/*.md | sort -r); do
  date=$(basename "$f" | cut -c1-10)
  slug=$(basename "$f" .md | cut -c12-)
  title=$(grep -m1 '^title:' "$f" | sed -E 's/^title: *"?([^"]*)"?$/\1/')
  year=${date:0:4}
  month=${date:5:2}
  day=${date:8:2}
  monthname=$(date -j -f "%Y-%m-%d" "$date" "+%b %d" 2>/dev/null || echo "$date")
  url="https://journal.heyitsmejosh.com/${year}/${month}/${day}/${slug}/"
  # Label the first post of each year, not just the first post overall, so a list
  # spanning years does not sit under one wrong heading.
  span=""
  ylabel=""
  [ "$year" != "$lastyear" ] && { span="<span class=\"year\">$year</span>"; ylabel="$year"; }
  lastyear="$year"
  html="${html}    <li><a href=\"${url}\">${span}<span class=\"name\">${title}</span><time class=\"meta\" datetime=\"${date}\">${monthname}</time></a></li>
"
  swift="${swift}    Item(year: \"${ylabel}\", name: \"${title}\", meta: \"${monthname}\", url: \"${url}\"),
"
  count=$((count + 1))
done

# Splice a generated block between two marker lines, leaving the markers in place.
splice() {
  local file=$1 start=$2 end=$3 body=$4
  local tmp; tmp=$(mktemp)
  printf "%s" "$body" > "$tmp"
  awk -v body="$tmp" -v s="$start" -v e="$end" '
    index($0, s) { print; while ((getline line < body) > 0) print line; skip=1; next }
    index($0, e) { skip=0 }
    !skip
  ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  rm -f "$tmp"
}

splice "$PORTFOLIO" "<!-- journal-sync:start -->" "<!-- journal-sync:end -->" "$html"
[ -f "$IOSAPP" ] && splice "$IOSAPP" "// journal-sync:start" "// journal-sync:end" "$swift"

echo "synced $count posts into the portfolio site and iOS app"

# Publish it. Pushing to main is what deploys the portfolio.
changed=$(git -C "$REPO" status --porcelain index.html ios/Sources/PortfolioApp.swift)
if [ -n "$changed" ]; then
  git -C "$REPO" add index.html ios/Sources/PortfolioApp.swift
  git -C "$REPO" commit -q -m "Sync latest journal posts"
  git -C "$REPO" push -q origin main
  echo "pushed portfolio"
else
  echo "portfolio already up to date"
fi

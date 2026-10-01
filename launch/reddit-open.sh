#!/bin/sh
# usage: launch/reddit-open.sh <subreddit>   e.g. osdev
# Opens the submit page in your default browser (already logged in), puts the TITLE in the
# URL, and copies the BODY to the clipboard. You paste the body and press Post. Read the
# sub's rules first. One self-promo post a day across the whole account.
d=$(cd "$(dirname "$0")" && pwd); f="$d/reddit/$1.txt"
[ -f "$f" ] || { echo "no draft for $1"; ls "$d/reddit"; exit 1; }
title=$(sed -n '1p' "$f"); body=$(sed '1,/^---$/d' "$f")
printf '%s' "$body" | pbcopy
enc=$(python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$title")
open "https://www.reddit.com/r/$1/submit/?type=TEXT&title=$enc"
echo "Body copied. Paste it, check the flair and rules, press Post."

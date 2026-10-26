#!/bin/bash
# Mac App Store shots: one Horula window on screen, five captures, then it quits. Ask Joshua before running.
# Usage: scripts/mac-tour.sh <path to Horula.app> <out dir>
BIN="$1/Contents/MacOS/Horula"; OUT="$2"; mkdir -p "$OUT"
trap 'pkill -f "^$BIN" 2>/dev/null' EXIT
( sleep 60; pkill -f "^$BIN" ) & GUARD=$!
"$BIN" -demo -tour 2>/dev/null | while read -r tag name wid; do
  [ "$tag" = SHOT ] || continue
  screencapture -o -x -l"$wid" "$OUT/$name.png" && echo "got $name"
done
kill $GUARD 2>/dev/null

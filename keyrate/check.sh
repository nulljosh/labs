#!/bin/sh
# One check before any push: node + vectors, gradle, xcodebuild, README refs.
set -e
cd "$(dirname "$0")"
echo "== node"; node --test
echo "== gradle"; if java -version >/dev/null 2>&1; then (cd kmp && ./gradlew --console=plain -q :shared:allTests); else echo "SKIPPED: no Java"; fi
echo "== xcodebuild"; if command -v xcodegen >/dev/null && command -v xcodebuild >/dev/null; then (cd apple && xcodegen generate -q && xcodebuild test -quiet -scheme Keyrate -destination 'platform=macOS' >/dev/null); else echo "SKIPPED: no xcodegen/xcodebuild"; fi
echo "== README refs"
for f in $(grep -oE '\]\(([A-Za-z0-9_./-]+)\)' README.md | sed 's/](//;s/)//' | grep -v '^http'); do
  [ -e "$f" ] || { echo "README points at missing $f"; exit 1; }
done
echo "all green"

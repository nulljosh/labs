#!/bin/sh
# ponytail: the site is the repo root, but the repo also holds ios/, macos/, metadata/ and
# screenshots/. Copy the web subset into dist/ so a Pages deploy ships the site and nothing
# else. functions/ stays at the root — wrangler picks it up from there, not from dist/.
set -e
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist
cp auth.js spark.js daily.js hints.js match.js difficulty.js challenge.js cup.js badges.js stats.js misquotes.js improv.js phrases-data.js phrases.js world-data.json world.js family.js modes.js season.js sharecard.js duel-client.js spectate.js reveal.js story.js speak.js voice.js art.js cup-ui.js clubs.js badges-ui.js stats-ui.js season-ui.js champions.js practice.js suggest.js watchlist.js passplay.js packs.js library.js index.html play.html privacy.html buzz.html buzz.js party.html classroom.js party.js stream.html stream.js style.css devices.css game.js settings.js i18n.js webmcp.js sw.js \
   manifest.webmanifest quotes.json vibe.json icon.svg icon-192.png icon-512.png \
   icon-512-maskable.png architecture.svg favicon.svg favicon-32.png apple-touch-icon.png dist/
cp -R locales fonts dist/
mkdir -p dist/brand && cp brand/index.html brand/tokens.css brand/mark.svg brand/icon-1024.png brand/quip-*.svg dist/brand/
mkdir -p dist/screenshots
cp -R screenshots/web dist/screenshots/
echo "built dist/"

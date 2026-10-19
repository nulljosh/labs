#!/bin/sh
# ponytail: the site is the repo root, but the repo also holds ios/, macos/, metadata/ and
# screenshots/. Copy the web subset into dist/ so a Pages deploy ships the site and nothing
# else. functions/ stays at the root — wrangler picks it up from there, not from dist/.
set -e
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist
cp auth.js spark.js daily.js hints.js match.js difficulty.js challenge.js badges.js stats.js misquotes.js improv.js phrases-data.js phrases.js world-data.json world.js family.js modes.js season.js sharecard.js taste.js duel-client.js spectate.js reveal.js story.js speak.js voice.js art.js archive.js badges-ui.js dress.js stats-ui.js quip-live.js event.js season-ui.js yearly.js practice.js suggest.js watchlist.js passplay.js packs.js library.js recent.js recent.json seasons.js shelves.js submit.js moderation.js offline.js index.html play.html privacy.html buzz.html buzz.js party.html classroom.js party.js style.css features.css devices.css game.js settings.js sound.js transfer.js profiles.js i18n.js webmcp.js sw.js \
   manifest.webmanifest quotes.json quotes-more.json vibe.json icon.svg icon-192.png icon-512.png \
   icon-512-maskable.png architecture.svg favicon.svg favicon-32.png apple-touch-icon.png dist/
cp -R locales fonts dist/
# The shared jaybulb tokens, refreshed each build when online; the committed copy is the fallback (v91).
curl -fsS --max-time 10 https://jaybulb.com/tokens.css -o brand/jaybulb-tokens.css.new && mv brand/jaybulb-tokens.css.new brand/jaybulb-tokens.css || rm -f brand/jaybulb-tokens.css.new
mkdir -p dist/brand && cp brand/index.html brand/tokens.css brand/jaybulb-tokens.css brand/mark.svg brand/icon-1024.png brand/quip-*.svg dist/brand/ && cp -R brand/outfits brand/press dist/brand/
mkdir -p dist/screenshots
cp -R screenshots/web dist/screenshots/
node -e "const fs=require('fs');for(const f of ['dist/quotes.json','dist/quotes-more.json'])fs.writeFileSync(f,JSON.stringify(JSON.parse(fs.readFileSync(f))))"   # v91: the banks ship minified
node scripts/build-roadmap.mjs dist/roadmap.html   # v99 public roadmap
node scripts/build-data.mjs dist/data   # v80 open data, rebuilt from quotes.json every build
# v93 security headers for every static page (Functions such as /embed and /c set their own).
cat > dist/_headers <<'HEADERS'
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), geolocation=(), payment=(), microphone=(self)
  Content-Security-Policy: script-src 'self' 'unsafe-inline' https://accounts.google.com https://appleid.cdn-apple.com https://static.cloudflareinsights.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self'
/data/*
  Access-Control-Allow-Origin: *
HEADERS
echo "built dist/"

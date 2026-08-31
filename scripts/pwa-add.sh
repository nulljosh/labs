#!/usr/bin/env bash
# Make a static/SPA web app installable on Windows, Linux, Android and ChromeOS.
# ponytail: a PWA is the whole cross-platform story for anything web-based --
# no Electron, no Tauri, no KMP port. Native targets stay native (see nimble).
#
#   pwa-add.sh --dir web --name Nimble --desc "..." [--scope /app/] [--theme '#ffca30'] [--icon icon.svg]
#
# Idempotent: re-running refreshes the manifest/sw and leaves the HTML tags alone.
set -euo pipefail

DIR=""; NAME=""; DESC=""; SCOPE=""; THEME=""; ICON=""; BG=""; ENTRY=""
while [ $# -gt 0 ]; do
  case "$1" in
    --dir) DIR="$2"; shift 2;;
    --name) NAME="$2"; shift 2;;
    --desc) DESC="$2"; shift 2;;
    --scope) SCOPE="$2"; shift 2;;
    --theme) THEME="$2"; shift 2;;
    --bg) BG="$2"; shift 2;;
    --icon) ICON="$2"; shift 2;;
    --entry) ENTRY="$2"; shift 2;;  # app HTML that lives outside --dir (Vite)
    *) echo "unknown arg: $1" >&2; exit 2;;
  esac
done
[ -n "$DIR" ] && [ -n "$NAME" ] || { echo "--dir and --name are required" >&2; exit 2; }
[ -d "$DIR" ] || { echo "no such dir: $DIR" >&2; exit 2; }

SCOPE="${SCOPE:-/}"
SLUG=$(echo "$NAME" | tr '[:upper:] ' '[:lower:]-')

# Theme colour: reuse whatever the page already declares before inventing one.
if [ -z "$THEME" ]; then
  THEME=$(grep -ho 'name="theme-color"[^>]*content="[^"]*"' "$DIR"/*.html 2>/dev/null \
          | head -1 | sed 's/.*content="\([^"]*\)".*/\1/') || true
fi
THEME="${THEME:-#111111}"
BG="${BG:-$THEME}"

# --- icons -------------------------------------------------------------------
# Chrome needs a >=192px raster for install; Android needs a maskable one with
# safe-zone padding or the icon gets cropped into a circle.
if [ -z "$ICON" ]; then
  for c in "$DIR/icon.svg" "$(dirname "$DIR")/icon.svg" "$DIR/../icon.svg"; do
    [ -f "$c" ] && { ICON="$c"; break; }
  done
fi
if [ -n "$ICON" ] && [ -f "$ICON" ] && command -v rsvg-convert >/dev/null; then
  case "$ICON" in
    *.svg)
      rsvg-convert -w 192 -h 192 "$ICON" -o "$DIR/icon-192.png"
      rsvg-convert -w 512 -h 512 "$ICON" -o "$DIR/icon-512.png"
      # maskable: 80% art centred in the 512 canvas, per the Android safe zone
      rsvg-convert -w 410 -h 410 "$ICON" -o "$DIR/.icon-inner.png"
      magick "$DIR/.icon-inner.png" -background "$BG" -gravity center -extent 512x512 \
             "$DIR/icon-512-maskable.png"
      rm -f "$DIR/.icon-inner.png";;
    *.png)
      magick "$ICON" -resize 192x192 "$DIR/icon-192.png"
      magick "$ICON" -resize 512x512 "$DIR/icon-512.png"
      magick "$ICON" -resize 410x410 -background "$BG" -gravity center -extent 512x512 \
             "$DIR/icon-512-maskable.png";;
  esac
fi

ICONS_JSON=""
if [ -f "$DIR/icon-192.png" ]; then
  ICONS_JSON=$(cat <<EOF
    { "src": "${SCOPE}icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "${SCOPE}icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "${SCOPE}icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
EOF
)
else
  ICONS_JSON="    { \"src\": \"${SCOPE}icon.svg\", \"sizes\": \"any\", \"type\": \"image/svg+xml\" }"
fi

cat > "$DIR/manifest.webmanifest" <<EOF
{
  "name": "$NAME",
  "short_name": "$NAME",
  "description": "$DESC",
  "start_url": "$SCOPE",
  "scope": "$SCOPE",
  "display": "standalone",
  "background_color": "$BG",
  "theme_color": "$THEME",
  "icons": [
$ICONS_JSON
  ]
}
EOF

# --- service worker ----------------------------------------------------------
FILES=$(cd "$DIR" && ls *.html 2>/dev/null | sed "s|^|\"${SCOPE}|;s|$|\",|" | tr -d '\n') || true
cat > "$DIR/sw.js" <<EOF
// ponytail: cache-first over a fixed file list. Bump CACHE to ship an update.
const CACHE = "$SLUG-v1";
const FILES = ["$SCOPE", $FILES "${SCOPE}manifest.webmanifest"];

self.addEventListener("install", e => {
  // A single missing file fails the whole addAll, so tolerate misses.
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  // Same-origin GETs only; APIs are cross-origin and stay network-only.
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit ||
      fetch(e.request).then(res => {
        // Fill the cache as the app loads, so the hashed bundles the shell needs
        // are there the next time the network is not.
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() =>
        e.request.mode === "navigate" ? caches.match(FILES[0]) : Promise.reject()
      )
    )
  );
});
EOF

# --- wire it into every page -------------------------------------------------
for f in "$DIR"/*.html ${ENTRY:+"$ENTRY"}; do
  [ -f "$f" ] || continue
  grep -q 'rel="manifest"' "$f" && continue
  TAGS="  <link rel=\"manifest\" href=\"${SCOPE}manifest.webmanifest\">"
  grep -q 'name="theme-color"' "$f" || TAGS="$TAGS\n  <meta name=\"theme-color\" content=\"$THEME\">"
  grep -q 'apple-touch-icon' "$f" || { [ -f "$DIR/icon-192.png" ] && TAGS="$TAGS\n  <link rel=\"apple-touch-icon\" href=\"${SCOPE}icon-192.png\">"; }
  TAGS="$TAGS\n  <meta name=\"apple-mobile-web-app-capable\" content=\"yes\">"
  perl -0pi -e "s|</head>|$(printf "%b" "$TAGS")\n</head>|" "$f"
  perl -0pi -e "s|</body>|  <script>if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('${SCOPE}sw.js'));</script>\n</body>|" "$f"
done

echo "pwa: $NAME -> $DIR (scope $SCOPE, theme $THEME)"

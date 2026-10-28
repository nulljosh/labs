#!/bin/sh
# App Store product page header (the animated hero) for any app: 3840x1646, 30 fps, 30 s, no audio.
# Talli's recipe (talli/launch/make_banner.sh) with the app's own brand: brand/mark.svg engraved in scanlines
# on the --accent band, drifting left one full row per loop so the end meets the start.
# Run from ~/Documents/Code:  sh scripts/store-header.sh <app>  ->  _attic/store-headers/<app>/<app>-header.mp4 (gitignored)
set -e
APP=${1:?usage: store-header.sh <app>}
[ -f "$APP/brand/mark.svg" ] && [ -f "$APP/brand/tokens.css" ] || { echo "$APP: needs brand/mark.svg and brand/tokens.css" >&2; exit 1; }
W=3840 H=1646 CELL=1280 G=820 PITCH=14 LINE=6 SECS=30 CELLS=6
NAME=${NAME:-$APP-header} OUT=${OUT:-_attic/store-headers/$APP} TMP=$(mktemp -d)
mkdir -p $OUT

# The band is the app's accent; the ink is its light accent pushed most of the way to white.
tok() { sed -n "s/.*--$1: *\(#[0-9a-fA-F]\{6\}\).*/\1/p" $APP/brand/tokens.css | head -1; }
BAND=$(tok accent) LIGHT=$(tok accent-light)
[ -n "$BAND" ] || BAND=$(tok bulb)  # icelus: --accent is var(--bulb)
[ -n "$BAND" ] || { echo "$APP: no --accent in tokens.css" >&2; exit 1; }
INK=$(magick xc:"${LIGHT:-$BAND}" -fill white -colorize 55% -format '#%[hex:u.p{0,0}]' info:)

# One row of the mark, twice over, so a pan of one row loops.
sed 's/currentColor/#fff/g' $APP/brand/mark.svg > $TMP/mark.svg
rsvg-convert -w $G -h $G $TMP/mark.svg | magick - -background none -gravity center -extent ${CELL}x${H} $TMP/cell.png
magick $(for i in $(seq $CELLS); do echo $TMP/cell.png; done) +append $TMP/row.png
magick $TMP/row.png $TMP/row.png +append -alpha extract $TMP/mask.png
SW=$((CELL * CELLS * 2))

# Rules: thick inside the marks, faint across the whole band.
magick -size 1x$PITCH xc:none -fill "$INK" -draw "rectangle 0,0 0,$((LINE - 1))" -write mpr:t +delete \
  -size ${SW}x$H tile:mpr:t $TMP/thick.png
magick -size 1x$PITCH xc:none -fill "$INK" -draw "rectangle 0,0 0,1" -write mpr:f +delete \
  -size ${SW}x$H tile:mpr:f -channel A -evaluate multiply 0.22 +channel $TMP/faint.png
magick $TMP/thick.png \( $TMP/mask.png -alpha copy \) -compose DstIn -composite $TMP/glyphs.png
magick -size ${SW}x$H xc:"$BAND" $TMP/faint.png -composite $TMP/glyphs.png -composite $TMP/strip.png

ffmpeg -y -loglevel error -loop 1 -framerate 30 -i $TMP/strip.png -t $SECS \
  -vf "crop=$W:$H:'mod(t*$((CELL * CELLS))/$SECS,$((CELL * CELLS)))':0,noise=alls=10:allf=t,format=yuv420p" \
  -c:v libx264 -preset medium -crf 22 -maxrate 25M -bufsize 50M -profile:v high -movflags +faststart -an $OUT/$NAME.mp4
ffmpeg -y -loglevel error -ss 5 -i $OUT/$NAME.mp4 -frames:v 1 -vf scale=1280:-1 $OUT/$NAME-frame.jpg
rm -rf $TMP
echo "$OUT/$NAME.mp4"

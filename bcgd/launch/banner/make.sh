#!/bin/zsh
# Renders the Doorstock banner: tall App Store preview (886x1920) and wide banner (1920x1080), MP4 + GIF.
# Run from launch/banner. Needs Xcode (swiftc) and ffmpeg.
set -e
cd "${0:A:h}"
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
TMP=${TMPDIR:-/tmp}/doorstock-banner; mkdir -p $TMP out
[[ -x $TMP/render && $TMP/render -nt render.swift ]] || swiftc -O render.swift -o $TMP/render
for size in 886x1920 1920x1080; do
  w=${size%x*}; h=${size#*x}; rm -rf $TMP/$size
  $TMP/render $w $h 30 $TMP/$size
  # App previews want H.264, 30 fps, and a stereo audio track, so a silent one is added.
  ffmpeg -loglevel error -y -framerate 30 -i $TMP/$size/%05d.png -f lavfi -i anullsrc=r=44100:cl=stereo -shortest \
    -c:v libx264 -pix_fmt yuv420p -profile:v high -crf 18 -c:a aac -b:a 128k -movflags +faststart out/doorstock-$size.mp4
done
# A looping GIF of the wide one, for the landing page and README.
ffmpeg -loglevel error -y -i out/doorstock-1920x1080.mp4 -vf "fps=15,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=sierra2_4a" -loop 0 out/doorstock-banner.gif
ls -la out

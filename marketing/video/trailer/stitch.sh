#!/bin/bash
# stitch.sh: title card + 4 shots + end card -> trailer.mp4 (1080x1920, blurred fill behind each shot)
set -e; cd "$(dirname "$0")"
f="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:3[bg];[0:v]scale=1080:1920:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,fps=30,format=yuv420p,setsar=1"
ffmpeg -v error -y -loop 1 -t 2 -i card-title.png -vf "fps=30,format=yuv420p,setsar=1" -an p0.mp4
i=1; for s in s2-garage s3-truck s4-hinges s5-hero; do ffmpeg -v error -y -i $s.mp4 -t 3 -filter_complex "[0:v]split[a][b];[a]${f/\[0:v\]/[b]}" -an p$i.mp4; i=$((i+1)); done
ffmpeg -v error -y -loop 1 -t 3 -i card-end.png -vf "fps=30,format=yuv420p,setsar=1" -an p5.mp4
printf "file 'p%s.mp4'\n" 0 1 2 3 4 5 > list.txt
ffmpeg -v error -y -f concat -safe 0 -i list.txt -c:v libx264 -crf 20 -pix_fmt yuv420p trailer.mp4 && rm -f p?.mp4 list.txt && echo "trailer.mp4 $(ffprobe -v error -show_entries format=duration -of csv=p=0 trailer.mp4)s"

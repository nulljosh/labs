# Brian video (6 seconds)

One talking clip from his real portrait. Veo 3.1 makes the voice and the lip sync from the prompt, so there is no separate audio step. It is a synthetic voice, not Brian's. Show it to Dad as a sample and get his OK before it runs anywhere public.

Start frame: `brian-start.jpg` (9:16, cropped from his site portrait).

Cost on 2026-10-11: Veo 3.1 Lite 4s with audio is 6 credits, Veo 3.1 high 6s is 24, ultra 6s is 54. The free plan has no commercial use. Fine for a demo, not for ads.

Run from this folder, after topping up credits:

```
higgsfield generate create veo3_1 --start-image brian-start.jpg --aspect_ratio 9:16 --duration 6 --quality high --wait \
  --prompt 'Close-up of a friendly garage door technician, steady handheld, soft daylight. He looks into the camera, smiles, and says warmly: "Hi, I am Brian from Best Choice Garage Doors." Natural lip sync, subtle head movement, no other text, no music.'
```

Then watch it with sound. If the lips or face drift, change one thing in the prompt and run again. One clip at a time.

## Free version (works, 35 seconds)
Stock ElevenLabs voice (Chris, not a clone) says the line, then LatentSync lips it onto the portrait on Hugging Face's free GPUs. Nothing heavy runs on the Mac.

```
cd local   # holds portrait.png (1024 square of brian-start.jpg) and line.wav
bash ~/.claude/skills/character-creator/scripts/lipsync.sh . line.wav   # writes talk.mp4
```

First result: `local/talk.mp4`, 512x512, 1.9 seconds, mouth matches the words. The source frame has him squinting one eye, and that carries through. Try a frame with both eyes open next. Limits: square and small, very little head movement, 2 second line.

## Higgsfield Lite result (2026-10-11)
`brian-veo-lite.mp4`: Veo 3.1 Lite, 720x1280, 4s with audio, from `brian-start.jpg`. Cost 6 credits (2.5 left). Far better than the free clip: real gestures and an expressive face. The voice is Veo's, not Brian's, and the squint from the photo still shows. Next: the 24-credit Veo 3.1 high version, or Katana (`katana.md`).

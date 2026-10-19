# "Attack of the Garage Door" trailer (15 seconds, 9:16)

A fake movie trailer starring the wrapped truck and Brian. Every shot starts from a real photo, so the truck, the wrap and Brian are really his. Brian approves it before it goes anywhere.

| # | Time | Shot | Start frame | Text on screen |
|---|---|---|---|---|
| 1 | 0-2s | Black. A low rumble. | none | IN A WORLD WHERE GARAGE DOORS FIGHT BACK |
| 2 | 2-4s | Inside a dark garage, the door shudders, the light flickers, a metallic BANG. | `../site/truck-from-garage.jpg` (top half) | |
| 3 | 4-7s | The wrapped truck rolls across the driveway in slow motion, dust and lens flare, the monster face on the wrap in full view. | `../site/truck-from-garage.jpg` | ATTACK OF THE GARAGE DOOR |
| 4 | 7-10s | Brian walks toward camera in slow motion and holds up the worn hinge like a trophy. | `../site/brian-worn-hinges.jpg` | ONE FAMILY. THREE GENERATIONS. |
| 5 | 10-12s | Brian, deadpan, to camera: "Don't lift it. Call me." | `brian-start.jpg` | |
| 6 | 12-15s | End card: logo, "NOW SHOWING", open 24 hours, (604) 240-0180. | rendered locally | NOW SHOWING. CALL OR TEXT 604-240-0180 |

**Voiceover** (stock ElevenLabs trailer voice, or Brian's clone once he records a sample): "In a world where garage doors fight back... one family has held the line for three generations. Best Choice Garage Doors. Open 24 hours."

**How to make it**
- Shots 2 to 5: one Higgsfield clip each. Veo 3.1 Lite is 6 credits per 4 seconds, so about 24 credits for one pass. Budget double for retakes.
- Shot 1 and the end card: rendered free in the site's teal and Barlow Condensed.
- Stitch, add the voiceover and captions with ffmpeg. Export 1080x1920.
- Or hand this table to Katana with a trailer reference video and let it build the edit.

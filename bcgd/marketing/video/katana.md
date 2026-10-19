# Katana: how to make a funny Brian video

Katana is Higgsfield's reference-video editing tool, announced October 8, 2026. It runs inside Claude through the Higgsfield MCP. You give it a reference video you like plus your own photos, and it rebuilds that edit with your content, then makes a few variations.

What is confirmed: the idea, the `/katana` command, and the Higgsfield MCP link. What is not: price, credit cost per edit, reference video length limits, and whether it works in Claude Code or only in claude.ai and the desktop app. Third-party guides disagree on details. Check Higgsfield's own Katana page before spending.

## Set up in Claude Code (verified 2026-10-11)
The Higgsfield connector is already added to Joshua's claude.ai account, and `claude mcp list` shows `claude.ai Higgsfield ... Connected`. Its tools only load in a session started after it was added.

1. Quit Claude Code and start it again in `~/Documents/Code/bcgd`.
2. Type `/mcp` and check that Higgsfield is listed and connected. If it asks, sign in to Higgsfield in the browser.
3. Type `/` and look for a Higgsfield or Katana command. If there is none, just say: "Use Higgsfield Katana to recreate the headlights preset with Brian's truck."
4. First thing in the new session: fetch the dance clip that was still rendering (`pending-renders.txt`).

**Billing:** the connector most likely spends the Higgsfield app account (free plan, 2.5 credits), not the API dollars (open.higgsfield.ai). If Katana says there are not enough credits, stop there. The API route (`trailer/`, Genjutsu dance) does the same kind of meme video with no plan.

## Picked presets (higgsfield.ai/katana, community)
1. **Headlights reveal** (by moonchild27): black and white, a car rolls up out of the dark with blinding headlights. Swap in the wrapped truck from `../site/truck-from-garage.jpg`. End on "The garage door guy has arrived. 604-240-0180."
2. **"who I was."** (aura walk, black and white): Brian walks toward camera in slow motion. Use `../site/brian-with-truck.jpg`. Retitle it "who I fix."

## The recipe for Dad
1. **Pick a reference.** Find a short vertical video you like. Aura-farming edits and product launch edits are the ones Higgsfield pushes. Only use it as a pattern for pacing and style. Do not reuse its footage, music or people.
2. **Split it in three:** structure (how it holds attention), style (colors, type, pace), content (who and what is in it). Keep the structure. Swap the style for the site's teal and Barlow Condensed. Swap the content for Brian.
3. **Feed it our real material:** `../site/brian-with-truck.jpg`, `../site/brian-portrait.jpg`, `../site/brian-worn-hinges.jpg`, the logo, and the wrapped truck photo once it is saved to disk.
4. **Ask for 3 versions,** keep the best one, extend that direction. More versions are not automatically better.
5. **Review every frame** for warped hardware, changed faces or a wrong phone number. Add the real number and logo as an end card in CapCut.

## Ideas that fit him
- The wrapped "Attack of the Garage Door" truck pulling up like a movie trailer.
- Brian holding up the worn hinge with a deadpan face.
- "Heard a bang?" cold open, then Brian walks in.
- Three generations, same family, old photo to today.

## Rules
- Brian approves the video, the voice and the words before it goes anywhere public. A synthetic voice is not his voice.
- Label it as AI-made if the platform asks.
- Higgsfield's free plan has no commercial use, so paid ads need a paid plan.
- Budget: Lite test 6 credits for 4s, Veo 3.1 high 24 credits for 6s, expect 3 to 5 tries.

## Run log 2026-10-11
- Dance render fetched: `brian-boom-dance.mp4` (genjutsu, request 6912a4dc).
- Katana headlights NOT run. Connector works, but `/katana/headlights` and `/katana/headlights-reveal` both return not_found (real slug unknown, `get_preset_instructions` catalog lists no Katana presets). The general `/katana` workflow needs a reference video plus paid Seedance 2.5 jobs.
- Higgsfield app balance: 2.5 credits, free plan. A 4s clip is ~6 credits, so it would not finish. Needs a plan or top-up (Joshua's call), then the exact slug from the Katana catalog page.
- Dance video texted to Dad (second try worked; the first attachment failed with error 34).
- Headlights clip: `brian-headlights.mp4`, Kling 2.5 Turbo standard via the API key (request 9e6c3dad), 5s, 1108x828. It came out in daylight and color, not the black and white night look. The truck pulls forward and the headlights come on at the end. The wrap text warps on the turn.

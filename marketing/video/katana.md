# Katana: how to make a funny Brian video

Katana is Higgsfield's reference-video editing tool, announced October 8, 2026. It runs inside Claude through the Higgsfield MCP. You give it a reference video you like plus your own photos, and it rebuilds that edit with your content, then makes a few variations.

What is confirmed: the idea, the `/katana` command, and the Higgsfield MCP link. What is not: price, credit cost per edit, reference video length limits, and whether it works in Claude Code or only in claude.ai and the desktop app. Third-party guides disagree on details. Check Higgsfield's own Katana page before spending.

## Set up
1. **Claude desktop or claude.ai:** Customize, then Connectors, add a custom connector with the Higgsfield MCP URL, sign in to your Higgsfield account, then type `/katana`.
2. **Claude Code (unverified):** `claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp`, then `/mcp` to sign in. The URL comes from third-party guides, not Higgsfield, so confirm it first.

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

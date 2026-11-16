# Doorstock loop handoff (2026-11-15, 18:38)

## What the loop is

The QA and submit loop for Doorstock, the stock and jobs app for Best Choice Garage Doors (ASC app 6791106082). It walks every screen and function of the iPhone app (src/ios, run on the simulator) and the Mac app (src/macos), keeps screenshots, and fixes what it finds until the UI reads as A+. It submits a build only on Joshua's yes. The loop never answers Apple on its own. Usage-conscious: no subagents, small steps.

## Where things stand

- Mac 2.0 is live on the Mac App Store (cleared review 2026-11-01).
- Mac 4.0 is built and pushed on Mac and iPhone, not submitted. It has the Today tab (3.0), the crew assign (4.0), and this session's spec gaps: torsion spring fields (wire size, inside diameter, length, left or right wind) with a cost on every part; "Scan a label", which reads a part box with the camera and opens the part it names or fills in a new one; and Settings > For the accountant, a monthly CSV of parts used on completed jobs with cost. Two part-editor bugs are fixed too: a crewmate's stock change no longer gets undone on save, and typed numbers are no longer lost.
- The label scanner has never run on a phone. The simulator has no camera, so its patterns are untested on real spring boxes.
- iPhone is still held under the 4.3(a) appeal. Do not resubmit the rejected build.
- Garage Cam is a prototype in the labs repo at bcgd/prototypes/garage-cam. It is not in the app yet.
- Older-build risk: the server swaps a part's whole record on edit, so an old build editing a part wipes its spring specs and cost. Keep old builds out of shops until this is fixed (see bcgd/roadmap.md).

## Next, in order

1. Joshua scans a real spring box label with an iPhone. Tune the patterns in Scan.swift to the labels the shop actually gets.
2. Fix the older-build field-wipe risk: merge fields in doorstock.js, or require 4.0 for shops.
3. On Joshua's yes, submit Mac 4.0 and tag it.
4. Once the Garage Cam has footage, wire it into the app so it can add or open parts. Joshua brings resources for it tomorrow.
5. QA the assign picker against a local Worker (`-apiBase http://127.0.0.1:8799`): assign a job, confirm it sorts first on the crew member's Today tab. Then walk the Mac window at the same bar as the iPhone pass.
6. Fill the Dashboard, which looks sparse since Today moved out of it.
7. Keep the iPhone screens at A+ as they are touched. Nothing goes to the store while the 4.3(a) appeal is open.

## Restart prompt

```
/loop QA every screen and function of bcgd Doorstock (src/ios on iPhone sim, src/macos) with screenshots; fix issues until the UI is A+ (feedback_a_plus_bar, apple skill rules). Check the open items in bcgd/roadmap.md first, starting with the label scan test and the older-build wipe risk. Submit Mac 4.0 only on Joshua's yes (asc app 6791106082). Usage-conscious, no subagents, small steps.
```

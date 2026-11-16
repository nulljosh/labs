# Garage Cam (prototype)

A phone or old iPad propped on the shelf watches the bins. Box each bin on screen and name the part in it. When someone walks in, takes something and walks off, any bin that now looks different gets an ask: Took 1, Added 1, or Ignore.

Open `index.html` in Safari on a phone (camera needs https or a file opened locally). Nothing leaves the device.

How it works: the frame shrinks to 64 by 48 grey pixels. Big change across the whole frame means someone is there. Once it goes still, each bin is compared with how it looked before. No machine learning yet.

Knobs at the top of the script: `MOTION`, `STILL_FRAMES`, `BIN_CHANGE`. Tune them on real footage.

Next, once we have real footage of the shop: move it into the Doorstock app as a Garage Cam tab, wire Took/Added to `Store.adjust` with reason "Garage cam", then try recognizing the part itself (spring box labels via the same text reader as Scan a label).

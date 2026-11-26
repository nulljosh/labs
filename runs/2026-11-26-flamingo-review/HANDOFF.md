# Flamingo Map 2.0.0 rejection, handoff (2026-11-26)

Apple rejected iOS 2.0.0 under 2.1 Information Needed: six asks, the first a screen recording on a physical device.

Done
- Cyllene Resolve All drafted the reply. It sits in ~/Library/Caches/Hermes/review/drafts.json under the key ending `|w5.<size of Sources/fixes.json>`. Answers 2 to 6 are filled from the real code and README (only external service is the optional api.jaybulb.com sign-in; unofficial fan project, not affiliated with Rockstar or Take-Two). Answer 1 still reads `[recording link]`.
- Joshua said "do it": this Mac mini is registered as a development device. Flamingo runs here as "My Mac (Designed for iPad)", launched from the real Xcode window (open the project in Xcode, then AppleScript `run` the workspace document). The Xcode MCP's RunProject fails to launch it.
- Window-only recording works: `screencapture -v -V <s> -l<windowID>`; the window id comes from CGWindowListCopyWindowInfo (owner "Flamingo").

Not done
- A clean recording. Scripted clicks (System Events `click at`) land on the Story list and toggle Mission 6 instead of the tab bar, so two takes stayed on the Story screen. Next try: read the window's real position first (`position of window 1` of process Flamingo) and click the tab buttons by element (`click` the AXButton whose description is Map/Story/Settings), not by coordinates. Check each step with a window screenshot before recording.
- Host the video, fill `[recording link]`, and send with `asc web review reply --thread-id <id> --message ... --confirm` (or Cyllene Send All with read-only off). Joshua approved sending.
- Apple asks for the info in the App Review Notes too, then a resubmit.

Fixed at 02:05: tabs work when pressed through accessibility (AXPress on the button whose description is Map/Story/Settings). Window sits at (448,71), 1024x800. A third take was recording to /private/tmp/cyl-flam/rec/review.mov via drive4.sh when the session hit 98%: check its frames, then upload (e.g. a gh release asset on nulljosh/flamingo), fill answer 1, and send. Answer 1 should say truthfully that it was recorded on an Apple silicon Mac running the iPhone app, not on an iPhone.

Scripts: /private/tmp/cyl-flam/drive4.sh (tmp, may be gone after a reboot).

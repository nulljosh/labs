# Roadmap

- [ ] Verify iPad split-view (ChapterListView) visually on simulator -- 2026-09-02. Pushed
  the NavigationSplitView conversion without a simulator screenshot; this machine's Xcode
  only has the iOS 26.5 SDK but the iOS 26.2 runtime downloaded, so `xcodebuild` won't
  recognize any simulator destination even by explicit UDID. Needs the matching platform
  component installed, then a quick visual check.
- [ ] iOS is built and parked, not shipping yet -- 2026-08-30. A new bundle ID for a
  single-book reader is the exact shape Apple rejected seven times in the open
  4.3(a) wave, and the 5.6 suspension only lifted 2026-08-18. Revisit
  `com.heyitsmejosh.fengshui` registration once those replies resolve.
- [ ] Consider macOS target once iOS is stable (see uprighty/ios/project.yml for the pattern)
- [ ] Add more chapter content beyond the single Good Fengshui summary if the app grows

## WebMCP + REST API rollout -- assessed and closed 2026-08-27

Not doing this here. Static long-form reader. Table of contents and scroll-jump only; nothing is created or saved.

A tool on a page like this would be `get_page_content`, which spends an
agent's context restating text it can already read. That is noise, not
coverage, and it makes the honest tools in the other repos harder to find.

Shipped instead in: epiphany, healstack, roost, curvely, wiretext, litigate,
cadence, sparkjar, lexly, talli, quotable, wordroot, newsline, nyc, notes,
bookrank, homeward.

**Reopen 2026-08-30.** The premise above no longer holds -- the page now saves an
assessment, so there is real state an agent could read and write
(`get_assessment` / `answer_question`). Worth a second look, not urgent.
- [ ] native (kmp) port — sibling apps have one, this doesn't (project-sync 2026-09-05)

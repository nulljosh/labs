# Keyrate roadmap

Steps, not semver. vN is the Nth small shippable step and v100 is the finish. Each step ends with its check green. Keyrate stays one number with nothing attached: no accounts, themes or multiplayer.

## Done 2026-10-29
- [x] Android and desktop app in `kmp/`, scoring ported, 14 tests
- [x] iOS and Mac SwiftUI app in `apple/`, one target, 12 tests, `Score.swift` shared with the TUI
- [x] Web: dark mode, the test embedded on the landing, timed-run clamp, domain, docs
- [x] Android launcher icon

## To v100

### Web test
- [x] v1: Commit the 2026-10-29 work (web fixes, kmp, apple) with keyrate paths only
- [x] v2: Retake the README screenshots in light mode with the quote and punct buttons showing
- [x] v3: Pull the test rules out of app/index.html into session.js, same API as Session.kt and Session.swift, tested with node --test
- [x] v4: Web takes the whole input text (setText) so pasted or batched input lands like slow typing
- [x] v5: Label the words, the mode chips and the result for screen readers; keep the timer quiet
- [x] v6: Keyboard-only mode switch: Esc leaves the test for the mode chips, arrows move, Enter picks
- [x] v7: Reloading keeps the chosen mode and the punct setting
- [x] v8: Landing: the embedded test resizes to its content so the result never scrolls inside the frame
- [ ] v9 (web done): Quote mode never repeats the quote just typed (all four ports)

### Rules and scoring
- [ ] v10: Score vectors: one file of 30 cases, generated tests in node, Kotlin and Swift that must all agree
- [ ] v11: One check script: node tests, vectors, gradle tests, xcodebuild tests, README refs; run before any push
- [ ] v12: Whitepaper: how accuracy is counted (final text, not keystrokes) with a worked example
- [ ] v13: Result also shows keystroke accuracy next to the final-text one, so both are honest
- [ ] v14: Decide the paste rule: a pasted burst should not set a best; write it down, then port it
- [ ] v15: Timed mode shows the real elapsed second once the run is over
- [ ] v16: Punct mode adds apostrophes and hyphens, numbers stay rare
- [ ] v17: Word list and quotes come from one source file; a script writes the Kotlin and Swift copies
- [ ] v18: Quotes grow from 10 to 100 short lines, public domain only
- [ ] v19: Word mode finishes on the last character of the last word, in all four ports

### Android
- [ ] v20: Run the debug APK on an emulator and walk 15, 60, words and quote
- [ ] v21: Fix whatever the soft keyboard does to the hidden input (autocorrect, spaces)
- [ ] v22: Adaptive launcher icon with the glyph on the accent tile
- [ ] v23: allowBackup off so scores never leave the device through a backup
- [ ] v24: Dark theme walk on a device, both orientations
- [ ] v25: Tablet and foldable layout: the words column stays 832dp wide and centred
- [ ] v26: TalkBack pass: words, timer, result
- [ ] v27: Release build: R8 on, signing from a gitignored file, versionCode from the git count
- [ ] v28: Play listing text and screenshots in a metadata folder, ready to paste
- [ ] v29: keyrate-kmp.yml runs shared tests and assembleDebug, added only after a clean run on a fresh clone
- [ ] v30: Keep the APK under 10 MB
- [ ] v31: Back button and rotation keep the run alive
- [ ] v32: Hardware keyboard: Tab restarts, Enter restarts after a result
- [ ] v33: Play pre-launch report read and fixed
- [ ] v34: First Play internal-testing build uploaded (Joshua signs in)
- [ ] v35: Android 2.0.1 from what the report and testers show

### Desktop (Windows, Mac, Linux)
- [ ] v36: Build the Dmg and open it on this Mac
- [ ] v37: Build the Msi and the Deb on CI runners, not here
- [ ] v38: Window remembers its size and position
- [ ] v39: Menu bar: New test and the six modes
- [ ] v40: Windows font check: system sans, never a serif fallback
- [ ] v41: Linux check on Wayland and X11
- [ ] v42: App icon in every desktop format from Keyrate.icon
- [ ] v43: Notarize the Mac Dmg (Joshua's account)
- [ ] v44: Winget and Homebrew cask manifests, drafted not submitted
- [ ] v45: Desktop 2.0.1 from what the three platforms show

### iPhone, iPad, Mac (SwiftUI)
- [ ] v46: Run on an iPhone simulator and walk every mode with the keyboard up
- [ ] v47: Fix the hidden field focus on iOS if the keyboard does not rise on launch
- [ ] v48: iPad layout: wider words column, hardware keyboard shortcuts
- [ ] v49: Mac: Tab, Enter and Cmd-R restart; Cmd-1 to Cmd-6 pick the modes
- [ ] v50: VoiceOver pass on iPhone and Mac
- [ ] v51: Dynamic Type: words scale with the system size without breaking the 3-line window
- [ ] v52: Light and dark App Store screenshots, no demo account
- [ ] v53: asc: create the app record under the final name, probing Keyrate with Apple's name check first
- [ ] v54: Bundle id, team, encryption answers and export options set
- [ ] v55: Archive and run asc validate before any upload
- [ ] v56: App Store text from the whitepaper, one paragraph, no feature list
- [ ] v57: Privacy label: nothing collected, matching PRIVACY.md word for word
- [ ] v58: TestFlight build 1 to Joshua's phone
- [ ] v59: Real iPhone walk: keyboard, autocorrect off, copy and paste, rotation
- [ ] v60: Fix what the real phone shows, TestFlight build 2
- [ ] v61: Mac App Store build: sandbox on, hardened runtime, no network entitlement
- [ ] v62: Submit iOS and Mac for review (Joshua's yes)

### Terminal
- [ ] v63: keyrate-tui plays a live test, not just a score card (raw mode, redraw loop)
- [ ] v64: TUI shares the word list and rules through the same vectors
- [ ] v65: TUI keeps best per mode in ~/.keyrate
- [ ] v66: TUI: Tab restarts, Esc quits, the same keys as the desktop app
- [ ] v67: Homebrew formula for keyrate-tui in the house tap

### Quality, docs, CI
- [ ] v68: keyrate-test.yml also runs the vectors check on Linux
- [ ] v69: Playwright smoke test for the web: type a quote, see a result
- [ ] v70: Whitepaper: the native apps, the shared vectors, the paste rule
- [ ] v71: architecture.svg redrawn with the four ports and the vectors file
- [ ] v72: README: a platforms table with a store link per row as each ships
- [ ] v73: Landing: swap each Coming soon for a real link as it ships
- [ ] v74: Landing: a dark screenshot in each platform card
- [ ] v75: Landing speed pass: the embedded test loads after the hero
- [ ] v76: Lighthouse accessibility 100 on / and /app
- [ ] v77: System font only, confirmed on every platform
- [ ] v78: Security pass: no network calls in any build, checked by grep and by a firewall run
- [ ] v79: SECURITY.md lists the supported native versions
- [ ] v80: PRIVACY.md checked against what each build really stores
- [ ] v81: Languages: Spanish, French, German and Portuguese word lists as opt-in modes, UI strings translated
- [ ] v82: Right-to-left check for the UI
- [ ] v83: A 15 minute idle test on each platform: memory stays flat
- [ ] v84: No timer runs while an app is in the background
- [ ] v85: A crash-free week on TestFlight and Play internal before any public submit
- [ ] v86: Reply to the first ten real reviews, plain words
- [ ] v87: Delete dead code: legacy notes, unused chips, stale files
- [ ] v88: Docs 100: every markdown file current, links valid, CI green, no stale branches
- [ ] v89: Quality pass on all four apps against the web, side by side, same words same score

### Release
- [ ] v90: Bump README, whitepaper and badges to v2.0.0 once iOS and Mac are in review
- [ ] v91: Tag keyrate-native-v2.0.0 and push the tag by name
- [ ] v92: Retake every screenshot after the last UI change
- [ ] v93: Product Hunt kit in launch/ (Joshua posts)
- [ ] v94: GitHub description, homepage and topics set
- [ ] v95: 2.0.1: the first round of fixes from real users, nothing new
- [ ] v96: Drop Coming soon from the landing entirely
- [ ] v97: Journal entry for the release, plain words
- [ ] v98: Move keyrate to its own repo only if the fleet rule says so, history kept
- [ ] v99: Review the out-of-scope list once: still no accounts, themes or multiplayer
- [ ] v100: v100: Keyrate on five platforms, one number, the same on all of them

## Joshua's steps
Apple login and 2FA, Play sign-in, signing and notarizing, store submits, posting the launch.

## TUI pilot (2026-09-05)
`keyrate-tui` is a SwiftPM target (SwiftTUI). `tui/Sources/Score.swift` is a line-for-line port of score.js and the apps reuse it. It renders one score card; v63 makes it live.

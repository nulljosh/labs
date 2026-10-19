# Architecture

Feng shui home assessment tool from Eva Wong's Good Fengshui. Users answer 24 questions across four layers (Macro, Micro, Form, Interior) tied to book chapters. Web assessment is the primary product. iOS and watchOS are companion readers with native storage for assessment responses. No backend, no login, static content deployed via Cloudflare Pages.

## How it runs

Web: `index.html` loads, renders the interactive questionnaire with layer sections, stores answers in localStorage, calculates concerns per layer, and builds a summary report tied to chapters. Service worker caches the page for offline use.

iOS: HomeqiApp opens a TabView with two tabs: Assess (questions, storage) and Read (chapters from content.md bundle). Assessment responses are stored locally via PropertyStore. Chapter content is parsed from bundled Markdown.

watchOS: Mirrors iOS, simplified for the small screen. Shows chapters and assessment chapters read-only. Content is bundled on-device.

## Web

| File | What it owns |
|---|---|
| `index.html` | Single-page app: questionnaire form with layers and questions, property name input, scoring logic that tallies concerns per layer, report view. Exports `tally(answers)` to calculate final scores. Uses localStorage to persist answers per property. |
| `sw.js` | Service worker for offline support. Caches the page, assets, and manifest with a cache-versioned key. Network-first for pages, cache-first for hashed assets. |
| `test.mjs` | Node test: validates the scoring logic by extracting layer/question tables from `index.html`, running test cases, and asserting expected tally results. |
| `devices.css` | Device frame CSS (iPhone, Android, Mac window). Canonical copy in portfolio repo, synced locally for landing-page demos. |

## iOS

| File | What it owns |
|---|---|
| `ios/Homeqi/HomeqiApp.swift` | App entry point. TabView with Assess and Read tabs. |
| `ios/Homeqi/AssessmentView.swift` | Assessment interface: layer sections, question rows, property rename/new/delete UI. Binds to PropertyStore. |
| `ios/Homeqi/AssessmentData.swift` | Layer and question definitions. Mirrored by hand from `index.html`'s LAYERS/QUESTIONS arrays. Hand-port ensures iOS question set matches web when the assessment is updated. |
| `ios/Homeqi/PropertyStore.swift` | Persistent storage for properties (per-property assessment state). UserDefaults-backed, observable. Stores answer map from question ID to yes/no/unsure response. |
| `ios/Homeqi/Models.swift` | Chapter data: title, body. ContentStore parses bundled content.md, returns array of Chapters. |
| `ios/Homeqi/Views/ChapterListView.swift` | Navigation list of all chapters. Taps open ChapterDetailView. |
| `ios/Homeqi/Views/ChapterDetailView.swift` | Renders chapter body with Markdown parsing: bold, links, line breaks. |

## watchOS

| File | What it owns |
|---|---|
| `watchos/HomeqiWatchApp.swift` | App entry point. WindowGroup wrapping ContentView. |
| `watchos/ContentView.swift` | Root view: delegates to ChapterListView. |
| `watchos/Models/ContentStore.swift` | Mirrors iOS version. Parses bundled content.md into Chapter array. No network, fully on-device. |
| `watchos/Views/ChapterListView.swift` | Compact chapter list for watch. Taps open ChapterDetailView. |
| `watchos/Views/ChapterDetailView.swift` | Chapter display with Markdown rendering. Compact padding for small screen (4pt gutter). |

## Deployment & sync

- **Web**: Deployed via `wrangler pages deploy` to Cloudflare Pages. Served at homeqi.heyitsmejosh.com (DNS alias from old fengshui.heyitsmejosh.com).
- **iOS/watchOS**: Bundle is built via Xcode, content.md is a bundled resource. No shared source between web and native question sets; hand-port AssessmentData.swift when web questions change.
- **Content**: `content.md` bundled on iOS/watchOS. Web questions reference chapter IDs for tying answers to reading material.

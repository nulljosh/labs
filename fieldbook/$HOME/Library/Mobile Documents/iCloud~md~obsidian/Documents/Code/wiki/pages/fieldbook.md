---
type: entity
tags: [encyclopedia, education, science, math, web]
sources: 0
updated: 2026-09-07
---

# Fieldbook

Science and math encyclopedia. Seventy-six fields explained plainly with cross-linked definitions, visualized on a d3 force graph where related domains cluster and hub fields radiate from the center. Live at https://fieldbook.heyitsmejosh.com.

## Current State

- v0 shipped 2026-09-07
- Single HTML file (web/index.html) houses the app, landing, and force graph
- 76 entries in data.js with curated cross-links between fields
- d3 force simulation: domain clustering, hub-field anchoring, pan/zoom, drag to reposition
- Glass sidebar with field list and search, scroll-spy highlighting
- Keyboard navigation (arrow keys, Enter to select), progress ring, print-friendly view
- Native ports: iOS/macOS via xcodegen, Android/desktop via KMP (CI-only, no JDK locally), TUI via SwiftTUI
- Fields.swift and Fields.kt auto-generated from data.js by scripts/gen.mjs
- Tests: node --test (data integrity + Playwright UI)
- No authentication, no Supabase, no ASC record (scoped as one thing: a field map)

## Design

- Single-page reference tool, not a tutorial sequence
- Force graph emphasizes relationships; users discover connections by exploring
- Apple-style touches: glass UI, scroll animations, keyboard shortcuts, print support
- Native apps reuse the same data structure (generated enums) across all platforms
- Landing page live with animated screenshots of the graph in motion

## Roadmap

**v0 — done**
- [x] Data model (76 fields with descriptions and cross-links)
- [x] d3 force graph visualization
- [x] Web UI (sidebar, search, scroll-spy, keyboard nav)
- [x] Native ports (iOS, macOS, KMP, TUI)
- [x] Code generation (Fields.swift, Fields.kt from data.js)
- [x] Tests and CI
- [x] Landing page

**v1+**
- [ ] Check question per field (Joshua's idea: one verification question to test understanding)
- [ ] Mobile-optimized touch interactions (swipe to navigate fields, pinch to zoom graph)
- [ ] Search ranking by popularity or alphabetical sort options
- [ ] Export/print feature enhancements (PDF generation)
- [ ] i18n support (translate field descriptions)

## Not Building

- Subtopic drill-down (stays one level: field overview only)
- Video tutorials or external links
- Collaborative editing
- User annotations or notes

## Repository

github.com/nulljosh/fieldbook (public)

## Origin

Joshua's thesis: "identify gaps of intellect in human consciousness on a macro level, then make apps to fill them." Fieldbook is the first. Same model planned for other autodidact subjects.

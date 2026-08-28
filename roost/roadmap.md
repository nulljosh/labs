# Roost Roadmap

## Braindump 2026-08-19
- [ ] Rename? "Roost" may not be the final name — run asc-name-creator for alternatives before any App Store record is made.

## From Apple Notes (imported 2026-08-27)
- [ ] Roost needs a landing page and iOS/Mac apps.

## Worldwide build 2026-08-28
Web app now browses anywhere on earth: Nominatim place search, real local street
names from Overpass, per-country currency/units/price levels, sale and rent
modes, and UI strings in 26 languages with RTL.

- [ ] Native iOS + macOS apps. Not started. One SwiftUI multiplatform target with
      MapKit, reusing the same market tables and generator ported to Swift.
- [ ] Settings still has hardcoded CAD price dropdowns (`src/pages/Settings.jsx`)
      left over from the BC-only version. Scale them off `marketFor(place)` the
      way FilterBar now does.
- [ ] Login/Register/ForgotPassword copy is still English-only; the strings dict
      has the keys, the pages just do not call `t()` yet.
- [ ] Listing descriptions and feature bullets were removed: the old generated
      English prose could not be localized. Either translate a template or wait
      for a real feed.
- [ ] Inventory is generated, not real. Shape matches an MLS/IDX response so a
      feed swap is one function (`generateListings`).
- [ ] Rename check before any App Store record — run asc-name-creator.
- [ ] Landing pitch is translated into 10 of the 26 languages; the rest fall back to English.

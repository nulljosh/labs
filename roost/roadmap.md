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
- [ ] Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY on the Cloudflare Pages
      project `roost`. Without them the client is null and sign-in is disabled in
      production, so nothing behind /browse is reachable.

## From Notes (imported 2026-08-27)
- [x] Bump the app icon. New mark (charcoal square, cream house, red door) in `public/icon.svg`; added `icon-1024.png` + `apple-touch-icon.png` (both flattened, no alpha) and an `og.png` social card. No Xcode target exists yet, so this is the web/PWA icon. Also fixed `/icon.svg` 404ing in production — the file was at the repo root, not `public/`.
- [x] Add more to the landing page. Hero now leads into a coverage strip (counts derived from `market.js`, not hardcoded), a four-card how-it-works section, the language list rendered from `supportedLanguages`, and an upfront note that inventory is generated. Verified in headless Chrome at 390px and 1280px and on the live deploy.

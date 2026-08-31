# homeward roadmap

## Cloudflare migration + rename — DONE 2026-08-17

Live on Cloudflare Pages project `homeward` (`homeward-5bq.pages.dev`), serving
both `homeward.heyitsmejosh.com` and `pets.heyitsmejosh.com`. The old `pets.`
URL was kept so existing links don't break. Vercel project deleted.

Renamed from `missing-pets` to Homeward across the web app, the iOS sources
(`ios/Homeward/`, `HomewardApp.swift`) and `ios/project.yml`.

How it got here:
- Static export (`output: "export"`) works with no adapter because every page is
  `"use client"` against Supabase — there is nothing to render server-side.
- `/listing/[id]` became `/listing?id=`; a dynamic segment can't static-export
  without `generateStaticParams`, and listing ids aren't known at build time.
- The build needs `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` in `.env.local`.
  Vercel's env API returned empty values (token lacks decrypt), but both are
  `NEXT_PUBLIC_*` and therefore compiled into the browser bundle — recovered
  from the deployed JS. Not a leak: the anon key ships to every visitor and is
  guarded by RLS.

## OAuth rollout (2026-08-24)
- [ ] Add Apple/GitHub sign-in to both web and iOS. App is currently email-only signup (plus unauthenticated posting). Web pattern proven in litigate/web/auth.js; iOS needs native SDK flows. Google credentials already in Cloudflare secrets. This app is unshipped, so OAuth can ship as part of the initial iOS launch.

## Left

- iOS target: FIXED 2026-08-23. It had never compiled since the rename — the
  target had no Info.plist and none was generated, so code signing failed.
  `GENERATE_INFOPLIST_FILE: YES` plus display-name/launch-screen keys in
  `ios/project.yml`; bundle id moved to `com.nulljosh.homeward` (no ASC record
  exists, so nothing to break). Builds clean against generic/iOS Simulator.
  Never run on a device or simulator — only compiled.
- `homeward.pages.dev` was taken, so the project is `homeward-5bq.pages.dev`.
  Cosmetic only, but note it when adding future DNS records.

## WebMCP + REST API rollout -- shipped 2026-08-27

Done. 5 tools through the existing `lib/supabase.ts` client: `search_listings`, `get_listing`, `whoami`, `post_listing`, and a gated `mark_listing_resolved`. Auth actions are deliberately not exposed.

See `docs/API.md` for the full tool table, linked from the README.

## iOS + Mac apps — DONE 2026-08-27

One XcodeGen target with `supportedDestinations: [iOS, macOS]`, so both platforms
ship from the same SwiftUI sources. Both build clean; iOS verified running in the
simulator against live Supabase (posted a test row via REST, saw it render, resolved
it through `update_listing`).

What was built:
- Supabase URL + anon key baked into `SupabaseClient.swift` (env override kept).
  They only existed as scheme env vars before, so an installed build talked to a
  placeholder host. The anon key is public by design and already ships in the web bundle.
- New `ListingStore` (@Observable): load, search, post, resolve, photo upload, error surface.
  Edit tokens from your own inserts are kept in UserDefaults, which is what enables the
  "Mark as resolved" button on your own listings — same model as the web edit link.
- `NavigationSplitView` so macOS gets a real two-pane window; free on iPhone.
- Search over name/species/color/notes/tag/location, lost-found search scopes, a filter
  menu with "show resolved", relative timestamps, photo thumbnails, tel:/mailto: contact links.
- Sandbox entitlements, `LSApplicationCategoryType`, `DEVELOPMENT_TEAM`, version 1.0 (1).

## Landing page, icon, OAuth, edit_token lockdown — 2026-08-31

- Landing page at `/`; the board moved to `/board`. Hero + three points + a
  recent-listings strip. `scripts/xplat-section.py` targets a static
  `landing/index.html`, so it does not apply to this Next app; the install
  points are written inline instead.
- App icon: `ios/Homeward/Assets.xcassets/AppIcon.appiconset`, rendered from
  `public/icon.svg` with rsvg-convert. iOS gets a square, alpha-free 1024
  (the SVG's own `rx="40"` is stripped so iOS doesn't double-mask the corners);
  macOS gets the full 16-1024 ladder. `ASSETCATALOG_COMPILER_APPICON_NAME` set
  in `project.yml` — without it macOS ships iconless. Both platforms build clean.
- OAuth: Apple / Google / GitHub buttons on login and register via
  `lib/OAuthButtons.tsx` (`signInWithOAuth`). All three providers were already
  enabled on the shared Supabase project; only the redirect allow-list needed
  homeward/pets/localhost added. iOS is still email + anonymous — native SIWA
  is the remaining piece.
- edit_token leak closed. `listings` is now a read-only definer view without
  the column; the table is `listings_data` with all grants revoked from anon
  and authenticated. Posting goes through `create_listing()`, which is the only
  thing that returns a token, and `listing_by_token()` backs the edit link.
  `update_listing()` now also accepts a signed-in owner instead of a token.
  Verified over REST: reads work, `edit_token` does not exist on the view, the
  base table is permission-denied, and direct insert/update/delete on the view
  are refused.

## Left
- [ ] No ASC record yet for `com.nulljosh.homeward`; nothing submitted.
- [ ] Native Sign in with Apple in the iOS/Mac app (web OAuth is done).
- [ ] The Mac icon is the same dark rounded-square art as iOS; a Mac-shaped
  icon would be better but is cosmetic.

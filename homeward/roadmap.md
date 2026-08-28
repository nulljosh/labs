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

## Left
- [ ] Landing page (from Apple Notes 2026-08-27).
- [ ] No ASC record yet for `com.nulljosh.homeward`; nothing submitted.
- [ ] App icon: neither platform has one.
- [ ] Security, pre-existing and shared with web: the `select` policy on `listings` is
  `using (true)`, so anyone can read every row's `edit_token` and resolve or edit someone
  else's listing. Real fix is column grants plus a `create_listing` RPC that returns the
  token — touches web, iOS, and a migration.
- [ ] OAuth rollout below is still open; the native apps post anonymously.

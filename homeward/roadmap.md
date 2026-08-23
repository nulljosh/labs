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

## Left

- iOS target: FIXED 2026-08-23. It had never compiled since the rename — the
  target had no Info.plist and none was generated, so code signing failed.
  `GENERATE_INFOPLIST_FILE: YES` plus display-name/launch-screen keys in
  `ios/project.yml`; bundle id moved to `com.nulljosh.homeward` (no ASC record
  exists, so nothing to break). Builds clean against generic/iOS Simulator.
  Never run on a device or simulator — only compiled.
- `homeward.pages.dev` was taken, so the project is `homeward-5bq.pages.dev`.
  Cosmetic only, but note it when adding future DNS records.

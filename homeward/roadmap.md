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

## WebMCP + REST API rollout (pending, 2026-08-27)

Add `document.modelContext` tool registration so in-browser agents can drive
this app, and document any HTTP surface it already has.

Pattern is already shipped in epiphany, healstack, roost, curvely, wiretext,
litigate, cadence, sparkjar and lexly — copy the closest one:

- React app with hooks → `src/lib/webmcp.js` exporting `useWebMCP(ctx)`, called
  from `App.jsx` with the hook callbacks it already holds (see epiphany, curvely).
- React app whose state lives in contexts → a `<WebMCP />` component that reads
  those contexts (see healstack, roost).
- Vanilla JS app → a `webmcp.js` IIFE plus `window.*` accessors exported from the
  existing app script (see litigate, lexly, sparkjar).

Rules the shipped ones follow:
- Tools call existing functions or existing `/api` routes. Never reimplement logic.
- Read-only tools first, then reversible writes.
- `requiresConfirmation: true` only on the genuinely consequential ones —
  payments, public publishing, deletions. Not on ordinary writes.
- Bail out quietly when `document.modelContext` is missing.
- Ship a `docs/API.md` listing REST routes (or stating there are none) plus the
  tool table split into read-only / reversible / confirmation-gated.

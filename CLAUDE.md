@AGENTS.md

# Missing Pets — project notes

Craigslist-style lost/found pet board: Next.js web app + SwiftUI iOS app sharing one Supabase backend. No auth — posts are public, editable only via a UUID `edit_token` link generated at post time.

## Key files
- `lib/supabase.ts` — web Supabase client + `Listing` type, shared by all pages
- `supabase/migrations/0001_init.sql` — schema, RLS, storage bucket, `update_listing` RPC (the only way to mutate a listing's status, gated on `edit_token` matching)
- `app/page.tsx` — list/filter/search view
- `app/post/page.tsx` — post form, returns the edit link on success
- `app/listing/[id]/page.tsx` — public detail view
- `app/listing/edit/page.tsx` — token-gated resolve flow
- `ios/project.yml` — XcodeGen spec; regenerate the `.xcodeproj` with `xcodegen generate` after changing this or adding new Swift files
- `ios/MissingPets/SupabaseClient.swift` — reads `SUPABASE_URL`/`SUPABASE_ANON_KEY` from process environment (set via Xcode scheme, not a plist)

## Conventions
- No server-side API routes — both clients (web, iOS) talk to Supabase directly.
- Listing mutations always go through the `update_listing` RPC, never a direct table update, since RLS blocks direct updates by design (token check lives in the function).
- This repo's Next.js version (16.2.9) has breaking changes from training-data Next.js — check `node_modules/next/dist/docs/` before assuming an API exists.

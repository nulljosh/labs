# Architecture

Doorstock helps a garage door repair business run day to day. It tracks parts on the shelf, job quotes, and customer leads, and lets customers book a job online. There is a public website for customers, a dashboard app for the office, and iOS/macOS apps for technicians out on a job. Everyone signs in through Supabase using Apple or Google.

## How it runs

**Web**: static HTML/CSS/JS site (`src/web/index.html`). Customer can browse services/service areas, fill a booking form which posts to Supabase `bcgd_leads` table. `build.js` generates one page per service and per service area from `data/services.json` and `data/areas.json`, sharing header/footer/CSS from `index.html`. A 404 page handles stale external links and also captures lead attempts.

**Dashboard**: React app (`src/dashboard/src/App.jsx`), localhost:5180 in dev, deployed separately. Authenticated technician/manager logs in with email+password (via Supabase AuthGate), sees parts inventory (localStorage-backed) and job history, can add/edit jobs and parts, export jobs as CSV, download/restore backup.

**iOS/macOS**: native SwiftUI apps (`src/ios/BCGD/`, `src/macos/Sources/`). Sign-in via Apple or Google, then access device-local inventory and job tracker. No cloud sync yet (jobs stay local to device).

## Web

| File | What it owns |
|---|---|
| `src/web/index.html` | Landing page, customer service/area picker, booking form, lead form, shared styles and layout |
| `src/web/404.html` | 404 page (also captures lead attempts), same layout as index.html |
| `src/web/privacy.html` | Privacy policy |
| `src/web/build.js` | Node script that generates one page per service/area from `data/services.json` and `data/areas.json`, writes sitemap.xml |
| `src/web/data.test.js` | Unit tests for data integrity (no duplicate slugs, all required fields present) |
| `src/web/sw.js` | Service worker, network-first for pages, cache-first for hashed assets |
| `src/web/data/services.json` | Service catalog: garage door repair, installation, maintenance, emergency |
| `src/web/data/areas.json` | Service area coverage: Langley, Aldergrove, Fort Langley, etc. |
| `portfolio-tokens.css` | Reference portfolio theme tokens (read-only, not used in build) |

## Dashboard (React admin panel)

| File | What it owns |
|---|---|
| `src/dashboard/index.html` | React root, app shell |
| `src/dashboard/vite.config.js` | Vite build config, dev port 5180 |
| `src/dashboard/src/main.jsx` | React entry point |
| `src/dashboard/src/App.jsx` | Main app state (parts, jobs, settings), job CSV export, lead import from Supabase |
| `src/dashboard/src/App.css` | All styling, Apple Liquid Glass theme (blue teal), light/dark modes |
| `src/dashboard/src/components/AuthGate.jsx` | Email+password sign-in form (replaces old PIN gate), Supabase auth + RLS |
| `src/dashboard/src/components/PartForm.jsx` | Add/edit parts (name, SKU, category, quantity, supplier, cost) |
| `src/dashboard/src/components/PartList.jsx` | Filterable parts inventory table |
| `src/dashboard/src/components/JobForm.jsx` | Add/edit jobs (client, phone, service, parts used, status, value, date) |
| `src/dashboard/src/components/JobList.jsx` | Filterable job list, color-coded by status (Lead/Quote/Scheduled/Complete/Paid) |
| `src/dashboard/src/components/HistoryLog.jsx` | Activity log showing timestamps and action types |
| `src/dashboard/src/components/Settings.jsx` | Change password, backup/restore (JSON export/import) |
| `src/dashboard/src/components/Logo.jsx` | Logo component |
| `src/dashboard/src/lib/storage.js` | localStorage CRUD for parts/jobs/history/settings, seed data, ID generation |
| `src/dashboard/src/lib/supabase.js` | Supabase client, fetch new leads from `bcgd_leads`, mark imported |

## iOS (Doorstock app)

| File | What it owns |
|---|---|
| `src/ios/BCGD/BCGDApp.swift` | App entry point, auth gate, biometric lock on resume, tab navigation |
| `src/ios/BCGD/Auth.swift` | Apple/Google sign-in, session persistence, account gate view |
| `src/ios/BCGD/Models.swift` | Decodable Part/Job types, Store (@Observable), color constants, device-local persistence |
| `src/ios/BCGD/Views.swift` | Dashboard (stats), Inventory (parts list/add/edit), Jobs (job list/add/edit), Settings |

## macOS (Doorstock app)

| File | What it owns |
|---|---|
| `src/macos/Sources/BCGDApp.swift` | App entry point, tab navigation (macOS sidebar), no auth gate (local-only builds assume auth already done) |
| `src/macos/Sources/Models.swift` | Same as iOS: Part/Job types, Store, colors, persistence |
| `src/macos/Sources/Views.swift` | Same as iOS: Dashboard, Inventory, Jobs, Settings views |

## Landing page

| File | What it owns |
|---|---|
| `src/landing/index.html` | Marketing landing for Doorstock app (iOS link, screenshots, tagline, features) |

## Data and backend

| File | What it owns |
|---|---|
| Supabase `bcgd_leads` table | Customer lead captures (name, phone, service, timestamp), RLS open for anon insert |
| Supabase auth | Apple and Google sign-in for technicians/managers (email+password alternative for dashboard) |

## Gotchas

**Web pages are generated**: `src/web/` does not contain individual service/area pages, they are generated by `build.js` from `data/` JSON. Hand-editing a generated page will be overwritten on next build. Edit `data/` instead, then re-run `build.js`.

**Dashboard is separate deployment**: the React app is not part of the main web build. Deploy with `cd src/dashboard && npm run build` or use a separate CI step.

**Auth differs by platform**: dashboard uses email+password (older approach, less secure), iOS/macOS use Apple/Google sign-in (native). Both hit the same Supabase `spark` project.

**No cloud sync for jobs/inventory**: iOS/macOS apps store jobs and parts locally (device UserDefaults only). No sync across devices yet (planned for later).

**Part inventory is demo-seeded**: on first run, dashboard shows sample parts. Editing them writes to localStorage only (no server). A future `bcgd_inventory` Supabase table can replace this.

**Lead capture is anonymous**: `bcgd_leads` table allows anon inserts (RLS does not require auth), so customers can submit booking forms without signing in.

**Biometric lock on iOS**: after closing and reopening the app, Face ID/Touch ID is prompted before accessing any data (LocalAuthentication + biometric flag in Auth.swift).

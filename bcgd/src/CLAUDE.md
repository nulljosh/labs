# BC Garage Doors (BCGD)
v3.0.0

Monorepo for BC Garage Doors -- customer-facing website, internal operations dashboard, and native companion apps.

## Structure
- `web/` -- Static HTML landing page + generated service/service-area pages. Live: bcgd.heyitsmejosh.com
- `dashboard/` -- Vite + React 19 operations dashboard. Inventory, jobs pipeline, website leads, Supabase auth, backup/restore. Live: bcgd-dashboard.heyitsmejosh.com
- `ios/` -- SwiftUI iPhone companion app (4 tabs, local persistence, builds + runs on sim)
- `macos/` -- (planned) SwiftUI macOS companion app

## Stack
- **web/**: Static HTML. `node build.js` regenerates the service/area pages + sitemap from `data/*.json`; `index.html` is hand-maintained and is the single source of styles/header/footer
- **dashboard/**: Vite + React 19, Supabase auth + leads, localStorage for parts/jobs, Animate.css, Apple Liquid Glass design

## Lead pipeline
Booking form (`web/index.html`) inserts into `bcgd_leads` on the shared `spark`
Supabase project (`tjsxsqlxjmanwvmywwvw`). RLS grants **anon INSERT only** -- the
publishable key in the page cannot read anything back. The dashboard signs in
(`shop@bcgaragedoors.ca`) and polls every 60s, turning new rows into `Lead` jobs
and flipping them to `Imported`.

## Features
- Inventory management (28 SKUs, 6 categories, +/- qty controls)
- Today view: today's scheduled jobs + the parts each needs
- Website leads auto-imported into the jobs pipeline
- Jobs carry a parts list, deducted from stock on Complete
- Low-stock alerts with reorder email (mailto)
- Browser notifications on stock threshold crossing
- Supabase email/password auth (replaced the old 4-digit PIN gate)
- Job pipeline tracker (Lead -> Quote -> Scheduled -> Complete -> Paid)
- Backup/restore (JSON export/import)
- Stock change history with audit trail
- CSV export
- Settings (alert email, PIN, backup)

## Deploy
Both sites are **Cloudflare Pages**, not Vercel. `bcgd.heyitsmejosh.com` and
`bcgd-dashboard.heyitsmejosh.com` are proxied CNAMEs to `bcgd.pages.dev` /
`bcgd-dashboard.pages.dev`. A `vercel --prod` here deploys to an orphaned
Vercel project that nothing points at -- it will look like it worked and change
nothing. Deploys off wrangler's cached OAuth session -- run `npx wrangler login` if it
has expired. There is no `CLOUDFLARE_API_TOKEN` in `~/.config/fish/secrets.fish`;
the only token there is `CLOUDFLARE_DNS_TOKEN`, which is deliberately DNS-scoped
and cannot deploy Pages.

```bash
# Landing page (regenerate sub-pages first if index.html or data/*.json changed)
cd web && node build.js
npx wrangler pages deploy . --project-name=bcgd --branch=main --commit-dirty=true

# Dashboard
cd dashboard && npm run build
npx wrangler pages deploy dist --project-name=bcgd-dashboard --branch=main --commit-dirty=true
```

## Dev
```bash
cd dashboard && npm install && npm run dev    # Vite on :5180
```

## Brand (matches the source site, bcgaragedoors.ca)
Every public page must match the client's real site. Verified against its Elementor
global palette 2026-08-28 -- do not substitute the personal portfolio look
(`portfolio-tokens.css` at the repo root is a reference for heyitsmejosh.com, NOT
for this client; applying it here is what made `web/support/index.html` drift onto
Inter + Newsreader, a serif, until it was fixed).

| Token | Value | Role |
|-------|-------|------|
| primary | `#1B5959` | header, links, h1 |
| secondary | `#134040` | h2, deep accent |
| text | `#3A3E40` | body copy |
| sage | `#8DA6A6` | muted accent |
| page bg | `#F2F2F2` | page background |

Fonts: **Barlow Condensed** (500/600/700) for headings, **Open Sans** (400/600/700)
for body. Both must be loaded via the Google Fonts link -- naming Open Sans in a
`font-family` without the `<link>` silently falls back to the system font.

## Rules
- No emojis
- No gradients or drop shadows
- Sans-serif only, never a serif face
- Spring physics on interactive elements: cubic-bezier(0.34, 1.56, 0.64, 1)
- Mobile-first, Apple Liquid Glass design system

## Roadmap

### iOS App (planned)
SwiftUI, iPhone 17 Pro target, iOS 17+. Four tabs:
- **Dashboard**: stats cards, low stock alerts, job stats (mirrors web)
- **Inventory**: part list with +/- qty controls, search, category filter
- **Jobs**: pipeline list with status badges, advance button, create/edit
- **Settings**: PIN, alert email, backup/restore

Data sync via shared API endpoint or standalone localStorage equivalent.
Located at `ios/` with xcodegen project.yml.

### macOS App (planned)
SwiftUI, macOS 14+. Same 4 tabs but sidebar navigation layout.
- Cmd+K search shortcut
- Native notifications for low stock alerts
- Keyboard shortcuts matching web (Alt+1-5 nav)

Located at `macos/` with xcodegen project.yml.

### Future
- Quick-quote calculator (door size + spring type + labor = estimate)
- Customer service history (name, address, work done, when)
- Estimate funnel engine (CTA tracking)
- Missed-call recovery autopilot

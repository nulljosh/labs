# Codebase Notes (~/Documents/Code)

*Last updated: 2026-08-11 Tuesday night wrap — Newsline v1.0.0 iOS and macOS reader apps built (SwiftUI, xcodegen, shared source tree for iPhone/iPad + Mac, NavigationSplitView for Stories/Latest/Saved, offline JSON cache, no account/analytics/SDKs, 5 unit tests, bundle ID com.nulljosh.newsline Universal Purchase, landing page + privacy policy deployed, pre-submit checklist queued, deferred App Store to 2026-08-18 due to 5.6 freeze). Earlier: Cloudflare bot protection research: single zone architecture (heyitsmejosh.com), recommended WAF rate-limiting rule (blocked on Joshua applying it). Prior session: Epiphany marketing-site screenshots refreshed with real account data; fastlane pipeline fixed; two pipeline bugs fixed (Snapfile -skipPackagePluginValidation, PreviewScreenshot triple-launch). Prior 2026-08-10 Monday late night wrap — System/package updates only. Earlier session (2026-08-09 Sunday): Newsline v0.3.0 API + MCP shipped, Cadence recovered + Pages Functions, Lexly forgot-password, Nimble Pages, ASC-login keychain fix.*

## 🛑 APP STORE SUBMISSION FREEZE — until 2026-08-18

**Do not submit ANY app for App Store review until Aug 18, 2026.** No `asc review
submissions-submit`, no `asc workflow run ship-ios`, no dashboard submits — on *any* app,
including healthy ones. This overrides the standing auto-submit-on-version-bump rule.

Reason: four apps are under a **Guideline 5.6 Developer Code of Conduct review suspension**
(Curvely 6794988370, Transcriptly/Echo-Mac-orphan 6783015101, Wiretext 6794988951,
NYC Survive 6782618198). Apple's letter states the apps are not eligible for resubmission
before Aug 18, and that *"continued submissions of apps that violate the App Review
Guidelines, including submitting new apps with the same or similar issues, will be treated
as a violation of the Apple Developer Program License Agreement and may result in removal
from the Apple Developer Program."* That is account-level risk across all 17 apps.

Still allowed during the freeze: local fixes, commits, pushes, web deploys, and TestFlight
builds (TestFlight is not App Store review). Full detail + all rejection reasons:
`wiki/pages/ship-plan.md` § "Guideline 5.6 suspension (2026-08-10)".

## Environment
- macOS Darwin 25.5.0 (arm64), Mac Mini M4
- Python 3.14.3 · Node.js v24.13.1 · xcodegen `/opt/homebrew/bin/xcodegen`
- ASC CLI + 20+ skills installed — use instead of App Store Connect dashboard

## Active Repos

### Products & Apps
| Repo | Description | Status |
|------|-------------|--------|
| **epiphany** | Finance dashboard. `epiphany.heyitsmejosh.com` | v2.6.1+ live + App Store (id6779522175). Commodity/crypto enrichment + Yelp reviews + Pro gating shipped. Web landing page hero restyled 2026-07-28 (Wealthsimple-inspired navbar pill, animated SVG map, CTA). App icon redesigned 2026-07-29 (lime-green #8fe86a network on dark #111814, higher contrast, all PNG sizes regenerated). Marketing-site screenshots refreshed 2026-08-10 with real account data ($162.37, holdings, spending chart) instead of stale empty state; fastlane pipeline fixed to use .env.accounts.local credentials instead of demo account. |
| **healstack** (was dose; folder + GitHub repo now `healstack`) | Health/supplement tracker. `healstack.heyitsmejosh.com` | v1.0 REJECTED (2026-07-27). Vercel→Cloudflare Pages migration complete 2026-08-06: wrangler.toml cleared of Vercel-only settings, serverless functions ported (functions/api/stripe.js/stripe-webhook.js/sync.js), Pages project created, DNS CNAME flipped, landing page restyled to Lexly design system. Stripe CSV export unlock verified live. Dead code removed 2026-08-10 (three dead hooks/pages). |
| **sparkjar** (was spark, renamed 2026-07-18) | Idea forum, JWT auth. `sparkjar.heyitsmejosh.com` | v2.2.0 live. iOS + Mac provisioning profiles created 2026-08-10 (CY2V3B846P + H9YQZ34MV5, both ACTIVE). Bundle-ID rename (com.heyitsmejosh.spark → sparkjar) still pending. Email verification + optional signup confirmation shipped (requires SMTP/Resend env var on Vercel to send). Vercel function slots: 8/12 used. |
| **talli** | DTC/RDSP/CDB admin tool (renamed from tally 2026-06-22) | iOS v3.5.12 SHIPPED 2026-07-28 (message parser consolidated from 4 root causes, date formatting, actionRequired badge, build 202607281630). v3.5.11 submitted 07-27 cleared (live/eligible for distribution). Web restyled: white backgrounds + system fonts (SF Pro/Helvetica, no webfonts). Mac widget-fix build VALID (8b29a831, on iOS app 6782366555) ready to attach after App Store distribution window completes |
| **lexly** (was lingo/parlay) | Gamified language learning. GitHub: nulljosh/lexly | iOS v1.1.3 READY_FOR_DISTRIBUTION/shipped, macOS v1.1.1 REJECTED (2026-08-04, see lexly/roadmap.md — leading hypothesis is the demo-account sign-in). Pro un-paywalled, courses free. 2026-08-06: Integrated 15 masterclass summaries from Uprighty (ML, Pre-Calc, Data Science, Accounting, IBS, Sobriety, Statistics, Good Feng Shui, etc.) via converter script; infinite-loop bug fixed (h3 headings were unhandled), all 15 deployed live. 2026-08-09: Added forgot-password reset flow to auth. |
| **voxprint** (was echo; folder + GitHub repo renamed 2026-07-29) | On-device speech transcription (WhisperKit). No cloud. App Store rejected "Echo" — renamed to Voxprint 2026-07-29 (tested ~25 names via ASC API). | Confirmed one app (6782604262, Universal Purchase) already serves iOS+macOS — no separate Mac project needed. macOS v1.3.6 LIVE (shipped 2026-08-06 after Apple approval on Aug 3 build). iOS v1.3.6 still WAITING_FOR_REVIEW (submitted 2026-08-03). App Store marketingUrl updated to voxprint.heyitsmejosh.com. Local folder `~/Documents/Code/voxprint`, GitHub repo `nulljosh/voxprint`. Orphan "Echo Transcribe Mac" (6783015101) flagged for Apple Support deletion. IAP hardcoded unlocked (`isPro = true`) for v1, re-enable for v2 after Paid Apps Agreement setup |
| **litigate** (folder renamed from brief 2026-07-19) | Litigation tool (Trommel v. AG Canada + Trommel v. Trommel). Private | iOS 1.0.1 + 1.0.2 both READY_FOR_SALE/live. P0 SECURITY FIX 2026-07-28: web case prose moved from HTML to Supabase RLS, auth.js gates web access, verified secure. CASE-0004 wired into iOS/macOS (Vancouver parking dispute, not Joshua's — closed). Anon bypass closed (scrape_token revoked). CanLII case-law search merged in iOS as a tab. Bundle ID remains com.nulljosh.brief (Apple-locked). Web (litigate.heyitsmejosh.com) on Cloudflare Pages. No macOS ASC record yet. 2026-08-06: Added light mode support (default via `prefers-color-scheme`, manual override via tweaks panel), designed minimalist gavel SVG icon for PWA manifest + favicon (works in both themes), fixed stale sign-in screen text that still said "Brief" instead of "Litigate" (iOS + macOS) |
| **life** | Therapy doc for Amanda. 32 sections, 21 SVG charts. Private | ARCHIVED 2026-07-28 — taken offline (personal timeline with sensitive content was ranking on Google). Backup: ~/Documents/life-site-backup.html. DNS record cleanup pending |
| **nimble** | macOS menu bar app + web instant-answer search | v1.0.0 shipped 2026-07-29 (web app redesigned from tiny centered box to full viewport, icon/architecture refreshed, README trimmed, docs/CNAME removed, tagged v1.0.0, GitHub release with signed macOS zip). Web restyled 2026-08-02 to Maybulb design system (yellow section dividers, Avenir Next font, flat square buttons); splash screen added. 2026-08-09: Web migrated from Vercel to Cloudflare Pages, answer-proxy payload key bug fixed. Bundle IDs registered 2026-07-29 (com.nulljosh.nimble macOS, com.nulljosh.nimble.ios iOS), ASC app record creation blocked on UI automation (Primary Language Ember Power Select widget silently no-ops), no App Store presence yet. Domain upgrade to nimbleapp.com pending user purchase (few weeks) |
| **nyc** | Times Square city sim | Active |
| **bookrank** (was `books`→`spine`→`uprighty`→`bookrank`; local folder still `~/Documents/Code/uprighty`, not renamed) | Book summaries site. `bookrank.heyitsmejosh.com` | Renamed 2026-08-07: Uprighty rejected as ASC duplicate, "Bookrank" landed after Shelved/Stacked/Booknook/Bookline/Litshelf were taken. GitHub repo renamed `nulljosh/uprighty`→`nulljosh/bookrank`, domain moved (old `spine.heyitsmejosh.com` CNAME deleted from Cloudflare), GitHub Pages custom-domain setting + iOS/macOS display names + metadata all updated. Portfolio link fixed too. Site live with 16 complete book summaries: ML + Pre-Calc + Steve Jobs + Calculus + IBS + Sobriety + Statistics + Good Feng Shui + The Optimist (ch. 1-10, 2026-08-11), plus AI Business/Accounting/macOS Tahoe/Data Science all complete. Privacy policy page live. iOS v1.0 + macOS v1.0 both WAITING_FOR_REVIEW (synced summaries bundled as resources). |
| **newsline** | RSS news reader + API dependency (16 sources). `news.heyitsmejosh.com` | **v1.0.0 iOS and macOS apps built 2026-08-11**: SwiftUI, xcodegen, shared source tree for Newsline-iOS (iPhone/iPad) and Newsline-macOS, bundle ID com.nulljosh.newsline (Universal Purchase). NavigationSplitView with Stories (bias bars, blindspot flags), Latest feed, Saved stories. Offline JSON cache in Caches. No account, no analytics, no third-party SDKs. 5 unit tests pass. Public `/app` landing page and `/privacy` policy deployed. App icons generated from icon.svg. Deliberately deferred App Store submission to 2026-08-18 (5.6 freeze); pre-submit checklist queued. **v0.3.0 live (2026-08-09)**: API/MCP server, query-param filtering, cache bugs fixed, feed parser fixed (Atom + entity decoding). 5 dead feeds pruned; CNN dropped + WSJ host fixed 2026-08-13, 16 outlets verified by `npm run feeds`. MCP published to official registry (io.github.nulljosh/newsline). Earlier: Hacker News 2026-07-19, Vancouver Sun + Province 2026-07-29. |
| **bcgd** | Garage-door dashboard. `bcgd.heyitsmejosh.com` | Web + dashboard live on Cloudflare Pages. Leads pipeline built (Supabase anon INSERT, was discarding via alert). 11 service pages + 12 area pages generated, real URL structure. Track repair page added 2026-08-02 (merge doc now complete: hero form, pricing, stats, founder photo, all service pages shipped). Dashboard: Supabase auth, Today view, inventory deductions. macOS target scaffolded 2026-07-29 (xcodegen, same bundle ID). v1.0 macOS first ASC build VALID 2026-07-29 (icon set sizes generated via sips, manifest rewritten). iOS app ready to submit |
| **curvely** (formerly grapher; id6794988370) | Mathematics equation grapher. `grapher.heyitsmejosh.com`, GitHub repo renamed 2026-07-29 | v1.1.0 SUBMITTED 2026-08-03 (build 202608031005, submission 108e1f88 WAITING_FOR_REVIEW). Fixed in-app branding from Grapher to Curvely (header/title/CFBundleDisplayName). Privacy policy page deployed to Cloudflare. iPad+iPhone 6.5" screenshots re-shot with correct branding. App Privacy published (DATA_NOT_COLLECTED) |
| **fengshui** | Fengshui reading app, recreated from scratch after original was lost. `fengshui.heyitsmejosh.com` | Web reader (chapter TOC, same viewer pattern as uprighty) + native SwiftUI iOS chapter browser, content from uprighty's Good Fengshui summary. Migrated from Vercel to Cloudflare Pages 2026-08-09, GitHub repo `nulljosh/fengshui`, iOS build verified 2026-08-01. No ASC app record yet |
| **cadence** | Time-tracking dashboard. `cadence.heyitsmejosh.com` | Recovered 2026-08-09 from Vercel deployment backup (originally deleted 2026-06-22, was running on Vercel untracked). SwiftUI iOS/macOS app included. API ported to Cloudflare Pages Functions (stats + heatmap endpoints verified 200, projects endpoint still debugging). Remaining steps: DNS flip (currently still pointing to Vercel), full API migration. GitHub repo `nulljosh/cadence` |
| **canlii-app**, **agent-101** | Experimental, local only | Not standalone GitHub repos |

### Infrastructure & Config
| Repo | Description |
|------|-------------|
| **dotfiles** | Shell configs, api-gateway, kv-store, search-engine, applescripts/, vibe ref |
| **labs** (`nulljosh/labs`) | **`~/Documents/Code` itself is this repo** (`origin = nulljosh/labs.git`) — there is no `labs/` subfolder. Its tracked contents are the experiment dirs at top level: roost, missing-pets, canlii-app, byo-*, capu, quotable, code-meta, video-speed-ext, abraham, bank, braingraph. Every product repo (epiphany, talli, wiretext, curvely, …) is a nested repo with its own remote, ignored by `.gitignore`'s leading `/*`. A stale second clone of labs.git lived at `Code/labs/` until 2026-08-12 — deleted (0 unique commits, 95 behind, ~1GB); do not recreate it. wiretext/curvely moved to their own repos 2026-07-04 |
| **inkpress** | Multi-feed RSS/Atom reader, iOS only (ASC 6787759999). Split from `journal` repo 2026-07-21 — no shared code, subscribes to journal's feed.xml as a regular feed by default. v1.0.3 WAITING_FOR_REVIEW (submitted 2026-08-09, icon redesign + loading indicator + screenshot refresh + icon alpha flatten + encryption compliance). Landing page live at inkpress.heyitsmejosh.com via Cloudflare Pages (DNS CNAME verified live). |
| **journal** | Jekyll blog. `journal.heyitsmejosh.com`. Split out of `inkpress` repo 2026-07-21 (was combined 2026-07-20 to 2026-07-21) — this repo is blog-only now. Migrated from Vercel to Cloudflare Pages 2026-08-09 (was returning 404 on Vercel; flip fixed the outage). Deploy target corrected 2026-08-11: the live domain is on the `journal-heyitsmejosh` Pages project, not the domain-less `journal` project deploy.sh had been targeting, so entries after Aug 6 were never actually publishing |
| **nulljosh.github.io** | Portfolio. `heyitsmejosh.com` |

## GitHub Repos (verified via `gh repo list` 2026-07-19, echo→voxprint complete 2026-07-29)
`abraham bank bcgd braingraph dotfiles voxprint epiphany etyma curvely healstack inkpress journal labs lexly litigate newsline nimble notes nulljosh.github.io nyc quotable sparkjar bookrank talli video-speed-ext wiretext`
`books`→spine→uprighty→bookrank, `grapher`→curvely, `echo`→voxprint (completed 2026-07-29), and `root`→etyma folders were renamed to match their repo names (spine→uprighty→bookrank, grapher→curvely, and echo→voxprint). Local folder for bookrank still lags at `~/Documents/Code/uprighty` (deliberately not renamed this round). `journal` (the folder) was briefly merged into `inkpress` 2026-07-20 then split back out into its own `journal` repo 2026-07-21 once Inkpress became a real RSS-reader product — `inkpress` and `journal` are now two unrelated repos again. `life` and `canlii-app` are local-only. `braingraph` repo is retired (merged into notes) — candidate for archival.

## Gone (do not reference)
- **`nulljosh/code-meta`**: repo no longer exists standalone — folded into `nulljosh/labs` as a `code-meta/` subfolder. 2026-08-12 correction: the old note here claimed a separate checkout still pointing at the dead `code-meta.git` — untrue. `~/Documents/Code` is the labs checkout, `code-meta/` is a plain tracked subfolder of it with no `.git` of its own, so it commits and pushes with everything else. The 2026-07-29 throwaway-clone sync workaround is obsolete; edit `code-meta/` in place.
- **Intentionally removed**: systems, beep, beep-web, missing-pets (top-level copy)
- **Accidentally deleted 2026-06-22** (recovered/resolved): bcgd (recovered 2026-07-29), cadence (recovered 2026-08-09, now on Cloudflare Pages), charters (intentionally deleted), nimble-web (orphan from monorepo split)
- **Merged**: school → lingo → parlay → renamed lexly (2026-07-01)
- **Vercel orphans deleted 2026-06-29**: fuse, pulse, _site, beep-web, school

## Automation
- No background daemons. `~/.local/bin` has only: `claude sync uv uvx asc-login`
- `asc-login` (built 2026-08-03): one-command daily App Store Connect web relogin. Checks `asc web auth status` first (session often still valid). Only prompts for 2FA code if actually expired. Apple ID + password read from Keychain (`asc-web-appleid`/`asc-web-password`).
- **weekly-journal** routine: `trig_017xPBtriJVF1HkRCnx4dkTa` — verify path before relying on it

## Stack Conventions
- **Screenshots/UI automation**: never create throwaway/demo accounts for App Store screenshots or UI testing — check that app's `.env`/`.env.local` (gitignored) for real credentials first and sign in with those.
- **Auth**: Supabase email+password (not magic link unless a repo says otherwise). Most apps share the `spark` Supabase project (see Shared Supabase backend below) — check `SUPABASE_URL`/anon key in that app's project.yml/Info.plist before assuming a dedicated project. iOS/macOS: Supabase Swift SDK via SPM package, sign-in state in an `@Observable` Store. Sign in with Apple needs both an Apple Developer Services key AND the provider enabled in Supabase's dashboard (Auth → Providers) — app-side code alone is not enough (see litigate's unresolved Apple sign-in item).
- **Web hosting/deploy**: Cloudflare Pages primary (migrated: litigate, lexly, bcgd, healstack, wiretext, curvely, voxprint, fengshui, nimble, journal, inkpress). Direct-upload via `wrangler pages deploy` (not git-connected, to avoid staleness). Remaining 5 on Vercel (epiphany, sparkjar, talli, missing-pets, cadence) need serverless function ports (Node handlers → Pages Functions). Env vars on Cloudflare via `wrangler pages secret put` + `[vars]` section in wrangler.toml.
- **Domains/DNS**: Cloudflare. Use the `CLOUDFLARE_DNS_TOKEN` from `~/.config/fish/secrets.fish` as the bearer for direct API/curl DNS changes (`curl -H "Authorization: Bearer $CLOUDFLARE_DNS_TOKEN" ...`) — don't make Joshua click through the dashboard. (Note: it's deliberately NOT named `CLOUDFLARE_API_TOKEN` — that name makes wrangler skip OAuth and fail for lacking Workers scope.)
- **iOS/macOS build system**: xcodegen (`project.yml`), no checked-in `.xcodeproj`. SwiftUI, iOS 17+/macOS 14+, `@Observable`/`@Bindable`. Build via `asc xcode archive`/`export` (see `asc-xcode-build` skill) over raw xcodebuild recipes when possible.
- **Lint**: SwiftLint as an SPM build-tool plugin where wired (see Roadmap) — requires `-skipPackagePluginValidation` on any CLI `xcodebuild` invocation, since headless builds can't grant the plugin's interactive trust prompt.
- **App Store Connect**: `asc` CLI + skills, never the ASC web dashboard for anything scriptable.
- **No emojis** in any UI, anywhere, across every app — standing rule, not per-repo.
- **No background automation** — no crontab/daemons beyond the 5 binaries in `~/.local/bin` (`claude`, `sync`, `uv`, `uvx`, `asc-login`).

## Repo Standards
- Every repo needs: `icon.svg`, `architecture.svg`, `README.md` (icon + version badge at top), `CLAUDE.md`
- READMEs: `<img src="icon.svg" width="80">` → `# Name` → version badge
- No `AGENTS.md` files. No "Build Your Own X" titles
- Icons: 200×200, dark terminal aesthetic, inline styles only
- Architecture SVGs: Apple node-and-line style, white bg, inline styles
- License: MIT 2026, Joshua Trommel
- `tests.yml`: only add after running tests locally
- `deploy.yml` for Pages: Settings → Pages → Source: GitHub Actions

## External Repos (_external/, read-only, do not push)
- **siftly** — Twitter/X bookmark organizer. Next.js + Prisma + SQLite
- **openplanter** — Recursive LLM research agent. Tauri 2 + Python
- **autoresearch-macos** — Karpathy autonomous research agent. Python
- **cashclaw** — Autonomous work agent for Moltlaunch. Node.js
- **mole** (`tw93/mole`) — Mac deep clean CLI. Go
- **shannon** (`KeygraphHQ/shannon`) — AI pentester for web apps. 
- **arthur** — Nano transformer LLM. Local only
- **bots** — Archived 2026-04-30. (fony, food, middleware, weedbot)

*On disk in `_external/`: `archived/`, `mole/`, `shannon/` — others may have been pruned.*

## Credentials
- **Cloudflare DNS token**: `CLOUDFLARE_DNS_TOKEN` in `~/.config/fish/secrets.fish` (old `~/.openclaw/...cloudflare.env` path is gone)
- **Upstash Redis** (epiphany): rotation pending — email auth failed. Fix: `security add-generic-password -s rotate-upstash-email -a email -w YOUR_EMAIL -U` then `/rotate upstash epiphany`

## Ship Status — VERIFIED against `asc versions list` 2026-08-12

Do not edit this section from memory. Re-verify with `asc versions list --app <id>` (public
API, no 2FA) before trusting or changing any line — on 2026-08-12 nearly every entry here was
wrong, including four apps recorded as "waiting for review" that were actually REJECTED.

**LIVE (READY_FOR_SALE)** — epiphany (iOS 2.5.4 + macOS 2.5.2), voxprint (iOS + macOS 1.3.6),
talli (iOS 3.5.12 + macOS 3.5.6), inkpress (iOS 1.0.3), lexly (iOS 1.1.3), litigate (iOS 1.0.2),
bookrank (macOS 1.0).

**WAITING_FOR_REVIEW** — bookrank (iOS 1.0).

**PREPARE_FOR_SUBMISSION** — wordroot (iOS + macOS 1.0), bcgd (iOS + macOS 1.0; the ASC record
*does* exist, id 6791106082).

**REJECTED — 8 apps, reasons unread** (Resolution Center only, needs `asc-login`): curvely
(iOS 1.1.0), healstack (iOS 2.3.4), lexly Mac (1.1.1 — both records 6783501611 + 6783501927),
nyc (iOS 1.0.0 + macOS 1.0), nullfolio (iOS 1.0 — track closed 08-11, Guideline 4.2), sparkjar
(iOS + macOS 1.0), transcriptly (macOS 9.9.9), wiretext (iOS 1.0).

**All submissions frozen until 2026-08-18** (Guideline 5.6 review). Build and stage only — no
`asc review submit`. Web: portfolio, journal (Jekyll, Cloudflare) live. life: ARCHIVED 07-28.

## Roadmap
- **Payments infra** (from Asc.pdf note, imported 2026-07-19): hook up an RBC bank account and get Stripe working across any/all apps — needs Stripe reauthorization (and possibly a CLI). Not started; requires interactive/credentialed setup, flag before executing.
- **Stripe + social-auth rollout across all shipped apps** (2026-08-03): epiphany done ($1 one-time, gates Autopilot/Daily Brief/People graph). Gap audit: only epiphany+lexly have any GitHub/Google/Facebook auth wiring, none have Apple/Google/Facebook fully live. Two separate blockers found:
  1. **Stripe**: mechanically easy (same live Stripe account, same $1 one-time pattern) but most apps have **no defined premium feature to gate**. Decided per-app gates and shipped 2 of 3 planned:
     - **healstack**: DONE — $1 unlocks CSV export (`api/stripe.js`, `api/stripe-webhook.js`, `src/hooks/usePro.js`, gated in `src/pages/Journal.jsx`). Verified live: checkout returns a real session URL, webhook rejects unsigned requests.
     - **sparkjar**: DONE — implements the "Spark Pro" spec already written in `sparkjar/CLAUDE.md` (unlimited posts, skips the 10-posts/60s rate limit in `api/posts.js`; 24h pinned visibility via new `posts.pinned_until` column, sorted first in the feed). `users.is_pro` + `posts.pinned_until` columns added to the shared spark Supabase project. Verified live after a manual `vercel --prod` deploy — **found sparkjar's git-push auto-deploy isn't firing** (6-day-old deployments were still live minutes after `git push`; had to deploy manually). Worth checking the GitHub↔Vercel integration for this project specifically.
     - **talli**: DONE — gate scoped down from the original "+ PDF export" idea once exploration found no PDF/export library exists in the codebase (would've been inventing a feature to gate, the exact mistake avoided on healstack/sparkjar). Ships $1 unlocking the full payment history view (YTD total + recent-payments bar chart in `HomeTab`, `web/unified.html`) — free view keeps just the monthly amount. New `GET/POST /api/stripe-status`/`stripe-checkout` routes in `src/api.js`; webhook mounted with `express.raw()` *before* the global `express.json()` (talli's Express monolith needs the raw body for signature verification, ordering matters). Entitlement stored via talli's existing per-user Blob helpers (`loadUserBlob`/`saveUserBlob`), keyed by session `userId` since talli has no separate account system. Talli auto-deploys via GitHub Actions (not Vercel Git integration like sparkjar), so should be more reliable — verify next session that the deploy actually went out.
     - lexly/nimble/curvely/inkpress/uprighty/fengshui/litigate/bcgd/voxprint: no natural fit, not touched (see full reasoning in session — voxprint already has a dormant native StoreKit paywall, litigate/bcgd aren't public products, the rest have no backend/accounts to hang an entitlement on). newsline has a real candidate (bias/clustering view) but runs on a Cloudflare Worker, not Vercel serverless — needs its own integration shape, flagged as a follow-up.
  2. **Apple/Facebook/Google OAuth**: registrations themselves are a hard wall, not code — needs one-time interactive developer-console app registration per provider (Google Cloud Console, Meta for Developers, Apple Developer/Sign In with Apple key). Still blocked on Joshua doing the 3 registrations. What *was* done: audited which apps could cheaply add provider buttons ahead of time. Only **healstack** uses Supabase Auth's `signInWithOAuth()` (the "register once in Supabase, every app gets it" shortcut) — added Google/Apple/Facebook buttons there (`src/pages/Auth.jsx`) alongside the existing GitHub one; they'll error until Joshua registers each provider, which is expected. Checked lexly and epiphany too — **neither uses Supabase Auth's OAuth**, so they don't get this shortcut; not touched. **Sparkjar's GitHub sign-in is a fully hand-rolled OAuth dance** (`api/_lib/auth/github.js` + `github-callback.js`, own JWT, no Supabase Auth involved) — replicating that per provider is a real multi-hour build per provider, not a cheap flip; deliberately not attempted, flagged as its own future task if wanted.
     - **2026-08-03 later**: also found **epiphany already has fully-built, hand-rolled Google + Facebook OAuth server code** (`server/api/auth.js:202-268` Google, `:270-329` Facebook) — complete authorize/callback/token-exchange flows just waiting on real credentials (`GOOGLE_CLIENT_ID`/`SECRET` present but empty in `.env.tui.local`, `FACEBOOK_CLIENT_ID`/`SECRET` not set at all). Epiphany's native iOS Apple Sign-In is separate and already shipped — not part of this web-OAuth work. Attempted to register the actual Google/Facebook/Apple apps via Claude in Chrome browser automation — **Chrome extension wasn't connecting** ("extension not connected" even after reinstall/restart attempts, despite having worked minutes earlier in the same session). Shelved, not a code blocker — retry `claude-in-chrome` connection next session, or Joshua registers manually. Full step-by-step plan (redirect URIs for both epiphany's own callback and Supabase's shared callback so one registration covers both apps, Apple's likely domain-verification dead end) is preserved for reuse whenever this is picked back up.
- **ASC merge/rename pass** (from Asc/Icons.pdf + Itinerary.pdf notes, imported 2026-07-19): duplicates the existing deferred plan at `~/.claude/plans/proud-popping-floyd.md` (Echo iOS/macOS merge, then Inkpress rejection fix, Spinelist rename+icon, Lexly Mac retirement, Litigate icon badge, Nullfolio icon spacing) — that plan is intentionally queued for a fresh-usage-headroom session (heavy Xcode archives involved), not re-run here.
- **DNS cleanup 2026-07-18**: removed 3 confirmed-stale Cloudflare CNAMEs from past renames (tally→talli, lingo→lexly, beep — app removed). Resolved 2026-07-19: `brief.heyitsmejosh.com` → confirmed renamed to `litigate.heyitsmejosh.com` (new domain set up via Cloudflare API in the Litigate rename wrap). Resolved 2026-07-27: both `bcgd.heyitsmejosh.com` and `bcgd-dashboard.heyitsmejosh.com` are Cloudflare Pages (web + dashboard repos). `vercel --prod` on Cloudflare Pages silently reports success but ships nothing — gotcha for any similar projects hosted on Pages. Resolved 2026-07-28: `brief.heyitsmejosh.com` and `charters.heyitsmejosh.com` stale Vercel CNAMEs deleted (dead, superseded by renames). Still ambiguous: `vxgd.heyitsmejosh.com` (purpose unclear — check before touching). `etyma.heyitsmejosh.com` resolved: serves Wordroot dictionary app (renamed 2026-08-11, Pages project still named `etyma` — kept for backward compat, can't rename).
- **swiftui-pro audit** (2026-07-18): installed twostraws/swiftui-agent-skill, ran read-only review across 18 apps (~78 findings, full report was in session scratchpad — not persisted). canlii-app's broken error alert (`.constant()` binding) fixed + build-verified, but push failed (`nulljosh/canlii-app` remote missing on GitHub — check if renamed/private before re-pushing). Ranked next: **healstack** (3 manual-`Binding(get:set:)` data-flow bugs in Lab Results/Settings/Log views), **litigate** (biometric-lock Unlock button invisible to VoiceOver), then a shared **epiphany/talli/sparkjar** cleanup pass (C-style `String(format:)` → FormatStyle, hard-coded fonts ignoring Dynamic Type, deprecated haptics APIs). Fix pattern: edit → `xcodegen generate` → `xcodebuild ... -skipPackagePluginValidation` → commit → push, one app at a time (see nimble's 2026-07-18 commit as precedent).
- **canlii → litigate merge**: DONE 2026-07-19 — CanLII case-law search merged into litigate/ios as a "Case Law" tab (`ios/Sources/CaseLaw/`), build-verified. canlii-app kept standalone but frozen (no further polish).
- **RevenueCat** (2026-07-18, found via research): worth evaluating for any app that gates features behind Apple IAP (Stripe alone can't unlock in-app features per App Review rules). Free under $2.5k MTR. Not yet integrated anywhere — needs a RevenueCat dashboard account (browser signup, confirm before opening Chrome) + StoreKit config + entitlement sync. Scope for Epiphany first.
- **SwiftLint** (2026-07-18): Epiphany + Talli lint at build time via SPM build-tool plugin, build-verified (`-skipPackagePluginValidation` required on xcodebuild — see each app's ios/CLAUDE.md Run section). **sparkjar, lexly, healstack, litigate got the same `project.yml`/`.swiftlint.yml` wiring committed but NOT build-verified** (session ended before running `xcodegen generate` + a full xcodebuild pass on each) — verify each builds clean with `-skipPackagePluginValidation` before relying on it; if a build fails, the fallback is reverting `packages:`/`buildToolPlugins:` in that app's project.yml (same revert epiphany needed on the first attempt). journal/inkpress not touched at all — no packages: block exists there yet.
- **Periphery** (2026-07-18): installed via brew (`periphery`, `swiftlint`), not yet configured per-app or wired into a skill. Run manually (`periphery scan`) when doing a cleanup pass — no CI wiring per no-background-automation rule.
- **Progress snapshot 2026-07-02**: ~67 open items ≈ 155h ≈ 4–6 wks — full table in `PROGRESS.md`, refresh with `/progress`
- **healstack**: rejection reason IS known (2.1(a) "unable to log in") and FIXED — version row is 2.3.4 `PREPARE_FOR_SUBMISSION`, build `202608121022` VALID. Only blocker is the dashboard-only stuck submission `2636ad65` in `UNRESOLVED_ISSUES` (needs `asc-login` + 2FA). The "waiting for rejection reason" framing was stale.
- **The three "broken sign-in" rejections had three unrelated causes, not one** (verified 2026-08-14; the shared-root-cause note in each roadmap is wrong). sparkjar = dead `spark.heyitsmejosh.com` baseURL, rebuilt 08-12. healstack = missing Supabase Info.plist config + `fatalError`, built 08-12. lexly macOS = silent-nil session read in `AuthStore.signIn`, fixed 08-13 but **never built until 2026-08-14** (build `202608141030`, version unified to 1.1.3). All three now staged; none submitted.
- **sparkjar**: provisioning ACTIVE (08-10, CY2V3B846P + H9YQZ34MV5); left: bundle-ID rename (com.heyitsmejosh.spark → sparkjar) + App Store submissions
- **voxprint** (renamed from echo 2026-07-29): v1.3.6 drafted with app rename; folder + GitHub repo renamed; workflow needs re-run to complete archive/export/upload
- **epiphany**: Verify force-sync after SnapTrade fix
- **nyc**: signing cert blocker was stale — valid "iPhone Distribution: Joshua Trommel (QMM486NPYC)" identity + private key already in local Keychain (cert expires 2027-07-03). Real remaining blocker per `nyc/CLAUDE.md`: 3 ASC-web-UI-only items (App Privacy answers, privacy policy URL, iPad 12.9" screenshot) before `asc review submit`
- **cadence**: RECOVERED 2026-08-09 (source restored from Vercel deployment, migrated to Cloudflare Pages Functions, stats + heatmap working)
- **bcgd/charters**: Recover from Vercel deployment + any backup source
- **Supabase**: At 2/2 free-tier limit (spark + epiphany). Epiphany auto-pauses if inactive 7+ days. Reuse spark DB for new projects until Pro
- **Trakt skill** (2026-08-01): stdlib-only Python client built (scripts/trakt_client.py, ~/.claude/skills/trakt/SKILL.md) with OAuth device code flow, covers search, watchlist, history, ratings. Blocked on user registering app at trakt.tv/oauth/applications and setting TRAKT_CLIENT_ID/TRAKT_CLIENT_SECRET env vars.

## Security Rotation Log
| Date | Rotated |
|------|---------|
| 2026-05-02 | Stripe sk + pk, Resend, Supabase anon + service role |
| 2026-05-09 | Spark JWT_SECRET |
| 2026-05-14 | Stripe sk (new), STRIPE_WEBHOOK_SECRET (`we_1TXF3e…`), FRED_API_KEY |
| done | Trakt API key |
| pending | Upstash Redis (see Credentials above) |

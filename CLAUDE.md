# Codebase Notes (~/Documents/Code)

*Last updated: 2026-08-25 Tuesday evening — Epiphany landing page hero redesign shipped (live map component in background, inert before login, camera eases on auth). Journal wrap posted with usage.sh enhancement (human-readable reset times in local timezone). Inkpress 1.0.5 in review (date parser fix, 16 feeds). 9 apps WAITING_FOR_REVIEW, 0 rejected, 9 live.*

## App Store status — 2026-08-25

The 5.6 date freeze expired 2026-08-18 and **Curvely 1.2.1 and Wiretext 1.1.0 both cleared review
and are live.** The blanket "submit nothing" rule is fully lifted; the apps it was written about
shipped. See the Ship Status section below for the verified board — nine records are in the queue
and no shipping app is rejected.

**Live gotcha worth knowing before any book/text app is submitted:** Apple rejects apps with book
or magazine content that are listed for sale in **China mainland** unless you supply a Chinese
Internet Publishing License (网络出版服务许可证). It arrives as a vague **Guideline 2.1 –
Information Needed** and says nothing about territories. It cost Lexly macOS two wasted code-fix
rounds before the reason was read. The fix is to drop the territory, not chase the permit:
`asc pricing availability edit --app <id> --territory "CHN" --available false`. bookrank, wordroot,
quotestreak and inkpress are all still listed in China; bookrank is already live that way, so the
rule is reviewer-triggered rather than automatic. Full detail:
[[reference_asc_china_publishing_permit]].

Rejection reasons live only in Resolution Center and need a 2FA'd web session (`asc-login`, or
`asc web auth login` with `ASC_WEB_2FA_CODE_COMMAND`). The public API never exposes them — so when
an app is rejected, read the reason *before* theorising a code fix.

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
| **sparkjar** (was spark, renamed 2026-07-18) | Idea forum, JWT auth. `sparkjar.heyitsmejosh.com` | v2.2.0 live. iOS + Mac provisioning profiles created 2026-08-10 (CY2V3B846P + H9YQZ34MV5, both ACTIVE). iOS 1.0 + macOS 1.0 submitted 2026-08-23 (after cancelling stale rejected submission), both WAITING_FOR_REVIEW. Bundle-ID rename (com.heyitsmejosh.spark → sparkjar) still pending. Email verification + optional signup confirmation shipped (requires SMTP/Resend env var on Vercel to send). Vercel function slots: 8/12 used. |
| **talli** | DTC/RDSP/CDB admin tool (renamed from tally 2026-06-22) | iOS v3.5.12 SHIPPED 2026-07-28 (message parser consolidated from 4 root causes, date formatting, actionRequired badge, build 202607281630). v3.5.11 submitted 07-27 cleared (live/eligible for distribution). Web restyled: white backgrounds + system fonts (SF Pro/Helvetica, no webfonts). Mac widget-fix build VALID (8b29a831, on iOS app 6782366555) ready to attach after App Store distribution window completes |
| **lexly** (was lingo/parlay) | Gamified language learning. GitHub: nulljosh/lexly | iOS v1.1.3 READY_FOR_DISTRIBUTION/shipped, macOS v1.1.1 REJECTED (2026-08-04, see lexly/roadmap.md — leading hypothesis is the demo-account sign-in). Pro un-paywalled, courses free. 2026-08-06: Integrated 15 masterclass summaries from Uprighty (ML, Pre-Calc, Data Science, Accounting, IBS, Sobriety, Statistics, Good Feng Shui, etc.) via converter script; infinite-loop bug fixed (h3 headings were unhandled), all 15 deployed live. 2026-08-09: Added forgot-password reset flow to auth. |
| **voxprint** (was echo; folder + GitHub repo renamed 2026-07-29) | On-device speech transcription (WhisperKit). No cloud. App Store rejected "Echo" — renamed to Voxprint 2026-07-29 (tested ~25 names via ASC API). | Confirmed one app (6782604262, Universal Purchase) already serves iOS+macOS — no separate Mac project needed. macOS v1.3.6 LIVE (shipped 2026-08-06 after Apple approval on Aug 3 build). iOS v1.3.6 still WAITING_FOR_REVIEW (submitted 2026-08-03). App Store marketingUrl updated to voxprint.heyitsmejosh.com. Local folder `~/Documents/Code/voxprint`, GitHub repo `nulljosh/voxprint`. Orphan "Echo Transcribe Mac" (6783015101) flagged for Apple Support deletion. IAP hardcoded unlocked (`isPro = true`) for v1, re-enable for v2 after Paid Apps Agreement setup |
| **litigate** (folder renamed from brief 2026-07-19) | Litigation tool (Trommel v. AG Canada + Trommel v. Trommel). Private | iOS 1.0.1 + 1.0.2 both READY_FOR_SALE/live. P0 SECURITY FIX 2026-07-28: web case prose moved from HTML to Supabase RLS, auth.js gates web access, verified secure. CASE-0004 wired into iOS/macOS (Vancouver parking dispute, not Joshua's — closed). Anon bypass closed (scrape_token revoked). CanLII case-law search merged in iOS as a tab. Bundle ID remains com.nulljosh.brief (Apple-locked). Web (litigate.heyitsmejosh.com) on Cloudflare Pages. No macOS ASC record yet. 2026-08-06: Added light mode support (default via `prefers-color-scheme`, manual override via tweaks panel), designed minimalist gavel SVG icon for PWA manifest + favicon (works in both themes), fixed stale sign-in screen text that still said "Brief" instead of "Litigate" (iOS + macOS) |
| **life** | Therapy doc for Amanda. 32 sections, 21 SVG charts. Private | ARCHIVED 2026-07-28 — taken offline (personal timeline with sensitive content was ranking on Google). Backup: ~/Documents/life-site-backup.html. DNS record cleanup pending |
| **nimble** | macOS menu bar app + web instant-answer search | v1.0.0 shipped 2026-07-29 (web app redesigned from tiny centered box to full viewport, icon/architecture refreshed, README trimmed, docs/CNAME removed, tagged v1.0.0, GitHub release with signed macOS zip). Web restyled 2026-08-02 to Maybulb design system (yellow section dividers, Avenir Next font, flat square buttons); splash screen added. 2026-08-09: Web migrated from Vercel to Cloudflare Pages, answer-proxy payload key bug fixed. Bundle IDs registered 2026-07-29 (com.nulljosh.nimble macOS, com.nulljosh.nimble.ios iOS), ASC app record creation blocked on UI automation (Primary Language Ember Power Select widget silently no-ops), no App Store presence yet. Domain upgrade to nimbleapp.com pending user purchase (few weeks) |
| **nyc** | Times Square city sim | Active |
| **bookrank** (was `books`→`spine`→`uprighty`→`bookrank`; local folder is `~/Documents/Code/bookrank`. `~/Documents/Code/uprighty` is a *diverged clone*, not a rename leftover — it holds unique books work rescued to `origin/books-wip` 2026-08-24; never delete it) | Book summaries site. `bookrank.heyitsmejosh.com` | Renamed 2026-08-07: Uprighty rejected as ASC duplicate, "Bookrank" landed after Shelved/Stacked/Booknook/Bookline/Litshelf were taken. GitHub repo renamed `nulljosh/uprighty`→`nulljosh/bookrank`, domain moved (old `spine.heyitsmejosh.com` CNAME deleted from Cloudflare), GitHub Pages custom-domain setting + iOS/macOS display names + metadata all updated. Portfolio link fixed too. Site live with 16 complete book summaries: ML + Pre-Calc + Steve Jobs + Calculus + IBS + Sobriety + Statistics + Good Feng Shui + The Optimist (ch. 1-10, 2026-08-11), plus AI Business/Accounting/macOS Tahoe/Data Science all complete. Privacy policy page live. iOS 1.0.1 + macOS 1.0.1 both READY_FOR_SALE (verified via `asc versions list --app 6792376485`, 2026-08-24); summaries now live behind per-user Supabase accounts, not bundled. |
| **newsline** | RSS news reader + API dependency (16 sources). `news.heyitsmejosh.com` | **v1.0.0 iOS and macOS apps built 2026-08-11**: SwiftUI, xcodegen, shared source tree for Newsline-iOS (iPhone/iPad) and Newsline-macOS, bundle ID com.nulljosh.newsline (Universal Purchase). NavigationSplitView with Stories (bias bars, blindspot flags), Latest feed, Saved stories. Offline JSON cache in Caches. No account, no analytics, no third-party SDKs. 5 unit tests pass. Public `/app` landing page and `/privacy` policy deployed. App icons generated from icon.svg. Deliberately deferred App Store submission to 2026-08-18 (5.6 freeze); pre-submit checklist queued. **v0.3.0 live (2026-08-09)**: API/MCP server, query-param filtering, cache bugs fixed, feed parser fixed (Atom + entity decoding). 5 dead feeds pruned; CNN dropped + WSJ host fixed 2026-08-13, 16 outlets verified by `npm run feeds`. MCP published to official registry (io.github.nulljosh/newsline). Earlier: Hacker News 2026-07-19, Vancouver Sun + Province 2026-07-29. |
| **bcgd** | Garage-door dashboard. `bcgd.heyitsmejosh.com` | Web + dashboard live on Cloudflare Pages. Leads pipeline built (Supabase anon INSERT, was discarding via alert). 11 service pages + 12 area pages generated, real URL structure. Track repair page added 2026-08-02 (merge doc now complete: hero form, pricing, stats, founder photo, all service pages shipped). Dashboard: Supabase auth, Today view, inventory deductions. iOS 1.0 + macOS 1.0 submitted 2026-08-23, both WAITING_FOR_REVIEW. Both validated clean with no fixes needed (both platforms entirely native SwiftUI, ready to ship as-is). |
| **curvely** (formerly grapher; id6794988370) | Mathematics equation grapher. `grapher.heyitsmejosh.com`, GitHub repo renamed 2026-07-29 | v1.2.0 SHIPPED 2026-08-23 (native SwiftUI rewrite, passed 5.6 review). v1.2.1 WAITING_FOR_REVIEW (graph canvas fix). Canvas now uses full screen on iPhone; previously tested via Desmos/Wolfram rendering patterns, recursive-descent mathjs parser, PNG export via ImageRenderer. Privacy policy live, App Privacy published (DATA_NOT_COLLECTED). |
| **quotable** (app store: Quotestreak, id 6804394619, Universal Purchase) | Movie/music quote guessing game. Web + iOS + macOS, no backend. | iOS v1.0 native SwiftUI app rewritten 2026-08-23 from WKWebView wrapper (5.6-rejection pattern), quote bank expanded 193→272 entries with 32 duplicates removed, ~1553-assertion check suite added, UI bugs fixed (button tint, purple color). Shipped as "Quotestreak" (name taken), iOS WAITING_FOR_REVIEW (built 202608230326, submitted with iPad screenshots + pricing). macOS v1.0 also rewritten to native SwiftUI sharing iOS sources via xcodegen, joined same record as iOS via Universal Purchase bundle `com.heyitsmejosh.quotable`. Generated full ICNS appiconset (512@2x required), captured macOS screenshots via CGWindowListCopyWindowInfo window lookup. Both platforms WAITING_FOR_REVIEW (build 202608230338, submitted 2026-08-23). |
| **fengshui** | Fengshui reading app, recreated from scratch after original was lost. `fengshui.heyitsmejosh.com` | Web reader (chapter TOC, same viewer pattern as uprighty) + native SwiftUI iOS chapter browser, content from uprighty's Good Fengshui summary. Migrated from Vercel to Cloudflare Pages 2026-08-09, GitHub repo `nulljosh/fengshui`, iOS build verified 2026-08-01. No ASC app record yet |
| **cadence** | Time-tracking dashboard. `cadence.heyitsmejosh.com` | Recovered 2026-08-09 from Vercel deployment backup (originally deleted 2026-06-22, was running on Vercel untracked). SwiftUI iOS/macOS app included. API ported to Cloudflare Pages Functions (stats + heatmap endpoints verified 200, projects endpoint still debugging). Remaining steps: DNS flip (currently still pointing to Vercel), full API migration. GitHub repo `nulljosh/cadence` |
| **canlii-app**, **agent-101** | Experimental, local only | Not standalone GitHub repos |

### Infrastructure & Config
| Repo | Description |
|------|-------------|
| **dotfiles** | Shell configs, api-gateway, kv-store, search-engine, applescripts/, vibe ref |
| **labs** (`nulljosh/labs`) | **`~/Documents/Code` itself is this repo** (`origin = nulljosh/labs.git`) — there is no `labs/` subfolder. Its tracked contents are the experiment dirs at top level: roost, homeward, canlii-app, byo-*, quotable, video-speed-ext, bank. Every product repo (epiphany, talli, wiretext, curvely, …) is a nested repo with its own remote, ignored by `.gitignore`'s leading `/*`. A stale second clone of labs.git lived at `Code/labs/` until 2026-08-12 — deleted (0 unique commits, 95 behind, ~1GB); do not recreate it. wiretext/curvely moved to their own repos 2026-07-04 |
| **inkpress** | Multi-feed RSS/Atom reader, iOS only (ASC 6787759999). Split from `journal` repo 2026-07-21 — no shared code, subscribes to journal's feed.xml as a regular feed by default. v1.0.3 WAITING_FOR_REVIEW (submitted 2026-08-09, icon redesign + loading indicator + screenshot refresh + icon alpha flatten + encryption compliance). Landing page live at inkpress.heyitsmejosh.com via Cloudflare Pages (DNS CNAME verified live). |
| **journal** | Jekyll blog. `journal.heyitsmejosh.com`. Split out of `inkpress` repo 2026-07-21 (was combined 2026-07-20 to 2026-07-21) — this repo is blog-only now. Migrated from Vercel to Cloudflare Pages 2026-08-09 (was returning 404 on Vercel; flip fixed the outage). Deploy target corrected 2026-08-11: the live domain is on the `journal-heyitsmejosh` Pages project, not the domain-less `journal` project deploy.sh had been targeting, so entries after Aug 6 were never actually publishing |
| **nulljosh.github.io** | Portfolio. `heyitsmejosh.com` |

## GitHub Repos (verified via `gh repo list` 2026-07-19, echo→voxprint complete 2026-07-29)
`bank bcgd braingraph dotfiles voxprint epiphany etyma curvely healstack inkpress journal labs lexly litigate newsline nimble notes nulljosh.github.io nyc quotable sparkjar bookrank talli video-speed-ext wiretext`
`books`→spine→uprighty→bookrank, `grapher`→curvely, `echo`→voxprint (completed 2026-07-29), and `root`→etyma folders were renamed to match their repo names (spine→uprighty→bookrank, grapher→curvely, and echo→voxprint). Local folder for bookrank is `~/Documents/Code/bookrank`; the separate `~/Documents/Code/uprighty` folder is a diverged clone of the same remote holding unique books work (archived as `origin/books-wip`), not a stale rename — do not delete it. `journal` (the folder) was briefly merged into `inkpress` 2026-07-20 then split back out into its own `journal` repo 2026-07-21 once Inkpress became a real RSS-reader product — `inkpress` and `journal` are now two unrelated repos again. `life` and `canlii-app` are local-only. `braingraph` repo is retired (merged into notes) — candidate for archival.

## Gone (do not reference)
- **Intentionally removed**: systems, beep, beep-web, missing-pets (top-level copy), abraham (SEO client project, removed 2026-08-23), code-meta (was a stale duplicate of this file + roadmap.md; unique roadmap sections merged into roadmap.md 2026-08-23)
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
- **Web hosting/deploy**: Cloudflare Pages primary (migrated: litigate, lexly, bcgd, healstack, wiretext, curvely, voxprint, fengshui, nimble, journal, inkpress, epiphany/Workers with wrangler). Cloudflare Pages also hosts homeward/pets. Direct-upload via `wrangler pages deploy` (not git-connected, to avoid staleness). Only talli remains on Vercel; it is a 2,197-line Express 5 server with headless Chrome and Python shells that cannot run on Workers (migration deferred pending usage reset). Env vars on Cloudflare via `wrangler pages secret put` + `[vars]` section in wrangler.toml.
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

## Ship Status — VERIFIED against `asc versions list` 2026-08-27

Do not edit this section from memory. Re-verify with `asc versions list --app <id>` (public API,
no 2FA) before trusting or changing any line. Every prior version of this block was stale.

**LIVE (READY_FOR_SALE)** — epiphany (iOS 2.5.4 + macOS 2.5.2), voxprint (iOS **1.3.7** + macOS
1.3.6), talli (iOS 3.5.12 + macOS 3.5.6), lexly (iOS 1.1.3 + macOS 1.1.4), litigate (iOS 1.0.2), bookrank
(iOS + macOS 1.0.1), curvely (iOS **1.2.1**), wiretext (iOS **1.1.0**), sparkjar (macOS 1.0.1), wordroot (iOS + macOS 1.0).

**IN THE REVIEW QUEUE (9 records)** — inkpress iOS 1.0.5, sparkjar iOS 1.0, nyc iOS 1.0.0, nyc macOS 1.0.0,
bcgd iOS + macOS 1.0, quotestreak iOS + macOS 1.0, wordroot iOS + macOS 1.0.1, healstack iOS 2.3.5,

**REJECTED — 3 records, and all three are orphans already marked for deletion**, not live
products: nullfolio (iOS 1.0), transcriptly (macOS 9.9.9), and the stray Lexly Mac record
6783501927 (macOS 1.1.1). The canonical Lexly record is 6783501611. **No shipping app is
currently in a rejected state.**

**Corrections this refresh made** — the previous block was wrong about nearly every line again:
- "Still do NOT submit NYC Survive … both REJECTED" — **false**, NYC is in the queue right now
  (macOS actively `IN_REVIEW`). Nothing to hold back.
- wiretext listed as "iOS 1.0 REJECTED" — it is **1.1.0 live**.
- healstack listed as "iOS 2.3.4 REJECTED" — it is **2.3.5 in the queue**.
- voxprint iOS listed as "1.3.6 WAITING_FOR_REVIEW" — it is **1.3.7 live**.
- curvely listed as 1.2.0/1.2.1 pending — **1.2.1 is live**.

**Caveat on the one-app-at-a-time rule** below: nine records are in the queue simultaneously. That
rule was written after the 5.6 suspension and is not being followed. Per
[[reference_asc_5_6_not_rate_limit]], 5.6 fires on *bulk thin new* apps, not on update frequency,
and most of these are updates to live apps — but it is worth knowing the rule is dormant, not
observed.

## Roadmap
- **Go-to-market / revenue: see `GTM.md`** (2026-08-26) — per-app ledger of price, payment rail, live status and blocker, plus the funnel and ASO state. Update that file rather than re-deriving revenue state from ASC.
- **Payments infra** (from Asc.pdf note, imported 2026-07-19; **corrected 2026-08-19**): the Stripe half is DONE and needs no reauthorization — epiphany/healstack/sparkjar/talli all answer live in production with real keys (probed, not read from notes; see `roadmap.md`). What survives is the banking half: **sign the Paid Apps Agreement + add a bank account in App Store Connect**. Dashboard-only (`asc agreements` exposes only `territories`), blocked on Joshua, and it is the single upstream gate on *all* Apple IAP revenue — including voxprint, whose finished StoreKit paywall is hardcoded open at `Sources/Services/StoreManager.swift:19` for exactly this reason.
- **Stripe + social-auth rollout across all shipped apps** (2026-08-03): epiphany done ($1 one-time, gates Autopilot/Daily Brief/People graph). Gap audit: only epiphany+lexly have any GitHub/Google/Facebook auth wiring, none have Apple/Google/Facebook fully live. Two separate blockers found:
  1. **Stripe**: mechanically easy (same live Stripe account, same $1 one-time pattern) but most apps have **no defined premium feature to gate**. Decided per-app gates and shipped 2 of 3 planned:
     - **healstack**: DONE — $1 unlocks CSV export (`api/stripe.js`, `api/stripe-webhook.js`, `src/hooks/usePro.js`, gated in `src/pages/Journal.jsx`). Verified live: checkout returns a real session URL, webhook rejects unsigned requests.
     - **sparkjar**: DONE — implements the "Spark Pro" spec already written in `sparkjar/CLAUDE.md` (unlimited posts, skips the 10-posts/60s rate limit in `api/posts.js`; 24h pinned visibility via new `posts.pinned_until` column, sorted first in the feed). `users.is_pro` + `posts.pinned_until` columns added to the shared spark Supabase project. Verified live after a manual `vercel --prod` deploy — **found sparkjar's git-push auto-deploy isn't firing** (6-day-old deployments were still live minutes after `git push`; had to deploy manually). Worth checking the GitHub↔Vercel integration for this project specifically.
     - **talli**: DONE — gate scoped down from the original "+ PDF export" idea once exploration found no PDF/export library exists in the codebase (would've been inventing a feature to gate, the exact mistake avoided on healstack/sparkjar). Ships $1 unlocking the full payment history view (YTD total + recent-payments bar chart in `HomeTab`, `web/unified.html`) — free view keeps just the monthly amount. New `GET/POST /api/stripe-status`/`stripe-checkout` routes in `src/api.js`; webhook mounted with `express.raw()` *before* the global `express.json()` (talli's Express monolith needs the raw body for signature verification, ordering matters). Entitlement stored via talli's existing per-user Blob helpers (`loadUserBlob`/`saveUserBlob`), keyed by session `userId` since talli has no separate account system. Talli auto-deploys via GitHub Actions (not Vercel Git integration like sparkjar), so should be more reliable — verify next session that the deploy actually went out.
     - **Pricing decided 2026-08-19**: voxprint keeps its existing $7.99 one-time non-consumable (`Echo.storekit`, `com.nulljosh.echo.unlock`) — "own it once, nothing leaves your device" is the product pitch, so a subscription contradicts it. Epiphany stays at $1 one-time for now; it is the one app with real recurring cost (broker polling, Yelp, daily-brief cron, KV) so a subscription is the eventual right answer, but that is the RevenueCat case below and is blocked on the same Paid Apps Agreement. Revisit when usage cost actually bites.
     - lexly/nimble/curvely/inkpress/bookrank/fengshui/litigate/bcgd/voxprint: no natural fit, not touched (see full reasoning in session — voxprint already has a dormant native StoreKit paywall, litigate/bcgd aren't public products, the rest have no backend/accounts to hang an entitlement on). newsline has a real candidate (bias/clustering view) but runs on a Cloudflare Worker, not Vercel serverless — needs its own integration shape, flagged as a follow-up.
  2. **Apple/Facebook/Google OAuth**: registrations themselves are a hard wall, not code — needs one-time interactive developer-console app registration per provider (Google Cloud Console, Meta for Developers, Apple Developer/Sign In with Apple key). Still blocked on Joshua doing the 3 registrations. What *was* done: audited which apps could cheaply add provider buttons ahead of time. Only **healstack** uses Supabase Auth's `signInWithOAuth()` (the "register once in Supabase, every app gets it" shortcut) — added Google/Apple/Facebook buttons there (`src/pages/Auth.jsx`) alongside the existing GitHub one; they'll error until Joshua registers each provider, which is expected. Checked lexly and epiphany too — **neither uses Supabase Auth's OAuth**, so they don't get this shortcut; not touched. **Sparkjar's GitHub sign-in is a fully hand-rolled OAuth dance** (`api/_lib/auth/github.js` + `github-callback.js`, own JWT, no Supabase Auth involved) — replicating that per provider is a real multi-hour build per provider, not a cheap flip; deliberately not attempted, flagged as its own future task if wanted.
     - **2026-08-03 later**: also found **epiphany already has fully-built, hand-rolled Google + Facebook OAuth server code** (`server/api/auth.js:202-268` Google, `:270-329` Facebook) — complete authorize/callback/token-exchange flows just waiting on real credentials (`GOOGLE_CLIENT_ID`/`SECRET` present but empty in `.env.tui.local`, `FACEBOOK_CLIENT_ID`/`SECRET` not set at all). Epiphany's native iOS Apple Sign-In is separate and already shipped — not part of this web-OAuth work. Attempted to register the actual Google/Facebook/Apple apps via Claude in Chrome browser automation — **Chrome extension wasn't connecting** ("extension not connected" even after reinstall/restart attempts, despite having worked minutes earlier in the same session). Shelved, not a code blocker — retry `claude-in-chrome` connection next session, or Joshua registers manually. Full step-by-step plan (redirect URIs for both epiphany's own callback and Supabase's shared callback so one registration covers both apps, Apple's likely domain-verification dead end) is preserved for reuse whenever this is picked back up.
- **ASC merge/rename pass** (from Asc/Icons.pdf + Itinerary.pdf notes, imported 2026-07-19): duplicates the existing deferred plan at `~/.claude/plans/proud-popping-floyd.md` (Echo iOS/macOS merge, then Inkpress rejection fix, Spinelist rename+icon, Lexly Mac retirement, Litigate icon badge, Nullfolio icon spacing) — that plan is intentionally queued for a fresh-usage-headroom session (heavy Xcode archives involved), not re-run here.
- **DNS cleanup 2026-07-18**: removed 3 confirmed-stale Cloudflare CNAMEs from past renames (tally→talli, lingo→lexly, beep — app removed). Resolved 2026-07-19: `brief.heyitsmejosh.com` → confirmed renamed to `litigate.heyitsmejosh.com` (new domain set up via Cloudflare API in the Litigate rename wrap). Resolved 2026-07-27: both `bcgd.heyitsmejosh.com` and `bcgd-dashboard.heyitsmejosh.com` are Cloudflare Pages (web + dashboard repos). `vercel --prod` on Cloudflare Pages silently reports success but ships nothing — gotcha for any similar projects hosted on Pages. Resolved 2026-07-28: `brief.heyitsmejosh.com` and `charters.heyitsmejosh.com` stale Vercel CNAMEs deleted (dead, superseded by renames). Still ambiguous: `vxgd.heyitsmejosh.com` (purpose unclear — check before touching). `etyma.heyitsmejosh.com` resolved: serves Wordroot dictionary app (renamed 2026-08-11, Pages project still named `etyma` — kept for backward compat, can't rename).
- **swiftui-pro audit** (2026-07-18): installed twostraws/swiftui-agent-skill, ran read-only review across 18 apps (~78 findings, full report was in session scratchpad — not persisted). canlii-app's broken error alert (`.constant()` binding) fixed + build-verified, but push failed (`nulljosh/canlii-app` remote missing on GitHub — check if renamed/private before re-pushing). ~~Ranked next: healstack (3 manual-`Binding(get:set:)` bugs), litigate (biometric-lock Unlock button invisible to VoiceOver)~~ **Both closed 2026-08-17.** healstack's three sites are fixed (commit d465edb): the marker rows were tuples bound through index closures, which could read a dead index when a panel switch shrank the array (CBC 6 markers -> HbA1c 1); promoted to `MarkerEntry: Identifiable` so `ForEach($markers)` binds directly, and the sync toggle now uses `@Bindable`. **The litigate finding was wrong**: the Unlock button is a `Button` with a `Text` label, so VoiceOver reads it fine. The real defect on that screen was branding — it said "BRIEF" and the Face ID prompt said "Unlock Brief" after the rename to Litigate; fixed in ec3d887. Still open from the audit: a shared **epiphany/talli/sparkjar** cleanup pass (C-style `String(format:)` → FormatStyle, hard-coded fonts ignoring Dynamic Type, deprecated haptics APIs). Fix pattern: edit → `xcodegen generate` → `xcodebuild ... -skipPackagePluginValidation` → commit → push, one app at a time (see nimble's 2026-07-18 commit as precedent).
- **canlii → litigate merge**: DONE 2026-07-19 — CanLII case-law search merged into litigate/ios as a "Case Law" tab (`ios/Sources/CaseLaw/`), build-verified. canlii-app kept standalone but frozen (no further polish).
- **RevenueCat** (2026-07-18, found via research): worth evaluating for any app that gates features behind Apple IAP (Stripe alone can't unlock in-app features per App Review rules). Free under $2.5k MTR. Not yet integrated anywhere — needs a RevenueCat dashboard account (browser signup, confirm before opening Chrome) + StoreKit config + entitlement sync. Scope for Epiphany first.
- **SwiftLint** (2026-07-18): Epiphany + Talli lint at build time via SPM build-tool plugin, build-verified (`-skipPackagePluginValidation` required on xcodebuild — see each app's ios/CLAUDE.md Run section). ~~sparkjar, lexly, healstack, litigate got the same wiring committed but NOT build-verified~~ **The 2026-08-17 'that wiring does not exist' correction was itself WRONG — re-verified 2026-08-25.** SwiftLint IS wired as a build-tool plugin in four repos: `healstack/ios/project.yml`, `epiphany/ios/project.yml`, `talli/ios/project.yml`, `sparkjar/ios/project.yml` (each has a `SwiftLint` entry under `packages:` and `buildToolPlugins: - plugin: SwiftLintBuildToolPlugin`). The bogus correction came from running `grep -rl buildToolPlugins --include=project.yml`, which **fish glob-expands** — `--include=*.yml`-style flags must be quoted in this shell or the flag is mangled and the grep silently finds nothing. Consequence to remember: a plain `xcodebuild ... build` on these four **fails with a bare `** BUILD FAILED **` and no error line**, because a headless build cannot grant the plugin's trust prompt. Always pass `-skipPackagePluginValidation`. Confirmed by building healstack's `Dose` scheme both ways on 2026-08-25: fails without the flag, succeeds with it.
- **SwiftLint** (2026-07-18): installed via brew, not wired into CI per no-background-automation rule. Run manually during cleanup passes. (Periphery removed 2026-08-24 — upstream archived, never configured.)
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

## npm dependency moves
`npm install <pkg> --save-dev` on an already-pinned dep **silently upgrades it**
to the newest satisfying version. Moving `jsdom` between sections this way jumped
27.4.0 -> 30.0.1 and broke CI (2026-08-17). Edit `package.json` and reinstall, or
pin explicitly (`npm i jsdom@^27.4.0 -D`). Diff the lockfile before committing.

# Codebase Notes (~/Documents/Code)

*Last updated: 2026-07-29 Wednesday night — Epiphany app icon redesigned (lime-green #8fe86a network on dark #111814 background, higher contrast, iOS+macOS all PNG sizes regenerated, 547f353). Earlier 2026-07-28 Tuesday night: Epiphany web landing hero restyled (Wealthsimple pill navbar, animated SVG map, CTA, bf4e055). Talli iOS 3.5.12 shipped (message parser consolidated from 4 root causes, date formatting, actionRequired badge). Lexly Computers tab merged into Programming (web+iOS). Etyma Wordroot icon wired, Wiretext icon designed + wired (teal viewfinder, clrs.cc). Nullfolio auto-refresh scoped M-effort/deferred, roadmap notes filed. Earlier: Spine Sobriety complete (intro+ch.1-17), Statistics started (intro+ch.1-2, 227/20 remaining). Litigate web secured (Supabase RLS), native migration pending, CASE-0004 wired (iOS/macOS), anon bypass closed. App Store audit complete (6 apps with store links). Epiphany statement upload fixed (unpushed). life.heyitsmejosh.com archived. All builds passing.*

## Environment
- macOS Darwin 25.5.0 (arm64), Mac Mini M4
- Python 3.14.3 · Node.js v24.13.1 · xcodegen `/opt/homebrew/bin/xcodegen`
- ASC CLI + 20+ skills installed — use instead of App Store Connect dashboard

## Active Repos

### Products & Apps
| Repo | Description | Status |
|------|-------------|--------|
| **epiphany** | Finance dashboard. `epiphany.heyitsmejosh.com` | v2.6.1+ live + App Store (id6779522175). Commodity/crypto enrichment + Yelp reviews + Pro gating shipped. Web landing page hero restyled 2026-07-28 (Wealthsimple-inspired navbar pill, animated SVG map, CTA). App icon redesigned 2026-07-29 (lime-green #8fe86a network on dark #111814, higher contrast, all PNG sizes regenerated) |
| **healstack** (was dose; folder + GitHub repo now `healstack`) | Health/supplement tracker. `healstack.heyitsmejosh.com` | v1.0 WAITING_FOR_REVIEW (submitted 2026-07-21). TestFlight v2.3.3 build 202607261112 uploaded 2026-07-26 with CFBundleDisplayName fix (Home Screen shows "Healstack"). Screenshot pipeline built and submitted 2026-07-26. Metadata/pricing/availability/privacy set via asc CLI. Mac universal setup + Release build verified. Medical device declaration cleared 2026-07-21 |
| **sparkjar** (was spark, renamed 2026-07-18) | Idea forum, JWT auth. `sparkjar.heyitsmejosh.com` | v2.2.0 live. Mac 1.0 WAITING_FOR_REVIEW (submitted 2026-07-29 after unblocking stale ASC submission). iOS build VALID on ASC. iOS provisioning FIXED 2026-07-18, archive builds clean. Bundle-ID rename (com.heyitsmejosh.spark → sparkjar) still pending |
| **talli** | DTC/RDSP/CDB admin tool (renamed from tally 2026-06-22) | iOS v3.5.12 SHIPPED 2026-07-28 (message parser consolidated from 4 root causes, date formatting, actionRequired badge, build 202607281630). v3.5.11 submitted 07-27 cleared (live/eligible for distribution). Web restyled: white backgrounds + system fonts (SF Pro/Helvetica, no webfonts). Mac widget-fix build VALID (8b29a831, on iOS app 6782366555) ready to attach after App Store distribution window completes |
| **lexly** (was lingo/parlay) | Gamified language learning. GitHub: nulljosh/lexly | iOS v1.1.3 PREPARE_FOR_SUBMISSION (icon redesigned 2026-07-27, screenshots fixed 2026-07-27, builds pending), macOS v1.1.1 WAITING_FOR_REVIEW (submitted 2026-07-29). Pro un-paywalled, courses free |
| **echo** | On-device speech transcription (WhisperKit). No cloud | Confirmed one app (6782604262, Universal Purchase) already serves iOS+macOS — no separate Mac project needed. v1.3.4 SUBMITTED 2026-07-26 (batch app icon recolor pass, changed from teal snowman-circle). v1.3.5 blocked on workflow re-attempt (icon fix committed 2026-07-29, `asc workflow run ship-ios` failed at export/upload stage). Mic-glyph redesign on clrs.cc blue with flattened alpha channel ready to ship. Orphan "Echo Transcribe Mac" (6783015101) flagged for manual dashboard deletion (user will delete personally, 2026-07-29). IAP hardcoded unlocked (`isPro = true`) for v1, re-enable for v2 after Paid Apps Agreement setup |
| **litigate** (folder renamed from brief 2026-07-19) | Litigation tool (Trommel v. AG Canada + Trommel v. Trommel). Private | iOS 1.0.1 b4 RESUBMITTED 2026-07-22. Mac 1.0.1 uploaded to unified iOS+Mac record. P0 SECURITY FIX 2026-07-28: web case prose moved from HTML to Supabase RLS, auth.js gates web access, verified secure. Native iOS/macOS app hardcoded case data migration in progress (still unencrypted in source). CASE-0004 wired into iOS/macOS (Vancouver parking dispute). Anon bypass closed (scrape_token revoked). CanLII case-law search merged in iOS as a tab. Bundle ID remains com.nulljosh.brief (Apple-locked). Web (litigate.heyitsmejosh.com) moved off Vercel to Cloudflare Pages 2026-07-28 — DNS CNAME flipped, verified live with auth gate intact |
| **life** | Therapy doc for Amanda. 32 sections, 21 SVG charts. Private | ARCHIVED 2026-07-28 — taken offline (personal timeline with sensitive content was ranking on Google). Backup: ~/Documents/life-site-backup.html. DNS record cleanup pending |
| **nimble** | macOS menu bar app | nimble.heyitsmejosh.com DNS repointed to Vercel 2026-07-14; answer quality investigation queued |
| **nyc** | Times Square city sim | Active |
| **spine** (was `books`, folder renamed 2026-07-20; iOS app: Uprighty 2026-07-29, formerly Spinework 2026-07-22, formerly Bindwise/Spine) | Book summaries site. `spine.heyitsmejosh.com` | Site live with ML + Pre-Calc + Steve Jobs + Calculus + IBS + Sobriety + Statistics (all complete) + Good Feng Shui (7 chapters, all 304+62 HEICs processed and deleted). Privacy policy page added (2026-07-28). App renamed Uprighty 2026-07-29 (was Spinework, itself renamed from "Spine" due to App Store availability 2026-07-22). Icon redesigned (bright safety-orange garage-door motif). iOS v1.0 first ASC build VALID 2026-07-29 with synced summaries |
| **newsline** | RSS news reader (15 sources). `news.heyitsmejosh.com` | v0.2.0 live. Cloudflare Worker + static assets. Latest feed + bias tabs, Hacker News added 2026-07-19. Security-sweep clean 2026-07-22 (wildcard CORS on read-only endpoint acceptable) |
| **bcgd** | Garage-door dashboard. `bcgd.heyitsmejosh.com` | Web + dashboard live on Cloudflare Pages. Leads pipeline built (Supabase anon INSERT, was discarding via alert). 11 service pages + 12 area pages generated, real URL structure. Dashboard: Supabase auth, Today view, inventory deductions. macOS target scaffolded 2026-07-29 (xcodegen, same bundle ID). v1.0 macOS first ASC build VALID 2026-07-29 (icon set sizes generated via sips, manifest rewritten). iOS app ready to submit |
| **grapher** (aka Curvely; id6794988370) | Mathematics equation grapher. `grapher.heyitsmejosh.com` | v1.1.0 build uploaded + app availability/pricing set via dashboard (2026-07-29). Submission rejected on 3 blockers: missing privacy policy URL, unpublished App Privacy declarations (no API), missing iPad screenshot (ipadPro129). |
| **canlii-app**, **agent-101** | Experimental, local only | Not standalone GitHub repos |

### Infrastructure & Config
| Repo | Description |
|------|-------------|
| **dotfiles** | Shell configs, api-gateway, kv-store, search-engine, applescripts/, vibe ref |
| **labs** (`nulljosh/labs`) | Monorepo: roost, missing-pets, canlii-app, byo-*, capu, code-meta. wiretext/grapher moved to their own repos 2026-07-04 |
| **inkpress** | Multi-feed RSS/Atom reader, iOS only (ASC 6787759999). Split from `journal` repo 2026-07-21 — no shared code, subscribes to journal's feed.xml as a regular feed by default. v1.0.2 APPROVED + LIVE (2026-07-22, splash screen fixed, multi-feed reader verified) |
| **journal** | Jekyll blog. `journal.heyitsmejosh.com`. Split out of `inkpress` repo 2026-07-21 (was combined 2026-07-20 to 2026-07-21) — this repo is blog-only now |
| **nulljosh.github.io** | Portfolio. `heyitsmejosh.com` |

## GitHub Repos (verified via `gh repo list` 2026-07-19)
`abraham bank bcgd braingraph dotfiles echo epiphany etyma grapher healstack inkpress journal labs lexly litigate newsline nimble notes nulljosh.github.io nyc quotable sparkjar spine talli video-speed-ext wiretext`
`books`→spine and `root`→etyma folders were renamed to match their repo names 2026-07-20. `journal` (the folder) was briefly merged into `inkpress` 2026-07-20 then split back out into its own `journal` repo 2026-07-21 once Inkpress became a real RSS-reader product — `inkpress` and `journal` are now two unrelated repos again. `life` and `canlii-app` are local-only. `braingraph` repo is retired (merged into notes) — candidate for archival.

## Gone (do not reference)
- **`nulljosh/code-meta`**: repo no longer exists standalone — folded into `nulljosh/labs` as a `code-meta/` subfolder. This `~/Documents/Code` checkout's `origin` still points at the dead `code-meta.git` URL (left as-is, not repointed — a plain remote swap would push this dir's contents to `labs`' repo root, not the `code-meta/` subpath). 2026-07-29: synced the 4 tracked files (CLAUDE.md/roadmap.md/PROGRESS.md/.gitignore) directly into `labs/code-meta/` via a throwaway clone + copy + push (history not merged, only current content). Repeat that same manual sync next time this file drifts far from `labs/code-meta/CLAUDE.md`, until/unless a real subtree relationship gets set up.
- **Intentionally removed**: systems, beep, beep-web, missing-pets (top-level copy)
- **Accidentally deleted 2026-06-22** (Vercel still live, needs recovery): bcgd, cadence, charters, nimble-web
- **Merged**: school → lingo → parlay → renamed lexly (2026-07-01)
- **Vercel orphans deleted 2026-06-29**: fuse, pulse, _site, beep-web, school

## Automation
- No background daemons. `~/.local/bin` has only: `claude sync uv uvx`
- **weekly-journal** routine: `trig_017xPBtriJVF1HkRCnx4dkTa` — verify path before relying on it

## Stack Conventions
- **Screenshots/UI automation**: never create throwaway/demo accounts for App Store screenshots or UI testing — check that app's `.env`/`.env.local` (gitignored) for real credentials first and sign in with those.
- **Auth**: Supabase email+password (not magic link unless a repo says otherwise). Most apps share the `spark` Supabase project (see Shared Supabase backend below) — check `SUPABASE_URL`/anon key in that app's project.yml/Info.plist before assuming a dedicated project. iOS/macOS: Supabase Swift SDK via SPM package, sign-in state in an `@Observable` Store. Sign in with Apple needs both an Apple Developer Services key AND the provider enabled in Supabase's dashboard (Auth → Providers) — app-side code alone is not enough (see litigate's unresolved Apple sign-in item).
- **Web hosting/deploy**: Vercel, one project per app, push to `main` auto-deploys unless a repo's CLAUDE.md says otherwise (e.g. journal is prebuilt-static-only via `deploy.sh`, never plain `git push`). Env vars managed via `vercel env` CLI, not the dashboard.
- **Domains/DNS**: Cloudflare. Use the `CLOUDFLARE_DNS_TOKEN` from `~/.config/fish/secrets.fish` as the bearer for direct API/curl DNS changes (`curl -H "Authorization: Bearer $CLOUDFLARE_DNS_TOKEN" ...`) — don't make Joshua click through the dashboard. (Note: it's deliberately NOT named `CLOUDFLARE_API_TOKEN` — that name makes wrangler skip OAuth and fail for lacking Workers scope.)
- **iOS/macOS build system**: xcodegen (`project.yml`), no checked-in `.xcodeproj`. SwiftUI, iOS 17+/macOS 14+, `@Observable`/`@Bindable`. Build via `asc xcode archive`/`export` (see `asc-xcode-build` skill) over raw xcodebuild recipes when possible.
- **Lint**: SwiftLint as an SPM build-tool plugin where wired (see Roadmap) — requires `-skipPackagePluginValidation` on any CLI `xcodebuild` invocation, since headless builds can't grant the plugin's interactive trust prompt.
- **App Store Connect**: `asc` CLI + skills, never the ASC web dashboard for anything scriptable.
- **No emojis** in any UI, anywhere, across every app — standing rule, not per-repo.
- **No background automation** — no crontab/daemons beyond the 4 binaries in `~/.local/bin`.

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

## Ship Status (most → least shipped, refresh as state changes)
epiphany (live) > inkpress (1.0.2 live 07-22), talli (iOS 3.5.12 SHIPPED 07-28), spine (iOS Uprighty v1.0 VALID 07-29: book summaries IBS/Sobriety/Statistics/Good Feng Shui all complete), wiretext (iOS v1.0 VALID 07-29), wordroot/etyma (iOS v1.0 VALID 07-29), echo (1.3.4 submitted 07-26, 1.3.5 pending), lexly (iOS 1.1.3 PREPARE 07-27, macOS 1.1.1 WAITING_FOR_REVIEW 07-29), litigate (1.0.1 submitted 07-22, P0 security FIXED 07-28), healstack (1.0 WAITING_FOR_REVIEW 07-21), sparkjar (iOS+Mac 1.0 WAITING_FOR_REVIEW 07-21), grapher (iOS Release archive 07-29, export/upload pending), portfolio (work expanded 07-27) > bcgd (web+dashboard live 07-27, macOS v1.0 VALID 07-29, iOS pending), journal (Jekyll blog live 07-21). life: ARCHIVED 07-28

## Roadmap
- **Payments infra** (from Asc.pdf note, imported 2026-07-19): hook up an RBC bank account and get Stripe working across any/all apps — needs Stripe reauthorization (and possibly a CLI). Not started; requires interactive/credentialed setup, flag before executing.
- **ASC merge/rename pass** (from Asc/Icons.pdf + Itinerary.pdf notes, imported 2026-07-19): duplicates the existing deferred plan at `~/.claude/plans/proud-popping-floyd.md` (Echo iOS/macOS merge, then Inkpress rejection fix, Spinelist rename+icon, Lexly Mac retirement, Litigate icon badge, Nullfolio icon spacing) — that plan is intentionally queued for a fresh-usage-headroom session (heavy Xcode archives involved), not re-run here.
- **DNS cleanup 2026-07-18**: removed 3 confirmed-stale Cloudflare CNAMEs from past renames (tally→talli, lingo→lexly, beep — app removed). Resolved 2026-07-19: `brief.heyitsmejosh.com` → confirmed renamed to `litigate.heyitsmejosh.com` (new domain set up via Cloudflare API in the Litigate rename wrap). Resolved 2026-07-27: both `bcgd.heyitsmejosh.com` and `bcgd-dashboard.heyitsmejosh.com` are Cloudflare Pages (web + dashboard repos). `vercel --prod` on Cloudflare Pages silently reports success but ships nothing — gotcha for any similar projects hosted on Pages. Resolved 2026-07-28: `brief.heyitsmejosh.com` and `charters.heyitsmejosh.com` stale Vercel CNAMEs deleted (dead, superseded by renames). Still ambiguous: `vxgd.heyitsmejosh.com`/`etyma.heyitsmejosh.com` (purpose unclear from current memory — check what app each actually serves before touching).
- **swiftui-pro audit** (2026-07-18): installed twostraws/swiftui-agent-skill, ran read-only review across 18 apps (~78 findings, full report was in session scratchpad — not persisted). canlii-app's broken error alert (`.constant()` binding) fixed + build-verified, but push failed (`nulljosh/canlii-app` remote missing on GitHub — check if renamed/private before re-pushing). Ranked next: **healstack** (3 manual-`Binding(get:set:)` data-flow bugs in Lab Results/Settings/Log views), **litigate** (biometric-lock Unlock button invisible to VoiceOver), then a shared **epiphany/talli/sparkjar** cleanup pass (C-style `String(format:)` → FormatStyle, hard-coded fonts ignoring Dynamic Type, deprecated haptics APIs). Fix pattern: edit → `xcodegen generate` → `xcodebuild ... -skipPackagePluginValidation` → commit → push, one app at a time (see nimble's 2026-07-18 commit as precedent).
- **canlii → litigate merge**: DONE 2026-07-19 — CanLII case-law search merged into litigate/ios as a "Case Law" tab (`ios/Sources/CaseLaw/`), build-verified. canlii-app kept standalone but frozen (no further polish).
- **RevenueCat** (2026-07-18, found via research): worth evaluating for any app that gates features behind Apple IAP (Stripe alone can't unlock in-app features per App Review rules). Free under $2.5k MTR. Not yet integrated anywhere — needs a RevenueCat dashboard account (browser signup, confirm before opening Chrome) + StoreKit config + entitlement sync. Scope for Epiphany first.
- **SwiftLint** (2026-07-18): Epiphany + Talli lint at build time via SPM build-tool plugin, build-verified (`-skipPackagePluginValidation` required on xcodebuild — see each app's ios/CLAUDE.md Run section). **sparkjar, lexly, healstack, litigate got the same `project.yml`/`.swiftlint.yml` wiring committed but NOT build-verified** (session ended before running `xcodegen generate` + a full xcodebuild pass on each) — verify each builds clean with `-skipPackagePluginValidation` before relying on it; if a build fails, the fallback is reverting `packages:`/`buildToolPlugins:` in that app's project.yml (same revert epiphany needed on the first attempt). journal/inkpress not touched at all — no packages: block exists there yet.
- **Periphery** (2026-07-18): installed via brew (`periphery`, `swiftlint`), not yet configured per-app or wired into a skill. Run manually (`periphery scan`) when doing a cleanup pass — no CI wiring per no-background-automation rule.
- **Progress snapshot 2026-07-02**: ~67 open items ≈ 155h ≈ 4–6 wks — full table in `PROGRESS.md`, refresh with `/progress`
- **healstack**: v1.0 WAITING_FOR_REVIEW (submitted 07-21), TestFlight v2.3.3 build 202607261112 uploaded 07-26; left: screenshots, availability (dashboard), demo account, then submit
- **sparkjar**: provisioning FIXED 2026-07-18, v2.2.0 build uploaded 2026-07-19; left: bundle-ID rename (com.heyitsmejosh.spark → sparkjar) + screenshots/metadata
- **echo**: Mac 1.0 blocked on pricing (dashboard); Universal Purchase merge in progress
- **epiphany**: Verify force-sync after SnapTrade fix
- **nyc**: Blocked on generating an iOS distribution signing cert with a local private key before IPA export/upload
- **bcgd/cadence/charters**: Recover from Vercel deployment + any backup source
- **Supabase**: At 2/2 free-tier limit (spark + epiphany). Epiphany auto-pauses if inactive 7+ days. Reuse spark DB for new projects until Pro

## Security Rotation Log
| Date | Rotated |
|------|---------|
| 2026-05-02 | Stripe sk + pk, Resend, Supabase anon + service role |
| 2026-05-09 | Spark JWT_SECRET |
| 2026-05-14 | Stripe sk (new), STRIPE_WEBHOOK_SECRET (`we_1TXF3e…`), FRED_API_KEY |
| done | Trakt API key |
| pending | Upstash Redis (see Credentials above) |

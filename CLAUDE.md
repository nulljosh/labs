# Codebase Notes (~/Documents/Code)

*Last updated: 2026-07-19*

## Environment
- macOS Darwin 25.5.0 (arm64), Mac Mini M4
- Python 3.14.3 · Node.js v24.13.1 · xcodegen `/opt/homebrew/bin/xcodegen`
- ASC CLI + 20+ skills installed — use instead of App Store Connect dashboard

## Active Repos

### Products & Apps
| Repo | Description | Status |
|------|-------------|--------|
| **epiphany** | Finance dashboard. `epiphany.heyitsmejosh.com` | v2.6.1+ live + App Store (id6779522175). Commodity/crypto enrichment + Yelp reviews + Pro gating shipped |
| **healstack** (was dose; folder + GitHub repo now `healstack`) | Health/supplement tracker. `dose.heyitsmejosh.com` | v2.3.4 build valid on ASC, metadata prepped via asc CLI 2026-07-19; blocked: screenshots, availability (dashboard), demo account |
| **sparkjar** (was spark, renamed 2026-07-18) | Idea forum, JWT auth. `sparkjar.heyitsmejosh.com` | v2.2.0 live. Mac ASC app registered (6786482755); iOS provisioning FIXED 2026-07-18 (see sparkjar/CLAUDE.md), archive builds clean, export/upload + bundle-ID rename (com.heyitsmejosh.spark → sparkjar) still pending |
| **talli** | DTC/RDSP/CDB admin tool (renamed from tally 2026-06-22) | v3.5.5 SUBMITTED 2026-07-19 (Xcode Cloud SwiftLint fix); v3.5.4 live |
| **lexly** (was lingo/parlay) | Gamified language learning. GitHub: nulljosh/lexly | iOS + macOS v1.1.1 in App Review 2026-07-19; Pro un-paywalled, courses free |
| **echo** | On-device speech transcription (WhisperKit). No cloud | iOS 1.3.3 SUBMITTED 2026-07-19; Universal Purchase merge underway; Mac blocked on pricing (dashboard) |
| **litigate** (folder renamed from brief 2026-07-19) | Litigation tool (Trommel v. AG Canada + Trommel v. Trommel). Private | ios/ macos/ web/ subdirs; CanLII case-law search merged in as a tab 2026-07-19 |
| **life** | Therapy doc for Amanda. 32 sections, 21 SVG charts. Private | Web + iOS |
| **nimble** | macOS menu bar app | nimble.heyitsmejosh.com DNS repointed to Vercel 2026-07-14; answer quality investigation queued |
| **nyc** | Times Square city sim | Active |
| **spine** (was `books`, folder renamed 2026-07-20) | Book summaries site. `spine.heyitsmejosh.com` | Has own CLAUDE.md |
| **newsline** | RSS news reader (15 sources). `news.heyitsmejosh.com` | v0.2.0 live. Cloudflare Worker + static assets. Latest feed + bias tabs, Hacker News added 2026-07-19 |
| **bcgd** | Garage-door dashboard. `bcgd.heyitsmejosh.com` | Recovered: web live, iOS verified in sim 2026-07-10; ASC app record + upload pending |
| **canlii-app**, **agent-101** | Experimental, local only | Not standalone GitHub repos |

### Infrastructure & Config
| Repo | Description |
|------|-------------|
| **dotfiles** | Shell configs, api-gateway, kv-store, search-engine, applescripts/, vibe ref |
| **labs** (`nulljosh/labs`) | Monorepo: roost, missing-pets, canlii-app, byo-*, capu. wiretext/grapher moved to their own repos 2026-07-04 |
| **inkpress** (was `journal`, folder renamed 2026-07-20) | Jekyll blog. `journal.heyitsmejosh.com`. iOS: rebuilt as multi-feed RSS reader after 4.2 rejection (code done, commit 0ab2592) — NOT yet resubmitted, ASC 6787759999 submission 409ce5a3 still REJECTED/UNRESOLVED_ISSUES on the old pre-RSS build; still needs build+upload+resubmit |
| **nulljosh.github.io** | Portfolio. `heyitsmejosh.com` |

## GitHub Repos (verified via `gh repo list` 2026-07-19)
`abraham bank bcgd braingraph dotfiles echo epiphany etyma grapher healstack inkpress labs lexly litigate newsline nimble notes nulljosh.github.io nyc quotable sparkjar spine talli video-speed-ext wiretext`
`books`→spine, `journal`→inkpress, and `root`→etyma folders were all renamed to match their repo names 2026-07-20 — no local-folder/repo-name mismatches remain. `life` and `canlii-app` are local-only. `braingraph` repo is retired (merged into notes) — candidate for archival.

## Gone (do not reference)
- **Intentionally removed**: systems, beep, beep-web, missing-pets (top-level copy)
- **Accidentally deleted 2026-06-22** (Vercel still live, needs recovery): bcgd, cadence, charters, nimble-web
- **Merged**: school → lingo → parlay → renamed lexly (2026-07-01)
- **Vercel orphans deleted 2026-06-29**: fuse, pulse, _site, beep-web, school

## Automation
- No background daemons. `~/.local/bin` has only: `claude sync uv uvx`
- **weekly-journal** routine: `trig_017xPBtriJVF1HkRCnx4dkTa` — verify path before relying on it

## Stack Conventions
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
epiphany (live) > talli (3.5.5 submitted 07-19), echo iOS (1.3.3 submitted 07-19), lexly (1.1.1 waiting), litigate (1.0.1 waiting) > journal/inkpress (rejected 4.2 minimum-functionality; RSS-reader fix coded but not yet built/resubmitted; also needs availability, dashboard-only) > echo Mac (blocked: pricing dashboard), healstack (blocked: screenshots+availability+demo acct), sparkjar (upload in progress 07-19) > bcgd (no ASC registration)

## Roadmap
- **Payments infra** (from Asc.pdf note, imported 2026-07-19): hook up an RBC bank account and get Stripe working across any/all apps — needs Stripe reauthorization (and possibly a CLI). Not started; requires interactive/credentialed setup, flag before executing.
- **ASC merge/rename pass** (from Asc/Icons.pdf + Itinerary.pdf notes, imported 2026-07-19): duplicates the existing deferred plan at `~/.claude/plans/proud-popping-floyd.md` (Echo iOS/macOS merge, then Inkpress rejection fix, Spinelist rename+icon, Lexly Mac retirement, Litigate icon badge, Nullfolio icon spacing) — that plan is intentionally queued for a fresh-usage-headroom session (heavy Xcode archives involved), not re-run here.
- **DNS cleanup 2026-07-18**: removed 3 confirmed-stale Cloudflare CNAMEs from past renames (tally→talli, lingo→lexly, beep — app removed). Resolved 2026-07-19: `brief.heyitsmejosh.com` → confirmed renamed to `litigate.heyitsmejosh.com` (new domain set up via Cloudflare API in the Litigate rename wrap); `brief.heyitsmejosh.com` CNAME is now stale and can be removed. Still ambiguous: `bcgd.heyitsmejosh.com` vs `bcgd-dashboard.heyitsmejosh.com` (bcgd was accidentally deleted 2026-06-22, Vercel may still be serving one of these), `charters.heyitsmejosh.com` (also part of the 2026-06-22 deletion), and `vxgd.heyitsmejosh.com`/`etyma.heyitsmejosh.com` (purpose unclear from current memory — check what app each actually serves before touching).
- **swiftui-pro audit** (2026-07-18): installed twostraws/swiftui-agent-skill, ran read-only review across 18 apps (~78 findings, full report was in session scratchpad — not persisted). canlii-app's broken error alert (`.constant()` binding) fixed + build-verified, but push failed (`nulljosh/canlii-app` remote missing on GitHub — check if renamed/private before re-pushing). Ranked next: **healstack** (3 manual-`Binding(get:set:)` data-flow bugs in Lab Results/Settings/Log views), **litigate** (biometric-lock Unlock button invisible to VoiceOver), then a shared **epiphany/talli/sparkjar** cleanup pass (C-style `String(format:)` → FormatStyle, hard-coded fonts ignoring Dynamic Type, deprecated haptics APIs). Fix pattern: edit → `xcodegen generate` → `xcodebuild ... -skipPackagePluginValidation` → commit → push, one app at a time (see nimble's 2026-07-18 commit as precedent).
- **canlii → litigate merge**: DONE 2026-07-19 — CanLII case-law search merged into litigate/ios as a "Case Law" tab (`ios/Sources/CaseLaw/`), build-verified. canlii-app kept standalone but frozen (no further polish).
- **RevenueCat** (2026-07-18, found via research): worth evaluating for any app that gates features behind Apple IAP (Stripe alone can't unlock in-app features per App Review rules). Free under $2.5k MTR. Not yet integrated anywhere — needs a RevenueCat dashboard account (browser signup, confirm before opening Chrome) + StoreKit config + entitlement sync. Scope for Epiphany first.
- **SwiftLint** (2026-07-18): Epiphany + Talli lint at build time via SPM build-tool plugin, build-verified (`-skipPackagePluginValidation` required on xcodebuild — see each app's ios/CLAUDE.md Run section). **sparkjar, lexly, healstack, litigate got the same `project.yml`/`.swiftlint.yml` wiring committed but NOT build-verified** (session ended before running `xcodegen generate` + a full xcodebuild pass on each) — verify each builds clean with `-skipPackagePluginValidation` before relying on it; if a build fails, the fallback is reverting `packages:`/`buildToolPlugins:` in that app's project.yml (same revert epiphany needed on the first attempt). journal/inkpress not touched at all — no packages: block exists there yet.
- **Periphery** (2026-07-18): installed via brew (`periphery`, `swiftlint`), not yet configured per-app or wired into a skill. Run manually (`periphery scan`) when doing a cleanup pass — no CI wiring per no-background-automation rule.
- **Progress snapshot 2026-07-02**: ~67 open items ≈ 155h ≈ 4–6 wks — full table in `PROGRESS.md`, refresh with `/progress`
- **healstack**: v2.3.4 build valid + metadata prepped; left: screenshots, availability (dashboard), demo account, then submit
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

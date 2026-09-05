# Codebase Notes (~/Documents/Code)

*Refreshed 2026-09-03 (Plain shipped, fleet-wide auto light/dark mode). This file is a map. Each repo's `CLAUDE.md` and `roadmap.md` hold the detail. `GTM.md` holds the money.*

## Environment
- Mac Mini M4, macOS 25.x · Python 3.14 · Node 24 · xcodegen at `/opt/homebrew/bin/xcodegen`
- `asc` CLI and its skills are installed. Use them. Stay out of the App Store Connect dashboard

## Repos

### Apps
| Repo | What | Domain / ASC |
|---|---|---|
| **epiphany** | Finance dashboard | epiphany.heyitsmejosh.com · 6779522175 |
| **talli** | DTC/RDSP/CDB admin tool | talli.heyitsmejosh.com |
| **voxprint** | On-device transcription, WhisperKit | 6782604262 |
| **lexly** | Gamified language learning | 6783501611 (6783501927 is a stray dupe) |
| **litigate** | Litigation tool, private | litigate.heyitsmejosh.com |
| **healstack** | Health/supplement tracker | healstack.heyitsmejosh.com |
| **sparkjar** | Idea forum | sparkjar.heyitsmejosh.com |
| **curvely** | Equation grapher | 6794988370 |
| **charwork** | Unicode wireframe tool (ASC record still "Wiretext"; own warm-paper theme, not the shared tokens) | wiretext.heyitsmejosh.com |
| **bookrank** | Book summaries | bookrank.heyitsmejosh.com |
| **wordroot** | Etymology lookup | wordroot.heyitsmejosh.com |
| **quotestreak** | Quote guessing game, no backend | 6804394619 |
| **inkpress** | Multi-feed RSS reader, iOS | 6787759999 |
| **sidewise** | RSS bias API + reader | sidewise.heyitsmejosh.com · 6806028670 |
| **nyc** | Times Square city sim | nyc.heyitsmejosh.com |
| **bcgd** | Garage-door site; ships as **Doorstock** | bcgd.heyitsmejosh.com |
| **homeqi** | Feng shui home-assessment tool (web, ex-fengshui); iOS reader-only | homeqi.heyitsmejosh.com |
| **nimble** | Instant answers, menu bar + web. **The reference repo** | nimble.heyitsmejosh.com |
| **cadence** | Commit-history tracker | cadence.heyitsmejosh.com |
| **dream** | Dream journal, Workers AI | dream.heyitsmejosh.com |
| **toroid** | Game of Life on a toroidal grid | toroid.heyitsmejosh.com |
| **homeward** | Lost/found pets, web + iOS + KMP | homeward.heyitsmejosh.com |
| **roost** | Real estate browsing, 25 languages | roost.heyitsmejosh.com |
| **numen** | Free-form calculator canvas | numen.heyitsmejosh.com |
| **swing** | Random 1:1 video chat, Durable Object lobby | swing.heyitsmejosh.com |
| **curbfind** | Craigslist browser, web/iOS/macOS/Android/desktop (renamed from curbside 2026-09-05, ASC 6809031662, submission-ready pending availability). Landing hero is the live app itself (blurred iframe), one click zooms in seamlessly, no reload | curbfind.heyitsmejosh.com |
| **seamark** | Read values off rendered charts (npm lib) | seamark.heyitsmejosh.com |
| **tripwire** | API drift watcher | tripwire.heyitsmejosh.com |
| **keyrate** | Typing test, one file | keyrate.heyitsmejosh.com |
| **plain** | Plain text editor, iOS + macOS + CLI, DocumentGroup only | plain.heyitsmejosh.com |

### Sites & infra
| Repo | What |
|---|---|
| **nulljosh.github.io** | Portfolio, heyitsmejosh.com (jaybulb.com rename pending domain). `/plan` folded in |
| **journal** | Jekyll blog (Pages project `journal-heyitsmejosh`) |
| **brain** | RAG over notes, bearer-gated /api + /mcp |
| **authmail** | Supabase auth email branding + Resend delivery (Cloudflare Worker) |
| **notes** | Private notes |
| **dotfiles** | Shell configs, skills, vibe ref |
| **os** | i386 kernel, boots on QEMU |
| **lec** / **logans-frenchies** | LEC portal client / client site pitch (private) |
| `scripts/`, `_feature_audit/`, `_external/` | helpers / audit CSVs / read-only checkouts, never push |

Gone. Don't mention them: systems, beep, missing-pets, abraham, code-meta, charters, nimble-web, uprighty, life, school/lingo/parlay, plan (archived).

## Ship status
Never write versions here. They go stale in a day. `asc versions list --app <id>` is the truth. Rejection reasons live in Resolution Center only (`asc-login` for 2FA).
Standing: a 4.3(a) spam wave hit 7 apps on 2026-08-28. Replies are filed. Never resubmit into it. Book apps get a vague 2.1 unless you drop CHN.

## Stack
- **Auth**: Supabase email+password, most apps share the `spark` project. Auth emails are intercepted by the authmail Cloudflare Worker, branded per app, and sent via Resend. Swift SDK via SPM, `@Observable` store
- **Hosting**: Cloudflare Pages and Workers. Deploys are `wrangler pages deploy`, not git. **A push deploys nothing.**
- **DNS**: curl with `CLOUDFLARE_DNS_TOKEN` from `~/.config/fish/secrets.fish`. It is not named `CLOUDFLARE_API_TOKEN` on purpose. That name breaks wrangler's OAuth
- **Apple**: xcodegen `project.yml`, no checked-in xcodeproj. SwiftUI, iOS 17+/macOS 14+. `asc xcode archive`/`export`
- **Other platforms**: Kotlin Multiplatform under `<repo>/kmp/` (homeward, nimble, talli so far). A PWA is a fallback. It does not count as coverage. `native-release.yml` builds msi, deb and apk
- **/api + /mcp**: house Cloudflare Functions pattern (quotestreak, bookrank, wordroot, curvely, charwork)
- No emojis in any UI. No demo accounts for screenshots. Use the gitignored `.env`

## Repo standard (nimble is the reference, synced across all repos 2026-09-01)
- `README.md`: `icon.svg` at 80px, H1, then version / MIT / GitHub shields badges, live link, Features
- `LICENSE` (MIT 2026 Joshua Trommel), `SECURITY.md`, `CLAUDE.md`, `WHITEPAPER.md`, `architecture.svg`, `icon.svg`. No `AGENTS.md`
- `WHITEPAPER.md` in every repo, no exceptions: H1 `<Name> Technical Whitepaper`, `**vX** | Month Year`, one-paragraph summary, then the core mechanic first and supporting detail after, MIT footer. ~40-60 lines. New repo = write it before the first push
- `.github/workflows/test.yml` where tests exist. GitHub: description (few words), homepage, topics set
- Icons 200×200 dark terminal aesthetic. Architecture SVGs Apple node-and-line, white bg

## Writing (READMEs, whitepapers, CLAUDE.md, roadmaps, journal, landing copy)
tripwire's README is the reference. Short sentences. Plain words. Say the problem, then the thing, then stop. One idea per line. Fragments are fine when they land ("That's the gap."). Talk to one person. Cut hedges, jargon, "leverage", "seamlessly", "robust". No em dashes, no emojis, no bullet walls where a sentence works. If a paragraph could be a Steve Jobs keynote line, good. If it reads like a product brochure or an AI wrote it, rewrite it. Prose only: this rule never touches code.

## Credentials
- Cloudflare DNS token: `secrets.fish`. Supabase Management PAT: macOS Keychain
- Upstash Redis (epiphany) rotation pending: `/rotate upstash epiphany`
- Stripe/Resend/Supabase keys rotated 2026-05; on-disk copies may be stale, probe the platform

## Gotchas
- `npm i <pkg> --save-dev` on a pinned dep upgrades it without telling you. Edit package.json by hand and diff the lockfile
- Stripe is live on epiphany, healstack, sparkjar and talli. It cannot unlock in-app features under App Review. That needs IAP
- Social sign-in is blocked on console registrations. The code is done
- `mole clean` needs a real TTY for sudo. Run it yourself

## Open work
`roadmap.md` is the queue. `GTM.md` is the ledger. About 18 apps still need a `kmp/` module. roost needs i18n keys before it gets a landing section. litigate has no landing on purpose.

## TUI rollout (2026-09-05)
Shipped 16, each with a `tui/` + root `Package.swift` (SwiftPM target depending on rensbreur/SwiftTUI, static one-shot render, needs a real TTY): nimble, cadence, numen, wordroot, keyrate, curvely, charwork, bookrank, quotestreak, inkpress, tripwire, sidewise, nyc, curbside, homeward, roost.
Three patterns used: reuse an existing Foundation-only model file as-is (nimble/QueryEngine, numen/Parser, curbside/CraigslistAPI); a thin fetch against the live API/Function when logic lives server-side (cadence, wordroot, curvely, charwork, bookrank, quotestreak, sidewise, tripwire); or a thin fetch against a third-party/public API when there's no backend of its own to wrap (roost→Nominatim, homeward→Supabase PostgREST directly, inkpress→its CORS proxy + Foundation's XMLParser). keyrate and nyc ported/reused static logic (score.js line-for-line; nyc's building-cost table, matching its watchOS app's own "quick-reference, not a live mirror" scope decision).
Deliberately not done, with reasons: epiphany, talli, litigate, sparkjar, healstack, lexly (auth-gated personal/financial/health/legal data, nothing to show a stateless CLI without building a login flow); voxprint (on-device WhisperKit transcription needs mic input, different shape entirely); seamark, homeqi (watchOS wrapper only, real logic is JS, would need a fresh port not a reuse); bcgd (local-only business data, nothing to fetch); dream (interpretation endpoint is safety-sensitive — distress detection — and bills Workers AI per call, not something to wrap casually); swing (repo empty on disk); plain (explicit prior decision against a terminal editor, see its own CLAUDE.md).

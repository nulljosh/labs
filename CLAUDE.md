# Codebase Notes (~/Documents/Code)

*Last refreshed 2026-08-28. Per-repo detail lives in each repo's own `CLAUDE.md`/`roadmap.md`; revenue state lives in `GTM.md`. Keep this file a map, not a changelog.*

## Environment
- macOS Darwin 25.x (arm64), Mac Mini M4 · Python 3.14 · Node 24 · xcodegen at `/opt/homebrew/bin/xcodegen`
- `asc` CLI + skills installed — use it instead of the App Store Connect dashboard for anything scriptable

## Repos

### Shipping apps
| Repo | What it is | Domain / ASC |
|---|---|---|
| **epiphany** | Finance dashboard | epiphany.heyitsmejosh.com · id6779522175 |
| **talli** | DTC/RDSP/CDB admin tool (was tally) | — |
| **voxprint** | On-device speech transcription, WhisperKit (was echo) | 6782604262, Universal Purchase |
| **lexly** | Gamified language learning (was lingo/parlay) | 6783501611 (6783501927 is a stray dupe) |
| **litigate** | Litigation tool, private (was brief) | litigate.heyitsmejosh.com |
| **healstack** | Health/supplement tracker (was dose) | healstack.heyitsmejosh.com |
| **sparkjar** | Idea forum, JWT auth (was spark) | sparkjar.heyitsmejosh.com |
| **curvely** | Equation grapher (was grapher) | id6794988370 |
| **charwork** | Unicode wireframe tool (was wiretext; ASC record still "Wiretext"). Deliberately NOT shared-design-system: warm paper theme with terracotta accent (overrides Jaybulb tokens in src/index.css without editing the shared file; iOS + web restyle complete 2026-08-28) | — |
| **bookrank** | Book summaries (was books→spine→uprighty) | bookrank.heyitsmejosh.com |
| **wordroot** | Etymology lookup (was root/etyma) | — |
| **quotestreak** | Quote guessing game, no backend | id6804394619, Universal Purchase |
| **inkpress** | Multi-feed RSS reader, iOS | inkpress.heyitsmejosh.com · 6787759999 |
| **newsline** | RSS API + reader; ships as **Sidewise** | news.heyitsmejosh.com · 6806028670 |
| **nyc** | Times Square city sim | — |
| **bcgd** | Garage-door site + dashboard; ships as **Doorstock** | bcgd.heyitsmejosh.com |
| **fengshui** | Fengshui reader, web + iOS | fengshui.heyitsmejosh.com |
| **nimble** | macOS menu bar + web instant answers | — |
| **cadence** | Time tracking, web + SwiftUI | cadence.heyitsmejosh.com |
| **dream** | Dream journal + interpretation (Workers AI) | dream.trommatic.workers.dev |
| **conway** | Game of Life, web/iOS/macOS. No accounts or network | — |

### Sites & infrastructure
| Repo | What it is |
|---|---|
| **nulljosh.github.io** | Portfolio, heyitsmejosh.com (rename to jaybulb.com pending domain purchase) |
| **journal** | Jekyll blog, journal.heyitsmejosh.com (Pages project `journal-heyitsmejosh`) |
| **notes** | Personal notes + reference, notes.heyitsmejosh.com (braingraph merged in) |
| **plan** | School/career plan site |
| **dotfiles** | Shell configs, api-gateway, kv-store, search-engine, applescripts, vibe ref |
| **scripts/** | Loose helper scripts (letterboxd, trakt, tf-health, wiki sync) |
| **_feature_audit/** | `/feature-audit` CSVs, one per app |
| **_external/** | Read-only third-party checkouts — do not push |

### Experiments (tracked by labs itself — see README.md)
bank, canlii-app, credis, homeward, roost, video-speed-ext. Also local-only: agent-101, lec (LEC portal client), logans-frenchies (research only).

## Gone (do not reference)
systems, beep, beep-web, missing-pets, abraham, code-meta, charters, nimble-web, uprighty (removed 2026-08-25; unique work preserved on `origin/books-wip`), life (archived offline 2026-07-28, backup in `_external/life-site-backup.html`), school→lingo→parlay (now lexly), Vercel orphans fuse/pulse/_site.

## Ship status
Do not record versions here — every version line written from memory has been wrong. Check
`asc versions list --app <id>` (public API, no 2FA). Rejection *reasons* only exist in Resolution
Center and need a 2FA'd web session (`asc-login`), so read the reason before theorising a fix.

Standing context as of 2026-08-28: a wave of Guideline 4.3(a) "spam" rejections hit 7 apps at once;
replies are filed, never resubmit into it. The 5.6 date freeze expired 2026-08-18 and is lifted.
Apps with book/magazine content get a vague Guideline 2.1 unless China mainland is dropped —
`asc pricing availability edit --app <id> --territory CHN --available false`.

## Automation
- No daemons, no crontab. `~/.local/bin` holds only `claude sync uv uvx asc-login`
- `asc-login` — one command daily ASC web relogin, Apple ID + password from Keychain, prompts for 2FA only if the session actually expired. Needs a TTY

## Stack conventions
- **Auth**: Supabase email+password. Most apps share the `spark` Supabase project (free tier is at its 2-project limit) — check `SUPABASE_URL` in project.yml/Info.plist before assuming a dedicated one. Swift SDK via SPM, state in an `@Observable` store
- **Hosting**: Cloudflare Pages/Workers, fully off Vercel since 2026-08-28. Direct-upload via `wrangler pages deploy`, not git-connected — **a git push deploys nothing**, run the deploy
- **DNS**: Cloudflare. Use `CLOUDFLARE_DNS_TOKEN` from `~/.config/fish/secrets.fish` with curl. Deliberately not named `CLOUDFLARE_API_TOKEN` — that name makes wrangler skip OAuth and fail for lacking Workers scope
- **iOS/macOS**: xcodegen `project.yml`, no checked-in `.xcodeproj`. SwiftUI, iOS 17+/macOS 14+. Build through `asc xcode archive`/`export`
- **Lint**: SwiftLint as an SPM build-tool plugin where wired — CLI builds need `-skipPackagePluginValidation`
- **Screenshots/UI tests**: never create demo accounts; use the real credentials in that app's gitignored `.env`
- **No emojis in any UI**, anywhere, every app

## Repo standards
- Every repo: `icon.svg`, `architecture.svg`, `README.md` (icon + version badge on top), `CLAUDE.md`. No `AGENTS.md`
- Icons 200×200, dark terminal aesthetic, inline styles. Architecture SVGs Apple node-and-line, white bg
- MIT 2026, Joshua Trommel. Add `tests.yml` only after tests pass locally

## Credentials
- Cloudflare DNS token: `CLOUDFLARE_DNS_TOKEN` in `~/.config/fish/secrets.fish`
- Supabase Management PAT: macOS Keychain, not `~/.supabase`
- Upstash Redis (epiphany): rotation pending — `security add-generic-password -s rotate-upstash-email -a email -w YOUR_EMAIL -U`, then `/rotate upstash epiphany`

| Rotated | What |
|---|---|
| 2026-05-02 | Stripe sk + pk, Resend, Supabase anon + service role |
| 2026-05-09 | Spark JWT_SECRET |
| 2026-05-14 | Stripe sk, STRIPE_WEBHOOK_SECRET, FRED_API_KEY |
| pending | Upstash Redis |

## Gotchas
- `npm i <pkg> --save-dev` on an already-pinned dep silently upgrades it (jsdom 27→30 broke CI 2026-08-17). Edit package.json and reinstall, or pin explicitly. Diff the lockfile
- Stripe is live on epiphany/healstack/sparkjar/talli. Stripe cannot unlock in-app features under App Review rules — that needs IAP (RevenueCat is the evaluated-but-unintegrated option)
- Social sign-in is blocked on one-time console registrations (Google/Meta/Apple), not on code. Epiphany already has working Google + Facebook server flows waiting on real credentials

## Open work
`roadmap.md` is the queue, `GTM.md` the revenue ledger, `PROGRESS.md` a stale 2026-07-02 sizing snapshot (refresh with `/progress`).

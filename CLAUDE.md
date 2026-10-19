# Codebase Notes (~/Documents/Code)

*Refreshed 2026-10-16. This file is a map. Each repo's `CLAUDE.md` and `roadmap.md` hold the detail. `GTM.md` holds the money. Never write versions here, `asc versions list --app <id>` is the truth.*

![Commits per month since Claude Code inception](progress.svg)

![The fleet: every project, grouped, with the services they share](fleet.svg)

## Environment
- Mac Mini M4 · Python 3.14 · Node 24 · xcodegen at `/opt/homebrew/bin/xcodegen`
- `asc` CLI and its skills are installed. Use them. Stay out of the App Store Connect dashboard.

## Repos

**`~/Documents/Code` is the `labs` repo.** 24 projects live in it as plain folders, history kept, and commit to `labs`: keyrate, weather, swing, evidna, plan, hormuz, tripwire, cadence, fieldbook, dream, seamark, costanza, numen, homeqi, homeward, dotfiles, journal, toroid, coda (ex-quotestreak), curvely, hamurapi, bcgd, nyc, inkpress. Glyphbox (ex-Glyphic, ex-Blockprint) left on 2026-10-18 and is its own repo (`nulljosh/glyphbox`, folder `glyphbox/`, ignored here). Their CI is `.github/workflows/<name>-*.yml` at the root, native builds tag `<name>-native-v*`. Private side projects (hackrange, secretary, slicehack, logans-frenchies) live in the private `vault` repo at `vault/`. Old per-repo bundles are in `_attic/folded/`.

### Apps
Domains are `<name>.jaybulb.com` unless noted. A number is the ASC app id.

| Repo | What |
|---|---|
| **nimble** | Instant answers, menu bar + web. **The reference repo** |
| **epiphany** | Finance dashboard · 6779522175 |
| **talli** | DTC/RDSP/CDB admin tool |
| **notate** (ex-voxprint) | On-device transcription, WhisperKit. Xcode targets and Pages project still say Voxprint · 6782604262 |
| **patois** (ex-tonchi, ex-lexly). Folder is `tonchi` | Gamified learning, 165 courses · 6783501611 (6783501927 is a stray dupe) |
| **intake** (ex-healstack) | Health/supplement tracker. Store name and Pages project still `healstack` |
| **thinkpond** (ex-hikko, ex-sparkjar). Folder is `hikko` | Idea forum. Pages project still `sparkjar` · 6785162492 |
| **mailbag** (ex-hagaki, siftbox, pare, sieve) | Inbox zero in one button. Store listing renamed Mailbag and resubmitted 2026-10-18; Google callback still on hagaki.jaybulb.com · 6811141466 |
| **bookrank** | Book summaries, listen feature |
| **curvely** | Equation grapher · 6794988370 |
| **glyphbox** (ex-glyphic, ex-blockprint, ex-blockframe, ex-wiretext). Own repo, not in labs | Sketch a screen in plain text. Domain, Pages project and bundle ID still `wiretext` · 6794988951 |
| **wordroot** | Etymology lookup |
| **coda** (ex-quotestreak) | Quote guessing game at coda.jaybulb.com. Store listing, Pages project, storage keys and RPCs still say quotestreak · 6804394619 |
| **inkpress** | Multi-feed RSS reader · 6787759999 |
| **sidewise** | RSS bias API + reader · 6806028670 |
| **plaintxt** | Plain text editor, iOS + macOS + CLI |
| **blackcomb** (ex-madobe, ex-lucarne) | WebKit browser: start page, reading list, Float, Pair, site rules. Mac automation built and held until the Mac review clears. Bundle ID `com.nulljosh.lucarne` and Worker name `madobe` stay · 6809355192 |
| **airwell** (ex-windgate) | Guided breathing. Folder is `breathe` · 6810806058 |
| **curbfind** | Craigslist browser, every platform · 6809031662 |
| **atlin** (ex-brick, ex-roost) | Real rentals on a map, deal-ranked, 27 languages. Bundle ID still `com.nulljosh.brick`, Pages project still `roost` (neither can be renamed) · 6824157219 |
| **hamurapi** (ex-hamurabi) | 1968 Hamurabi with a drawn city. Bundle ID and Worker still `hamurabi` · 6819131590 |
| **toroid** | Game of Life on a torus · 6806324937 |
| **nyc** | Times Square city sim (NYC Survive) · 6782618198 |
| **bcgd** | Garage-door site, ships as **Doorstock** · 6791106082 |
| **litigate** | Litigation tool, private, no landing on purpose · 6787857503 |
| **homeqi** | Feng shui home assessment (web, iOS reader-only) |
| **homeward** | Lost/found pets, web + iOS + KMP |
| **homeroom** (ex-lec) | Private D2L quiz app |
| **costanza** | Poetry network, shared spark table `stanza_poems` |
| **swing** | Random 1:1 video chat, Durable Object lobby |
| **dream** | Dream journal, Workers AI |
| **cadence** | Commit-history tracker |
| **numen** | Free-form calculator canvas |
| **tripwire** | API drift and CI-failure watcher |
| **seamark** | Read values off rendered charts (npm lib) |
| **keyrate** | Typing test, one file |
| **weather** | Forecast page, Open-Meteo, one file |
| **fieldbook** | Every field of science + math explained plainly |
| **hormuz** | Strait of Hormuz, oil prices, trading signals |
| **noema** | Mathematics lab: SAT, number theory, small proofs. No GitHub remote yet |
| **evidna** | Evidence-first biology lab, public HBB data |

### Big projects
| Repo | What |
|---|---|
| **joshuatree** | From-scratch i386 and Pi 4 OS: desktop, Wi-Fi, HTTPS browser, Samantha relay. |
| **turing** | Pipeline for small on-device language models. First model: Samantha. |
| **plank** | Small compiled language, one Python file. `homebrew-tap` is the one tap for plank-lang and nimble |
| **vancouvervice** | GTA-style game in the real Vancouver, Unreal 5 |
| **conveyer** | Claude plays Factorio, now Game Dev Tycoon |
| **cruise** | Duolingo autoplayer, private. The runner must stay up |
| **gato** | Voice-first OS shell, local-only repo. "Leopard Gecko" is reserved for Joshua Tree's future distro |

### Sites & infra
| Repo | What |
|---|---|
| **nulljosh.github.io** | Portfolio, jaybulb.com. Pages project `jaybulb` |
| **journal** | Jekyll blog (Pages project `journal-heyitsmejosh`) |
| **notes** | Notes repo, source of truth for the Obsidian vault copy |
| **brain** | RAG over notes, bearer-gated /api + /mcp |
| **jaybulb-api** | Cloudflare Worker on D1 and KV: sign-in, data rules, photos, mail for web apps at api.jaybulb.com |
| **authmail** | Auth email branding + Resend delivery Worker |
| **dotfiles** | Shell configs, skills |

### Small or local-only
`secretary` (Claude + Twilio phone secretary), `hackrange` (security dojo, private), `slicehack`, `logans-frenchies` (client pitch, private), `bbgd` (client site), `bank`, `canlii-app`, `credis`, `agent-101`, `video-speed-ext`, `launch` (post drafts), `runs`. Old experiments and stray copies live in `_attic/` (gitignored, never push). Helpers: `scripts/`, `_external/` (read-only checkouts, never push).

Gone. Don't mention them: systems, beep, missing-pets, abraham, code-meta, charters, nimble-web, uprighty, life, school/lingo/parlay, plan.

## Ship status
Standing: a 4.3(a) spam wave hit 7 apps on 2026-08-28 and again on 2026-10-05. Reply with the nine answers, never resubmit unchanged, and send nothing without Joshua's yes. Book apps get a vague 2.1 unless you drop CHN. Rejection reasons live in Resolution Center only (`asc-login` for 2FA). The ledger is `wiki/pages/asc-status.md` in the Obsidian vault, regenerate it, don't trust it.

## Stack
- **Auth**: web apps use jaybulb-api (email+password, Apple and Google id tokens, per-table rules). Reset and confirm mail goes through authmail via Resend. Supabase (shared `spark` project) stays only for installed native apps until their new builds ship.
- **Hosting**: Cloudflare Pages and Workers. Deploys are `wrangler pages deploy`. **A push deploys nothing.**
- **DNS**: curl with `CLOUDFLARE_DNS_TOKEN` from `~/.config/fish/secrets.fish`. Not named `CLOUDFLARE_API_TOKEN` on purpose, that name breaks wrangler's OAuth.
- **Apple**: xcodegen `project.yml`, no checked-in xcodeproj. SwiftUI, iOS 17+/macOS 14+. `asc xcode archive`/`export`.
- **Other platforms**: Kotlin Multiplatform under `<repo>/kmp/`. A PWA is a fallback and does not count as coverage.
- **/api + /mcp**: house Cloudflare Functions pattern (coda, bookrank, wordroot, curvely, glyphbox).
- No emojis in any UI. No demo accounts for screenshots. Use the gitignored `.env`.

## Repo standard (nimble is the reference)
- `README.md`: `icon.svg` at 80px, version / MIT badges (tests too where CI runs), live link, Features. No H1, no banner image, no GitHub badge (Joshua, 2026-10-16; nimble is the model).
- `LICENSE` (MIT 2026 Joshua Trommel), `SECURITY.md`, `CLAUDE.md`, `WHITEPAPER.md`, `architecture.svg`, `icon.svg`. `AGENTS.md` is a symlink to `CLAUDE.md`.
- `WHITEPAPER.md`: H1 `<Name> Technical Whitepaper`, `**vX** | Month Year`, one-paragraph summary, core mechanic first, MIT footer, about 40 to 60 lines. Write it before the first push.
- `.github/workflows/test.yml` where tests exist. GitHub description, homepage, topics set.
- Icons 200x200 dark terminal style. Architecture SVGs Apple node-and-line, white bg.
- **Landing in every repo** at `<name>.jaybulb.com` (Worker, `wrangler.toml` + `deploy.sh`, `landing/` or `docs/`), live before the ASC record. The real app runs directly on the page under the hero tagline, with no device frame or window around it (Joshua 2026-10-17). Never a screenshot where the app can run. Built on the shared tokens: 8 point grid, one radius set, 48 point capsule controls, system font. Reference: `airwell/web/index.html` and `wordroot/brand/tokens.css`. Older landings that still use a device frame (nimble `docs/index.html` and others) are being rebuilt.

## Writing (READMEs, whitepapers, CLAUDE.md, roadmaps, journal, landing copy)
tripwire's README is the reference. Short sentences. Plain words. Say the problem, then the thing, then stop. Talk to one person. Cut hedges, jargon, "leverage", "seamlessly", "robust". No em dashes, no emojis, no bullet walls where a sentence works. If it reads like a brochure or an AI wrote it, rewrite it. Prose only, never touches code.

## Credentials
- Cloudflare DNS token: `secrets.fish`. Supabase Management PAT: macOS Keychain.
- On-disk copies of Stripe/Resend/Supabase/Upstash keys may be stale, probe the platform.

## Gotchas
- `heyitsmejosh.com` lapsed 2026-10-13 on purpose. Everything lives at `<name>.jaybulb.com`. Native apps still hardcode the old host until their next build.
- `npm i <pkg> --save-dev` on a pinned dep upgrades it silently. Edit package.json by hand and diff the lockfile.
- Stripe is live on epiphany, intake, thinkpond and talli. It cannot unlock in-app features under App Review, that needs IAP.
- Social sign-in is blocked on console registrations. The code is done.
- `mole clean` needs a real TTY for sudo. Run it yourself.

## Open work
`roadmap.md` is the queue. `GTM.md` is the ledger. About 18 apps still need a `kmp/` module. TUI companions (`tui/` + SwiftTUI) exist for 16 apps, the rest are deliberately skipped (auth-gated, mic-bound or no backend).

# Codebase Notes (~/Documents/Code)

*A map. Each repo's `CLAUDE.md` and `roadmap.md` hold the detail, `GTM.md` holds the money. Never write versions here: `asc versions list --app <id>` is the truth.*

## Environment
Mac Mini M4, Python 3.14, Node 24, xcodegen. Use the `asc` CLI, never the App Store Connect dashboard.

## Repos
`~/Documents/Code` is the `labs` repo. Plain folders in it, no repo of their own: bcgd, bbgd (second garage-door site, not deployed), homeqi, dream, cadence, fieldbook, hormuz, keyrate, weather, authmail, dotfiles, scripts, plan, runs, launch (post drafts), and the experiments bank, credis, canlii-app, agent-101, video-speed-ext. Everything else is its own repo in a same-named folder, gitignored here. Labs CI is `.github/workflows/<name>-*.yml`. Private side projects live in `vault/`. `_attic/` and `_external/` are never pushed.

Root stays small: this file, `README.md`, `roadmap.md`, `GTM.md`, `REVENUE.md`, `SHIPPING.md`, `README-TEMPLATE.md`, the two svgs and `LICENSE`. Session handoffs go in `runs/<date>-<name>/`, dead prompts and logs in `_attic/`. Nothing else lives loose at the root.

Old names live on in bundle ids, Pages projects and hosts after a rename. Check the repo's CLAUDE.md before touching them.

### Apps (`<name>.jaybulb.com`, number = ASC id)
| Repo | What |
|---|---|
| **nimble** | Instant answers, menu bar + web. The reference repo |
| **epiphany** | Finance dashboard · 6779522175 |
| **talli** | BC disability assistance tracker · 6782366555 |
| **echo** | On-device transcription (store still Notate, targets Voxprint) · 6782604262 |
| **patois** | Gamified learning, 125 courses · 6783501611 |
| **machaon** | Dose log and health dashboard (bundle `healstack`) · 6785764864 |
| **melete** | Idea feed (Pages `sparkjar`) · 6785162492 |
| **mailbag** | Inbox zero in one button · 6811141466 |
| **kernel** | Chapter summaries (bundle `com.heyitsmejosh.spine`) · 6792376485 |
| **pan** | Desmos-style grapher (store Conics since 2026-11-13, repo still Pan) · 6794988370 |
| **icelus** | Describe a screen, it takes shape (Pages `wiretext`) · 6794988951 |
| **elah** | Nine public domain Bibles offline · 6829146794 |
| **cyllene** | Mac and iPhone App Store Connect app · 6829353117 |
| **eponym** | Etymology dictionary (store Wordroot) · 6794988021 |
| **coda** | Quote guessing game (store Quotestreak) · 6804394619 |
| **bugle** | RSS reader, store name "Bugle News" · 6787759999 |
| **plaintxt** | Plain text editor, iOS + macOS + CLI |
| **blackcomb** | WebKit browser (bundle `lucarne`) · 6809355192 |
| **airwell** | Guided breathing, folder `breathe` · 6810806058 |
| **scrounger** | Craigslist browser · 6809031662 |
| **atlin** | Rentals on a map, deal-ranked (bundle `brick`) · 6824157219 |
| **hamurapi** | 1968 Hamurabi with a drawn city · 6819131590 |
| **toroid** | Game of Life on a torus · 6806324937 |
| **gastown** | Vancouver colony game (store NYC Survive) · 6782618198 |
| **bcgd** | Garage-door site, ships as Doorstock · 6791106082 |
| **temida** | Litigation tool (Pages `themis`) · 6787857503 |
| **sighting** | Lost/found pets (bundle `homeward`) · 6829546358 |
| **costanza** | Poetry network · 6829546496 |
| **cartons** | UPS tracker · 6825115360 |
| **tocks** | iOS Clock on web, iPhone and Mac (ex-Horula, Worker `clock`) · 6826916379 |
| **keyrate** | Typing test, many ports · 6830043245 |
| **homeqi**, **homeroom**, **dream**, **cadence**, **numen**, **weather**, **fieldbook**, **hormuz** | Small web apps |
| **noema** | STEM lab, a lane per field, `./deploy.sh` |
| **hackrange** | Pentesting dojo for the Mac, public, `RULES.md` binds every agent there (Pages `hackrange`) |

### Big projects
**joshuatree** (from-scratch i386 and Pi 4 OS), **turing** (small on-device models), **plank** (one-file language), **vancouvervice** (Unreal 5), **duke** (plays games while you sleep, runner must stay up), **joshemon** (GBA game in C), **mirage** (desert platformer that runs inside Joshua Tree).

`jt-brand`, `jt-gpu`, `jt-install`, `jt-spot` are git worktrees of joshuatree, one per live session. Not projects. Don't move, delete or `git worktree prune` them while a session is on that branch; ask Joshua first.

### Sites and infra
**nulljosh.github.io** (portfolio, jaybulb.com), **journal** (Jekyll), **notes** (Obsidian source), **brain** (RAG), **jaybulb-api** (Worker on D1/KV: sign-in, data, mail), **authmail** (Resend mail Worker), **tripwire** (CI fixer), **homebrew-tap** (`brew install nulljosh/tap/...`), **dotfiles** (shell, skills).

Gone, don't mention: sidewise, seamark, conveyer, gato, systems, beep, missing-pets, abraham, code-meta, charters, nimble-web, uprighty, life, school/lingo/parlay, oohaah.

## Ship status
A 4.3(a) spam wave hit 7 apps twice. Reply with the nine answers, never resubmit unchanged, send nothing without Joshua's yes. Book apps get a vague 2.1 unless you drop CHN. The ledger is `wiki/pages/asc-status.md` in the vault: regenerate it, don't trust it. The live queue (what is rejected, drafted, waiting) is the top of `roadmap.md`, pulled from `asc` on 2026-11-03.

To regenerate: `asc apps list --paginate`, then `asc versions list --app <id> --latest` per app. The JSON key is `items` on versions and `data` on apps.

## Stack
- Auth: web apps use jaybulb-api. Supabase (`spark`) only for installed native apps until their new builds ship.
- Hosting: Cloudflare Pages and Workers via `wrangler pages deploy`. A push deploys nothing.
- DNS: curl with `CLOUDFLARE_DNS_TOKEN` from `~/.config/fish/secrets.fish` (not `CLOUDFLARE_API_TOKEN`, that breaks wrangler OAuth).
- Apple: xcodegen `project.yml`, SwiftUI, iOS 17+/macOS 14+, `asc xcode archive`/`export`.
- Other platforms: Kotlin Multiplatform under `kmp/`. A PWA doesn't count.
- No emojis in UI, no demo accounts, secrets in the gitignored `.env`.

## Repo standard (nimble is the reference)
README with 80px `icon.svg`, version/MIT badges, live link, Features; no H1 or banner. Plus `LICENSE` (MIT 2026 Joshua Trommel), `SECURITY.md`, `CLAUDE.md` (`AGENTS.md` symlinks it), a 40 to 60 line `WHITEPAPER.md`, `architecture.svg`, CI where tests exist, GitHub description and topics. Every repo has a landing at `<name>.jaybulb.com` where the real app runs under the hero, no device frame, on the shared tokens (reference `airwell/web/index.html`, `eponym/brand/tokens.css`).

## Writing
tripwire's README is the reference. Short sentences, plain words, talk to one person. No em dashes, emojis, "leverage", "seamlessly", or bullet walls.

## Gotchas
- heyitsmejosh.com lapsed on purpose; native apps hardcode it until their next build.
- `npm i <pkg> --save-dev` silently upgrades pinned deps. Edit package.json by hand.
- Stripe can't unlock in-app features under App Review; that needs IAP.
- On-disk Stripe/Resend/Supabase/Upstash keys may be stale, probe the platform.
- `mole clean` needs a real TTY for sudo.

## Open work
`roadmap.md` is the queue, `GTM.md` the ledger.

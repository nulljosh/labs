# Cross-repo roadmap

Items without their own repo. Per-project work lives in each repo's `roadmap.md`.
Last pruned 2026-08-24 against live ASC + HTTP state, not against notes.

## Blocked on Joshua (manual, dashboard or phone)

- [ ] **Apple banking/payout rejected.** RBC + Wealthsimple details were not accepted for the
      paid/IAP agreements, which gates *all* IAP revenue. Dashboard-only (Agreements/Tax/Banking),
      needs Joshua + 2FA. Read Apple's exact rejection reason first, then ask which account type
      they want — likely a chequing account with a routable transit/institution number, not a
      Wealthsimple cash account. CRA phone queue has been ongoing for weeks. Concretely gates
      voxprint: `Sources/Services/StoreManager.swift:19` hardcodes `isPro = true` and
      `refreshEntitlement()` early-returns, both with `ponytail:` comments naming this reason.
      Re-enabling is a two-line revert once enrolled.
- [ ] **ASC orphan Mac records to delete**: Transcriptly (6783015101), Lexly Mac (6783501927),
      Nullfolio (6788180394). All superseded by Universal Purchase on the iOS record. No public
      DELETE endpoint exists — dashboard-only, and Apple only allows it for records that never
      sold. Echo support ticket already filed (case 102949488998).
      Talli Mac and Epiphany Mac are DONE — both now ship as the MAC_OS platform of their iOS record.
- [ ] **App Group portal assignment** (developer.apple.com, web UI only). Done: tally.mac
      (5GRY7Y2894), tally.mac.widgets (A58D295228 — verify saved). Remaining, recipe is
      edit page → App Groups Configure → check group → Continue → Save → Confirm:
      epiphany-macos (8UV9646S23) + epiphany-macos.widgets (74WAG78UJS) → `group.com.heyitsmejosh.epiphany`;
      spark.widgets (55W9MW38HJ) + com.heyitsmejosh.spark + .spark.mac + .spark.mac.widgets →
      `group.com.jt.spark`. Then re-export the archives already built in each repo's `.asc/artifacts`.

- [ ] **Lexly Mac 1.1.4 rejection reason** — submission 1a81dace (2026-08-23) is in
      UNRESOLVED_ISSUES and the API will not say why. Reading Resolution Center needs
      `asc web review show --app 6783501611 --apple-id trommatic@icloud.com`, and
      `asc web auth status` is `authenticated:false` — **needs Joshua's 2FA code**. Until the
      submission is resolved every metadata field is locked too (the empty en-US What's New
      cannot be set). 1.1.4 was the keychain fix for a 2.1(a) sign-in rejection.

## Finish the Vercel exit

Down to 2 projects (talli, epiphany). Both live and serving — no outage pressure, but the
account is not closable until they move. Everything else is on Cloudflare Pages and verified 200.

- [ ] **talli** (`talli.heyitsmejosh.com`) — blocked on architecture, not effort. Depends on
      `puppeteer-core` + `@sparticuz/chromium`; headless Chrome does not run on Workers. Needs
      the Cloudflare Browser Rendering API, plus `@vercel/blob` → R2 and dropping `express`.
- [ ] **epiphany** (`epiphany.heyitsmejosh.com`) — hardest. 91 functions, 1.3G,
      `better-sqlite3` (native, no Workers support) and `@vercel/blob`. Flagship, highest blast
      radius. Plan it properly before touching it.

Gotcha that will recur: with `compatibility_date` earlier than 2025-04-01, `nodejs_compat` does
NOT populate `process.env` — bindings read as undefined and assigning to `process.env` silently
no-ops. See `cadence/functions/_adapter.js` for the globalThis workaround, or bump the date.

## App Store hygiene

- [ ] **Developer website sweep** — set `marketingUrl` to https://heyitsmejosh.com.
      Done: Sparkjar, Lexly, Wordroot, NYC Survive, Epiphany. Skipped on purpose: BC Garage
      Doors (client app, keeps bcgaragedoors.ca).
      Locked by ASC ("cannot be edited at this time"), redo on the next editable version:
      Wiretext, Talli, Voxprint, Litigate. Never set at all: Healstack, Curvely, Bookrank,
      Inkpress, Nullfolio.
- [ ] **TestFlight staleness** — most apps are weeks stale. Establish a cadence of
      `asc workflow run ship-ios` per app.
- [ ] **Icon color pass** — rework all app icon colors on the [clrs.cc](https://clrs.cc) palette.
      Current contrast is poor; keep the strong per-app color differentiation, that part works.
      Skip the few icons that already look good.
- [ ] **Icon scaling bug** — art renders small with margins (hit talli 2.4.1, portfolio, books).
      Likely SVG rasterized at source size onto a larger canvas. Root-cause the generation path
      once, fix everywhere.
- [ ] **macOS versions still needed for**: BCGD, Nullfolio, Healstack, Wiretext, Litigate, Inkpress.

## New-app freeze (decided 2026-08-22, revised)

The 5.6 suspension was not caused by update frequency — Apple imposes no submission rate limit.
It fires on new, thin app records submitted in bulk. Updating an app that is already live is
unlimited and zero risk. The rule is "do not submit a *batch* of thin ones"; one finished app
at a time was always fine.

- [ ] **Nimble: approved to ship** — 1,677 lines with real search, results and context-menu UI
      over the Workers AI backend, substantive enough for Guideline 4.2. Ship after the current
      resubmissions come back approved, so there is a clean streak behind it. Needs a full
      session: ASC record (browser-only, see `asc-app-create-ui`), bundle ID, signing,
      screenshots, metadata, App Privacy.
- [ ] **Newsline: do NOT submit** — 398 lines excluding tests, one list view, one detail view,
      a bias bar and one service. That is the exact thin-RSS-reader profile that killed
      Nullfolio. Add real functionality first.
- [ ] **NYC Survive** is the test case: its 5.6 hold expired 2026-08-18, but it needs a genuine
      quality pass plus detailed review notes before resubmitting, not a bare retry.

## Codebase consolidation

Plan: `~/.claude/plans/lovely-churning-wolf.md`. Phase 1 DONE (nested `Code/labs/` clone
deleted, ~1GB freed; `abraham/{contract.pdf,plan.pdf,OPERATING_GUIDE.local.md}` rescued to
top level first — they existed only in that clone).

- [ ] **Phase 2:** convert the 6 hard-copied `tokens.css` (bookrank, fengshui, uprighty, nimble
      web+docs, notes, roost) to the one-line `@import` stub that curvely/litigate/sparkjar/
      wiretext already use. Then add `nulljosh.github.io/apps.json` as the single app registry —
      portfolio cards, app footers and `wiki-refresh` all read it instead of hardcoded lists
      (this is why 8 renames each needed hand-editing everywhere).
- [ ] **Phase 3 merges:** newsline `/api/stories` → inkpress default feeds (smallest, do first);
      fengshui → bookrank chapter + domain redirect; etyma → nimble answer source + redirect;
      publish `bookrank.../summaries.json` so lexly fetches instead of holding copies.
- [ ] **Phase 4 (only user-facing risk):** sparkjar hand-rolled OAuth+JWT
      (`api/_lib/auth/github.js`) → `supabase.auth.signInWithOAuth()`. Deletes code and inherits
      every provider once the 3 console registrations land.
- [ ] Cosmetic leftover: labs.git still *tracks* stale paths at `wiretext/`, `quotable/`,
      `capu/`, `byo-*/`, shadowed on disk by nested repos with their own remotes. No data at
      risk. Fix is `git rm -r --cached <dir>` + a .gitignore entry per dir. Not urgent.
- **Deliberately not doing:** unifying the 4 live Stripe impls (3 runtimes, all verified, no
  payoff). Revisit when a 5th app needs a $1 gate.

## Cross-repo sweeps

- [ ] **Landing pages** — still missing for nimble, curvely, wiretext, nyc, inkpress, bookrank,
      newsline, wordroot. Believed handled a previous session; verify each before reporting done.
- [ ] **Splash screens** — confirm every iOS app has one, add where missing.
- [ ] **Design system** — pick the project with the best one as source of truth, sync the rest.
- [ ] **GitHub tidy** — simplify every project README and match the repo description to it.
- [ ] **Auth buttons** — Apple/Google/Facebook/email on all iOS/Mac apps (Apps.pdf mockup).
- [ ] **Stripe status audit** — only epiphany is known wired. Per app: live vs test keys present,
      webhook registered, whether reauthorization is actually needed. Confirm before scoping.
- [ ] **Reclaim ~224 MB of committed build artifacts from git history (9 repos)** — untracked and
      gitignored 2026-08-19 (voxprint 144 MB, epiphany 52 MB, bcgd 14 MB, sparkjar 8.3 MB,
      inkpress 4.0 MB, wiretext 1.7 MB, plus talli/healstack/litigate) so nothing new accumulates,
      but the blobs remain in history and clone size is unchanged. Needs `git filter-repo` +
      force-push per repo, as done once for bookrank. One repo at a time, back up first, only
      when nothing else is in flight on that repo.
- [ ] **Supabase `logs.all` removal 2026-09-23** — migrate to `analytics/endpoints/logs`. A
      2026-08-22 grep across the codebase found zero in-repo references, so the caller is an
      external script, a CI job, or the Supabase MCP/CLI itself. Find it before the cutoff.
- [ ] **Disk cleanup** — update `mole` and run a deep clean.
- [ ] **Codebase SVG** — `codebase.svg` in `~/Documents/Code`, node-and-line graph in the journal
      aesthetic (Geist, #111 bg, #e8e8e8 text, `prefers-color-scheme`). Show the shared Supabase,
      the labs monorepo, dotfiles infra, presence. Reference it from CLAUDE.md.

## Build gotchas (for whoever scripts a smoke test)

`sparkjar` and `talli` have no scheme in the repo root, and their first scheme alphabetically is
the watchOS one (`SparkWatch`, `TalliWatch`), which fails against an iOS Simulator destination —
pick `Spark` / `Talli` from `ios/` explicitly. Healstack's iOS scheme is still called `Dose`,
not `Healstack`.

## Wiki backlog (deferred from the 2026-08-11 wrap)

- [ ] `notes/notes/master.md`: bump Updated date, refresh Roadmap / Active Projects / Ship Now
- [ ] Obsidian vault (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Code/wiki/`):
      ingest 2026-08-11 per `wiki/CLAUDE.md`, update touched entity pages, then refresh
      `index.md` + `pages/_overview.md`. This is the surface actually read — don't skip it.
- [ ] Run `wiki-refresh` across its 3 surfaces (vault, master.md, Code/CLAUDE.md)

## Someday / explore

- [ ] **Sparkjar rename** — name still undecided.
- [ ] **Quotestreak quote bank** — replace the hardcoded ~25-quote `quotes.json` with a real
      source. No well-known free movie-quote API exists; may need to curate, or pair TMDB
      metadata with a quotes dataset.
- [ ] **RBC account + ASC** — clarify what "hook up" means (payout routing? reconciliation?)
      before starting. Probably the same underlying issue as the payout item above.
- [ ] **Ontology** — connect projects with a shared entity index. Overlaps with Epiphany's
      ontology / people index feature.
- [ ] **Graph engineering** — research github.com/codejunkie99/graph-engineering; we already
      ship SVG architectures in many READMEs.
- [ ] **Xcodeless** — headless release audit across all apps (project.yml, Local.xcconfig,
      notarytool profiles, scripts/release.sh, CLAUDE.md docs).
- [ ] **/asc-update skill** — detect apps changed since last release → build → TestFlight upload
      → release notes.
- [ ] **Obsidian/notes consolidation** — evaluate merging the vault into the notes repo
      (braingraph already merged 2026-07-11) for one source of truth.
- [ ] **Claude Code plays Factorio** — Steam + Factorio already installed. Try
      github.com/JackHopkins/claude-code-plays-factorio first, fallback
      github.com/MarkMcCaskey/factorioctl. For fun, low priority.
- [ ] **Terminal** — Abralo is installed to /Applications; trial vs cmux, then decide whether to
      drop Warp/cmux. Verdict notes in `wiki/pages/terminal-tooling.md`.
- [ ] **Unidentified CI failure** — "Prepare Build for App Store Connect failed" on commit
      "Fix Mac app icon rebrand, close out stale roadmap items". Repo unknown; grep git log across
      `~/Documents/Code/*` to locate, then pull the Xcode Cloud build log.

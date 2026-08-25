# Cross-repo roadmap

Items without their own repo. Per-project work lives in each repo's `roadmap.md`.
Last pruned 2026-08-24 against live ASC + HTTP state, not against notes.

## Blocked on Joshua (manual, dashboard or phone)

**Probed 2026-08-25 — two of these are smaller than their labels said.**

- **Orphan record deletion is NOT dashboard-only.** `asc web apps delete --app <id>
  --expected-name "..." --confirm` exists, and the old 409's missing prerequisite looks like
  removal from sale: `asc pricing availability remove-from-sale --app 6783015101 --confirm`
  succeeded cleanly (`removedFromSale`, 175/175 territories verified). **Transcriptly 6783015101 is
  now removed from sale, but the delete still 409s with the exact code nobody had captured before:
  `STATE_ERROR.CANNOT_REMOVE_WITH_APP_STORE_AVAILABILITY`. **Cause: the record still has
  `availableInNewTerritories: true`**, so Apple counts it as still available. No CLI can clear that
  flag (the API "cannot change it" per its own help; `asc web apps availability` only has `create`).
  **Fix: ASC → app → Pricing and Availability → turn off "Available in new territories", then the
  delete works.** That is the dashboard prerequisite the old note never named. Also gated by
  this machine's permission classifier, so Joshua runs that one line. Not worth loosening
  permissions for: these records are rejected, never sold, and harm nothing sitting there.
- **Apple banking narrowed.** `asc web agreements status` shows both Developer Program agreements
  `active`, `pending: false`, `contractMessages: []` (License Agreement accepted 2026-08-19). So the
  Program agreements are ruled out. What remains is the **Paid Applications Agreement + banking**
  under ASC Business → Agreements, Tax, and Banking, a separate system with **no `asc` surface at
  all**. Genuinely browser-only. When doing it: read Apple's exact rejection text first rather than
  re-entering details — the likeliest cause is that a **Wealthsimple cash account has no routable
  transit/institution number** and Apple needs a real chequing account (RBC), or the account-holder
  name does not match the developer entity.


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

- **Lexly Mac 1.1.4 — SOLVED 2026-08-25, no longer blocked on Joshua.** He supplied a 2FA code,
      the web session read Resolution Center, and the reason was **Guideline 2.1: book/magazine
      content listed for China mainland without a Chinese Internet Publishing License
      (网络出版服务许可证)** — a territory-licensing issue, never a code bug. Both prior theories
      (the 2.1(a) sign-in fix, the collapsed-window fix) were chasing the wrong cause. Fixed by
      dropping China rather than chasing an unobtainable permit:
      `asc pricing availability edit --app 6783501611 --territory "CHN" --available false`,
      then cancelling the stale `UNRESOLVED_ISSUES` submission and resubmitting. Now
      `WAITING_FOR_REVIEW` as `c7a51dfe`. Full detail in `lexly/roadmap.md`.
      **Watch for this on the other book/text apps** — bookrank, wordroot, quotestreak and
      inkpress are all still listed in China mainland. bookrank is already *live* that way, so
      the rule is reviewer-triggered, not automatic; none were pre-emptively changed.

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
      Also done 2026-08-24: **Healstack, Quotestreak (iOS + macOS)**.
      **Rule learned:** the field is editable while a version is WAITING_FOR_REVIEW, and only
      locks at READY_FOR_SALE — so catch each app *while it is in the review queue*.
      Still locked (all currently live), redo on their next editable version: Wiretext, Talli,
      Voxprint, Litigate, Curvely, Bookrank, Inkpress, Nullfolio.
      **CLI gotcha:** `asc apps info edit --app <id> --marketing-url ...` without
      `--platform`/`--version` fails with a misleading "The URL path is not valid"; pass both
      and you get Apple's real answer.
- [ ] **TestFlight staleness** — most apps are weeks stale. Establish a cadence of
      `asc workflow run ship-ios` per app.
- [ ] **Icon color pass** — rework all app icon colors on the [clrs.cc](https://clrs.cc) palette.
      Current contrast is poor; keep the strong per-app color differentiation, that part works.
      Skip the few icons that already look good.
- **Icon scaling bug — CLOSED 2026-08-25, already fixed; do not re-open without a live example.**
      Root-caused: the cause was `rsvg-convert` using the SVG's *intrinsic* size, so art landed
      small on a 1024 canvas. Every `scripts/make-appicon.sh` that exists (bookrank, lexly,
      nulljosh.github.io, sparkjar, uprighty) already passes `-w 1024 -h 1024`, which forces full
      size — bookrank's even carries a comment naming this exact glitch. Spot-checked the shipped
      PNGs for talli (the version named above) and inkpress: both are 1024x1024, `hasAlpha: no`,
      and the art fills the canvas. `talli 2.4.1` predates the fix; it ships 3.5.12 now.
      **Residual risk, deliberately not acted on (YAGNI):** 19 repos have an `icon.svg` but no
      `make-appicon.sh`, so they have no guardrail against a hand export reintroducing this.
      Nothing is currently broken, so no script was copied into 19 repos. If it recurs, the fix
      is one shared parameterized script (dest + bg differ per repo), not 19 copies.
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
- **Newsline: do NOT submit — settled 2026-08-25.** 398 lines, one list view, one detail view,
      a bias bar and one service: the exact thin-RSS-reader profile that killed Nullfolio. Rather
      than fatten it, its curated feed list was folded into Inkpress 1.0.5 (Phase 3 below), which
      is a shipping app. Newsline stays a Worker + MCP server, not an App Store submission.
- [ ] **NYC Survive** — **already resubmitted**, contrary to the note this bullet used to carry.
      Live state 2026-08-25: iOS 1.0.0 `WAITING_FOR_REVIEW`, macOS 1.0.0 `IN_REVIEW`. Nothing to
      do but wait for the verdict; if it comes back rejected, *then* do the quality pass.

## Codebase consolidation

Plan: `~/.claude/plans/lovely-churning-wolf.md`. Phase 1 DONE (nested `Code/labs/` clone
deleted, ~1GB freed; `abraham/{contract.pdf,plan.pdf,OPERATING_GUIDE.local.md}` rescued to
top level first — they existed only in that clone).

- [ ] **Phase 2 — RE-SCOPED 2026-08-24, was mis-described.** This is not one mechanical
      cleanup, it is three different things:
      1. **DECIDED 2026-08-24: not doing the theme swap.** A naive stub swap also *breaks*
         these sites — they use 4 tokens the canonical file does not define
         (`--font-display` on all three, plus `--accent-soft` and `--cell2`/`--dur`), so the
         fonts and accents would fall back to nothing. Converting properly means adopting the
         Jaybulb look *and* hand-mapping the orphans: a repaint of three live sites, which is
         a taste call, not a cleanup. Leave the local copies until Joshua wants the repaint.
         bookrank/fengshui/uprighty carry the
         **fredrika** theme (66 lines, `--bg:#fcfcfc`, Geist, no serif). The canonical
         `heyitsmejosh.com/tokens.css` is **Jaybulb** (85 lines, `--bulb:#ffca30`, black on
         white, square corners) — `diff` is 147 lines. Swapping the stub in redesigns three
         live sites. Ask before doing it.
      2. ~~**Safe mechanical dedupe:** nimble ships its own design system copied 4x.~~
         **DONE 2026-08-25.** Only two copies were ever tracked (`web/` and `dist/` are
         build output / gitignored); `web/tokens.css` and `web/icon.svg` were byte-identical
         to the `docs/` originals and are now symlinks to them. `scripts/build-site.sh` uses
         `cp`, which dereferences, so `dist/` still ships real files.
      3. notes and roost have their own distinct token sets (roost even imports Fraunces) —
         leave them alone unless the answer to (1) is "adopt Jaybulb everywhere".
      Then add `nulljosh.github.io/apps.json` as the single app registry —
      portfolio cards, app footers and `wiki-refresh` all read it instead of hardcoded lists
      (this is why 8 renames each needed hand-editing everywhere).
- [ ] **Phase 3 merges:** ~~newsline → inkpress default feeds~~ **DONE 2026-08-25** — the 16
      curated outlets from `newsline/src/feeds.js` now seed `FeedStore.seedFeeds` in Inkpress,
      plus a Suggested list in Manage Feeds. Only the *list* moved: Inkpress keeps parsing RSS
      itself, so there is no runtime dependency on the newsline Worker. Shipped as 1.0.5.
      Remaining: fengshui → bookrank chapter + domain redirect; etyma → nimble answer source +
      redirect.
      ~~publish `bookrank.../summaries.json` so lexly fetches instead of holding copies~~
      **DROPPED 2026-08-25 — the premise was wrong, there is nothing to dedupe.** Checked:
      `bookrank/summaries/` is empty and uncommitted (populated locally from iCloud by
      `sync-summaries.sh`, so there is no `summaries.json` to publish in the first place), and
      lexly's `content/notes/*.json` are 17 **masterclass course** files, a different artifact
      from bookrank's markdown chapter summaries — not copies of them. lexly contains zero
      references to bookrank. Do not re-open this without new evidence.
- [ ] **Phase 4 (only user-facing risk):** sparkjar hand-rolled OAuth+JWT
      (`api/_lib/auth/github.js`) → `supabase.auth.signInWithOAuth()`. Deletes code and inherits
      every provider once the 3 console registrations land.
- **DONE 2026-08-25** — labs.git no longer tracks stale paths inside nested repos. `wiretext/`
      and `quotable/` had already been cleaned; `capu/` and the four `byo-*/` repos were untracked
      with `git rm -r --cached` + a .gitignore entry each. Nothing removed from disk.
- **Deliberately not doing:** unifying the 4 live Stripe impls (3 runtimes, all verified, no
  payoff). Revisit when a 5th app needs a $1 gate.

## Cross-repo sweeps

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
- **Supabase `logs.all` removal 2026-09-23 — CLOSED 2026-08-25, nothing for us to do.** The
      2026-08-22 grep found zero in-repo references; the 2026-08-25 pass ruled out the two
      remaining suspects as well — there is **no crontab** on this machine and **no CI workflow
      in any repo references Supabase**. The only match anywhere in `~/Documents/Code` for
      `logs.all` is this roadmap line describing itself. The caller is therefore the Supabase
      MCP server or CLI, which we do not own and which will move to
      `analytics/endpoints/logs` on its own. Keep the CLI/MCP current and this resolves itself.
      Do not spend another session hunting for a caller that is not ours.
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

## Vercel → Cloudflare migration — 2026-07-18
- [ ] Goal: move hosting off Vercel to Cloudflare Pages/Workers for all 8 apps that use Vercel (canlii-app, epiphany, healstack, journal, lexly, nulljosh.github.io, sparkjar, talli), consolidating onto one platform since DNS is already on Cloudflare.
- [x] Piloted with journal (Jekyll, static, lowest risk): built `_site`, created Cloudflare Pages project `journal-heyitsmejosh`, deployed successfully (verified 200 on `journal-heyitsmejosh.pages.dev`).
- [ ] **Blocker**: `CLOUDFLARE_DNS_TOKEN` (in `~/.config/fish/secrets.fish`) only has DNS:Edit scope — adding a custom domain to a Pages project needs Pages:Edit, which that token doesn't have. `wrangler`'s own OAuth session has `pages (write)` scope but its token isn't easily extractable for direct API calls. Try `CLOUDFLARE_API_TOKEN` at `~/.openclaw/.openclaw.bak/.secure/cloudflare.env` next session (per CLAUDE.md Credentials) — may already have broader scope — or use `wrangler pages deployment`/dashboard for the one-time domain attach.
- [ ] I attempted cutting `journal.heyitsmejosh.com` DNS to the Pages project before the custom domain was registered on the Pages side — site 522'd. **Reverted DNS back to `cname.vercel-dns.com` (unproxied), confirmed matches original.** journal is back on Vercel, unaffected.
- [ ] Correct order next time: (1) deploy to Pages, (2) add custom domain to the Pages project via API/dashboard *first*, confirm it resolves on the `.pages.dev` domain with the custom hostname attached, (3) only then flip DNS.
- [ ] Remaining 7 apps not started. epiphany and talli have live users — treat as higher-risk, do last, one at a time, verify before DNS cutover each time.

## From Asc.pdf (imported 2026-07-14)
- [ ] Spark rename — decide new name and rename repo/ASC/domain (Spark currently still under consideration, per user note "still a fucking mess"); scope tbd

## QuoteGuess
- [ ] Replace hardcoded `quotes.json` (~25 basic quotes) with a real movie-quote API for a much larger bank — investigate options (no well-known free "movie quotes" API exists yet; may need to scrape/curate or pair TMDB metadata with a quotes dataset)
- [ ] iOS: `ios/` has SwiftUI+WKWebView scaffold (project.yml, QuoteGuessApp.swift, GameWebView.swift, bundled web assets) but is untested — needs `xcodegen generate`, Info.plist, app icon, ASC bundle ID registration (com.heyitsmejosh.quoteguess), build, and TestFlight upload. Paused 2026-06-30 at 80% weekly usage limit.

## Docs → wiki sync — 2026-07-03
- [ ] Run `~/Documents/Code/scripts/sync-docs-to-wiki.sh` to push repo READMEs into the Obsidian wiki.

# Unfiled roadmap

Items without their own repo/README. Move into a real README once the project exists.

## Talli Xcode Cloud signing fix — 2026-07-03
- [x] Root cause found: widget App Group entitlement used `group.com.jt.talli`, which doesn't match Talli's bundle ID prefix (`com.heyitsmejosh.tally*`) — never registered with Apple, so every Xcode Cloud archive since commit `1c5eea7` failed at export/code-signing (50+ failures over weeks).
- [x] Renamed to `group.com.heyitsmejosh.talli` across 7 files (entitlements + Swift), committed (`3c26df6`) and pushed to `nulljosh/talli` main.
- [x] Confirmed via `asc bundle-ids capabilities list` — App Groups capability already enabled on all 4 bundle IDs (`com.heyitsmejosh.tally`, `.widgets`, `.mac`, `.mac.widgets`).
- [ ] **Blocked on manual step**: register the App Group container `group.com.heyitsmejosh.talli` itself at developer.apple.com/account/resources/identifiers/list/application-group (not exposed via public ASC API — web UI only, needs Apple ID + 2FA login). Portal was loading/spinning indefinitely 2026-07-03, deferred to this weekend.
- [ ] Then attach the new group to all 4 bundle IDs' App Groups capability, and re-run the Xcode Cloud build.

## Session handoff 2026-07-01
- [x] **Dose/Healstack** — local repo now exists at `~/Documents/Code/healstack` (confirmed 2026-07-20), actively developed all session (commit `aa3701d` etc). No longer missing.
- [x] **Talli** — Xcode Cloud signing fixed and CI green as of this session's talli sweep (`3c26df6` + follow-ups); build/submission pipeline unblocked.

## Codebase SVG diagram
- [ ] Create `codebase.svg` in `~/Documents/Code/` showing project relationships (node-and-line graph)
- [ ] Style: journal aesthetic (Geist font, #111 bg, #e8e8e8 text, `@media prefers-color-scheme`)
- [ ] Show: Supabase shared by spark+epiphany+dose, labs monorepo (wiretext/grapher/roost/canlii-app), dotfiles infra, presence (journal+portfolio)
- [ ] Reference it in CLAUDE.md as `![codebase](codebase.svg)`

## Stashed 2026-06-28
- [ ] Add Apple/Google/Facebook/email auth buttons to all iOS/Mac apps (see Apps.pdf mockup — Apple+Google+Facebook+email layout)

## Ssn leak (security)
- [ ] Verified: SIN absent from apps working tree (see run log)
- [ ] Personal follow-ups (not code): call Service Canada 1-866-274-6627; place fraud alerts with Equifax + TransUnion Canada; ask GitHub Support to purge cached views of the old commits
- [ ] Audit every repo for other scraper-captured PII (systemic, not a one-off)

## /ship remaining apps
CLI metadata done 2026-06-29. Manual blockers remaining for all 3:
- [ ] **Availability** — ASC → Pricing & Availability → all territories (Echo 6782604262, Spark 6785162492, LingoAce Mac 6783501927)
- [ ] **Screenshots** — iOS screenshots for Echo + Spark; Mac screenshots for LingoAce Mac
- [ ] **App Privacy** — publish in ASC for all 3
- [ ] **Spark build** — no build uploaded yet, needs archive + upload first
- [ ] **LingoAce iOS** (6783501611) — needs same metadata pass + .ship.json

## Echo iOS 1.3.0 — blocked on IAP setup (2026-07-03)
- [x] Resolved: "Echo Pro" IAP (`com.nulljosh.echo.unlock`, id 6787371864) now exists in ASC, state WAITING_FOR_REVIEW — confirmed via `asc iap list --app 6782604262` 2026-07-20. Echo iOS 1.3.3 itself is also WAITING_FOR_REVIEW (submission went through).

## Wrap 2026-07-05 (hard-problems pass) — manual steps for Joshua
- [ ] NYC iOS: in ASC web UI — App Privacy answers, privacy policy URL, iPad 12.9" screenshot — then `asc review submit` (build 5 already clean)
- [ ] Epiphany: Trade tab is STILL disabled as of 2026-07-20 (`FinancePanel.jsx` comment: "disabled until SnapTrade sync math is fixed, phantom holdings, bad net worth") — contradicts memory file `project_epiphany_stale_holdings.md` claiming this was fixed 2026-07-15; that memory is stale, flagging for correction. Still needs the force-sync + re-enable.
- [ ] Echo/Talli: check Apple validation emails for upload errors 90183/90189, then re-upload
- [ ] Talli login: repro live once so logging can pinpoint BC Self-Serve auth failure
- Sparkjar fn-cap consolidation plan noted in sparkjar/roadmap.md (deferred, nothing blocked)

## 2026-07-10 icon/ship blockers (from overnight session)
- [ ] App Group portal assignment — 2026-07-10 partial: all 3 groups already registered; DONE via portal: tally.mac (5GRY7Y2894), tally.mac.widgets (A58D295228 — verify saved). REMAINING (recipe: edit page → App Groups Configure → check group → Continue → Save → Confirm): epiphany-macos (8UV9646S23) + epiphany-macos.widgets (74WAG78UJS) → group.com.heyitsmejosh.epiphany; spark.widgets (55W9MW38HJ) + com.heyitsmejosh.spark + .spark.mac + .spark.mac.widgets → group.com.jt.spark. Then re-export archives (already built in each repo's .asc/artifacts).
- [ ] Books Mac: export failed after archive — rerun `asc xcode export` with ExportOptionsMac.plist in books/ios and read the error.
- [ ] Sparkjar iOS: same App Group blocker as Spark (documented earlier).
- [ ] All .asc/workflow.json ship-mac workflows broken: asc CLI removed `--pkg-path`; steps also fail on pre-existing archive paths (need --overwrite). Update workflow.json in echo/talli/epiphany/spark.
- [ ] Echo iOS 1.3.3: verify resubmission actually went through (poller: asc review submissions-submit --id 5d64a452-...; version must leave PREPARE_FOR_SUBMISSION).
- [ ] Uploaded tonight, icons appear after Apple processing: Echo Mac 1.3.3, books-ios 1.0, Healstack (uploading).
- [x] Healstack + books-ios icons live on ASC (2026-07-10)
- [ ] books: merge Books Mac + books-ios into one universal ASC app record
- [ ] books-ios icon scaling bug — art renders small with margins (recurring across apps: talli v2.4.1, portfolio, now books; likely SVG rasterized at source size onto larger canvas). Root-cause the icon generation path once, fix everywhere.
- [ ] spark: merge Spark Mac + Sparkjar into one universal ASC app record (same as books merge)

## GitHub cleanup (2026-07-10) — DONE
- labs pushed, 5 repos archived (15 active), Vercel projects grapher/wiretext/etyma repointed to labs subdirs via API. All sites verified 200.

## Stashed 2026-07-10 (braindump session)
- [ ] primitive.dev MCP: OAuth flow errors (server returns null client_uri/logo_uri, SDK rejects) — run /mcp to auth manually; then send/receive smoke test; tell Ben about the null-fields spec bug
- [ ] Terminal: Abralo installed to /Applications — trial it vs cmux for a few days, then decide whether to drop Warp/cmux (verdict notes in wiki pages/terminal-tooling.md)

## 2026-07-14 dump (cross-repo)
- [ ] /asc-update skill: detect apps changed since last release → build → TestFlight upload → release notes; investigate release automation (CI uploads, version bumps, changelog from git, release gates)
- [ ] iOS+macOS codebase consolidation where apps have separate implementations
- [ ] Xcodeless: run headless release audit/setup across all apps (scottwillsey.com/building-and-shipping-mac-and-ios-apps-without-ever-opening-xcode) — project.yml, Local.xcconfig, notarytool profiles, scripts/release.sh, CLAUDE.md docs
- [ ] GitHub cleanup: standardize READMEs, prune completed roadmap items, move loose root files into folders
- [ ] Obsidian/notes consolidation: evaluate merging Obsidian vault into notes repo (braingraph already merged 2026-07-11) — single source of truth
- [ ] Add CLAUDE.md refresh step to /update skill (clean up + keep current)
- [ ] Project-clone shortcut (/vibe for projects) — check if exists; use on namethatui.com

## From Asc.pdf / Asc - Icons.pdf / Asc - TestFlight.pdf (imported 2026-07-19)
- [ ] Hook up RBC account (banking) with ASC — no further detail given, clarify what "hook
  up" means (payout routing? reconciliation?) before starting
- [ ] Stripe reauthorization needed across any/all apps — user flagged "we need
  reauthorization with stripe and maybe a cli" — check Stripe dashboard connection status
  per-app (epiphany has Stripe wired, others may not) before assuming scope
- [ ] Multi-app ASC cleanup checklist (source: "Asc / Icons"):
  - Finish Inkpress App Store rejection → confirm it returns to a healthy submission state
  - Merge Echo iOS + macOS into one App Store record (Universal Purchase) — **an existing
    plan already covers this in detail**: `~/.claude/plans/proud-popping-floyd.md` (Step 1
    done: bundle id set to com.nulljosh.echo; Step 2 cheap ASC-side steps ready to run;
    Step 3 heavy WhisperKit archive/upload deferred to a fresh-usage session). Follow that
    plan, don't restart from scratch. It also notes the same merge pattern should roll to
    Lexly, Talli, Epiphany next, and separately that Litigate's "red dot" is a real
    unread-review-messages badge, not an icon bug (already proven, don't re-investigate).
  - Merge Lexly Mac into the Lexly iOS listing (delete/merge standalone macOS app); if ASC
    blocks a same-CLI merge, the source note says "use Opus to complete the merge" (i.e.
    escalate to Opus model for a harder web-UI-driven merge)
  - [x] Rename Spinelist → Spine: confirmed DONE — GitHub repo `nulljosh/spine`, ASC bundle id
    `com.heyitsmejosh.spine` exists, CLAUDE.md/roadmap.md updated, wiki page renamed
    `books.md`→`spine.md` (verified 2026-07-20).
  - Fix Nullfolio icon spacing (match padding/weight/corner treatment/style of the rest of
    the portfolio icon set — keep the already-corrected spacing)
  - Fix Litigate icon: remove remaining red badge/indicator from the icon asset itself,
    rebuild icon assets, verify correct asset in use (separate from the unread-messages
    badge issue noted above, which is NOT this — that one's already explained/expected)
  - Final review pass: confirm no duplicate ASC app entries, all icons consistent, every
    app in a valid ASC state before submission
- [x] TestFlight/ASC sync recurring bottleneck — the specific example (Lexly "Couldn't load
  Computer Basics") is resolved: fix landed in `634e2fc`, iOS 1.1.1 resubmitted with the
  fixed build (per lexly/roadmap.md). General action item remains valid as an ongoing
  practice (audit build-vs-commit before assuming a bug is live) but isn't a one-time task —
  moved to a standing practice note rather than a checkbox.

## From claude games.pdf (imported 2026-07-19)
- [ ] Get Claude Code to play Factorio — Steam + Factorio already installed locally. Try
  https://github.com/JackHopkins/claude-code-plays-factorio first (purpose-built); fallback
  https://github.com/MarkMcCaskey/factorioctl (lower-level) if the first doesn't fit. For-fun
  project, no shipping-app tie, low priority.

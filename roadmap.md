## README refresh sweep — 2026-07-22 — DONE, all repos checked
Fixed 6 repos: epiphany (consolidated conflicting/stale broker-decision
sections — Alpaca is default execution path, RBC/WS confirmed dead ends),
talli (badge 3.5.6→3.5.7), echo (badge 1.3.2→1.3.3), litigate (README still
said "Brief"/`brief.heyitsmejosh.com` from before the 2026-07-18 rename —
fixed title/domain/status), lexly (badge 1.1.0→1.1.1), healstack (badge
2.1.1→2.3.4). All committed+pushed.
Checked, no drift found: sparkjar, inkpress, journal (already documents the
inkpress split correctly), spine, newsline, bcgd, nyc, nimble, dotfiles,
labs, nulljosh.github.io. life/canlii-app/agent-101 have no README by design
(local-only experimental, not standalone GitHub repos per CLAUDE.md) — skipped.

## ASC apps status — 2026-07-21 (from Joshua's grid review)
- [ ] Spinelist ASC app-name field (still shows "Spinelist", not "Spine") — attempted rename to "Spine" 2026-07-21, **rejected by Apple: name already taken by another developer account.** Also found conflicting ASC app-ID info between memory (`6787499076`/`6787499349`) and this session's `asc apps list` lookup (`6792376485`) — needs reconciling before any further naming action. Needs a real decision (new candidate name via `asc-name-creator` skill), not a guess — not attempted further this pass.
- [ ] Spinelist "needs an icon": INVESTIGATED 2026-07-21 — false alarm. `asc builds list --app 6792376485` shows **zero builds ever uploaded** to this app record, so there's nothing for Apple's CDN to render an icon from yet (same known false-positive pattern as `project_icon_ship_pipeline` memory describes). Local icon asset (`spine/ios/Spine/Assets.xcassets/AppIcon.appiconset/icon_1024.png`) is valid (1024×1024, no alpha). Real fix is just: build + upload once, not an icon fix.
- [ ] Epiphany + Talli Mac + Lexly Mac + Echo Mac — INVESTIGATED 2026-07-21, Joshua decided: delete the 4 standalone Mac app records, make each iOS app multiplatform (same bundle ID, "Add Platform" macOS) going forward. Findings:
  - Confirmed all 4 Mac app records have distinct bundle IDs from their iOS counterparts (`com.nulljosh.echo` vs `com.nulljosh.echo.mac`, `com.nulljosh.lingo` vs `.mac`, `com.heyitsmejosh.tally` vs `.mac`, `com.heyitsmejosh.epiphany` vs `epiphany-macos`) — genuinely separate app records, not a UI quirk.
  - Confirmed **none of the 4 have ever shipped** (`asc versions list`): Echo Mac / Talli Mac / Epiphany Mac all PREPARE_FOR_SUBMISSION (never submitted), Lexly Mac REJECTED (never approved) — zero live users, reviews, or rankings at risk, so deletion is low-consequence.
  - Confirmed via `asc schema "DELETE /v1/apps"` — **no public API endpoint exists to delete an app record.** Apple only exposes this in the ASC web dashboard (App Information → General → remove, only possible for apps that never had a build go to sale). Not attempted via browser automation — deleting an app record is Apple's most irreversible action; needs Joshua's own click, not automated.
  - [ ] **Manual step (Joshua, ASC dashboard)**: delete the 4 unshipped Mac app records (Echo Transcribe Mac id 6783015101, Lexly Mac id 6783501927, Talli Mac id 6782661988, Epiphany Mac id 6782703473).
  - [ ] **Follow-up code work (separate session, not started)**: convert each iOS Xcode project to a multiplatform target (add macOS platform under the existing iOS bundle ID via xcodegen `platform: [iOS, macOS]` or per-target macOS destination) so future Mac builds ship under the same app record as iOS. Nontrivial per-app surgery (entitlements/capabilities differences between platforms) — scope as its own task, not a quick loop item.
- [~] Nullfolio icon: the "N" square shown in Joshua's grid screenshot was a **stale CDN render**, not the current asset — shipped a fresh build (202607211542) to force a re-render. Confirmed local asset is the correct polished icon. Should show correctly once Apple's CDN catches up (usually within the hour) — not independently re-verified before session end.
- [ ] Talli / Epiphany (iOS): both "Ready for Distribution" — no action needed, these are fine as-is.
- [ ] NYC Survive, BC Garage Doors: both still "Prepare for Submission" on iOS(+macOS for NYC) — not investigated this session, likely need the same metadata pass Echo Mac just got.

## Vercel → Cloudflare migration — 2026-07-18
- [ ] Goal: move hosting off Vercel to Cloudflare Pages/Workers for all 8 apps that use Vercel (canlii-app, epiphany, healstack, journal, lexly, nulljosh.github.io, sparkjar, talli), consolidating onto one platform since DNS is already on Cloudflare.
- [ ] **Blocker**: `CLOUDFLARE_DNS_TOKEN` (in `~/.config/fish/secrets.fish`) only has DNS:Edit scope — adding a custom domain to a Pages project needs Pages:Edit, which that token doesn't have. `wrangler`'s own OAuth session has `pages (write)` scope but its token isn't easily extractable for direct API calls. Try `CLOUDFLARE_API_TOKEN` at `~/.openclaw/.openclaw.bak/.secure/cloudflare.env` next session (per CLAUDE.md Credentials) — may already have broader scope — or use `wrangler pages deployment`/dashboard for the one-time domain attach.
- [ ] I attempted cutting `journal.heyitsmejosh.com` DNS to the Pages project before the custom domain was registered on the Pages side — site 522'd. **Reverted DNS back to `cname.vercel-dns.com` (unproxied), confirmed matches original.** journal is back on Vercel, unaffected.
- [ ] Correct order next time: (1) deploy to Pages, (2) add custom domain to the Pages project via API/dashboard *first*, confirm it resolves on the `.pages.dev` domain with the custom hostname attached, (3) only then flip DNS.
- [ ] Remaining 7 apps not started. epiphany and talli have live users — treat as higher-risk, do last, one at a time, verify before DNS cutover each time.
- [ ] **Next session**: just re-check status (`GET /accounts/14c849d102ecc38b5fae54d9b22deec4/pages/projects/<project>/domains/<domain>`) — should go `active` on its own now that proxy is enabled, no more digging needed. Once active: flip each DNS record's `content` from the Vercel target to the Pages project (`<project>.pages.dev` via CNAME), verify 200 immediately, done.
- [ ] Session end 2026-07-20 decision: asked user whether to push into sparkjar/epiphany auth tonight; user deferred to my judgment, noting 55% usage already spent. Called it — stopping at the 4 verified apps rather than rushing live-auth/payments code with no way to test OAuth/login interactively. Sparkjar/epiphany/talli need their own dedicated session.
- [ ] **Sparkjar (step 6, deliberately NOT started)**: this app's `api/auth.js` delegates to 7 sub-handlers (GitHub OAuth, Apple sign-in, login, register, password-reset, account-deletion) using JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) + Supabase REST calls. This is a live authentication system, not a lift-and-shift — needs real testing (does `jsonwebtoken`/`bcryptjs` even run under Workers `nodejs_compat`? verify before porting) and should get its own dedicated session, not be rushed through in the same pass as the static/simple apps. Also still needs: 8 API handlers ported, 1 cron → Workers Cron Trigger, `@vercel/blob` (avatar.js) → R2.
- [ ] **Epiphany (step 7) and talli (step 8)**: unchanged from original plan — epiphany has live users + gateway function + 3 crons + blob; talli needs a Puppeteer/Browser-Rendering redesign, not a port. Do not rush these.

## Vercel to Cloudflare migration 2026-07-21 (easy batch)
Scope: every static/simple repo, explicitly excluding epiphany/sparkjar/healstack/talli (live serverless + KV/Blob + Stripe/OAuth, deferred to their own session). All below built, deployed to Cloudflare Pages, verified 200 on the custom domain, then DNS-cut. Vercel projects left in place (not deleted) as rollback fallback.
- [ ] **Skipped — missing-pets** (`labs/missing-pets`, `pets.heyitsmejosh.com`): looked easy (no `/api` routes) but is Next.js with a dynamic route (`app/listing/[id]`) fetched client-side from Supabase. Static export requires `generateStaticParams()`, which isn't feasible for a live database-driven listing page without either (a) a real Cloudflare adapter (`@cloudflare/next-on-pages`, keeps SSR) or (b) refactoring the route to a client-side shell that fetches by ID — either is a real change, not a lift-and-shift. Left on Vercel.
- [ ] **Skipped — cadence, charters**: no local source exists for either (per CLAUDE.md, both were part of the 2026-06-22 accidental deletion). Can't migrate what isn't there — needs recovery first. Still live on Vercel, both domains untouched.
- [ ] **Skipped — "web" Vercel project**: no custom domain attached, no obvious matching local repo (checked top-level `~/Documents/Code` and `labs/`). Flagging rather than guessing; likely an orphaned preview-only project, safe to ignore.

## From Asc.pdf (imported 2026-07-14)
- [ ] Spark rename — decide new name and rename repo/ASC/domain (Spark currently still under consideration, per user note "still a fucking mess"); scope tbd

## QuoteGuess
- [ ] Replace hardcoded `quotes.json` (~25 basic quotes) with a real movie-quote API for a much larger bank — investigate options (no well-known free "movie quotes" API exists yet; may need to scrape/curate or pair TMDB metadata with a quotes dataset)
- [ ] iOS: `ios/` has SwiftUI+WKWebView scaffold (project.yml, QuoteGuessApp.swift, GameWebView.swift, bundled web assets) but is untested — needs `xcodegen generate`, Info.plist, app icon, ASC bundle ID registration (com.heyitsmejosh.quoteguess), build, and TestFlight upload. Paused 2026-06-30 at 80% weekly usage limit.

# Unfiled roadmap

Items without their own repo/README. Move into a real README once the project exists.

## Talli Xcode Cloud signing fix — 2026-07-03
- [ ] **Blocked on manual step**: register the App Group container `group.com.heyitsmejosh.talli` itself at developer.apple.com/account/resources/identifiers/list/application-group (not exposed via public ASC API — web UI only, needs Apple ID + 2FA login). Portal was loading/spinning indefinitely 2026-07-03, deferred to this weekend.
- [ ] Then attach the new group to all 4 bundle IDs' App Groups capability, and re-run the Xcode Cloud build.

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

## /ship remaining apps
CLI metadata done 2026-06-29. Manual blockers remaining for all 3:
- [ ] **Availability** — ASC → Pricing & Availability → all territories (Echo 6782604262, Spark 6785162492, LingoAce Mac 6783501927)
- [ ] **Screenshots** — iOS screenshots for Echo + Spark; Mac screenshots for LingoAce Mac
- [ ] **App Privacy** — publish in ASC for all 3
- [ ] **Spark build** — no build uploaded yet, needs archive + upload first
- [ ] **LingoAce iOS** (6783501611) — needs same metadata pass + .ship.json

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

## From claude games.pdf (imported 2026-07-19)
- [ ] Get Claude Code to play Factorio — Steam + Factorio already installed locally. Try
  https://github.com/JackHopkins/claude-code-plays-factorio first (purpose-built); fallback
  https://github.com/MarkMcCaskey/factorioctl (lower-level) if the first doesn't fit. For-fun
  project, no shipping-app tie, low priority.

## ASC follow-ups queued 2026-07-20
- Litigate 1.0.1 REJECTED (confirmed via push) — run asc review doctor for real rejection reasons, fix, resubmit
- Lexly 1.1.1 "unresolved issues" email — verify if real rejection or stale notice (no rejected push seen)
- Talli 3.5.5/104 invalid-version email — likely moot, 3.5.6 already submitted same night, just confirm
- CI failure "Prepare Build for App Store Connect failed" on commit "Fix Mac app icon rebrand, close out stale roadmap items" — repo not yet identified, grep git log across ~/Documents/Code/* to locate, then pull Xcode Cloud build log
- Plan file: /Users/joshua/.claude/plans/witty-wondering-pine.md

## Cloudflare migration (2026-07-21)
- [ ] Full Vercel → Cloudflare migration, 9 repos (journal, lexly, nulljosh.github.io, grapher, wiretext, epiphany, sparkjar, healstack, talli) + nimble check. Phased plan (13-17 sessions) approved and saved: /Users/joshua/.claude/plans/bright-baking-lake.md — start with Phase 0 (reference doc + Cloudflare access confirm) next session, no DNS/production changes until each repo's explicit confirm gate.

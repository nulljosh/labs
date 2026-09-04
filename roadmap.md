# Cross-repo roadmap

Items without their own repo. Per-project work lives in each repo's `roadmap.md`.
Last pruned 2026-09-01 against live ASC + HTTP state, not against notes.

## Fable queue (ingested from ~/Downloads/FABLE.md 2026-09-01)

- [ ] **Doorstock keyword regression.** Live keywords are single words
      (`garage door,inventory,jobs,contractor,field service,trade,stock`); the deleted legacy set
      used phrases (`garage door inventory,contractor job tracker,trade parts,field service,small
      business stock`) and ranks better. Push it back only after iOS 1.0's 4.3(a) verdict lands;
      a review is open until then. Old text is in `bcgd` git history.
- Done 2026-09-01: promotionalText on all live localizations (Epiphany and Talli live in
  **en-CA**, not en-US, which is why they kept showing empty). GTM ledger and this file's
  staleness section re-verified against ASC.
- Not for a fast pass: epiphany + talli Vercel migrations (native deps, Browser Rendering, blob
  to R2). Architecture work, needs a plan.

## Blocked on Joshua (manual, dashboard or phone)

**Probed 2026-08-25, two of these are smaller than their labels said.**

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
  re-entering details, the likeliest cause is that a **Wealthsimple cash account has no routable
  transit/institution number** and Apple needs a real chequing account (RBC), or the account-holder
  name does not match the developer entity.

- [ ] **Apple banking/payout rejected.** RBC + Wealthsimple details were not accepted for the
      paid/IAP agreements, which gates *all* IAP revenue. Dashboard-only (Agreements/Tax/Banking),
      needs Joshua + 2FA. Read Apple's exact rejection reason first, then ask which account type
      they want, likely a chequing account with a routable transit/institution number, not a
      Wealthsimple cash account. CRA phone queue has been ongoing for weeks. Concretely gates
      voxprint: `Sources/Services/StoreManager.swift:19` hardcodes `isPro = true` and
      `refreshEntitlement()` early-returns, both with `ponytail:` comments naming this reason.
      Re-enabling is a two-line revert once enrolled.
- [ ] **ASC orphan Mac records to delete**: Transcriptly (6783015101), Lexly Mac (6783501927),
      Nullfolio (6788180394). All superseded by Universal Purchase on the iOS record. No public
      DELETE endpoint exists, dashboard-only, and Apple only allows it for records that never
      sold. Echo support ticket already filed (case 102949488998).
      Talli Mac and Epiphany Mac are DONE, both now ship as the MAC_OS platform of their iOS record.
- [ ] **App Group portal assignment** (developer.apple.com, web UI only). Done: tally.mac
      (5GRY7Y2894), tally.mac.widgets (A58D295228, verify saved). Remaining, recipe is
      edit page → App Groups Configure → check group → Continue → Save → Confirm:
      epiphany-macos (8UV9646S23) + epiphany-macos.widgets (74WAG78UJS) → `group.com.heyitsmejosh.epiphany`;
      spark.widgets (55W9MW38HJ) + com.heyitsmejosh.spark + .spark.mac + .spark.mac.widgets →
      `group.com.jt.spark`. Then re-export the archives already built in each repo's `.asc/artifacts`.

- **Lexly Mac 1.1.4, SOLVED 2026-08-25, no longer blocked on Joshua.** He supplied a 2FA code,
      the web session read Resolution Center, and the reason was **Guideline 2.1: book/magazine
      content listed for China mainland without a Chinese Internet Publishing License
      (网络出版服务许可证)**, a territory-licensing issue, never a code bug. Both prior theories
      (the 2.1(a) sign-in fix, the collapsed-window fix) were chasing the wrong cause. Fixed by
      dropping China rather than chasing an unobtainable permit:
      `asc pricing availability edit --app 6783501611 --territory "CHN" --available false`,
      then cancelling the stale `UNRESOLVED_ISSUES` submission and resubmitting. Now
      `WAITING_FOR_REVIEW` as `c7a51dfe`. Full detail in `lexly/roadmap.md`.
      **RESOLVED 2026-08-30 for the other book/text apps.** bookrank, wordroot, quotestreak and
      inkpress were all still available in China mainland (verified: 175 territories each, CHN
      available). All four had CHN dropped pre-emptively rather than waiting to be rejected:
      `asc pricing availability edit --app <id> --territory "CHN" --available false`, verified
      1 updated territory each. bookrank was *live* that way, so the rule is reviewer-triggered
      and this was a latent trap, not an active one.

## Finish the Vercel exit

Down to 2 projects (talli, epiphany). Both live and serving, no outage pressure, but the
account is not closable until they move. Everything else is on Cloudflare Pages and verified 200.

- [ ] **talli** (`talli.heyitsmejosh.com`), blocked on architecture, not effort. Depends on
      `puppeteer-core` + `@sparticuz/chromium`; headless Chrome does not run on Workers. Needs
      the Cloudflare Browser Rendering API, plus `@vercel/blob` → R2 and dropping `express`.
- [ ] **epiphany** (`epiphany.heyitsmejosh.com`), hardest. 91 functions, 1.3G,
      `better-sqlite3` (native, no Workers support) and `@vercel/blob`. Flagship, highest blast
      radius. Plan it properly before touching it.

Gotcha that will recur: with `compatibility_date` earlier than 2025-04-01, `nodejs_compat` does
NOT populate `process.env`, bindings read as undefined and assigning to `process.env` silently
no-ops. See `cadence/functions/_adapter.js` for the globalThis workaround, or bump the date.

## App Store hygiene

- [ ] **Developer website sweep**, set `marketingUrl` to https://heyitsmejosh.com.
      Done: Sparkjar, Lexly, Wordroot, NYC Survive, Epiphany. Skipped on purpose: BC Garage
      Doors (client app, keeps bcgaragedoors.ca).
      Also done 2026-08-24: **Healstack, Quotestreak (iOS + macOS)**.
      **Rule learned:** the field is editable while a version is WAITING_FOR_REVIEW, and only
      locks at READY_FOR_SALE, so catch each app *while it is in the review queue*.
      Still locked (all currently live), redo on their next editable version: Wiretext, Talli,
      Voxprint, Litigate, Curvely, Bookrank, Inkpress, Nullfolio.
      **CLI gotcha:** `asc apps info edit --app <id> --marketing-url ...` without
      `--platform`/`--version` fails with a misleading "The URL path is not valid"; pass both
      and you get Apple's real answer.
- [ ] **TestFlight staleness**, most apps are weeks stale. Establish a cadence of
      `asc workflow run ship-ios` per app.
- [ ] **Icon color pass**, rework all app icon colors on the [clrs.cc](https://clrs.cc) palette.
      Current contrast is poor; keep the strong per-app color differentiation, that part works.
      Skip the few icons that already look good.
- **Icon scaling bug, CLOSED 2026-08-25, already fixed; do not re-open without a live example.**
      Root-caused: the cause was `rsvg-convert` using the SVG's *intrinsic* size, so art landed
      small on a 1024 canvas. Every `scripts/make-appicon.sh` that exists (bookrank, lexly,
      nulljosh.github.io, sparkjar, uprighty) already passes `-w 1024 -h 1024`, which forces full
      size, bookrank's even carries a comment naming this exact glitch. Spot-checked the shipped
      PNGs for talli (the version named above) and inkpress: both are 1024x1024, `hasAlpha: no`,
      and the art fills the canvas. `talli 2.4.1` predates the fix; it ships 3.5.12 now.
      **Residual risk, deliberately not acted on (YAGNI):** 19 repos have an `icon.svg` but no
      `make-appicon.sh`, so they have no guardrail against a hand export reintroducing this.
      Nothing is currently broken, so no script was copied into 19 repos. If it recurs, the fix
      is one shared parameterized script (dest + bg differ per repo), not 19 copies.
- **macOS coverage, DONE 2026-08-30. Do not re-open.** That old list was stale: bcgd, healstack,
      litigate and inkpress all already had macOS targets. charwork and curvely were the only two
      genuinely missing one and both now build, sign and run. **Every app in the estate has a Mac
      target.** Recipe if it ever comes up again: `supportedDestinations: [iOS, macOS]`, the ten
      `mac_*.png` icon idioms, `LSApplicationCategoryType` in the *plist* (INFOPLIST_KEY_* is
      ignored under `GENERATE_INFOPLIST_FILE: NO`), and **two entitlements files split by
      `[sdk=macosx*]`**, a shared one compiles but cannot sign, because `application-identifier`
      is not a valid macOS entitlement.
- **Icon "missing" scare, investigated 2026-08-30, NOT a real estate-wide bug.** A missing
      `ASSETCATALOG_COMPILER_APPICON_NAME` breaks only *macOS* builds; iOS auto-detects an
      appiconset named AppIcon. Verified against talli's and healstack's built apps, which both
      carry `CFBundleIconName` despite lacking the setting. talli and healstack need no fix.
      **Cadence icon, DONE 2026-08-30.** Generated universal 1024 from icon.svg for iOS and ten mac idiom sizes for macOS; set the compiler flag on both targets. Verified Mac app now carries AppIcon.icns.
- [ ] **MCP endpoints, next three** (charwork and curvely both shipped one 2026-08-30 , 
      `functions/mcp.js` + a shared `src/lib/tools.js`, ~75 lines of JSON-RPC, no SDK, no Durable
      Object, copy either). Ranked by cost:
      1. **cadence**: cheapest by far. Pages already, 3 routes, zero auth, handlers already
         callable behind `functions/_adapter.js`, and `web/webmcp.js` already names the tools
         (`get_commit_stats`, `get_projects`, `get_heatmap`). **The work is not the JSON-RPC , 
         it is a rate limit**, since every call spends the `GITHUB_TOKEN` GraphQL quota. Copy the
         `unsafe.bindings` ratelimit block from `nimble/worker/wrangler.jsonc`.
      2. **healstack**: `src/data/substances.js` is a 3663-line public reference corpus (no auth
         question at all). Tools: search_substances / get_substance / check_interactions. Cost is
         pulling that logic out of `src/components/InteractionChecker.jsx` and
         `src/hooks/useSubstances.js` into a shared module. The 14 personal tools in
         `src/lib/webmcp.jsx` stay browser-side, that is the user's health log.
      3. **epiphany**: richest public data (~20 unauth market/weather/civic routes in
         `server/api/`). More expensive: it is a Worker not Pages, handlers are `(req,res)`-shaped
         with no adapter, and the tool list must be an explicit **allowlist** so portfolio /
         watchlist / broker / stripe can never be reached through it. Rate-limit it.
      **Not worth it, decided 2026-08-30:** litigate (no server, and it is someone's legal case
      file), bookrank (static on GH Pages, books.json is already a public URL), lexly (zero API
      routes), talli (45 of 46 routes are session-gated CRA data), inkpress (one tool over an open
      proxy), dream + nimble (a model asking a weaker model a question).
- **Android / Windows / Linux, decided against 2026-08-30.** nimble is the only app with them and
      it cost a full KMP rewrite (`nimble/kmp/`). Revisit only if an app gets real users there.

## New-app freeze (decided 2026-08-22, revised)

The 5.6 suspension was not caused by update frequency, Apple imposes no submission rate limit.
It fires on new, thin app records submitted in bulk. Updating an app that is already live is
unlimited and zero risk. The rule is "do not submit a *batch* of thin ones"; one finished app
at a time was always fine.

- [ ] **Nimble: approved to ship**, 1,677 lines with real search, results and context-menu UI
      over the Workers AI backend, substantive enough for Guideline 4.2. Ship after the current
      resubmissions come back approved, so there is a clean streak behind it. Needs a full
      session: ASC record (browser-only, see `asc-app-create-ui`), bundle ID, signing,
      screenshots, metadata, App Privacy.
- **Newsline: do NOT submit, settled 2026-08-25.** 398 lines, one list view, one detail view,
      a bias bar and one service: the exact thin-RSS-reader profile that killed Nullfolio. Rather
      than fatten it, its curated feed list was folded into Inkpress 1.0.5 (Phase 3 below), which
      is a shipping app. Newsline stays a Worker + MCP server, not an App Store submission.
- [ ] **NYC Survive**, **already resubmitted**, contrary to the note this bullet used to carry.
      Live state 2026-09-01: iOS 1.0.0 `REJECTED`, macOS 1.0.1 `REJECTED` (4.3(a) wave), macOS
      1.0.0 live. Reply filed; do not resubmit. Quality pass only after a verdict.

## Codebase consolidation

Plan: `~/.claude/plans/lovely-churning-wolf.md`. Phase 1 DONE (nested `Code/labs/` clone
deleted, ~1GB freed; `abraham/{contract.pdf,plan.pdf,OPERATING_GUIDE.local.md}` rescued to
top level first, they existed only in that clone).

- [ ] **Phase 2, RE-SCOPED 2026-08-24, was mis-described.** This is not one mechanical
      cleanup, it is three different things:
      1. **DECIDED 2026-08-24: not doing the theme swap.** A naive stub swap also *breaks*
         these sites, they use 4 tokens the canonical file does not define
         (`--font-display` on all three, plus `--accent-soft` and `--cell2`/`--dur`), so the
         fonts and accents would fall back to nothing. Converting properly means adopting the
         Jaybulb look *and* hand-mapping the orphans: a repaint of three live sites, which is
         a taste call, not a cleanup. Leave the local copies until Joshua wants the repaint.
         bookrank/fengshui/uprighty carry the
         **fredrika** theme (66 lines, `--bg:#fcfcfc`, Geist, no serif). The canonical
         `heyitsmejosh.com/tokens.css` is **Jaybulb** (85 lines, `--bulb:#ffca30`, black on
         white, square corners), `diff` is 147 lines. Swapping the stub in redesigns three
         live sites. Ask before doing it.
      2. ~~**Safe mechanical dedupe:** nimble ships its own design system copied 4x.~~
         **DONE 2026-08-25.** Only two copies were ever tracked (`web/` and `dist/` are
         build output / gitignored); `web/tokens.css` and `web/icon.svg` were byte-identical
         to the `docs/` originals and are now symlinks to them. `scripts/build-site.sh` uses
         `cp`, which dereferences, so `dist/` still ships real files.
      3. notes and roost have their own distinct token sets (roost even imports Fraunces) , 
         leave them alone unless the answer to (1) is "adopt Jaybulb everywhere".
      Then add `nulljosh.github.io/apps.json` as the single app registry , 
      portfolio cards, app footers and `wiki-refresh` all read it instead of hardcoded lists
      (this is why 8 renames each needed hand-editing everywhere).
- [ ] **Phase 3 merges:** ~~newsline → inkpress default feeds~~ **DONE 2026-08-25**, the 16
      curated outlets from `newsline/src/feeds.js` now seed `FeedStore.seedFeeds` in Inkpress,
      plus a Suggested list in Manage Feeds. Only the *list* moved: Inkpress keeps parsing RSS
      itself, so there is no runtime dependency on the newsline Worker. Shipped as 1.0.5.
      Remaining: fengshui → bookrank chapter + domain redirect; etyma → nimble answer source +
      redirect.
      ~~publish `bookrank.../summaries.json` so lexly fetches instead of holding copies~~
      **DROPPED 2026-08-25, the premise was wrong, there is nothing to dedupe.** Checked:
      `bookrank/summaries/` is empty and uncommitted (populated locally from iCloud by
      `sync-summaries.sh`, so there is no `summaries.json` to publish in the first place), and
      lexly's `content/notes/*.json` are 17 **masterclass course** files, a different artifact
      from bookrank's markdown chapter summaries, not copies of them. lexly contains zero
      references to bookrank. Do not re-open this without new evidence.
- [ ] **Phase 4 (only user-facing risk):** sparkjar hand-rolled OAuth+JWT
      (`api/_lib/auth/github.js`) → `supabase.auth.signInWithOAuth()`. Deletes code and inherits
      every provider once the 3 console registrations land.
- **DONE 2026-08-25**: labs.git no longer tracks stale paths inside nested repos. `wiretext/`
      and `quotable/` had already been cleaned; `capu/` and the four `byo-*/` repos were untracked
      with `git rm -r --cached` + a .gitignore entry each. Nothing removed from disk.
- **Deliberately not doing:** unifying the 4 live Stripe impls (3 runtimes, all verified, no
  payoff). Revisit when a 5th app needs a $1 gate.

## Cross-repo sweeps

- [ ] **Design system**, pick the project with the best one as source of truth, sync the rest.
- [ ] **GitHub tidy**, simplify every project README and match the repo description to it.
- [ ] **Auth buttons**, Apple/Google/Facebook/email on all iOS/Mac apps (Apps.pdf mockup).
- [ ] **Stripe status audit**, only epiphany is known wired. Per app: live vs test keys present,
      webhook registered, whether reauthorization is actually needed. Confirm before scoping.
- [ ] **Reclaim ~224 MB of committed build artifacts from git history (9 repos)**, untracked and
      gitignored 2026-08-19 (voxprint 144 MB, epiphany 52 MB, bcgd 14 MB, sparkjar 8.3 MB,
      inkpress 4.0 MB, wiretext 1.7 MB, plus talli/healstack/litigate) so nothing new accumulates,
      but the blobs remain in history and clone size is unchanged. Needs `git filter-repo` +
      force-push per repo, as done once for bookrank. One repo at a time, back up first, only
      when nothing else is in flight on that repo.
- **Supabase `logs.all` removal 2026-09-23, CLOSED 2026-08-25, nothing for us to do.** The
      2026-08-22 grep found zero in-repo references; the 2026-08-25 pass ruled out the two
      remaining suspects as well, there is **no crontab** on this machine and **no CI workflow
      in any repo references Supabase**. The only match anywhere in `~/Documents/Code` for
      `logs.all` is this roadmap line describing itself. The caller is therefore the Supabase
      MCP server or CLI, which we do not own and which will move to
      `analytics/endpoints/logs` on its own. Keep the CLI/MCP current and this resolves itself.
      Do not spend another session hunting for a caller that is not ours.
- [ ] **Disk cleanup**, update `mole` and run a deep clean.
- [ ] **Codebase SVG**, `codebase.svg` in `~/Documents/Code`, node-and-line graph in the journal
      aesthetic (Geist, #111 bg, #e8e8e8 text, `prefers-color-scheme`). Show the shared Supabase,
      the labs monorepo, dotfiles infra, presence. Reference it from CLAUDE.md.

## Build gotchas (for whoever scripts a smoke test)

`sparkjar` and `talli` have no scheme in the repo root, and their first scheme alphabetically is
the watchOS one (`SparkWatch`, `TalliWatch`), which fails against an iOS Simulator destination , 
pick `Spark` / `Talli` from `ios/` explicitly. Healstack's iOS scheme is still called `Dose`,
not `Healstack`.

## Wiki backlog (deferred from the 2026-08-11 wrap)

- [ ] `notes/notes/master.md`: bump Updated date, refresh Roadmap / Active Projects / Ship Now
- [ ] Obsidian vault (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Code/wiki/`):
      ingest 2026-08-11 per `wiki/CLAUDE.md`, update touched entity pages, then refresh
      `index.md` + `pages/_overview.md`. This is the surface actually read, don't skip it.
- [ ] Run `wiki-refresh` across its 3 surfaces (vault, master.md, Code/CLAUDE.md)

## Someday / explore

- [ ] **Sparkjar rename**, name still undecided.
- [ ] **Quotestreak quote bank**, replace the hardcoded ~25-quote `quotes.json` with a real
      source. No well-known free movie-quote API exists; may need to curate, or pair TMDB
      metadata with a quotes dataset.
- [ ] **RBC account + ASC**, clarify what "hook up" means (payout routing? reconciliation?)
      before starting. Probably the same underlying issue as the payout item above.
- [ ] **Ontology**, connect projects with a shared entity index. Overlaps with Epiphany's
      ontology / people index feature.
- [ ] **Graph engineering**, research github.com/codejunkie99/graph-engineering; we already
      ship SVG architectures in many READMEs.
- [ ] **Xcodeless**, headless release audit across all apps (project.yml, Local.xcconfig,
      notarytool profiles, scripts/release.sh, CLAUDE.md docs).
- [ ] **/asc-update skill**, detect apps changed since last release → build → TestFlight upload
      → release notes.
- [ ] **Obsidian/notes consolidation**, evaluate merging the vault into the notes repo
      (braingraph already merged 2026-07-11) for one source of truth.
- [ ] **Claude Code plays Factorio**, Steam + Factorio already installed. Try
      github.com/JackHopkins/claude-code-plays-factorio first, fallback
      github.com/MarkMcCaskey/factorioctl. For fun, low priority.
- [ ] **Terminal**, Abralo is installed to /Applications; trial vs cmux, then decide whether to
      drop Warp/cmux. Verdict notes in `wiki/pages/terminal-tooling.md`.
- [ ] **Unidentified CI failure**, "Prepare Build for App Store Connect failed" on commit
      "Fix Mac app icon rebrand, close out stale roadmap items". Repo unknown; grep git log across
      `~/Documents/Code/*` to locate, then pull the Xcode Cloud build log.

## Google sign-in (2026-08-27)
Google OAuth client is READY. Reused the existing `epiphany` Web client in GCP project
`epiphany-501805` rather than creating a new one.

- Client ID: `455155642136-apgrhdk2bc2p6gvvv029j2tsos57fcm2.apps.googleusercontent.com`
- Redirect URIs now on the client (both saved + verified):
  - `https://epiphany.heyitsmejosh.com/api/auth?action=google-callback` (epiphany hand-rolled)
  - `https://tjsxsqlxjmanwvmywwvw.supabase.co/auth/v1/callback` (shared spark Supabase, covers
    healstack/litigate/lexly/anything on `signInWithOAuth`)
- Secret #2 minted 2026-08-27 (tail `z_0e`), downloaded to
  `~/Downloads/client_secret_2_455155642136-*.json`. Google no longer allows viewing an existing
  secret, so minting a second one is the only way to obtain a usable value. Old secret (`tFuu`)
  left enabled so epiphany keeps working.

DONE 2026-08-27: Google provider enabled on the shared spark project via the Supabase
Management API (PAT lives in the macOS Keychain, `security find-generic-password -s "Supabase CLI" -w`
-- NOT in ~/.supabase, which only holds telemetry). PATCH /v1/projects/<ref>/config/auth with
external_google_{enabled,client_id,secret}. Verified: /auth/v1/settings now reports "google":true.
Note: urllib PATCH returned 403 where curl returned 200 -- use curl for this endpoint.

Caveat: the consent screen is branded "epiphany", so healstack/litigate users will see
"continue to epiphany". Rename in GCP -> Branding if that matters.

Facebook: not started. Same shape, Meta for Developers.

### Apple sign-in on WEB, next session, ~15 min (2026-08-27)
Joshua wants Apple buttons everywhere, not just native. Currently web Apple 400s:
`{"error_code":"validation_failed","msg":"Unsupported provider: missing OAuth secret"}`
because `external_apple_client_id` holds native bundle IDs and `external_apple_secret` is null.
Apple web buttons were REMOVED from litigate/lexly this session so nothing ships broken.
Re-add them as the last step, after the provider actually works.

Runbook (blocked only on Apple Developer login, session expired, Claude cannot sign in):
1. developer.apple.com -> Identifiers -> new **Services ID** (e.g. `com.heyitsmejosh.websignin`).
   Enable Sign In with Apple. Domain: `tjsxsqlxjmanwvmywwvw.supabase.co`
   Return URL: `https://tjsxsqlxjmanwvmywwvw.supabase.co/auth/v1/callback`
2. Keys -> new key, enable Sign In with Apple, download the .p8 (ONE download only).
   NOTE: the two existing keys in ~/.appstoreconnect/private_keys (F44GR466T7, MUJM3PFMT4)
   are App Store Connect API keys, NOT Sign in with Apple keys. Different type, not reusable.
3. Team ID is **QMM486NPYC** (confirmed from cert + provisioning profile).
4. Generate the client secret JWT: ES256, iss=QMM486NPYC, sub=<ServicesID>,
   aud=https://appleid.apple.com, exp <= 6 months. Save the generator as a script --
   this secret EXPIRES every 6 months and web Apple sign-in dies silently when it does.
5. PATCH config/auth: append the Services ID to external_apple_client_id (comma-separated,
   keep the existing bundle IDs -- they serve native signInWithIdToken) and set
   external_apple_secret to the JWT. Use curl; urllib gets 403 on this endpoint.
6. Verify `/auth/v1/authorize?provider=apple` returns 302 (not 400), THEN re-add
   `data-provider="apple"` buttons to litigate/web/index.html, lexly/app/index.html,
   bookrank/library.html. Handlers are already generic; markup only.

Also open: healstack/src/pages/Auth.jsx has apple AND facebook buttons that are both dead
today -- fix apple via the above, and strip the facebook one (Facebook skipped: Meta needs
business verification + app review for the email permission).

## From Notes (imported 2026-08-27)
- [ ] **App Store staleness sweep**, "some of our apps are stale, can we do a full sweep?" Run `asc` across every live app to find version/build drift between what is shipped and what is in the repo, and list what needs a bump.

### App Store staleness sweep, run 2026-08-27

Every app's live App Store version compared against its repo `MARKETING_VERSION`.
Reported only; nothing bulk-submitted (a bulk wave is what triggered the 5.6 suspension).

**Rejected right now, all five are the SAME Guideline 4.3(a) Design: Spam account-level wave**, not five separate content problems. Do not fix code and do not resubmit any of them; the appeal draft is at `notes/appeal-4-3-spam.md` (repo root) and is DRAFTED, NOT FILED, filing is Resolution Center, browser-only, blocked on Joshua. Doorstock carries a second, earlier Guideline 3.2 rejection as well.

| App | repo | iOS live | iOS pending | macOS live |
|---|---|---|---|---|
| Talli | 3.5.14 | 3.5.14 |: (2026-09-01: live) | 3.5.6 |
| Curvely | 1.2.2 | 1.2.2 |: (appeal won 2026-08-30) | 1.2.2 |
| Sparkjar | 1.0.1 | **never shipped** | 1.0 REJECTED | 1.0.1 |
| NYC Survive | 1.0.1 | **never shipped** | 1.0.0 REJECTED | 1.0.0 (1.0.1 REJECTED 2026-09-01) |
| Doorstock | 1.0 | **never shipped** | 1.0 REJECTED | 1.0 |

**Corrections to notes that were wrong:**
- [ ] **Epiphany iOS live is 2.5.4, not 2.6.x.** 2.5.5 is REJECTED and the repo is already at 2.5.6. Notes claiming "v2.6.1+ live on the App Store" are wrong, the store is three versions behind the repo.
- [ ] **Healstack has nothing live on either platform.** Both iOS and macOS show no READY_FOR_SALE version; 2.3.5 is REJECTED on both (verified 2026-09-01). Notes saying 2.3.4 shipped are wrong.
- [ ] **Sparkjar / NYC Survive / Doorstock have never shipped on iOS**, one iOS version record each, none ever READY_FOR_SALE. Only their macOS builds are live.

**Genuine version drift (repo ahead of store, nothing in flight):**
- [ ] Epiphany macOS live 2.5.2 vs repo 2.5.6, four versions behind, no Mac submission pending.
- [ ] Talli macOS live 3.5.6 vs iOS 3.5.12, the Mac app is seven minor versions behind its own iOS twin.
- [ ] Voxprint macOS live 1.3.6 vs iOS 1.3.7, one behind.

**In flight (re-verified 2026-09-01):** nothing is in review except Sidewise 1.0 (both platforms WAITING_FOR_REVIEW). Lexly 1.1.5 (both), Wordroot macOS 1.0.1, NYC macOS 1.0.1 and Healstack 2.3.5 (both) all came back REJECTED in the 4.3(a) wave. Voxprint iOS 1.3.8 and Toroid 1.0 sit in PREPARE_FOR_SUBMISSION.

**Aligned, nothing to do (2026-09-01):** Litigate 1.0.3, Wordroot iOS 1.0.1, Quotestreak 1.1, Inkpress iOS 1.0.6 / Mac 1.0.7, Charwork 1.1.1, Bookrank 1.0.1, Voxprint iOS 1.3.7, Curvely 1.2.2.

**Never submitted:** Toroid 1.0 sits in PREPARE_FOR_SUBMISSION on both platforms, held for the 4.3(a) wave. (Sidewise was submitted 2026-08-28 and is WAITING_FOR_REVIEW.)

**Orphan records still cluttering the account:**
- [ ] `Headwire` (6783501927, com.nulljosh.lingo.mac), macOS 1.1.1 REJECTED, nothing ever live. This is the duplicate Lexly Mac record; Lexly's real record is 6783501611.
- [ ] `Transcriptly` (6783015101), macOS 9.9.9 REJECTED, junk version number, nothing live.
- [ ] `Nullfolio` (6788180394), iOS 1.0 REJECTED, project closed 2026-08-11.

**Appeal-path correction (found 2026-08-27):** every one of the five repos' roadmaps points at
`<repo>/notes/appeal-4-3-spam.md` for the appeal draft. **That file does not exist in any of them.**
The only copy is `~/Documents/Code/notes/appeal-4-3-spam.md` at the codebase root. The per-repo
roadmap notes also disagree about whether the appeals were filed (Sparkjar and Doorstock say
"filed", Curvely and NYC Survive say "DRAFTED, NOT FILED"); the draft's own header says
**DRAFTED, NOT FILED**, so treat all of them as unfiled until Joshua confirms otherwise.

## Portfolio gaps (audit 2026-08-30)

Competitive scan of all ~32 projects. 12 in a store, 6 in the 4.3(a) wave, ~14 never submitted.

**Four apps face thin competition, these are the portfolio:**
Talli (benefits eligibility; only rivals are Prosper Canada's Benefits Wayfinder web form and
211.ca, BC Services Card does identity, not eligibility), Litigate (self-represented litigants;
Clio/MyCase are firm-priced, CanLII is research only), Epiphany (Kubera charges $150/yr),
LEC (nobody else clients that portal).

**Eight compete with a free giant**, Bookrank/Goodreads, Wordroot/Etymonline, Curvely/Desmos,
Sparkjar/Apple Notes, Inkpress/Substack, Lexly/Duolingo, Quotestreak/everything, Charwork/TextEdit.
- [ ] Freeze all eight: no new versions, no metadata, no icons. They are ASO surface and review-queue
      risk, nothing more. Every hour here is an hour off the four above.

**Gap 1, nothing can charge.** Form 506 gates all iOS revenue portfolio-wide. Blocked on Joshua.
See `wiki/pages/paid-apps-agreement.md`. Worth asking Apple whether it accepts a *not-registered*
declaration; the portfolio is far under the $30k small-supplier threshold.

**Gap 2, nothing is measured.** Zero analytics scripts across every site, so every claim about
which app matters is a guess. Needs a Cloudflare Web Analytics beacon token (dashboard-only; the
stored token is DNS-scoped, the wrangler OAuth token has no `rum` scope). One line per site after.

**Gap 3, ASO does nothing.** No app has canonical `metadata/` checked in. Subtitle and the
100-char keyword field are the two highest-weight fields and are empty.
- [ ] Bootstrap `metadata/` for Talli, Litigate, Epiphany only. Agent-doable, not blocked.

**Done 2026-08-30:** Voxprint IAP renamed Echo Pro -> Voxprint Pro (stale since the rename) and
repriced $3.99 -> $12.99 (proceeds $11.04). Benchmark: Aiko is the same product at $19.99 one-time,
MacWhisper Pro $59; Otter/Rev/Descript are $8-30/month, so one-time is the pitch, not a discount.
The `StoreManager.swift` `isPro` flip stays blocked on Form 506, flipping it early ships a
purchase button that dies in review.

## Broken privacy policy URLs (found 2026-08-30), COMPLIANCE, not cosmetics

Apple requires a working privacy policy URL. Four apps point at dead or 404 pages. Swept every
app's `privacyPolicyUrl` and curled each one:

- [ ] **Litigate**, `brief.heyitsmejosh.com/privacy.html` (dead host, stale from the Brief rename).
      App is **LIVE** with a dead privacy policy. `litigate.heyitsmejosh.com/privacy.html` works.
- [ ] **Bookrank**, `spine.heyitsmejosh.com/privacy.html` (dead host, stale from the Spine rename).
      App is **LIVE**. `bookrank.heyitsmejosh.com/privacy.html` works.
- [ ] **Lexly**, `heyitsmejosh.com/privacy` returns **404**, and it is the generic portfolio root.
      Lexly iOS is REJECTED right now. `lexly.heyitsmejosh.com/privacy.html` works.
- [ ] **Voxprint**, the LIVE app-info still has `echo.heyitsmejosh.com/privacy.html` (dead). The
      staged 1.3.8 app-info is already correct, so shipping 1.3.8 fixes this automatically.

**Why none of these could be fixed today:** an app-info record is only editable while a version is
staged. Litigate and Bookrank have exactly one app-info each, READY_FOR_SALE, so `privacyPolicyUrl`
returns "can not be modified in the current state". Lexly's second app-info is IN_REVIEW and equally
locked. **Creating the next version record is what unlocks the fix**, do it as part of the next
release, not as a standalone draft (stray ASC drafts can only be deleted from the dashboard).

**Hypothesis for the 4.3(a) wave, now with evidence.** The listings share a template fingerprint:
several apps pointed support/marketing/privacy at the bare `heyitsmejosh.com` root, and several
more at hosts abandoned in a rename. To a reviewer that reads as one generator emitting many thin
apps. De-genericizing every listing is unblocked by Form 506 and worth doing before any resubmit.
Already fixed live: Healstack iOS and Voxprint iOS support/marketing URLs.

**Web Stripe is NOT broken** (checked 2026-08-30). `/api/stripe` returns 400 to an empty POST on
epiphany, healstack and sparkjar, the endpoint is live and validating. Talli's returns 401, i.e.
auth-gated. The rail works; what is missing is CTAs and products, not infrastructure.

## Service worker stale-HTML fix, 2026-08-31

`scripts/pwa-add.sh` generated a cache-first service worker that also served
navigations from cache. Because the HTML names the hashed bundles, one cached
page pinned an entire stale build: anyone who had visited a site before stopped
receiving updates from it. Caught on homeward, whose new landing page was
invisible in the browser while curl showed it fine.

Generator fixed, and the worker patched in all 17 apps that had it, with each
cache version bumped so existing clients drop what the old worker stored.

- [ ] Still serving the old worker until their next deploy: fengshui,
  quotestreak, bookrank, numen, curvely, dream, wordroot, nimble, charwork,
  voxprint, bcgd. Each needs a build before deploy and none declares both a
  Pages project name and an output dir, so they were left rather than guessed.
  Their next normal deploy carries the fix anyway.

## WCAG contrast audit, 2026-08-31

`scripts/wcag-audit.py` reads the house `--bg`/`--text`/`--accent` tokens out of
every stylesheet and checks the pairs the landing templates actually render, in
light and dark. 64 text failures across ~15 projects, and nearly all of them are
one bug repeated: **the accent colour is used both as a fill and as link text,
but it is tuned for fill.**

- `#5B9BD5`, the shared house blue, is 2.96:1 as link text on white. It is used
  that way in bookrank, conway, curvely, numen, quotestreak, wordroot, healthstack.
- Same shape elsewhere: charwork `#D97757` 2.96, homeward `#FF851B` 2.44,
  swing `#ff851b` 2.44, sidewise `#1f4e79` 2.14 on dark, inkpress `#b8730a` 3.82,
  the portfolio's `#d9442c` 3.53, plus bcgd, wordroot, nyc on hero backgrounds.
- A handful of separate `--text2` greys also fail: bookrank/fengshui `#8f8f8f`,
  roost `#868686`, sparkjar `#8c8c8c`.

- [ ] Fix: give each palette a `--link` token distinct from `--accent`, dark
  enough to pass 4.5:1 on `--bg`, and keep `--accent` for fills with dark ink on
  top. Homeward already does this (`--link` blue in light, orange in dark, black
  ink on orange buttons) and can be the model. This is a tokens.css change plus
  one line per landing, not a redesign.
- The 60 border findings the script also reports are advisory. WCAG 1.4.11 covers
  UI components and meaningful graphics, not decorative 1px dividers.

## Bulk deploy: bash 3.2 trap, 2026-08-31

A script to redeploy every app used `declare -A` for the repo-to-Pages-project
map. macOS /bin/bash is 3.2, which has no associative arrays and fails silently:
the assignment became an indexed array, every string subscript evaluated to 0,
so every repo mapped to the same project. bookrank was deployed over the
`homeward` project before it was caught on the first log line. Homeward was
rebuilt and redeployed immediately and verified on both hosts; nothing else ran.

- [ ] If a bulk deploy is wanted, use `#!/opt/homebrew/bin/bash` (bash 5) or a
  plain case statement, and echo the resolved project name per repo before
  deploying anything.
- [ ] The contrast fix is committed everywhere but only deployed to homeward.
  Each app picks it up on its next normal deploy; there is no urgency.

## Native fleet rollout, real ports (2026-09-03)

Eight apps got a real port past the bare scaffold, each pushed and building:
**numen** (full expression parser + evaluator ported to Kotlin, tested,
wired to a working single-expression calculator screen — the multi-card
draggable canvas is still not ported), **cadence** (Ktor client reading the
live `/api/projects` + `/api/stats` endpoints, no GITHUB_TOKEN embedded —
that stays server-side), **bookrank** (Ktor client reading the deployed
`books.json` directly), **quotestreak** (same shape, `quotes.json`, wired to
a real playable multiple-choice streak game, not just a list), **curvely**
(ported `ios/App/Expression.swift`'s grapher parser to Kotlin, tested, wired
to a real Compose Canvas graph — fixed domain, no pan/zoom yet), **conway**
(ported `life.js`'s toroidal-grid simulation to Kotlin, wired to a real
playable Canvas grid with play/pause/step/randomize/tap-to-toggle),
**charwork** (ported `engine.js` + all 23 `presets.js` component templates
to Kotlin, tested, wired to a real tap-to-place wireframe canvas with
undo/redo), **sidewise** (Ktor client reading the public `/api/stories`
endpoint — no RSS parsing client-side, the Worker already does that).

**healstack** got a ninth port: `substances.js`'s full 200-entry reference
corpus embedded verbatim (generated, not hand-typed) plus a faithful port of
`InteractionChecker.jsx`'s real logic (severity keywords, A-mentions-B /
B-mentions-A with dedup, shared-target cross-reference), wired to a real
search + interaction-check screen. Scoped deliberately to the public,
no-auth half of the app — the 14 personal/session tools (dose log, active
stack, reminders) are Supabase auth-gated and stay out.

**lexly** got a tenth port: catalog + course JSON read live, a real
translation/mathChoice/cloze quiz flow. Login flow decided by matching the
policy already documented in lexly's own CLAUDE.md ("Auth differs by
platform, on purpose": iOS/macOS never gate content, sign-in buys progress
sync only) — so no auth was added, same as those platforms.

**dream** got an eleventh port: expect/actual `EntryStore` (java.util.prefs
on desktop, SharedPreferences on Android — desktop verified by the build,
Android follows the same interface but is unverified on-device), wired to
the live `/api/interpret` endpoint. The DISTRESS crisis-language guard runs
server-side on that endpoint already, so no client-side duplication needed.
Real journal: write, save, list, request a reading per entry.

Stopped chasing more for now — the remaining pool splits into two shapes:
- **Needs real design work, not a mechanical port**: epiphany, sparkjar,
  litigate are auth-gated with personal Supabase data end to end (no
  public-data half, and no documented "don't gate content" precedent like
  lexly had). Wiring a native login flow and deciding what data surface to
  expose is a real product decision per app, not something to rush blind.
- **Genuinely more parsing work**: wordroot (wikitext regex per Wiktionary
  edition), inkpress (RSS/Atom XML parsing, no public API to proxy through
  like sidewise has), roost (seeded per-country listing generation +
  Nominatim search + 26-language i18n).

- [ ] Next session: pick one auth-gated app and actually decide the native
  login UX (Supabase email+password token exchange is the same on Android/
  desktop as iOS, so this isn't blocked technically, just needs a chosen
  scope per app) before doing all four the same way.
- [ ] 11 of 17 apps now have a real port (numen, cadence, bookrank,
  quotestreak, curvely, conway, charwork, sidewise, healstack, lexly,
  dream). 6 remain scaffold-only: epiphany, sparkjar, litigate, wordroot,
  inkpress, roost.

## Native fleet rollout, `kmp/` scaffolding (2026-09-03, DONE — bare scaffolds only)

[[project-native-fleet-rollout]]. All 17 apps in the queue now have a `kmp/`
Android+desktop Compose scaffold (gradle wrapper, package `com.nulljosh.<app>`,
one placeholder screen), copied from `homeward/kmp` and stripped of its
listings code. Each compiles clean (spot-verified on numen and curvely with
`gradlew :shared:compileKotlinJvm :composeApp:compileKotlinDesktop`), and each
is committed + pushed to its own repo. **None of them have real UI or a data
port yet** — every `Placeholder.kt`/`AppScreen.kt` carries a `ponytail:`
marker naming the gap. Apps done this pass: numen, curvely, charwork,
epiphany, inkpress, lexly, sparkjar, healstack, wordroot, quotestreak,
cadence, roost, dream, sidewise, litigate, bookrank, conway (toroid shares
conway's repo, no separate scaffold needed).

- [ ] Port each app's real read path and UI into `commonMain`, one app at a
  time. Easiest first: apps whose data is static/local (dream, cadence,
  numen's parser) or a public read like homeward's Supabase table, before
  ones needing new auth plumbing (litigate, sparkjar).
- [ ] No CI release workflow yet for any of them — `.msi`/`.deb`/`.apk` are
  built locally only. Needs a GitHub Actions matrix (windows + ubuntu
  runners) on a tag once more than one or two apps have real KMP code.

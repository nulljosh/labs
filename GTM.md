# GTM, revenue state of every app

Single source of truth for what earns money, what can't yet, and why. Verified against ASC and
production on 2026-08-29. Don't re-derive this from 18 ASC records; update this table instead.

## Current focus, 2026-09-11

Revenue work is Epiphany and Voxprint. Talli is a disability-tracking utility, not a revenue target (Joshua, 2026-09-11). Existing Talli payment fixes are reliability work only.

Live ASC checks: Voxprint 1.3.9 is live on Mac and approved pending developer release on iOS. Epiphany iOS 2.5.11 is waiting for review; Mac 2.5.2 is live. Both apps have an approved non-consumable IAP. Voxprint is already on Product Hunt; do not plan a duplicate launch.

See [the revenue audit](REVENUE.md) for verified fixes, checks, and the next actions. This section supersedes conflicting historical blockers and focus rules below.

## Monetization plan, 2026-09-20 (supersedes the 2026-09-09 strategy below)

Every app gets a rail. The old objection to paid upfront was that it kills the trial funnel. It doesn't here: every app runs free on its landing page. The web app is the trial. The store is the checkout.

Anyone who downloaded while free keeps it forever. Only new customers pay.

| Rail | Apps | State |
|---|---|---|
| **$0.99 upfront** | Curvely, Plaintxt, Toroid, Charblock, Wordroot, NYC Survive, Windgate, Inkpress | **Live 2026-09-20.** Set with `asc pricing schedule create --price 0.99`. No build, no review. Revert with `--free` |
| **Free + $0.99 one-time IAP** | Voxprint, Epiphany | Both IAPs approved. Voxprint iOS 1.3.9 is approved and unreleased: `asc versions release --version-id 36846827-7c37-45a0-875b-29ee1caf5029 --confirm` |
| **Stripe subscription, web** | Epiphany Pro $2.99/mo, Siftbox $2.99/mo, Sidewise API $4.99/mo | Planned. Epiphany first, it is the one app with real recurring cost. Siftbox and Sidewise wait until they have a live store build |
| **Stripe $1 one-time, web** | Sparkjar, Healstack | Live, unchanged |
| **Free + ads, $0.99 IAP removes them** | Quotestreak | Planned, not built. The only app where ads fit: a daily casual game. Do not build until it shows 1k monthly players. Ads at zero users earn zero and cost a privacy label |
| **Free, on purpose** | Talli, Litigate, Doorstock, Madobe, Curbfind, Nimble Answers, Bookrank, Lexly | Disability tool, public good, client work, browsers, funnel top. Bookrank charges nothing because selling book summaries invites a copyright fight. Lexly is the natural subscription app but sits in the 4.3(a) wave; revisit when the appeal lands |

Orphan IAP records `com.nulljosh.grapher.unlock` and `com.nulljosh.journal.unlock` are MISSING_METADATA with no code behind them. Leave them. Both apps are paid upfront now.

Do not mass-submit new IAP builds. Bulk submissions are what triggered the 5.6 suspension and the 4.3(a) wave. One app per week at most.

Price is not the bottleneck. Traffic is: about 37 visits a day across the whole portfolio. None of these rails earn until that moves.

## The one-line summary

Paid Apps Agreement is **ACTIVE** (2026-09-08, BN 795776756 RT0001). iOS can charge. Voxprint 1.3.9 ships the real $1 IAP
(in review 2026-09-09). The other nine stay free as ASO surface, per the focus rule below. Distribution and
measurement are still the gap.

## Strategy (decided 2026-09-09)

Three rails, picked per app by what the app already has:

1. **Free, on purpose**, for the nine small apps (Inkpress, Plaintxt, Curvely, Lexly, Wordroot,
   Charwork, Quotestreak, Toroid, NYC Survive). Tried $0.99 upfront for an hour on 2026-09-09 and
   reverted: it kills the trial funnel a Product Hunt launch needs and earns nothing at zero users.
   Revisit as free + $1 IAP only for an app that shows real installs.
2. **Free + $1 one-time IAP** where a free tier is the funnel: Voxprint (3 free files then $1,
   1.3.9 submitted 2026-09-09). Epiphany next: `asc iap setup` a $1 non-consumable, verify the
   JWS transaction server-side and set the same `isPro` the Stripe webhook sets, so web and iOS
   share one entitlement. Only code work left on the revenue side.
3. **Web Stripe only** for apps whose value is server-side and whose iOS build must not mention
   the paid tier: Epiphany (until 2 lands), Talli, Sparkjar, Healstack. Unchanged.

Stays free on purpose: Litigate (public-good tool), Bookrank and Sidewise (need an audience before
a price), Doorstock (client), Curbfind and Lucarne (browsers are free by convention).

Launch order for Product Hunt: Voxprint (clean one-line pitch, own-it-once), then Epiphany once
the IAP ships, then the free apps as a roundup. Each needs: tagline, first comment, 3 screenshots,
landing page (done fleet-wide). No analytics yet; App Store Connect sales reports are the only
revenue signal until PostHog or similar is added.

## Ledger

| App | ASC ID | Live (verified against ASC 2026-09-01) | Price | Rail | Blocker / next action |
|---|---|---|---|---|---|
| Epiphany | 6779522175 | Mac 2.5.2 · **iOS 2.5.6 REJECTED** | $1 one-time (planned) | Stripe live + StoreKit | **Focus.** iOS is out of the store on 4.3(a); fix that before any paywall work |
| Talli | 6782366555 | iOS 3.5.14 · Mac 3.5.6 | free | Stripe live | **Focus.** One upgrade CTA (`src/api.js` → `/api/stripe-checkout`) |
| Voxprint | 6782604262 | Mac 1.3.6 · iOS 1.3.8 staged | $1 one-time | StoreKit LIVE in 1.3.9 (iOS submitted 2026-09-09, Mac following) | watch review |
| Lexly | 6783501611 | iOS 1.1.3 · Mac 1.1.4 · **1.1.5 REJECTED both platforms** | free | none | none planned |
| Litigate | 6787857503 | iOS 1.0.3 | free | none | none planned |
| Bookrank | 6792376485 | iOS 1.0.1 · Mac 1.0.1 | free | none | personal shelf, not a product |
| Sparkjar | 6785162492 | Mac 1.0.1 · **iOS 1.0 REJECTED** | $1 Spark Pro | Stripe live (wired 2026-09-06) | iOS never shipped; email/OAuth unconfigured: leave alone |
| Inkpress | 6787759999 | iOS 1.0.6 · Mac 1.0.7 | free | none | Mac 1.0.7 approved 2026-08-30, first Mac release |
| Wordroot | 6794988021 | iOS 1.0.1 · Mac 1.0 · **Mac 1.0.1 REJECTED** | free | none | none planned |
| Curvely | 6794988370 | iOS 1.2.2 · Mac 1.2.2 | free | none | 4.3(a) appeal WON, 1.2.2 approved 2026-08-30 |
| Charwork | 6794988951 | iOS 1.1.1 | free | none | repo renamed from wiretext; ASC record still "Wiretext" |
| Quotestreak | 6804394619 | iOS 1.1 · Mac 1.1 | free | none | none planned |
| Healstack | 6785764864 | **nothing live; iOS + Mac 2.3.5 both REJECTED** | $1 CSV export | Stripe live (wired 2026-09-06) | 4.3(a) wave, reply filed |
| NYC Survive | 6782618198 | Mac 1.0.0 · **iOS 1.0.0 + Mac 1.0.1 REJECTED** | free | none | listing filled to 10 screenshots 2026-08-29 |
| Doorstock | 6791106082 | Mac 1.0 · **iOS 1.0 REJECTED** | free | none | 4.3(a) + 3.2, appeals filed; keyword regression fix waits on verdict |
| Sidewise | 6806028670 | iOS 1.0 + Mac 1.0 WAITING_FOR_REVIEW | free | none | submitted 2026-08-28 |
| Toroid | 6806324937 | iOS 1.0 + Mac 1.0 PREPARE_FOR_SUBMISSION | free | none | held for the 4.3(a) wave |

## Web-only by decision (not a gap)

These ship as web only and are **deliberately not going to the App Store**. Recorded 2026-08-30 so
the question stops resurfacing as a portfolio "gap":

| App | Why not |
|---|---|
| Numen | Free-form calculator. Thin by Apple's 4.3(a) definition; live at numen.heyitsmejosh.com |
| Journal | Personal weekly writing site, not a product. Inkpress is the shipped writing app |
| Nimble | Instant-answer search box. Thin; no ASC record and none planned |
| Feng Shui | Web app is a 24-question assessment; the iOS reader target is PARKED and diverged |

The portfolio badges were corrected on 2026-08-30 to say Web for these plus Healstack and NYC,
which had been claiming iOS/macOS while their store builds were rejected or in review.

**Do not batch-create ASC records for these.** Bulk new thin apps are what triggered the 5.6
suspension and the 4.3(a) wave that took out 7 apps on 2026-08-28, two are still rejected today.

Focus is **Epiphany, Talli, Voxprint**. The other nine stay free and serve as ASO surface , 
twelve paywalls with no users each earn $0 and triple the review surface.

## What's blocked on Joshua (no agent path)

1. **Canadian GST/HST Form 506, status `Missing Tax Info`.** Read off ASC > Business >
   Agreements on 2026-08-29. This is the *only* outstanding item and it gates all iOS revenue
   across all apps. Paid Apps Agreement is `Pending User Info`; both US tax forms are Active;
   bank `rbc (8640)` is `Processing`, **not rejected**, the "no further updates for 24 hours"
   banner is what previously read as a rejection.
   **The old "test first" note is resolved and wrong:** Apple names the Canadian form explicitly,
   so it is not skippable. Still unknown, and the one question worth asking Apple: whether Form
   506 accepts a *not-registered* declaration, which would skip CRA registration entirely (the
   portfolio is far below the $30k small-supplier threshold). Full detail: `wiki/pages/paid-apps-agreement.md`.
2. ~~**Cloudflare Web Analytics beacon token.**~~ **NOT BLOCKED, resolved 2026-08-30, this item
   was never real.** Web Analytics was already enabled with automatic edge injection and had been
   collecting for ~6 months. No token to create, no script tag to install. (It remains true that
   the CLI cannot read this: the stored CF token is DNS-scoped with zero account access and the
   wrangler OAuth token has no `rum` scope, so `/rum/site_info/list` returns an auth error. That is
   a *read* limitation only, it is what made this look blocked. Check the dashboard, not the API.)
3. Buy `jaybulb.com` if the portfolio rename should land before any launch posts.

## Funnel

Two hops: portfolio → `<app>.heyitsmejosh.com` → App Store. Both hops work; every landing page
carries a store button (Epiphany's is `epiphany/src/pages/LandingPage.jsx:383`, it's an SPA, so
curl reports a false zero. **Grep the source, never curl, when auditing these.**)

- **Done:** `nulljosh.github.io/index.html` now carries a direct App Store link on all 12 live
  apps, alongside the landing-page link, so returning visitors skip the second hop.
- **Done, and the old "blocked" note here was wrong.** Cloudflare Web Analytics has been live
  on `heyitsmejosh.com` for ~6 months, set to **"Enable, excluding visitor data in the EU"**,
  which means Cloudflare injects the beacon at the edge. That is exactly why grepping the repos
  for `cloudflareinsights` / `beacon.min.js` finds nothing, **there is no script tag to find, and
  its absence is not evidence of no analytics.** Verified in the dashboard 2026-08-30: 37 visits /
  38 page views in 24h, and the per-URL breakdown covers the app subdomains, not just the apex
  (heyitsmejosh.com, doorstock., bookrank., voxprint., nyc. all reporting). Site tag
  `b4cf73902e484158b50172410b0ca54d`. Both funnel hops are measured. Nothing to install.
- **Done 2026-08-30:** ASO metadata. **The old claim here, "No app has canonical `metadata/`
  checked in", was wrong.** 14 apps already had it; the remaining 5 were pulled from live on
  2026-08-30 (epiphany, curvely, wordroot, nyc, bcgd/Doorstock). All 19 now carry canonical
  JSON under `metadata/app-info/` + `metadata/version/<v>/`, with subtitle and keywords set.
  `bcgd` was the last legacy fastlane `.txt` layout and is now JSON like the rest.
- **Done 2026-08-31:** `promotionalText` written and applied live on all 17 remaining
  localizations (bcgd/Doorstock, bookrank, charwork, curvely, healstack, inkpress, lexly,
  sparkjar, voxprint, wordroot, both platforms each). conway, litigate, nyc and quotestreak
  already had it. **Do not use `asc metadata plan/apply` for this on a live version**, it
  PATCHes the whole localization and Apple rejects it with "Attribute 'description' cannot be
  edited at this time". Use `asc localizations update --id <localizationId> --promotional-text
  "..."`, which sends the one field and works in READY_FOR_SALE, IN_REVIEW and REJECTED alike.
- For iOS, ASC App Analytics is the free feedback loop, already collecting, nothing to install.

## Track C, the IAP flip (execute the day the agreement activates, not before)

A live IAP under an inactive agreement fails review, so this is staged, not applied.

- **Voxprint** `Sources/Services/StoreManager.swift`: flip `isPro = true` → `false`, un-early-return
  `refreshEntitlement()`, delete the `ponytail:` comment explaining the workaround. Product
  `com.nulljosh.echo.unlock`, $9.99 non-consumable, 3-free-file gate, `PaywallView.swift` already
  built. It is **live right now, shipping fully unlocked**.
- Pricing as decided: Voxprint $9.99 one-time (a subscription contradicts the "own it once,
  nothing leaves your device" pitch); Epiphany $1 one-time.
  Benchmark: **Aiko** is the direct comparable, same on-device Whisper, iOS + Mac, one-time
  **$19.99**. MacWhisper Pro is $59 one-time. Otter/Rev/Descript are $8-30 **per month**, so
  one-time is the differentiator, not a discount. $9.99 sits well under Aiko because Voxprint has no reviews and Pro unlocks
  only unlimited file imports plus the `whisper-small` model, live mic is free forever. For a
  no-review app a low price buys reviews, which are the scarcer asset; raise toward $19.99 once
  they exist. Set in ASC 2026-08-30 (was $3.99). None of this matters until Form 506 clears.
- Before declaring a submit blocked, run **one** `asc review submit` and read the real error.
  `asc validate` cannot see agreement state, and a past session was lost to assuming otherwise.

## Verified 2026-08-31, the "Stripe live on 4 apps" claim was half wrong

Checked production secrets, not the repo. Only **two** rails can actually take money today:

| App | Prod Stripe secret | Frontend paywall | Verdict |
|---|---|---|---|
| Talli | all 4 set (Worker) | `web/unified.html:442` upgrade CTA | **works** |
| Epiphany | all 7 set (Worker) | PricingPage + isPro gates on People/DailyBrief | **works: webhook fixed 2026-08-31** |
| Healstack | **none**: placeholder price id removed 2026-08-31 | `usePro` + Journal gate, webhook added 2026-08-31 | **code done, needs keys** |
| Sparkjar | **none** | no CTA in `app.html` | dead code |

**Two real bugs found and fixed 2026-08-31, both silent:**

1. **Epiphany's webhook had been dead since the Cloudflare migration.** `worker/index.js` hands
   handlers a plain object, not a Node stream, so `stripe-webhook.js` iterating `req` with
   `for await` threw *before* its try block. Stripe got a 500 on every delivery and
   `sub:<customerId>` was never written: a completed $1 purchase charged the card and left the
   buyer on the free tier. Fixed by carrying the exact signed bytes as `req.rawBody` and
   verifying with `constructEventAsync` (Workers has no synchronous crypto). Live probe with a
   forged signature went 500 → 400. **Check Stripe's dashboard for past failed deliveries and
   replay any real ones.**
2. **Healstack had no webhook at all.** Nothing ever wrote `pro:<userId>`, so even with a working
   key a payment would unlock nothing. Handler added, plus a 503 guard so an unconfigured
   checkout says so instead of dying inside the SDK.

The frontend and Functions code is now complete in all four. Healstack and Sparkjar are missing only
a `STRIPE_SECRET_KEY` (+ a real price id) in Cloudflare Pages. That is a paste, not a build , 
but it needs the key from the Stripe dashboard, which no CLI here can read back out of Talli's
or Epiphany's encrypted secrets.

**The CRA Business Number is mailed and faxed and still pending**, so Form 506, the Paid Apps
Agreement and every StoreKit price stay blocked. Nothing in the code can move that.

## Wired 2026-09-06: Healstack + Sparkjar Stripe

Set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` on both Pages projects (webhook endpoints recreated via API to obtain signing secrets), redeployed. Probes: forged-signature webhook 400 on both, checkout 401 unauthenticated on both. Sparkjar already had the `proBanner` + `unlockPro()` CTA in `app.html`; the earlier "no CTA" claim was stale. Authenticated checkout not probed (test-account login failed); handler code is identical to Talli's working one. All four Stripe rails now take money on the web. Stripe account itself: charges + payouts enabled, zero requirements.

## Resolved 2026-09-06 via Stripe API (live key in `epiphany/.env.tui.local`)

Checked the whole account: **zero charges ever, zero checkout sessions.** Nothing to replay. All five webhook endpoints exist and are enabled (talli, sparkjar, healstack, epiphany, opticon). The section below is kept for the procedure only.

## Was open, needed Joshua's Stripe login (deferred to 2026-09-01)

1. **Check Epiphany's failed webhook deliveries and replay the real ones.** The webhook 500'd on
   every delivery from the Cloudflare migration until the fix on 2026-08-31. Stripe retries for
   ~3 days and then gives up, so anything older is only visible in the dashboard's event log.
   Stripe > Developers > Webhooks > the epiphany endpoint > failed deliveries. Any
   `checkout.session.completed` there is someone who **paid and got nothing**, replay it (the
   handler is idempotent, it just writes `sub:<customerId>`) and confirm their tier flips.
   If the endpoint is missing entirely, that is the finding: create it against
   `https://epiphany.heyitsmejosh.com/api/stripe-webhook` and update `STRIPE_WEBHOOK_SECRET`.
2. Cross-check that Talli's webhook endpoint exists too, its code is fine and it runs on the
   same Worker adapter, but it was never probed. Forged-signature probe: 400 healthy, 500 broken. Send `content-type: application/json`; a form body skips rawBody and 500s by design. Talli probed 2026-09-06: 400, healthy. Epiphany re-probed 2026-09-06: 400, healthy.

**Decided 2026-08-31: Healstack's paywall stays unwired.** The code is now complete and correct,
but a $1 CSV-export paywall on an app with no iOS release and no traffic earns $0 and adds a live
payments surface to maintain. It follows the "no paywalls on the nine non-focus apps" rule below.
Wire it only if Healstack ever gets users.

## Deliberately not doing

No paid ads until a paywall converts. No new landing pages, they all exist. No unifying the four
Stripe implementations (three runtimes, all working). No paywalls on the nine non-focus apps.
No analytics SDK, no email platform, no new dependency.

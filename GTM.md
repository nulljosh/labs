# GTM — revenue state of every app

Single source of truth for what earns money, what can't yet, and why. Verified against ASC and
production on 2026-08-29. Don't re-derive this from 18 ASC records; update this table instead.

## The one-line summary

Payments code is **done**. Distribution and measurement are **not**. iOS cannot charge at all
until the Paid Apps Agreement activates (blocked on a CRA Business Number, see below).

## Ledger

| App | ASC ID | Live | Price | Rail | Blocker / next action |
|---|---|---|---|---|---|
| Epiphany | 6779522175 | Mac 2.5.2 · **iOS 2.5.6 REJECTED** | $1 one-time (planned) | Stripe live + StoreKit | **Focus.** iOS is out of the store on 4.3(a); fix that before any paywall work |
| Talli | 6782366555 | iOS 3.5.13 · Mac 3.5.6 | free | Stripe live | **Focus.** One upgrade CTA (`src/api.js` → `/api/stripe-checkout`) |
| Voxprint | 6782604262 | Mac 1.3.6 · iOS 1.3.8 staged | $9.99 one-time | StoreKit, **disabled** | **Focus.** 2-line revert, but BLOCKED until Form 506 clears |
| Lexly | 6783501611 | **iOS 1.1.5 REJECTED** · Mac 1.1.5 IN_REVIEW | free | none | none planned |
| Litigate | 6787857503 | iOS 1.0.3 | free | none | none planned |
| Bookrank | 6792376485 | iOS 1.0.1 · Mac 1.0.1 | free | none | personal shelf, not a product |
| Sparkjar | 6785162492 | Mac 1.0.1 · **iOS 1.0 REJECTED** | free | Stripe live | iOS never shipped; email/OAuth unconfigured — leave alone |
| Inkpress | 6787759999 | **iOS 1.0.6 + Mac 1.0.7 WAITING_FOR_REVIEW** | free | none | Mac 1.0.7 is its first ever Mac release |
| Wordroot | 6794988021 | iOS 1.0.1 · Mac 1.0.1 IN_REVIEW | free | none | none planned |
| Curvely | 6794988370 | **iOS 1.2.2 REJECTED** | free | none | 4.3(a) wave, reply filed |
| Charwork | 6794988951 | iOS 1.1.0 | free | none | repo renamed from wiretext; ASC record still "Wiretext" |
| Quotestreak | 6804394619 | iOS 1.0 · Mac 1.0 | free | none | none planned |
| Healstack | 6785764864 | **iOS 2.3.5 REJECTED** · Mac 2.3.5 IN_REVIEW | $1 CSV export | Stripe live | 4.3(a) wave, reply filed |
| NYC Survive | 6782618198 | **iOS 1.0.0 REJECTED** · Mac 1.0.1 IN_REVIEW | free | none | listing filled to 10 screenshots 2026-08-29 |

Focus is **Epiphany, Talli, Voxprint**. The other nine stay free and serve as ASO surface —
twelve paywalls with no users each earn $0 and triple the review surface.

## What's blocked on Joshua (no agent path)

1. **Canadian GST/HST Form 506 — status `Missing Tax Info`.** Read off ASC > Business >
   Agreements on 2026-08-29. This is the *only* outstanding item and it gates all iOS revenue
   across all apps. Paid Apps Agreement is `Pending User Info`; both US tax forms are Active;
   bank `rbc (8640)` is `Processing`, **not rejected** — the "no further updates for 24 hours"
   banner is what previously read as a rejection.
   **The old "test first" note is resolved and wrong:** Apple names the Canadian form explicitly,
   so it is not skippable. Still unknown, and the one question worth asking Apple: whether Form
   506 accepts a *not-registered* declaration, which would skip CRA registration entirely (the
   portfolio is far below the $30k small-supplier threshold). Full detail: `wiki/pages/paid-apps-agreement.md`.
2. **Cloudflare Web Analytics beacon token.** Dashboard-only: the stored token is DNS-scoped and
   the wrangler OAuth token has no `rum` scope, so no CLI path exists. Create the site token in
   the CF dashboard and drop it in; the script tag is one line per site.
3. Buy `jaybulb.com` if the portfolio rename should land before any launch posts.

## Funnel

Two hops: portfolio → `<app>.heyitsmejosh.com` → App Store. Both hops work; every landing page
carries a store button (Epiphany's is `epiphany/src/pages/LandingPage.jsx:383` — it's an SPA, so
curl reports a false zero. **Grep the source, never curl, when auditing these.**)

- **Done:** `nulljosh.github.io/index.html` now carries a direct App Store link on all 12 live
  apps, alongside the landing-page link, so returning visitors skip the second hop.
- **Blocked:** analytics. Zero scripts across every site — not one hop of this funnel is
  measured, which makes every other claim here unfalsifiable. See blocker 2.
- **Todo:** ASO. No app has canonical `metadata/` checked in. Subtitle + 100-char keywords are
  the two highest-weight fields and are doing nothing. Bootstrap with
  `asc metadata init --dir ./metadata` → `pull` → `plan` → `approve` → `apply --confirm`
  (use the `asc-metadata-sync` skill). Push metadata **before** a submit — `ship-ios` never
  pushes `whatsNew`.
- For iOS, ASC App Analytics is the free feedback loop — already collecting, nothing to install.

## Track C — the IAP flip (execute the day the agreement activates, not before)

A live IAP under an inactive agreement fails review, so this is staged, not applied.

- **Voxprint** `Sources/Services/StoreManager.swift`: flip `isPro = true` → `false`, un-early-return
  `refreshEntitlement()`, delete the `ponytail:` comment explaining the workaround. Product
  `com.nulljosh.echo.unlock`, $9.99 non-consumable, 3-free-file gate, `PaywallView.swift` already
  built. It is **live right now, shipping fully unlocked**.
- Pricing as decided: Voxprint $9.99 one-time (a subscription contradicts the "own it once,
  nothing leaves your device" pitch); Epiphany $1 one-time.
  Benchmark: **Aiko** is the direct comparable — same on-device Whisper, iOS + Mac, one-time
  **$19.99**. MacWhisper Pro is $59 one-time. Otter/Rev/Descript are $8-30 **per month**, so
  one-time is the differentiator, not a discount. $9.99 sits well under Aiko because Voxprint has no reviews and Pro unlocks
  only unlimited file imports plus the `whisper-small` model — live mic is free forever. For a
  no-review app a low price buys reviews, which are the scarcer asset; raise toward $19.99 once
  they exist. Set in ASC 2026-08-30 (was $3.99). None of this matters until Form 506 clears.
- Before declaring a submit blocked, run **one** `asc review submit` and read the real error.
  `asc validate` cannot see agreement state, and a past session was lost to assuming otherwise.

## Deliberately not doing

No paid ads until a paywall converts. No new landing pages — they all exist. No unifying the four
Stripe implementations (three runtimes, all working). No paywalls on the nine non-focus apps.
No analytics SDK, no email platform, no new dependency.

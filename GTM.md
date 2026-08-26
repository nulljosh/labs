# GTM — revenue state of every app

Single source of truth for what earns money, what can't yet, and why. Verified against ASC and
production on 2026-08-26. Don't re-derive this from 18 ASC records; update this table instead.

## The one-line summary

Payments code is **done**. Distribution and measurement are **not**. iOS cannot charge at all
until the Paid Apps Agreement activates (blocked on a CRA Business Number, see below).

## Ledger

| App | ASC ID | Live | Price | Rail | Blocker / next action |
|---|---|---|---|---|---|
| Epiphany | 6779522175 | iOS 2.5.4 · Mac 2.5.2 | $1 one-time (planned) | Stripe live + StoreKit | **Focus.** Verify checkout round-trip; add one upgrade CTA at the free limit |
| Talli | 6782366555 | iOS 3.5.12 · Mac 3.5.6 | free | Stripe live | **Focus.** One upgrade CTA (`src/api.js` → `/api/stripe-checkout`) |
| Voxprint | 6782604262 | Mac 1.3.6 | $7.99 one-time | StoreKit, **disabled** | **Focus.** Cheapest unlock in the portfolio — 2-line revert, see Track C |
| Lexly | 6783501611 | iOS 1.1.3 · Mac 1.1.4 | free | Stripe (unused) | none planned |
| Litigate | 6787857503 | iOS 1.0.2 | free | none | none planned |
| Bookrank | 6792376485 | Mac 1.0.1 | free | none | none planned |
| Sparkjar | 6785162492 | Mac 1.0.1 | free | Stripe live | email/OAuth unconfigured — leave alone |
| Inkpress | 6787759999 | iOS 1.0.5 | free | none | none planned |
| Wordroot | 6794988021 | Mac 1.0 | free | none | none planned |
| Curvely | 6794988370 | iOS 1.2.1 | free | none | none planned |
| Wiretext | 6794988951 | iOS 1.1.0 | free | none | none planned |
| Quotestreak | 6804394619 | iOS 1.0 · Mac 1.0 | free | none | none planned |
| Healstack | 6785764864 | **IN_REVIEW** 2.3.5 | $1 CSV export | Stripe live | wait for review |
| NYC Survive | 6782618198 | **REJECTED** iOS | free | none | read rejection reason |

Focus is **Epiphany, Talli, Voxprint**. The other nine stay free and serve as ASO surface —
twelve paywalls with no users each earn $0 and triple the review surface.

## What's blocked on Joshua (no agent path)

1. **CRA Business Registration Online → Business Number + RT**, then GST/HST Form 506 in ASC.
   This gates *all* iOS revenue across *all* apps. US tax forms (W-8BEN + Certificate of Foreign
   Status) are already Active; bank `rbc (8640)` is submitted.
   **Test first:** Apple lists only Banking + US Tax as activation requirements and never names
   the Canadian form — the agreement may flip Active without the BN. Check before registering.
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
  `com.nulljosh.echo.unlock`, $7.99 non-consumable, 3-free-file gate, `PaywallView.swift` already
  built. It is **live right now, shipping fully unlocked**.
- Pricing as decided: Voxprint $7.99 one-time (a subscription contradicts the "own it once,
  nothing leaves your device" pitch); Epiphany $1 one-time.
- Before declaring a submit blocked, run **one** `asc review submit` and read the real error.
  `asc validate` cannot see agreement state, and a past session was lost to assuming otherwise.

## Deliberately not doing

No paid ads until a paywall converts. No new landing pages — they all exist. No unifying the four
Stripe implementations (three runtimes, all working). No paywalls on the nine non-focus apps.
No analytics SDK, no email platform, no new dependency.

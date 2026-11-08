# GTM, the money ledger

*Current state only, verified 2026-11-02 (`asc pricing current --app <id>` for every app). The plan for the company is `REVENUE.md`. Each app's own plan is its `MONEY.md`. History is in git.*

## The numbers

Revenue: **no verified number.** The App Store Connect API key lacks the Sales role, so `asc analytics sales` is refused; Stripe showed zero charges ever when last checked on 2026-09-06. Traffic: about 37 visits a day across every site (Cloudflare Web Analytics, last read 2026-08-30). Give the key the Sales role and this section becomes a weekly number.

## Rules

Every app is free or a dollar. Paid upfront unlocks everything, nobody pays twice. No subscriptions, tips, ads, tiers or price tests (Joshua, 2026-10-01). Web buys go through Stripe at $1; iPhone and Mac through the App Store at $0.99 under the Small Business Program, so each sale pays $0.84. Joshua Tree the OS is free forever; its money is hardware. Anyone who got an app free keeps it free.

## Ledger

| App | ASC | Store price | Web | Role in the plan | Plan |
|---|---|---|---|---|---|
| Epiphany | 6779522175 | $1.00 | Stripe $1 (Premium) | hero candidate | `epiphany/MONEY.md` |
| Echo (store: Notate) | 6782604262 | $0.99 | free | hero candidate | `echo/docs/MONEY.md` |
| Kernel | 6792376485 | $0.99 (the voices) | free | hero candidate | `kernel/MONEY.md` |
| Pan (store: Curvely) | 6794988370 | $0.99 | free | catalogue | `pan/MONEY.md` |
| Icelus | 6794988951 | $0.99 | free | catalogue | `icelus/MONEY.md` |
| Eponym | 6794988021 | $0.99 | free | catalogue | `eponym/docs/MONEY.md` |
| Bugle (store: Bugles) | 6787759999 | $0.99 | free | catalogue | `bugle/MONEY.md` |
| Nimble (store: Nimble Answers) | 6807858746 | $0.99 | free, Apache 2.0 | catalogue | `nimble/MONEY.md` |
| Airwell | 6810806058 | $0.99 | free | catalogue | `airwell/MONEY.md` |
| Toroid | 6806324937 | $0.99 | free | catalogue | `toroid/MONEY.md` |
| Gastown | 6782618198 | $0.99 | free | catalogue | `gastown/docs/MONEY.md` |
| Cartons | 6825115360 | $0.99 | free | catalogue | `cartons/MONEY.md` |
| Talli | 6782366555 | free | Stripe $1 | free on purpose, a disability tool | `talli/docs/MONEY.md` |
| Machaon | 6785764864 | free | Stripe $1 | catalogue | `machaon/docs/MONEY.md` |
| Melete (store: Thinkpond) | 6785162492 | free | Stripe $1 | catalogue | `melete/MONEY.md` |
| Patois | 6783501611 | free | free | catalogue | `patois/MONEY.md` |
| Mailbag | 6811141466 | free | free | catalogue | `mailbag/MONEY.md` |
| Coda (store: Quotestreak) | 6804394619 | free | free | catalogue | `coda/MONEY.md` |
| Blackcomb | 6809355192 | free | free | free on purpose, a browser | `blackcomb/MONEY.md` |
| Scrounger | 6809031662 | free | free | catalogue | `scrounger/MONEY.md` |
| Hamurapi | 6819131590 | free | free | catalogue | `hamurapi/MONEY.md` |
| Plaintxt | 6809841903 | free | free | free on purpose, a text editor | `plaintxt/MONEY.md` |
| Temida | 6787857503 | free | free | free on purpose, a public good | `temida/MONEY.md` |
| Doorstock (bcgd) | 6791106082 | free | free | client work | `bcgd/MONEY.md` |
| Elah | 6829146794 | free | free | free on purpose, public domain Bibles | none yet |
| Cyllene | 6829353117 | free | free | catalogue | none yet |
| Atlin | 6824157219 | free | free | catalogue | none yet |
| Horula | 6826916379 | free | free | catalogue | none yet |
| Sighting | 6829546358 | free | free | free on purpose, lost pets | none yet |
| Co-Stanza | 6829546496 | free | free | catalogue | none yet |
| Duke | none | never sold | free | Duolingo's terms forbid automation | `duke/MONEY.md` |
| Plank | none | free | free | the language Joshua Tree apps are written in | `plank/MONEY.md` |
| Joshua Tree | none | the OS is free | waitlist | **the hardware, stage one's center** | `REVENUE.md` |

Sidewise was retired 2026-10-28 and removed from sale (6806028670).

## Hard-won rules

- **One store submission a week at most.** Bulk submissions triggered the 5.6 suspension and the 4.3(a) waves of 2026-08-28 and 2026-10-05.
- **Price changes need no build or review:** `asc pricing schedule create --app <id> --price 0.99 --base-territory USA --start-date YYYY-MM-DD`, or `--free` to revert. Only with Joshua's yes in chat.
- **Promotional text on a live version:** `asc localizations update --id <localizationId> --promotional-text "..."`. Never `asc metadata apply`, which PATCHes the whole localization and is refused.
- **Stripe webhooks:** probe with a forged signature and `content-type: application/json`. 400 is healthy, 500 is broken. Workers hand handlers a plain object, so verify against `req.rawBody` with `constructEventAsync`.
- **Stripe cannot unlock in-app features under App Review.** That needs StoreKit.
- **Auditing a landing for a store button:** grep the source, never curl. The landings are single page apps.
- **Analytics are already on.** Cloudflare injects the beacon at the edge, so there is no script tag to find. Read the dashboard; the stored token cannot.
- Before calling a submit blocked, run one `asc review submit` and read the real error.

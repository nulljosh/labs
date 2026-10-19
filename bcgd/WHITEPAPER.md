# BC Garage Doors Technical Whitepaper

**v3.0.0** | August 2026

A small local business has two real problems online: getting found by someone
searching for a garage door repair, and knowing what's actually in stock without
a clipboard. Two things for Best Choice Garage Doors (bcgaragedoors.ca) exist to
solve each. A landing page at
[bcgd.heyitsmejosh.com](https://bcgd.heyitsmejosh.com) that turns a search into a
phone call. A stock tracker at bcgd-dashboard.heyitsmejosh.com so the shop knows
what's on the truck.

## Landing Page

Static conversion page in `web/` (source partially under recovery, see
Status). Built for one job: turn a search visit into a phone call or quote
request, because a garage door business converts on the phone, not on a web
form. Mobile-first, since most of that search traffic is someone standing in
their garage with a broken door and a phone in hand, no framework, styled with
the shared portfolio design tokens (`portfolio-tokens.css`).

## Dashboard

Inventory and stock tracker for door panels, openers, and parts, a simple
CRUD view over stock levels so the shop knows what's on the truck versus on
order, replacing a paper or spreadsheet count that only one person can check
at a time.

## Companion iOS App

SwiftUI iOS and macOS apps exist under ASC record 6791106082, both in
`PREPARE_FOR_SUBMISSION`, registered but not yet submitted for review, giving
the shop a dashboard that works off the truck lot without a browser tab open.

## Status

The repo was accidentally deleted from disk and GitHub on 2026-06-22; the
Vercel deployments remain live. Current disk contents are the recovered
partial source. Full recovery from the live deployment is the open item before
further feature work.

## License

MIT 2026, Joshua Trommel

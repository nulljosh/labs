# CanLII App Technical Whitepaper

**v0.1** | August 2026

Canadian case law, searchable from your phone.

A native iOS client for CanLII plus a small web wrapper, behind a serverless proxy
whose only job is to keep the API key off the client.

## Problem

canlii.org is the free public record of Canadian law, and its own site is dated
and blocks scraping (403 on direct fetch). CanLII does publish an official API,
but it is key-authenticated, and a key shipped inside an iOS binary or a
browser bundle is a published key.

## The Proxy

`api/` holds Vercel Edge Functions that mirror the two endpoints the clients
need, `/api/databases` and `/api/search`, and forward to `api.canlii.org`
with `CANLII_API_KEY` read from the server environment. Both clients call the
proxy; neither ever holds the key. It is the whole reason a backend exists here
at all.

## Clients

| Platform | Stack | Notes |
|----------|-------|-------|
| iOS | SwiftUI, xcodegen (`ios/project.yml`) | Search, browse, bookmarks via SwiftData, decisions open in a Safari view |
| Web | Static HTML/CSS/JS | Same `/api` routes, no framework |

Full decisions open in Safari against canlii.org rather than being re-rendered
in-app: the source is authoritative, paginated, and citation-stable, and
reproducing it would only introduce a way to be wrong about what a judgment
says.

Bookmarks are local SwiftData, there are no accounts, so a bookmark never
leaves the device.

## Relationship to Litigate

Litigate is the case-management side of the same problem (timelines, grounds,
documents for a self-represented litigant). Folding this search client into
Litigate as a research tab is the likely end state; it stays separate while the
API-key proxy and the search UX are still being proven.

## Status

MVP scaffold. Search, browse, and bookmark work once `CANLII_API_KEY` is set;
the iOS build is verified for the simulator. Not submitted to the App Store.

## License

MIT 2026, Joshua Trommel

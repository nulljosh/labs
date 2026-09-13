# CanLII App Technical Whitepaper

**v0.1** | August 2026

Canadian case law is free and public, but its own site is unusable on a
phone. This app exists to put that same public record somewhere a person can
actually search from their pocket: a native iOS client for CanLII plus a small web wrapper, behind a serverless proxy
whose only job is to keep the API key off the client, because there is no other way to call an authenticated API from something as inspectable as a mobile app or a browser bundle.

## Problem

canlii.org is the free public record of Canadian law, and its own site is dated
and blocks scraping (403 on direct fetch). CanLII does publish an official API,
but it is key-authenticated, and a key shipped inside an iOS binary or a
browser bundle is a published key.

## The Proxy

`api/` holds Vercel Edge Functions that mirror the two endpoints the clients
need, `/api/databases` and `/api/search`, and forward to `api.canlii.org`
with `CANLII_API_KEY` read from the server environment, never sent to a
client. Both clients call the
proxy; neither ever holds the key. It is the whole reason a backend exists here
at all: the app would otherwise be a static client with nothing to protect.

## Clients

| Platform | Stack | Notes |
|----------|-------|-------|
| iOS | SwiftUI, xcodegen (`ios/project.yml`) | Search, browse, bookmarks via SwiftData, decisions open in a Safari view |
| watchOS | SwiftUI, standalone (WKWatchOnly), xcodegen (`watchos/project.yml`) | Search by court, title/citation only (search API returns no more), full decision link hands off to canlii.org |
| Web | Static HTML/CSS/JS | Same `/api` routes, no framework |

Full decisions open in Safari against canlii.org rather than being re-rendered
in-app: the source is authoritative, paginated, and citation-stable, and
reproducing it would only introduce a way to be wrong about what a judgment
says.

Bookmarks are local SwiftData, there are no accounts, so a bookmark never
leaves the device, because what a person is researching is exactly the kind
of thing that should not sit in a server's database.

## Relationship to Litigate

Litigate is the case-management side of the same problem (timelines, grounds,
documents for a self-represented litigant). Folding this search client into
Litigate as a research tab is the likely end state, since the two solve
halves of one problem for the same person; it stays separate while the
API-key proxy and the search UX are still being proven, so a mistake here
does not risk the case data Litigate holds.

## Status

MVP scaffold. Search, browse, and bookmark work once `CANLII_API_KEY` is set;
the iOS build is verified for the simulator. Not submitted to the App Store.

## License

MIT 2026, Joshua Trommel

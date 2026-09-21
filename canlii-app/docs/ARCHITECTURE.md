# Architecture

Search Canadian case law without building your own proxy. iOS, watchOS, and web clients for CanLII's public API, with a serverless Vercel proxy that holds the API key server-side so it never ships in the client bundle. All three platforms share the same `/api` routes.

## How it runs

Clients call `/api/databases` (fetch available courts and case databases) and `/api/search` (query by court, title, citation). These Vercel Edge Functions forward to `api.canlii.org` with `CANLII_API_KEY` from the server environment, never exposing the key to the client. iOS and watchOS apps call the proxy from their native code. The web app uses the same proxy from JavaScript. Search results display locally; full decisions open in Safari against canlii.org (the authoritative source). iOS bookmarks are stored locally in SwiftData and never sent to a server.

| File | What it owns |
|---|---|
| `api/databases.ts` | Vercel Edge Function. Accepts `?type=legislation` or default case browse. Forwards to CanLII's `caseBrowse` or `legislationBrowse` endpoint with the server API key. Returns JSON list of databases. |
| `api/search.ts` | Vercel Edge Function. Accepts query params (court ID, title, citation). Forwards to CanLII's search endpoint. Returns case results. |
| `ios/CanLII/CanLIIApp.swift` | SwiftUI app entry point. Sets up the app structure and scenes. |
| `ios/CanLII/API/CanLIIClient.swift` | HTTP client wrapping the `/api` proxy. Handles database list and search requests. |
| `ios/CanLII/Models/Models.swift` | Codable data types for databases, cases, and search results. |
| `ios/CanLII/Services/BookmarkStore.swift` | SwiftData persistence for case bookmarks. Local only, no sync. |
| `ios/CanLII/Views/SearchView.swift` | Search UI: court picker, title/citation input, results list. |
| `ios/CanLII/Views/CaseDetailView.swift` | Opens a decision link in Safari (no re-rendering). Shows metadata. |
| `ios/project.yml` | xcodegen project definition. |
| `watchos/CanLIIWatchApp.swift` + `watchos/ContentView.swift` | watchOS app entry and main view. WKWatchOnly target for small screen. |
| `watchos/Models/WatchAPI.swift` | HTTP client for watchOS; search by court and title only. |
| `watchos/Views/SearchView.swift` + `watchos/Views/CaseDetailView.swift` | Watch UI for search and result detail. |
| `web/index.html` + `web/app.js` | Static web client. Same `/api` routes. Search form and results rendering via vanilla JavaScript. |

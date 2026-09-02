# scripts

Loose helpers shared across the repos here. Each one stands alone. No shared
package, no install step. Run it.

| Script | What it does |
|---|---|
| `letterboxd_watchlist.py` | Scrape a Letterboxd watchlist to CSV, ranked by rating. `python3 letterboxd_watchlist.py <username>` |
| `test_letterboxd_watchlist.py` | Its tests. `pytest scripts/` |
| `trakt_client.py` | Trakt API client (device-code OAuth, search, watchlist, history, ratings). Needs an app registered at trakt.tv/oauth/applications. |
| `wcag-audit.py` | Contrast audit over the house design tokens, light mode and dark overrides. Point it at HTML/CSS files. |
| `xplat-section.py` | Inject the "Install it anywhere" section into an app's landing page. |
| `pwa-add.sh` | Make a static/SPA web app installable (manifest + service worker). |
| `sync-docs-to-wiki.sh` | Copy each repo's `README.md` into the Obsidian wiki as `pages/<repo>-readme.md`. Run manually after doc updates. |
| `tf-health.sh` | TestFlight build/health check across all apps via `asc`. |

The Python scrapers expect `requests` and `beautifulsoup4`.

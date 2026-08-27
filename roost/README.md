<img src="icon.svg" width="80">

# Roost

![version](https://img.shields.io/badge/version-v2.0.1-blue)

BC real estate listings app with interactive map, search filters, and favorites. Mobile-first PWA with Dark Editorial design.

## Features

- Interactive Leaflet map with Zillow-style price pill markers
- Filter by price, beds, property type, sort order
- Favorites system with localStorage
- Supabase Auth (email + password, forgot password, session persistence)
- Profile settings with search preferences
- 50 mock BC listings (Vancouver, Victoria, Kelowna)

## Run

```bash
npm install && npm run dev
npm run build
```

## License

MIT 2026 Joshua Trommel

[Technical whitepaper](WHITEPAPER.md)

## API and agent tools

[`docs/API.md`](docs/API.md) documents the HTTP surface (where there is one) and
the WebMCP tools this app registers on `document.modelContext`, so an in-browser
agent can drive it. Tools are split into read-only, reversible writes, and the
few that require human confirmation.

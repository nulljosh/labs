# roost
v2.0.1

## From Notes PDF (imported 2026-08-02)
- [ ] Confirmed 2026-08-02: roost is still in the codebase (`labs/roost`), active, v2.0.1.
- [x] DONE 2026-08-23 (The Garage + Koret Lofts, in `src/data/listings.js` as `realListings`; Taylor Building omitted, no active listing). Integrate real Gastown listing picks into the mock listings data (from Zillow clone.pdf note): "The Garage" (202-36 Water Street, top pick, $625,000, 1bd/1ba, exposed concrete/Miele kitchen loft), "Koret Lofts" (506-55 E Cordova Street, runner-up, $824,900, 1bd/1.5ba, 20ft ceilings/exposed brick/timber), "Taylor Building" (310 Water Street, runner-up, 1911 heritage conversion, 22 suites, no active listing — reference only). Sources: Royal LePage MLS #R3149447, Vancity Lofts MLS #R3149767, Vancity Lofts Taylor Building gallery (as of 2026-07-29).

## Rules

- Mobile-first layout, horizontal filter chips on small screens
- Dark Editorial design (BC gov blue variant): navy `#0c1220`, blue `#1a5a96`/`#2472b2`/`#4e9cd7`, Fraunces + DM Sans
- Map markers stay as price pill SVGs
- No emojis

## Run

```bash
npm install && npm run dev
npm run build
```

## Key Files

- src/main.jsx: App bootstrap and Vite entry
- src/App.jsx: Routing and protected routes
- src/context/AuthContext.jsx: localStorage auth (login, register, profile)
- src/context/FavoritesContext.jsx: Favorites with localStorage sync
- src/context/FiltersContext.jsx: Price, beds, type, sort filters
- src/components/MapView.jsx: Leaflet map with price pill markers
- src/components/FilterBar.jsx: Horizontal chip filter bar
- src/components/ListingCard.jsx: Listing card with photo and stats
- src/data/listings.js: 50 mock BC listings with seeded generation
- src/pages/: Login, Register, ForgotPassword, Listings, ListingDetail, Settings

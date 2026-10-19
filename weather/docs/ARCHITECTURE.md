# Architecture

Weather forecast. Enter a city or allow location access, see the current temperature and week ahead. No account, no ads, no app to install. One static page.

## How it runs

`web/index.html` uses the browser's Geolocation API (if permitted) or accepts city search via form input. It queries Open-Meteo's free weather API (no API key needed) for coordinates and then forecast data. Results display as current conditions (temperature, feels like, humidity, wind) and a seven-day forecast. All data is fetched fresh on load; nothing is cached or stored.

| File | What it owns |
|---|---|
| `web/index.html` | Sole page. Geolocation permission prompt (on load if not denied), city search form, current weather display, seven-day forecast cards. Inline CSS. Calls Open-Meteo public API. |
| `web/devices.css` | Responsive design styling. |
| `test.mjs` | Unit tests for API call logic. |
| `wrangler.toml` | Cloudflare Worker deployment config. |

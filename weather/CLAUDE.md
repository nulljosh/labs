# Weather
v1.0.0

Forecast page, `weather.heyitsmejosh.com`. One static file, Open-Meteo (geocoding + forecast), no key, no backend, no build step.

## Structure
- `web/index.html`: landing + app, single file. `CODES` maps WMO codes to words. localStorage keys: `place`, `unit`.
- `web/devices.css`: landing device frame (shared fleet file).
- Cloudflare Worker, static assets only. Deploy: `npx wrangler deploy`.

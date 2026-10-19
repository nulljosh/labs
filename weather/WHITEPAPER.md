# Weather Technical Whitepaper

**v1.0.0** | September 2026

Every weather app buries the number you actually want under ads, hourly
gauges, and a forecast for a city you're not in. Weather exists to answer
one question fast: what's it like outside, right now, here. Type a city or
share your location, read the forecast.
Live at [weather.heyitsmejosh.com](https://weather.heyitsmejosh.com).

## The mechanic

Two requests to Open-Meteo, straight from the browser. The first turns a
city name into coordinates. The second takes those coordinates and returns
current conditions plus a seven-day daily forecast, in the local timezone.
Open-Meteo needs no API key, so there is no server in between: no backend to
run, no key to leak, no reason for the page to ever go down except
Open-Meteo itself going down.

WMO weather codes come back as integers. A small table maps them to plain
words. Temperatures arrive in Celsius and are converted on render if the
visitor picked Fahrenheit.

The last place and the unit are kept in localStorage, so a return visit
loads without asking, because the whole point is speed and a repeat visitor
shouldn't re-type a city they already gave once. First visit with nothing
stored asks for geolocation.

## Design

One column. The current temperature is the biggest thing on the page,
because it's the one number a visitor came for. Dark by default, light on
`prefers-color-scheme: light`. No icons, no imagery; an icon takes longer to
read than the word it's standing in for.

## Security / Privacy

No backend, no accounts, no analytics. Coordinates go to Open-Meteo and
nowhere else. Nothing is stored beyond the browser's own localStorage.

## License

MIT 2026, Joshua Trommel

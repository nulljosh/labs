<img src="src/icon.svg" width="80">

# BC Garage Doors

![version](https://img.shields.io/badge/version-v5.1.0-blue)
![license](https://img.shields.io/badge/license-MIT-green) [![GitHub](https://img.shields.io/badge/GitHub-nulljosh%2Fbcgd-black?logo=github)](https://github.com/nulljosh/labs/tree/main/bcgd)

A website and a stock dashboard for Best Choice Garage Doors (bcgaragedoors.ca). One brings customers in. The other tells the shop what's on the shelf.

<img src="progress.svg" width="460">

## Screenshots

<p>
<img src="screenshots/bcgd-1.jpg" alt="Doorstock">
</p>

## Projects

| Directory | Description | URL |
|-----------|-------------|-----|
| `web/` | Conversion landing page | [bcgd.jaybulb.com](https://bcgd.jaybulb.com) |
| `dashboard/` | Inventory and stock tracker | [bcgd-dashboard.jaybulb.com](https://bcgd-dashboard.jaybulb.com) |
| `ios/`, `macos/` | Doorstock, the stock and jobs app | [doorstock.jaybulb.com](https://doorstock.jaybulb.com) |
| `../prototypes/garage-cam/` | Garage Cam, a shelf camera prototype | open `index.html` on a phone |

## Doorstock features

- Torsion springs by wire size, inside diameter, length and wind, plus cables, rollers, openers and panels, each with a cost
- Snap a label: the camera reads a box and opens that part, or fills in a new one
- Marking a job complete takes its parts off the shelf
- Low-stock alerts and a one-tap reorder email
- A monthly CSV for the accountant: parts used on finished jobs, with cost
- Shared stock and jobs for the whole crew

## License

MIT 2026, Joshua Trommel

## Whitepaper

[Technical whitepaper](WHITEPAPER.md)

## Architecture

<img src="architecture.svg" width="600">

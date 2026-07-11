<img src="icon.svg" width="80" style="border-radius:18px">

# Quotable

![version](https://img.shields.io/badge/version-1.5.0-blue) ![license](https://img.shields.io/badge/license-MIT-green) [![GitHub](https://img.shields.io/badge/GitHub-nulljosh%2Fquotable-black?logo=github)](https://github.com/nulljosh/quotable)

Guess the movie or artist from a quote. Multiple choice, plus a 10-second speed round with a score multiplier for fast answers. 193 entries (143 movie quotes + 50 song lyrics) across 10 genres.

Credits to dad for the idea.

## Run

```
python3 -m http.server
```

Open `http://localhost:8000`.

## Structure

- `index.html` / `style.css` / `game.js` — game
- `quotes.json` — quote bank (`type: movie|music`, `genre`, `quote`, `answer`, `options`)
- `ios/` — basic SwiftUI wrapper (WKWebView)
- `macos/` — basic SwiftUI wrapper (WKWebView, AppKit)

## Roadmap

- **App Store**: `ios/` and `macos/` are unsigned scaffolds — no icons, no signing, no App Store Connect record yet. Steps: generate app icons (1024×1024 + sizes), register bundle IDs + create ASC app records (`asc` CLI), set up signing certs/provisioning profiles, build + archive + upload (`asc-xcode-build`/`asc-signing-setup` skills automate most of this), write metadata/screenshots, submit for review. Nothing here is uniquely manual — the whole pipeline is automatable via the `asc` CLI skills already installed.
- **Music sources**: current 50 lyric entries are hand-seeded. Could pull real metadata (song/artist pairs) from the free, keyless iTunes Search API (`itunes.apple.com/search`) to grow the bank without manually authoring more trivia.
- **Quote bank growth**: same hand-seeding approach could scale movie quotes further via a free quotes API (e.g. movie-quote datasets on GitHub) if a larger bank is wanted.

## License

MIT 2026, Joshua Trommel

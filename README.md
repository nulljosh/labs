<img src="icon.svg" width="80">

# Quotable

![version](https://img.shields.io/badge/version-1.1.1-blue)

Guess the movie from its quote. Multiple choice, plus a 10-second speed round with a score multiplier for fast answers.

Credits to dad for the idea.

## Run

```
python3 -m http.server
```

Open `http://localhost:8000`.

## Structure

- `index.html` / `style.css` / `game.js` — game
- `quotes.json` — quote bank
- `ios/` — basic SwiftUI wrapper (WKWebView)
- `macos/` — basic SwiftUI wrapper (WKWebView, AppKit)

## License

MIT 2026, Joshua Trommel

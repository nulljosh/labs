<img src="icon.svg" width="80">

# Nimble

![version](https://img.shields.io/badge/version-v1.3.0-blue)

Native macOS instant-answer search. Smart query classification. Math offline. Factual questions prioritize instant answers.

Inspired by the original [Nimble](https://github.com/Maybulb/Nimble) (Electron + Wolfram|Alpha, deprecated 2020).

## Features

- **Smart classification**: math/factual/definition intent detection
- **Instant answers**: DDG API → Wikipedia (prioritized for questions)
- **Offline math**: Arithmetic, trig, sqrt, log, powers, pi
- **8 themes** (orange, red, yellow, green, blue, purple, pink, contrast)
- **No API keys** required, 26 tests passing
- Copy results, search links

> MenuBarExtra disabled (macOS Tahoe beta bug). Re-enabled when SDK stabilizes.

## Development

```bash
xcodegen generate && open Nimble.xcodeproj
```

Requires Xcode + xcodegen.

## License

MIT 2026 Joshua Trommel

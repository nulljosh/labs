# Conway Technical Whitepaper

**v1.0.0** | September 2026

Game of Life on a bounded grid always ends the same way: gliders and other
travelling patterns hit a wall and die, which is a dull way to watch a
cellular automaton run. Conway is Conway's Game of Life on a toroidal grid,
so nothing dies at an edge, for web, iOS and macOS. No accounts, no network,
no storage, because the whole thing is a grid of booleans and a step
function; there is nothing here worth an account. Live at
[toroid.heyitsmejosh.com](https://toroid.heyitsmejosh.com).

## Engine

The rules are implemented twice, once in JavaScript (`life.js`) and once in
Swift (`ios/Conway/Life.swift`), because there is no shared runtime between a
browser and SwiftUI and the rules are small enough that a shared native
library would be more overhead than the duplication it avoids. Both are pure
functions: `step(grid) -> grid`.

The grid wraps at the edges (a torus), so gliders never die at a wall, which
is the entire reason this exists instead of a plain bounded board.
`step()` resolves the wrap once per row and once per column instead of doing
two modulo operations on each of the eight neighbour reads, because the wrap
math is the one place a naive implementation wastes real cycles. That is the
only optimisation; the board is small enough that anything more is noise.

Both ports are held to the same four test cases (`life.test.js` and
`ios/Checks/main.swift`): block still life, blinker period 2, glider
translation, and edge wrap, because two independent hand-written
implementations of the same rules are exactly where a silent, one-line
mistake in one of them would otherwise go unnoticed. If a port drifts, one of
them fails.

## Surfaces

| Surface | Where |
|---|---|
| Web landing + live board | `index.html` |
| Web player | `play.html` |
| iOS | `ios/`, xcodegen, SwiftUI |
| macOS | `macos/`, same Swift sources |

The landing page runs the real engine behind the hero as an attract mode,
because a moving grid of gliders sells the idea faster than a screenshot
could. The player is fully manual: step, run, clear, random, and draw with
the pointer.

## Build

```sh
node life.test.js
swiftc ios/Conway/Life.swift ios/Checks/main.swift -o /tmp/c && /tmp/c
(cd ios && xcodegen generate && xcodebuild -scheme Conway -destination 'generic/platform=iOS Simulator' build)
(cd macos && xcodegen generate && xcodebuild -scheme Conway build)
```

## License

MIT 2026, Joshua Trommel

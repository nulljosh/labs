# Product Hunt, Toroid

## Name (<=40 chars)
Toroid

## Tagline (<=60 chars)
Conway's Game of Life on a grid that never dies at an edge

## Description (<=260 chars)
Toroid is Conway's Game of Life on a wrapping board, so gliders never hit a wall. Draw a pattern, press play, watch four rules do the rest. Web, iOS, iPad, Mac, and a standalone watchOS app. No accounts, no network, no ads.

## Topics (3)
- Games
- Simulation
- Productivity

## First comment (maker story)
Game of Life on a bounded grid always ends the same way. A glider walks toward the edge, hits the wall, and dies. That is a strange way to watch a cellular automaton run, since the whole appeal is watching patterns move forever.

Toroid fixes the one thing that bugged me about every Game of Life I had used: the edges. The board wraps top to bottom and left to right, like the surface of a torus. A glider that walks off the right side comes back in on the left. Nothing dies at a wall.

The rules are four sentences. A living cell with two or three living neighbours survives. Fewer and it dies of loneliness, more and it dies of crowding. An empty square with exactly three living neighbours comes alive. Every cell updates at once, no score, no goal, no opponent, only what your starting pattern turns into.

I built the engine twice, once in JavaScript and once in Swift, because there is no shared runtime between a browser and SwiftUI. Both are held to the same four test cases, so if one port drifts, a test catches it.

Drop in a glider, a pulsar, or Gosper's glider gun, which fires a new glider every thirty generations forever. Or fill the board at random and see what survives.

Toroid is $0.99 on iPhone, iPad and Mac, free on the web.

## Pricing line (exact wording)
$0.99 on iPhone, iPad and Mac, free on the web.

## Links
- Web: https://toroid.jaybulb.com
- App Store: https://apps.apple.com/app/id6806324937
- GitHub: https://github.com/nulljosh/labs/tree/main/toroid

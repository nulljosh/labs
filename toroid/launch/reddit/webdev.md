Note: no fixed karma gate, but frame as "I built X to solve Y", not an ad.

## Title
Built Conway's Game of Life as a static site, no framework, no backend, no build step

## Body

Wanted a version of Game of Life where gliders don't die when they hit the edge of the board, so I wrote one where the grid wraps like the surface of a torus instead of stopping at a wall.

It's plain HTML, CSS, and one JavaScript file for the engine, no framework, no build step, no server. The landing page runs the real engine behind the hero as an attract mode, which sells the idea faster than a static screenshot would. The player itself is a separate page: draw with the pointer, step through generations one at a time, or run it at up to sixty generations a second.

No accounts, no network calls, no analytics. `node life.test.js` runs the four test cases that pin down the rules (still life, blinker, glider, and the edge wrap itself).

https://toroid.jaybulb.com

Curious if anyone's found a cleaner way to handle the wrap math than resolving it once per row and once per column.

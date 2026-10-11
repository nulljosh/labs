Note: no karma/flair gate, self-promo tolerated. Tell the build story, no bare link.

## Title
I built Conway's Game of Life on a board that wraps instead of walling gliders in

## Body

I kept running into the same annoyance with every Game of Life implementation: a glider walks to the edge of the board and just dies. That's a weird way to watch a cellular automaton, since the whole point is watching a pattern move forever.

So I built Toroid. The board wraps top to bottom and left to right, like the surface of a torus, so nothing dies at an edge. A glider that leaves the right side comes back in on the left.

It's four rules, drawn with your finger or dropped in from six known patterns, including Gosper's glider gun, which fires a new glider every thirty generations forever. The engine is written twice, once in JavaScript for the web version and once in Swift for iOS and Mac, and both are held to the same four test cases so a drifting port fails a test instead of shipping quietly wrong.

No accounts, no network, no analytics. Free to try on the web, $0.99 upfront on iOS if you want it on your phone.

Web: https://toroid.jaybulb.com

Would love feedback, especially on the wrap math or anything that feels off in the simulation.

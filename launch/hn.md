## Title (<=80 chars)
Show HN: Toroid – Conway's Game of Life on a grid that wraps, not walls

## Body

Every Game of Life I had used ends the same way: a glider walks to the edge of the board and dies. Toroid wraps the board into a torus instead, so a glider that leaves the right side comes back on the left and nothing ever dies at a wall. The rules are the standard four, drawn with a finger or dropped in as one of six known patterns, including Gosper's glider gun. The engine is written twice, once in JavaScript for the web and once in Swift for iOS and Mac, held to the same four test cases so a drifting port fails a test instead of shipping quietly wrong. No accounts, no network, no analytics. Live at https://toroid.jaybulb.com, $0.99 on the App Store, free on the web. Would love feedback on the engine or the wrap math.

# Quotestreak Technical Whitepaper

**v22.0.0** | October 2026

Here's the line. Name where it came from. Quotestreak is a guessing game for lines from movies, TV, games, songs and books. It runs as a static site on Cloudflare Pages and as a native SwiftUI app on iPhone, iPad, Mac and Apple Watch. Two small Workers sit behind it: one relays live duels, one holds accounts and scores.

## The guess

`quotes.json` holds 1,624 lines in 15 genres. 272 were written by hand. The rest were harvested: film, TV and game lines from Wikiquote, kept only when the title's Wikipedia article is well read, and book openings read straight off Project Gutenberg's most downloaded novels. Each harvested line keeps its character and its source link.

A round shows a line and four choices, or a text box when typing is on. Typed answers forgive case, punctuation and small typos. Hints cost points. The speed round puts ten seconds on the clock and pays more for faster answers. Difficulty is measured, not guessed: every answer is counted per quote in D1, and once a line has ten plays its real hit rate sorts it into easy, medium or hard.

The Daily Quote walks a fixed shuffle of the bank, one line per UTC day, so everyone gets the same one.

## Playing with people

A challenge link encodes ten quote ids and a score in the URL. The friend plays the same ten.

Live duels run through `quotestreak-duel`, a Worker with one Durable Object per four-letter room. The room relays messages between two players and does no scoring; the pages do that. Hibernation keeps idle rooms free. Spectators join the same room read-only and get a full snapshot of both players after every move.

The weekly cup seeds a bracket from that week's ten quotes. Friends, clubs and leaderboards live in jaybulb-api, the shared Worker on D1 at api.jaybulb.com. A friend code is the first eight hex digits of a user id; adding one links both people.

## On the device

High score, badges and stats never leave the browser or the phone. Fifty badges are computed from a small bag of counters. Stats keep hit rates by genre and decade and the last fifty scores. A share card is drawn on a canvas with the Quip pose that fits the game.

## Accounts

Email and password, Sign in with Apple, and Google, on every platform, all against jaybulb-api. No Supabase. Deleting an account removes scores, friend links and club membership.

## Native

`Game.swift` is the game loop with no SwiftUI imports, so it runs headless under `ios/Checks/main.swift`. macOS builds from the same four sources. The Watch reads the iPhone's last game from an App Group.

## Security and privacy

No analytics. Scores and accounts are the only things stored on a server. Duel rooms hold no history once both players leave.

## License

MIT 2026, Joshua Trommel

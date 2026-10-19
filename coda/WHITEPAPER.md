# Coda Technical Whitepaper

**v100.0.0** | October 2026

Here's the line. Name where it came from. Coda is a guessing game for lines from films, TV, games, songs and books. It is a static site on Cloudflare Pages and a native SwiftUI app on iPhone, iPad, Mac, Apple Watch, Apple TV and Vision Pro. Two small Workers sit behind it: one runs live rooms, one holds accounts and scores. This is the second edition, written at v99.

## The bank

`quotes.json` holds 1,697 lines in 16 genres. 272 were typed in by hand at the start; the rest were harvested from Wikiquote, Wikipedia and Wikidata, and book openings from Project Gutenberg. Since v71 every line without a source was checked against its title's Wikiquote page: a line counts when 80 percent of its five-word runs appear there. That check caught ten bad lines, among them a soup ad filed under Twins, and they were replaced. 1,472 lines now carry the page they were checked against, shown on the reveal. Directors, actors, ratings, albums and seasons come from Wikidata, matched on title and year. New films, sports calls, speeches and stand-up live in their own files, so adding them never reshuffles the Daily. Since v100 a second bank, `quotes-more.json`, adds 12,737 more lines, 14,434 in all: every film, show and game page on Wikiquote from 1930 on, up to a few lines each, with the same filters (no slurs, no stage directions, no line that names its own title). It loads after the first round. The Daily, the cup, the show and the archive keep drawing from the core bank alone.

## The guess

A line, four choices, or a text box. More than a dozen ways to guess turn the same bank into new questions: who said it, which album, finish the line, the real line behind a misquote, a timeline, a blurred poster. Hints halve the points. The speed round pays for speed. Difficulty is measured: every answer is tallied per line, and after ten plays the real hit rate sorts it.

## Shared clocks, no server state

The Daily Quote walks a fixed shuffle of the bank, one line per UTC day, the same in every browser, in the widget and in the API. The weekly new-release pack works the same way: a seed from the date picks the lines, and each browser works out the live question from the time, corrected by the server's clock. Nothing drives it. Live duels and party games relay through Durable Objects that keep nothing once the room empties.

## Fair scores

A game takes a signed token when it starts and hands in its run when it ends: each line, each pick, each point. The server refuses a forged or reused token, a pace faster than the game can go, points the board can't award, and in classic rounds any point for a wrong answer. Only then does a score reach the board, and the ten best ever stay in the hall of fame for good.

## On the device

High score, badges, stats, profiles and offline packs stay in the browser or on the phone. A transfer link carries them to another device inside the link itself and merges without losing anything: counts keep the larger, lists join. The apps keep the best score in iCloud.

## Everywhere

Twenty languages, right to left included, translated from one English string table. Axe finds nothing on any screen, light or dark; keyboard play, 320-pixel reflow and reduced motion are tested every release. The bank's open parts are published at `/data/` (CC BY-SA for Wikiquote lines, CC0 for facts), the daily and the bank are on `/api` and `/mcp`, and `/embed` puts the Daily Quote on any site.

## Security and privacy

Every static page sends a script policy and the usual hardening headers. Cloudflare Web Analytics counts page views without cookies; there is no other tracking and no ads. An account holds an email, a name, scores, friends and a club, and deleting it removes them. The daily email is opt in, confirmed by a button, and one tap to leave. See `docs/AUDIT.md` and `docs/ACCESSIBILITY.md`.

## License

MIT 2026, Joshua Trommel

<img src="icon.svg" width="80" height="80" alt="Quotestreak icon">

![version](https://img.shields.io/badge/version-53.0.0-blue) ![license](https://img.shields.io/badge/license-MIT-green)

Here's the line. Name the movie.

Or the show, the game, the song or the book. 1,624 lines across 15 genres, from the 1930s to now, with a clock if you want one and a friend to beat if you have one. Dad's idea.

**[quotestreak.jaybulb.com →](https://quotestreak.jaybulb.com)** · **[Play →](https://quotestreak.jaybulb.com/play)**

<p>
<img src="screenshots/web/02-menu.jpg" width="49%">
<img src="screenshots/web/03-question.jpg" width="49%">
</p>

## Features

**Guess.** Four choices or type it in. Hints if you turn them on. Filter by genre, decade and difficulty, where difficulty comes from what real players get right. Other ways to guess: who said it, which actor, which director, finish the line, misquotes, said or written (was it improvised?), timeline, poster and album reveal, name the year, and a marathon through every genre on three lives.

**Hands free.** Turn them on in Settings: Quip reads every line aloud, and you say the answer instead of tapping it.

**The story.** After any answer, tap The story for the title's Wikipedia summary and where the line is quoted.

**Speed round.** Ten seconds a line. Faster answers pay more.

**Daily Quote.** One line a day, the same for everyone, with a day streak.

**Play with people.** Send a friend your ten quotes as a challenge link, duel live, watch someone else's duel, enter the weekly cup, join a club, add friends and see a friends-only leaderboard.

**Keep score.** Fifty badges drawn around Quip, the mascot. Stats by genre and decade with a graph of your last fifty games. A share card for every game. A ranked season every quarter, with a Quip medal for each tier you reach, and a Champions bracket for the top eight that anyone can watch.

**Siri.** "Give me a quote from Quotestreak" reads today's line; "Start a speed round in Quotestreak" opens straight into one.

**Handoff.** Start a game on your iPhone and pick it up on your Mac at the same question.

**Make a pack.** Write your own lines, family sayings or inside jokes, and share them as a link. The whole pack lives in the link; nothing is stored. Send a pack to the library and, once it's reviewed, anyone can play it.

**Stream mode.** Add /stream to your Twitch stream as a browser source and chat votes on every line.

**Pass and play.** Up to eight people on one phone, taking turns.

**Party.** Put it on a big screen, the Apple TV or any browser at /party, and everyone plays on their own phone: type the code, tap your answer, the screen keeps score. Phones need no app, just the browser. Quiz night makes it four themed rounds with the standings between them. Classroom packs (Shakespeare, famous speeches, first lines of novels) turn it into a lesson, with every student's results ready to paste into a gradebook.

**Everywhere.** Web, iPhone, iPad, Mac, Apple TV, Apple Watch and Vision Pro, where the poster wall surrounds you. The next app update adds a Daily Quote widget for the home screen, lock screen and Mac desktop, the Daily Quote on the watch, and live duels on the phone with both scores on the lock screen, and a round of five you can play right inside iMessage. One account on every platform: email, Apple or Google.

<img src="progress.svg" width="460">

## Run

```
sh scripts/build-site.sh && npx wrangler pages dev dist
```

Tests: `for t in *.test.js; do node $t; done`

## Docs

[Architecture](docs/ARCHITECTURE.md) · [API and agent tools](docs/API.md) · [Whitepaper](WHITEPAPER.md) · [Roadmap](roadmap.md)

<img src="architecture.svg" width="600">

## License

MIT 2026, Joshua Trommel

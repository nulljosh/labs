# Coda open data

The parts of the quote bank we are allowed to pass on, rebuilt from `quotes.json` on every deploy by `scripts/build-data.mjs`.

- `https://coda.jaybulb.com/data/index.json` says what is there and how many.
- `/data/lines.json` has 1,572 lines with their title, type, year, character and source page. Lines from Wikiquote are CC BY-SA 4.0: credit the page in `source` and share alike. First lines of books come from Project Gutenberg and are public domain.
- `/data/titles.json` has one row per film, show, game, song and book: year, genre, director, actors, rating, seasons and albums, with how many lines each has. These are facts, mostly from Wikidata, and are CC0.

Left out on purpose: song lyrics and the few film lines with no published source. The game plays them; they are not ours to license. Poster and album art stay out too, since TMDB and Apple set their own terms.

The files allow cross-origin reads. For a live view of the same bank, with the daily quote, use the API in `docs/API.md`.

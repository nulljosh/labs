# Coda API

Three surfaces: WebMCP tools that play the game in the visitor's browser, a read-only HTTP and MCP API over the quote bank, and the duel socket. Accounts and scores go through jaybulb-api (`POST https://api.jaybulb.com/rpc/quotestreak_*`), documented there.

## WebMCP

`webmcp.js` registers tools via `window.modelContext` so an agent visiting
the page can read game state and play, using the same functions the UI
calls (`game.js`) — no logic is duplicated.

### Read-only

| tool | what it does |
|------|---------------|
| `get_high_score` | Returns the player's all-time high score from `localStorage`. |
| `get_game_state` | Returns whether a game is in progress, mode, score, streak, selected genre, and the current question (quote, type, options) if any. |

### Reversible writes

| tool | what it does |
|------|---------------|
| `start_game` | Starts a new game for a given genre and mode (`normal` or `timed`). Resets score/streak. |
| `answer_question` | Answers the current question with one of its option strings. |
| `next_question` | Skips to the next question. |

No tool requires `requiresConfirmation` — nothing here loses user data.
Worst case for any tool is a restarted or skipped game, which the player
(or agent) can always start again from the mode-select screen.

## HTTP API (Cloudflare Pages Functions)

These read the quote set instead of playing, so an agent can use it without loading the page.

Both surfaces call the same `callTool()` in `src/lib/tools.js`; REST and MCP cannot describe
different behaviour. `quotes.json` is imported into the bundle.

### REST (read-only, `GET`)

| Endpoint | Returns |
|---|---|
| `/api` | The endpoint list and tool names. |
| `/api/genres` | Genres and media types, with counts. |
| `/api/random?genre=&type=` | One random quote, its options and the answer. |
| `/api/search?q=&limit=&genre=&type=` | Quotes matching a query, with a `total`. |
| `/api/daily?reveal=` | Today's Daily Quote (the game's own walk, `daily.js`), with `day` and `next_in_seconds`. The answer, character and source only with `reveal=true`. Cached until midnight UTC at most. |
| `/api/quotes?offset=&limit=&genre=&type=` | The whole bank in a fixed order, up to 200 per page, with `total`. |

`/api/random` is `no-store`; everything else is cached for an hour. An unknown genre or type
is a 400 naming the valid values, not a silent empty result.

### MCP

`POST /mcp`, JSON-RPC, stateless. Tools: `list_genres`, `random_quote`, `daily_quote`, `list_quotes`, `search_quotes`.

Every quote carries `character` and `source` (the page it was checked against) where the bank has them.

The answer ships with the question on purpose: `quotes.json` is public on the site anyway,
and withholding it would only stop an agent from checking its own guess.

## Duel socket

`wss://coda.jaybulb.com/duel/ws?room=ABCD` joins a duel as a player (two at most, a third gets 409). Every message is relayed to the other player: `start {qids}`, `answer {score, i, name}`, `done {score}`. The room sends `joined {host}`, `opponent` and `left`.

Add `&watch=1` to spectate. Spectators can't send. They get `state {qids, players: [{host, name, score, i, done}]}` on join and after every move.

## Party socket

`wss://coda.jaybulb.com/duel/party?room=ABCD&role=host` is the big screen (one per room); `&name=Sam` instead is a phone (eight at most). Phones send `buzz {option}`; the screen gets `players`, `join {id, name}`, `buzz {id, option, at}` and `leave {id}`. Whatever the screen sends goes to every phone, or to one with `to: id`: the TV sends `question {n, total, options}`, `reveal {answer, scores}` and `over {scores}`. Phones get `hello {id, screen}` on joining and `screen-left` if the screen goes.

## Embed

Put today's Daily Quote on any page:

```html
<iframe src="https://coda.jaybulb.com/embed" width="360" height="420" style="border:0" title="Coda Daily Quote"></iframe>
```

It is rendered by `functions/embed.js` from the game's own daily walk, so it matches `/play` and `/api/daily`. A pick shows right or wrong in place; the link opens the full game. Add `?theme=dark` or `?theme=light` to fix the scheme; otherwise it follows the visitor's. It follows their language too.

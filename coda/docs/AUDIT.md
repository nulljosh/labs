# Coda security and privacy audit (v93, 2026-10-19)

A pass over the web game, its Pages Functions and the jaybulb-api routes it uses. What was checked, what changed, what is left.

## Web game
Every `innerHTML` sink was read. Player and third-party text (board names, club names, pack titles, duel and party names, Wikipedia summaries, suggested lines) is escaped before it reaches markup. Three spots put a server error message into markup; they now set it as text. Links built from data are either our own or checked server-side to start with `https://` (suggested sources). Nothing uses `eval` or builds script from data.

Every static page now sends `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy` that allows only the microphone (for answering by voice) and a `Content-Security-Policy` that loads scripts only from the site and from Google and Apple sign-in, with no plugins, no `<base>` changes and no framing by other sites. `/embed` and `/c` are Functions and set their own; `/embed` may be framed anywhere on purpose. A headless pass over every page on the live domain found no policy violations once the edge-injected analytics beacon was allowed.

## Server (jaybulb-api)
Scores: checked runs only since v87; direct writes to the board are closed. The anonymous answer tally, which feeds difficulty, took any id with no limit: it now takes only lines that are in the bank and at most 120 a minute per address. Sign-in routes, the newsletter signup and the tally are rate limited per address. Owner-only calls (review queues, featuring, moderation) check the owner id on the server. Packs and suggested lines cap how many one player can have waiting. Names, club names and pack titles pass a word filter. Newsletter links are signed and confirming needs a button press, so nobody can be signed up by a link scanner.

## Privacy
The privacy page now covers profiles and offline packs (on the device), the transfer link (never sent to us), score runs (sent to check the score, only the score is kept), sent-in packs and lines, the daily email (address and confirmation only, one-tap unsubscribe), iCloud for the best score in the apps, and that the apps load art too. The old page said there were no analytics, but Cloudflare injects its Web Analytics beacon at the edge (no tag in the source, so it hid from grep). The page now says so: it counts page views without cookies. The policy allows that one beacon.

## Left open
Duel and party room codes are four letters, so a stranger can guess one and watch; they can't play or change anything. The newsletter has no list-wide send cap beyond 90 a day. An outside audit is v98.

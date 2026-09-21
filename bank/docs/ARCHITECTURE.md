# Architecture

Prototype banking sandbox. A Next.js app with an in-memory ledger, a brokerage trading stub against Alpaca's paper API, and a UI showing account balance, transaction history, and a trade form. No real money is involved.

## How it runs

On page load, `app/page.js` fetches `/api/accounts` to load the current account balance and transaction list. Users enter a stock symbol, quantity, and buy/sell side, then submit the trade form. This posts to `/api/trade`, which calls the broker's order endpoint, updates the ledger, and returns the order status. A full reload fetches the updated balance and activity list.

| File | What it owns |
|---|---|
| `app/page.js` | React client: balance display, transaction table, trade form (symbol, qty, side inputs). Fetches account data and posts trades via the API routes. |
| `app/layout.js` | HTML document wrapper. |
| `app/api/accounts/route.js` | GET /api/accounts returns the current account state (balance in cents, currency code, transaction list). |
| `app/api/trade/route.js` | POST /api/trade accepts an order (symbol, qty, side), calls the broker to place it, posts a ledger entry at a fixed $100/share placeholder price, and returns the filled order. |
| `lib/ledger.js` | In-memory account store (planned for Supabase). `getAccount` retrieves an account by ID; `post` adds a transaction and updates the balance. |
| `lib/broker.js` | Alpaca paper API wrapper. `placeOrder` places a market order if ALPACA_KEY is set; without keys, returns a simulated fill for offline development. |
| `test/ledger.test.js` | Unit tests for ledger `post` function (balance updates, insufficient funds, non-integer amounts). |

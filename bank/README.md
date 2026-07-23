# bank

Neobank prototype (Wealthsimple-style): accounts + stock trading, sandbox-only.

## Stack
- Next.js API routes (deploy: Vercel)
- Ledger: in-memory mock now → Supabase later (shared spark DB)
- Trading: Alpaca Broker API **paper/sandbox** (`ALPACA_KEY` / `ALPACA_SECRET`)
- No real money. Ever, until a BaaS partner contract exists.

## Roadmap
1. [x] Scaffold: mock ledger + Alpaca paper trading stub
2. [ ] Alpaca sandbox keys → real paper trades
3. [ ] Supabase auth + persistent ledger
4. [ ] iOS app (SwiftUI, same API)
5. [ ] KYC stub (Persona sandbox)
6. — everything past here needs FINTRAC MSB + BaaS partner (Peoples Group / DC Bank), not code

## Run
```
npm i && npm run dev
curl localhost:3000/api/accounts
curl -X POST localhost:3000/api/trade -d '{"symbol":"AAPL","qty":1,"side":"buy"}'
```

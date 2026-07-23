# Bank Technical Whitepaper

**v0.1.0 prototype** | July 2026

Bank is a Wealthsimple-style neobank prototype: accounts, a ledger, and stock
trading — sandbox only. No real money moves, ever, until a BaaS partner
contract exists.

This paper leads with the ledger and trading design. Everything else is
supporting detail.

## Ledger

The ledger is the source of truth for balances. Current implementation is an
in-memory mock behind Next.js API routes (`/api/accounts`); the planned
persistence layer is Supabase (shared spark project) with the same double-entry
shape: every transfer writes a debit and a credit, balances are derived, never
stored as a mutable number.

## Trading

Trading routes through the Alpaca Broker API in **paper/sandbox mode only**
(`ALPACA_KEY` / `ALPACA_SECRET`). `POST /api/trade` with
`{symbol, qty, side}` places a paper order; fills post back to the ledger.
Removing the keys disables all order placement.

## Regulatory Boundary

Everything past the sandbox is deliberately out of scope as code:

- Real deposits/custody require a Canadian BaaS partner (Peoples Group or
  DC Bank) and FINTRAC MSB registration.
- KYC is planned as a Persona sandbox stub only.
- The prototype exists to validate product and API shape, not to hold funds.

## Stack

| Layer | Tech | Status |
|-------|------|--------|
| API | Next.js API routes on Vercel | Scaffolded |
| Ledger | In-memory mock → Supabase | Mock |
| Trading | Alpaca Broker API (paper) | Stub, keys pending |
| Auth | Supabase email+password | Planned |
| iOS | SwiftUI, same API | Planned |

## License

MIT 2026, Joshua Trommel

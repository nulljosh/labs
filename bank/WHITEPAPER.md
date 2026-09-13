# Bank Technical Whitepaper

**v0.1.0 prototype** | August 2026

A bank, as a prototype. Real banking and brokerage products are slow and
expensive to test ideas against, so this exists to validate the product
shape and API design before any real money, any partner, or any regulator is
involved. Accounts, a ledger, stock trading. Sandbox only.

No real money moves. None, ever, until a BaaS partner signs a contract,
because moving real money means real licensing, and that's a business
decision, not a code change. This paper is about the ledger and the trading
design. The rest is detail.

## Ledger

The ledger is the source of truth for balances. Current implementation is an
in-memory mock behind Next.js API routes (`/api/accounts`); the planned
persistence layer is Supabase (shared spark project) with the same double-entry
shape: every transfer writes a debit and a credit, balances are derived, never
stored as a mutable number, because a balance that's just a stored integer can
drift from reality on the first bug, while a derived balance can't disagree
with its own history.

## Trading

Trading routes through the Alpaca Broker API in **paper/sandbox mode only**
(`ALPACA_KEY` / `ALPACA_SECRET`), chosen over building an order-matching
engine from scratch since the interesting question here is the product shape,
not whether this prototype can out-engineer a real exchange. `POST /api/trade`
with `{symbol, qty, side}` places a paper order; fills post back to the
ledger. Removing the keys disables all order placement, so the sandbox
boundary is enforced by the absence of a key, not a runtime check that could
be missed.

## Regulatory Boundary

Everything past the sandbox is deliberately out of scope as code:

- Real deposits/custody require a Canadian BaaS partner (Peoples Group or
  DC Bank) and FINTRAC MSB registration, licensing work that has nothing to
  do with whether the product idea is any good.
- KYC is planned as a Persona sandbox stub only, since real identity
  verification is meaningless without a real regulated account behind it.
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

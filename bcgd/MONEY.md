# Doorstock Money

How Doorstock makes money. The company plan is `REVENUE.md` in the Code root; the ledger is `GTM.md`.

## Price and rail

Free on the App Store (ASC 6791106082). Nothing is charged there. The client pays for the work directly, not through a store. The customer site at bcgd.jaybulb.com is free to visit.

## What is actually sold

Nothing in the store. Doorstock is a stock dashboard built for Best Choice Garage Doors. What gets paid for is the work: the customer site and the dashboard, built for one client. The risk is concentration. The money depends on that client, not on store sales.

## Who pays and why

The client pays Joshua for the site and the dashboard, because the business needs both. The App Store copy is only how the dashboard reaches a phone. Nobody else is asked to pay for it.

## Cost to serve

No paid API in the app code. Sign-in uses Supabase (supabase-swift in the iOS and macOS `Account.swift`). That bill sits with the Supabase plan, and nothing in this repo sets a cap on it.

## Where we are

- Repo notes (undated): iOS 1.0 was rejected under the 4.3(a) wave, and appeals were filed. Do not resubmit into that wave.
- Repo notes (undated): macOS 1.0 is live.
- Revenue: no verified number (the App Store Connect key cannot read sales yet).

## Role in the company plan

Client work. GTM.md lists it that way, and it sits outside the ladder in REVENUE.md. The client pays Joshua, not the App Store, so no stage depends on it. It does not count toward the stages.

## Next

Nothing on the store side. Leave the price free and let the client work carry the money. Do not resubmit iOS 1.0 into the 4.3(a) wave.

## Million, billion, trillion

**A million.** Doorstock is the free dashboard a garage-door business runs from its phone, and its money comes from the builds, not the store.

**A billion.** Doorstock is the default dashboard for garage-door companies, with each build paid for once and never by subscription.

**A trillion.** Doorstock is the first app in a stack that runs every home-service trade, and the stack is the company.

## Change it

`asc pricing schedule create --app 6791106082 --price 0.99 --base-territory USA --start-date YYYY-MM-DD` if the store price ever changes. Only with Joshua's yes in chat.

Anyone who got Doorstock while it was free keeps it free.

*ASC 6791106082. Verified 2026-11-02.*

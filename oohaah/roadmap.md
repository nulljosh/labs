# oohaah roadmap

> Priority tier 5 (2026-10-17): exploratory, this year. Order: live blockers, ship pushes, active features, portfolio, exploratory. See ~/Documents/Code/LOOP-HANDOFF.md.

- [ ] TURN: `/ice` still serves STUN only. Creating the key requires a Cloudflare
      API token with Calls Write, then `TURN_KEY_ID` and `TURN_KEY_API_TOKEN`
      Worker secrets. Current Wrangler OAuth and DNS token lack that permission.
- [ ] Accounts, so a kept handle survives the tab closing.
- [ ] Interest/region matching, needs the lobby sharded past one DO.
- [ ] iOS/macOS wrappers, per the cross-platform rule.

# Fleet map run, 2026-10-02

**Result:** one SVG, `~/Documents/Code/fleet.svg`, that shows every live project grouped by kind, with lines for what they share (backends, hosting, payments, and the projects that feed each other).

## Jobs

1. **inventory** (lane): every folder under ~/Documents/Code, sorted into a group or marked skip (worktrees, helpers, checkouts, dead repos). Platforms per project from real dirs (ios/, macos/, kmp/, wrangler.toml).
2. **shared** (lane): which projects use which shared thing, from grep evidence in the repo: spark Supabase, Cloudflare Workers/Pages, Upstash KV, Stripe, Workers AI, authmail, brain, Plank. Plus project-to-project edges (Plank -> Joshua Tree, Samantha <-> Joshua Tree).
3. **skeptic** (separate Haiku agent): spot-checks inventory.md and shared.md against the repos. Wrong group, missing project, edge with no evidence.
4. **merge**: render fleet.svg from what survived.
5. **gate**: Joshua sees fleet.svg before it's committed or linked anywhere.

State passed along: inventory.md -> shared.md -> review.md -> result.md + fleet.svg.

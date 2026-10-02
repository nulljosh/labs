# Fleet map, result

`fleet.svg`: 69 projects in five groups, four shared services.

- Supabase spark carries 13 projects, the single biggest shared dependency. If spark goes down, 10 of the 38 apps lose sign-in, plus authmail and both garage-door sites.
- Workers AI powers 9, Stripe 5, Resend 5. Everything hosts on Cloudflare.
- 23 projects are on the App Store (dot on the chip).
- 43 of 69 share nothing at all: no shared backend, no link to another project. Most are one-file sites on Cloudflare.
- Real project links: joshuatree and paintbar use Samantha (turing), turing uses brain, brain reads notes, homebrew-plank ships plank, joshuatree-monitor watches joshuatree.
- Plank is not wired into Joshua Tree or Samantha yet, despite the plan.

Spec: `fleet.json`. Rerun: `python3 ~/.claude/skills/architecture-svg/fleet.py < fleet.json`.

**Gate:** nothing committed or linked until Joshua says yes. Proposed home: `~/Documents/Code/fleet.svg`, linked from `~/Documents/Code/CLAUDE.md` under the progress chart.

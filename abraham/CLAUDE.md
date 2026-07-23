# Abraham

Two jobs for Abraham under one contract: an SEO/Google Business Profile retainer, and
a cold email bot (`src/`). Merged into one repo/doc so there's a single source of
truth. Public for now (scaffolding only, Apache-2.0 licensed) — revisit visibility
with Abraham once real client data enters the picture.

## Chain
The client (Abraham's own customer, runs a platform for this kind of business) → hires Abraham (friend) → Abraham subcontracts SEO execution to the user.

## Deal
- $500 one-time website build + $500/mo retainer per Google Business Profile client, initially low vs market ($750–1500/mo for same scope).
- the client has ~10 more GBPs ready at $500/mo each if this one performs, potentially 20-30 profiles across the country. Stated ceiling: $10-20K/mo if it works.
- Scope (the client's own words): website build/expansion, new service + location pages, GBP optimization, backlink building, content publishing, rank monitoring, technical SEO, monthly report. Open-ended ("no fixed number of pages/backlinks — focus on results").
- the client's goal metric: leads/day (currently ~1/day, wants 10/day within a year).

## Files here
- `contract.pdf` — agreement with Abraham: cold-email-bot job + SEO/GBP retainer, plus a one-page pricing-context appendix. Local-only, not pushed.
- `plan.pdf` — combined iMessage negotiation screenshots + the SEO cost comparison chart. Local-only, not pushed.
- `OPERATING_GUIDE.local.md` — the client's full detailed SEO operating rules (approval boundaries, prohibited practices, KPI order, incident SLAs). Local-only, not pushed — treated as confidential like the client operating manual it builds on. This is the doc to follow when doing the actual work.
- `transcripts.pdf` — bullet-point summaries of 3 reference YouTube videos on running SEO with Claude, each with a "how to try this on the client" plan. See condensed takeaways below.
- `index.html` — public landing page for this repo (GitHub Pages), summarizing scope/pricing/status for Abraham.
- `src/` — cold email bot scaffolding (`leads.py`, `writer.py`, `sender.py`, `main.py`). Reads a lead CSV, drafts a personalized email per lead with Claude, sends via SMTP. Stubs only — not wired to Abraham's real lead format/email account yet.
- `requirements.txt`, `.env.example` — deps and config template for the email bot.

## Job 2 — Cold email bot
- $45/hr, estimate 4-8 hours ($180-360), not a hard cap. Includes setting Abraham up with Claude Pro and showing him the basics.
- Inputs needed before starting: lead list format, email sending account/credentials, brand/voice notes.
- Payment-triggered delivery (X paid → Y delivered, not one lump handoff):

| Paid | Delivered |
|---|---|
| Signed contract + deposit (~2 hrs, $90) | Lead CSV format confirmed, `leads.py` finalized to match his actual columns, Claude Pro set up |
| +2 hrs ($90) | `writer.py` drafting real emails from his brand/voice notes, reviewed manually |
| +2 hrs ($90) | `sender.py` wired to his sending account, end-to-end test send |
| +2 hrs ($90) | Full run against his real lead list, handoff + walkthrough, one month of support included |

Total lands inside the $180-360 estimate unless he asks for extras (CRM, dashboard,
scheduling) — those get scoped and quoted separately in writing.

## Status
Not working yet — waiting on Abraham to pay the first invoice per the contract. Once paid: pick up the email bot first (fast, few hours), then start the SEO retainer following `OPERATING_GUIDE.local.md`.

When starting: baseline audit of the site/GBP first, then ask the client the open questions below, set up the change/content/outreach logs the guide requires, then run the monthly checklist on autopilot.

## Open questions to confirm with the client
- Who is the company approver for day-to-day requests, and expected turnaround time?
- Actual monthly content/outreach budget vs. the stated minimums?
- Dev team SLA for tickets by severity?
- What the client's platform data (lead outcomes, conversation themes) will actually be shared?
- After-hours point of contact for critical incidents?

## Video takeaways (full detail in transcripts.pdf)
- **Claude Fable 5 video** — proof Claude can run a long, multi-step job unattended if given a clear goal + told to verify its own work. Not SEO-specific.
- **Fully Automated SEO with Claude Code** — build one Claude "skill" that crawls a site, finds competitor gaps, builds a content plan, and drafts articles; optionally auto-publish via an API integration. Second skill repurposes blog posts into scheduled social content.
- **This NEW Claude AI SEO Workflow** — 4-step loop: keyword research → topic clusters (pillar + supporting articles) → EAT-optimized content (human-edited) → local pages + iterate using Search Console data on anything stuck on page 2.
- **Claude Code + Clay lead gen** (youtube.com/watch?v=zyvdl__Ywfk) — directly applicable to Job 2. Claude Code as orchestrator, Clay (B2B data platform, has its own dataset + negotiated access to other providers, runs a waterfall across them for verified emails/phones) as data source via Clay's Claude Code MCP plugin. Flow: plain-English goal prompt ("50 leads that look like X") → Claude Code calls Clay MCP to source + enrich leads → Claude Code writes personalized subject/body per lead using context files (business profile, case studies, FAQs, offer, website copy — must be preloaded or copy is generic) → output CSV (leads + enrichment + copy) → import into Clay to buy/warm domains and launch the campaign. ~$12 in Clay credits got 50 fully enriched HVAC leads with custom copy in the demo. Reduces `leads.py`/`sender.py` scope: Clay's MCP plugin could replace the manual sourcing + SMTP send steps, leaving `writer.py`'s personalization job to Claude Code driven straight off Clay's output — worth evaluating instead of building sourcing/sending from scratch once Abraham pays and lead-list/brand inputs are in hand.

## Notes
- Tool stack for delivering this at scale: Claude (skills for SEO-content-autopilot and social-repurposing), Apollo AI (lead gen), hosting.
- Folder convention: keep this folder to PDFs/local-only docs for anything sensitive — public repo only gets README/CLAUDE.md/index.html/transcripts.pdf.

## Resolved: HTTPS cert (2026-07-15)
`abraham.heyitsmejosh.com` HTTPS was stuck on GitHub Pages' fallback `*.github.io` wildcard cert. Root cause: the Cloudflare CNAME record was only created 2026-07-15T04:47Z, so GH's cert issuance hadn't retried yet. Fix: unset the Pages custom domain then re-set it via `gh api -X PUT repos/nulljosh/abraham/pages`, forcing a fresh Let's Encrypt request. Cert approved (expires 2026-10-13), HTTPS now enforced via `gh api -X PUT repos/nulljosh/abraham/pages -F 'https_enforced=true'`. Verified live — site serves `HTTP/2 200` over https.

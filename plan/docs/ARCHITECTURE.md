# Architecture

Personal ten-year plan. Read the roadmap, see the timeline, understand where things are heading. Static landing and plan pages, no backend, no login.

## How it runs

`index.html` is the landing page (explainer and link to the plan). `/docs/index.html` is the plan itself (timeline, milestones, goals). Both are static HTML with inline CSS. No API, no framework, no build step.

| File | What it owns |
|---|---|
| `index.html` | Landing page. Describes the plan, links to plan.heyitsmejosh.com/docs. |
| `docs/` | Contains `index.html` (the plan page itself: timeline, goals, roadmap). Film photos in `docs/film/` are backdrops. |
| `wrangler.toml` | Cloudflare Worker deployment config. |

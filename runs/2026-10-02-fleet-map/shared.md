# shared (lane 2)

Source: regex scan of each project's source (js/ts/swift/kt/py/toml/json/html/sh/c/h/pk/yml, skipping node_modules, build, models), plus wrangler.toml and .asc/ presence. First matching file is the evidence.

Cloudflare hosts nearly everything (CLAUDE.md: Pages and Workers everywhere), so it is a footer note, not lines.

## Spark Supabase (auth + data)
epiphany (server/api/supabase.js), lexly (app/index.html), litigate (macos/project.yml), healstack (package-lock.json), sparkjar (wrangler.toml), bookrank (profile.html), quotestreak (auth.js), homeward (supabase/functions), costanza (watchos/ContentView.swift), roost (package-lock.json), authmail (src/index.js), bbgd (src/index.html), bcgd (src/web/index.html)
Dropped as noise: tripwire (watches.json lists Supabase as a watched API), dotfiles (tooling).

## Stripe
epiphany, talli, lexly, healstack, sparkjar

## Workers AI
sparkjar, bookrank, curbfind, nimble, dream, tripwire, joshuatree, turing, brain

## KV / Upstash
epiphany, talli, healstack, bookrank, siftbox, hormuz, tripwire, joshuatree, turing, secretary, logans-frenchies

## Resend (mail)
epiphany, sparkjar, homeward, authmail, joshuatree

## App Store (.asc/ present)
epiphany, talli, notate, lexly, litigate, healstack, sparkjar, curvely, blockframe, bookrank, wordroot, quotestreak, inkpress, sidewise, siftbox, windgate, plain, madobe, toroid, curbfind, nimble, nyc, bcgd

## Project to project
- joshuatree -> Samantha (joshuatree/worker.js)
- paintbar -> Samantha (paintbar/PaintBar.swift)
- plank -> Samantha (plank/apps/agent.pk)
- turing -> brain (turing/app/ask.py)
- brain -> notes (notes/index.html links brain; brain indexes notes)
- homebrew-plank -> plank (formula)
- joshuatree-monitor -> joshuatree (reads its roadmap.md)
- plank -> joshuatree: claimed in memory ("scripting language for Joshua Tree"), NOT found by the scan. Needs a check.
Dropped as noise: lexly/bookrank "plank" (the word in a course JSON), journal/portfolio mentions (links, not dependencies).

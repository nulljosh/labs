# Review: inventory & shared scan

CUT: plank -> joshuatree because no grep results in *.c, *.h, *.md, *.sh; CLAUDE.md memory note only

CUT: plank -> Samantha because plank/apps/agent.pk is example code only, comments say "This is the shape of a Samantha or Joshua Tree script", not actual integration

CUT: siftbox -> Supabase because it only appears in KNOWN_SERVICES URL pattern match (worker.js), not in real auth or data calls

MOVE: homeroom and logans-frenchies to Sites and infra together because CLAUDE.md lists them jointly in that section, not split across Apps and Games

COUNT: Sites and infra says (8) but lists only 7 items: nulljosh.github.io, journal, authmail, notes, dotfiles, plan, launch

## Rulings (merge step)
- Took: cut plank -> joshuatree and plank -> Samantha. agent.pk is an example script, not wiring. Memory's "scripting language for Joshua Tree" is a plan, not a fact yet.
- No-op: siftbox -> Supabase was never claimed.
- Rejected: move homeroom to Sites. It is a Mac and iPhone app; CLAUDE.md's table placement is a filing accident. logans-frenchies stays with client work.
- Took: count fix, Sites and infra is 7.
- Checked myself (skeptic skipped it): roost (src/lib/supabase.js) and healstack (ios/Services/AuthService.swift, src/hooks/useProfile.js) really call Supabase. Kept.

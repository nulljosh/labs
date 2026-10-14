# Noema loop handoff (2026-10-14, morning)

## What the loop is

A finite foreground research cycle. State one exact question, calculate within a fixed bound, check independently, preserve failures, and separate observations from proof. No background automation, paid models or automatic Git pushes.

## Where things stand

Public site: https://noema.jaybulb.com. Brand kit: /brand.html. Fourteen tests pass. SAT checked 18,069 formulas; Goldbach and Collatz total stopping cover 10,000. First descent checks starts two through one million with two implementations, maximum 287 ordinary steps at 626,331. Modulo 8 and 16 reports preserve the v1 baseline. Elementary written proofs cover even starts, 4k+1 above one, and 16k+3. These are known facts reproduced, not a universal termination theorem. No Lean proof exists yet.

## Next, in order

Read docs/RESEARCH.md and the three elementary arguments. Run the tests, SAT benchmark and descent study. Split only remainders 7, 11 and 15 modulo 32 at the existing bound. Derive forced affine prefixes before calculation. Preserve variable branches and exceptions. Verify one exact small lemma in Lean without assuming Collatz. Update the whitepaper and public findings from measured evidence; publish explicitly through Sites.

## Restart prompt

```text
Continue Noema's finite foreground research loop. Read CLAUDE.md,
WHITEPAPER.md, docs/RESEARCH.md, benchmarks/README.md and roadmap.md.
Run python3 -m unittest discover -s tests -v, python3 mathlab.py benchmark,
and python3 descent.py. Derive the forced ordinary-step affine prefixes
for remainders 7, 11 and 15 modulo 16 when split modulo 32. Keep the
study bound at one million. Predeclare controls and rejection rules.
Check independently, preserve failures, and verify one small lemma in
Lean without a Collatz assumption if the toolchain is available.
Update the roadmap, whitepaper and public evidence with actual results.
No paid models, background jobs, record claims or universal conclusions
from finite checks. Stop when this bounded cycle is complete.
```

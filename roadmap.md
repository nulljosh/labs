# Research queue

- [x] Inspect Evidna and adapt its finite evidence loop.
- [x] Exhaustively check small SAT formulas and save stalled examples.
- [x] Run Goldbach, Collatz and twin-prime studies at three increasing bounds.
- [x] Write a source-backed whitepaper and research ladder.
- [x] Measure first descent through 1,000,000 and cross-check every start with an accelerated implementation.
- [ ] Check tiny pigeonhole formulas and DPLL node counts.
- [ ] Measure prime gaps on disjoint intervals with checked endpoints.
- [ ] Formalize one small proved lemma before larger proof proposals.
- [ ] Review a specific complexity technique against its computation model and barriers.

Raise one study's scope at a time. Riemann remains literature-only until prerequisites and a rigorous verification method are specified.

## Living literature queue

Last reviewed: October 14, 2026. Update this file after each completed study or source review, not with background automation.

- [ ] Read Barina's 2025 verification methods and reproduce one tiny congruence-class example.
- [ ] Review the 2025 paradoxical-Collatz preprint, pin its map convention and select one reproducible statement.
- [ ] Read the 2025 missing-string/algebrization preprint after the basic complexity barriers.
- [ ] Recheck primary sources for later progress before promoting any literature lead.

Recent papers are leads, not assumed solutions. Keep a precise source and status with every added item.

## Next after the first-descent run

- [x] Split first-descent measurements by residue classes modulo 8 and 16. Declare the grouping before running, preserve odd/even distinctions, and look for a statement that can be proved rather than merely checked farther.
- [x] Prove the easy class n = 4k+1 for k >= 1: three ordinary steps give 3k+1, which is below 4k+1. Compare with exact first-descent measurements, then consider a small Lean formalization.

Current evidence: starts 2 through 1,000,000 all descended within 1,000 ordinary steps. The maximum was 287 steps at 626,331. No universal claim follows.

## Cycle 2 completed

Modulo 8 and 16 summaries preserve all earlier aggregate results. Elementary first-descent proofs cover even starts, 4k+1 for k >= 1, and 16k+3 for k >= 0. Remaining remainders modulo 16: 7, 11 and 15. This is known algebra reproduced in the notebook, not a new Collatz result.

- [ ] Split the remaining three groups modulo 32 at the existing bound. Derive affine prefixes before calculation and preserve variable branches and exceptions.
- [ ] Formalize the exact three-step or six-step lemma in Lean, with no unproved Collatz assumption.

Do not infer termination for an initial class merely because its first descent is proved: its smaller endpoint may belong to an uncovered class.

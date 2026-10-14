# Noema Technical Whitepaper

**v0.1.0** | October 2026

Noema is a mathematics lab built around precise questions, bounded computations and honest records. It borrows Evidna's finite foreground evidence loop. The first studies cover SAT, Goldbach, Collatz and twin primes.

## The core mechanic

State the finite domain before running a test.
Use a direct reference calculation or independent algorithm to check results.
Retain the domain and engine fingerprints, counts and representative cases.
Compare against a fixed regression baseline before updating accepted findings.
A larger finite bound extends coverage. It does not prove an infinite conjecture.

## SAT study

Enumerate one through three labelled variables and up to four distinct clauses.
Clauses are nonempty, have distinct variables and exclude tautologies.
There are 3^n - 1 possible clauses; select subsets in canonical order.
The empty formula is included. A truth table decides each case.
Plain unit propagation either decides a formula or reports that it stalled.
Every reported SAT assignment is checked against the original formula.
The four possible two-variable clauses together rule out all four assignments.
They have no unit clause, so propagation stalls despite unsatisfiability.
This is a known limitation of a restricted solver, not a new lower bound.

## Number theory

Check bounds 100, 1,000 and 10,000 in order.
Find a prime pair for each even number from four through each bound.
Trial division independently checks sieve membership and selected witnesses.
Follow each positive Collatz start through at most 1,000 ordinary steps.
A cap hit means unresolved, never divergence.
Count twin-prime pairs with both endpoints in each interval.
Overlapping stages cannot be added as independent evidence.

## Proof obligations

[Cook's official statement](https://www.claymath.org/wp-content/uploads/2022/06/pvsnp.pdf) defines P, NP and NP-completeness.
A polynomial-time algorithm for all SAT inputs would establish P = NP.
A lower bound for one solver does not establish P != NP.
[Algebrization](https://www.scottaaronson.com/papers/alg.pdf) describes barriers to broad classes of techniques.
[Natural proofs](https://www.sciencedirect.com/science/article/pii/S002200009791494X) gives a conditional barrier for certain general circuit lower-bound arguments.
Future proof proposals must specify their model, quantifiers and relevant barrier assumptions.

## Limits

No open conjecture has been solved. These studies reproduce small known results.
Baselines detect changed behavior; they are not external mathematical certification.
No AI calls, daemon, autonomous publishing or formal proof assistant runs.
The viewer contains bounded interactive examples and Python-generated reports.
Sources and the next experiment are in docs/RESEARCH.md.

<!-- research-loop:start -->
## Latest measured run

Updated 2026-10-14T16:49:01.323181+00:00.
Checked 18,069 formulas. Soundness errors: 0.
Unit propagation stalled on 9,824 satisfiable and 10 unsatisfiable formulas.
This finite result measures one restricted algorithm, not P versus NP.
<!-- research-loop:end -->

MIT License · Copyright 2026 Joshua Trommel.

## Living research record

The roadmap advances from known controls to bounded number theory, structured SAT and proof obligations. New sources enter a dated literature queue before an experiment is selected. The current watchlist includes Barina's 2025 Collatz verification methods and two 2025 preprints on stopping-time behavior and algebrization. See docs/RESEARCH.md for sources, publication status and unreproduced claims.

The Noema identity uses a single-color N within a circle and an exact clrs.cc base palette. The public brand kit contains constrained SVG variants, CSS and JSON tokens, typography and accessibility rules. Browser examples remain separate from Python-generated research records.

## First-descent calculation, October 14, 2026

The ordinary Collatz map counts an odd 3n+1 step separately from the following halving. For every start from two through the stated bound, the study finds the first value strictly below that start. One is excluded because it has no smaller positive target. Each start is cross-checked with a separate implementation that combines odd steps with their next halving, then restores the ordinary-step count.

| Upper bound | Starts checked | Unresolved at 1,000 steps | First start with longest descent | Steps | First lower value |
| --- | ---: | ---: | ---: | ---: | ---: |
| 10,000 | 9,999 | 0 | 703 | 132 | 628 |
| 100,000 | 99,999 | 0 | 35,655 | 220 | 29,405 |
| 1,000,000 | 999,999 | 0 | 626,331 | 287 | 597,017 |

No implementation disagreements occurred. The three stages overlap and must not be summed. The longest first descent is distinct from total stopping time to one. This finite reproduction does not prove every integer eventually descends. The complete report is landing/descent.json; run python3 descent.py to reproduce it. The study is software-checked, not proof-assistant-certified or a verification record.

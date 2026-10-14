# Research ladder

Start with easy experiments, not promises of easy open problems. This order describes the prerequisites and cost of our next study, not a ranking of mathematical difficulty. Number theory does not form a chain of implications leading to P versus NP.

| Stage | Question | Evidence and next gate |
| --- | --- | --- |
| 0 | Do reference calculations reproduce known answers? | SAT controls, known primes, Collatz 27 and powers of two. Tests before larger runs. |
| 1 | Is unit propagation complete on the small SAT corpus? | No. Replay the saved four-clause unsatisfiable example. |
| 2 | Does strong Goldbach hold through 10,000? | Bounded reproduction completed. Prime-pair witnesses independently checked. |
| 3 | Do Collatz starts through 10,000 reach one within 1,000 steps? | Yes. Next: first descent below the starting value. |
| 4 | How do twin counts and consecutive-prime gaps grow? | Finite pair counts complete. Next: gap records on disjoint intervals. |
| 5 | How does branching behave on structured SAT families? | Next SAT experiment: tiny pigeonhole formulas and a truth-table-checked DPLL implementation. |
| 6 | What would settle P versus NP or Riemann? | Literature and exact proof obligations only. No asymptotic conclusions from timing curves. |

## Initial results

SAT: 18,069 syntactic formulas, zero incorrect decisions or invalid SAT witnesses. Propagation stalled on 9,824 satisfiable and 10 unsatisfiable cases. Labelled variables and clause sets are counted, not distinct Boolean functions or random SAT inputs.

Goldbach: all 4,999 even integers from four through 10,000 had witnesses. The largest minimum prime addend was 173, first attained at 7,426 = 173 + 7,253. This is far below published verification work.

Collatz: all 10,000 starts reached one. Start 6,171 had the longest total stopping time, 261 ordinary steps. Its trajectory peaked at 975,400; this is not a claim about the largest peak of all starts. There were 205 twin-prime pairs with both endpoints at most 10,000.

## A small proved statement

For every nonnegative integer k, the Collatz orbit of 2^k reaches one after exactly k steps. Each positive power of two is even, so halving decreases its exponent by one. The first exponent zero occurs after k steps. This elementary established argument is a proof. Testing twenty powers only checks the implementation.

The four two-variable SAT clauses rule out all assignments and have no unit clause. Allowing unused variables extends this example to any larger variable count. This proves plain unit propagation is incomplete on arbitrary CNF; it says nothing about all SAT algorithms.

## Next predeclared experiment

For Collatz starts two through 10,000, find the first ordinary step below the start, capped at 1,000 steps. Independently replay the record cases. Report cap hits as unresolved. A finite maximum is a dataset statistic, not a universal bound. Proving eventual descent for every integer greater than one would yield termination by strong induction. Our finite checks do not supply that quantifier.

## Primary sources, consulted October 14, 2026

[Cook's official statement](https://www.claymath.org/wp-content/uploads/2022/06/pvsnp.pdf) gives the formal framework. [Clay](https://www.claymath.org/millennium/p-vs-np/) lists P versus NP as unsolved.

[Oliveira e Silva, Herzog and Pardi](https://sweet.ua.pt/tos/bib/4.12.html) reports even-Goldbach verification through 4 x 10^18. Strong Goldbach concerns two prime summands for each even number greater than two; it differs from the proved three-prime weak theorem.

[Tao, 2019](https://arxiv.org/abs/1909.03562) proves an almost-all result for Collatz orbits, not termination for every positive integer.

[Maynard, On the Twin Prime Conjecture](https://arxiv.org/abs/1910.14674) discusses prime-gap progress. A finite pair count cannot prove infinitely many pairs.

[Clay's Riemann description](https://www.claymath.org/millennium/riemann-hypothesis/) concerns nontrivial zeta zeros. No zeta-zero experiment has been performed here.

[Aaronson and Wigderson](https://www.scottaaronson.com/papers/alg.pdf) describes relativization, due to Baker, Gill and Solovay, and develops algebrization. [Razborov and Rudich](https://www.sciencedirect.com/science/article/pii/S002200009791494X) gives a natural-proofs barrier under a hardness assumption. These barriers do not prove P != NP.

## Recent work watchlist

Reviewed October 14, 2026. [Barina's 2025 peer-reviewed verification paper](https://link.springer.com/article/10.1007/s11227-025-07337-0) and [author's project](https://pcbarina.fit.vut.cz/) report a verification milestone below 2^71. This is finite computation, not a Collatz proof; Noema is not attempting to beat it. Read its sieve and congruence-class methods before considering larger verification runs.

[Paradoxical behavior in Collatz sequences, 2025 preprint](https://arxiv.org/abs/2502.00948) concerns stopping-time behavior and trajectories exceeding their starting value. Review the paper's exact iteration convention before comparing counts: some Collatz maps combine an odd step with a halving, while Noema counts those separately. This is a literature lead, not an endorsed proof or a reproduced result.

[New Algebrization Barriers to Circuit Lower Bounds via Communication Complexity of Missing-String, 2025 preprint](https://arxiv.org/abs/2511.14038) is a later complexity-theory reading lead. Check its exact theorem statements and publication status before selecting an experiment. Noema has not verified its proofs.

At each research session, refresh sources before adding a new direction. Add the date, primary source, claim, publication status, prerequisites and smallest testable question. A new preprint does not automatically become a priority or an accepted theorem.

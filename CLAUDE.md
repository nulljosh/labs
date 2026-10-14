# Noema
Python 3.9+, standard library only. mathlab.py owns exhaustive small-SAT checks and reports. conjectures.py owns bounded Goldbach, Collatz and twin-prime studies. landing/ contains the public viewer.

Run python3 -m unittest discover -s tests -v, python3 mathlab.py benchmark, and python3 conjectures.py. Run python3 mathlab.py research --minutes 15 for a finite foreground cycle.

Read docs/RESEARCH.md before extending a study. State exact domains, controls and rejection rules first. Bounded observations are not universal proofs. Keep baseline failures visible; never automatically overwrite baselines. No background automation, paid model calls or automatic pushes. No subagents unless requested.

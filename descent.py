"""Bounded Collatz first descent, counted in ordinary (uncombined) steps."""
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import time

from mathlab import ROOT, atomic_write


def first_descent(start, cap=1000):
    if type(start) is not int or not 2 <= start <= 1000000:
        raise ValueError('Use an integer start from two through one million.')
    if type(cap) is not int or not 1 <= cap <= 1000:
        raise ValueError('Use an integer step cap from one through 1000.')
    n = start
    for steps in range(1, cap + 1):
        n = 3 * n + 1 if n % 2 else n // 2
        if n < start:
            return {'start': start, 'steps': steps, 'first_below': n, 'status': 'descended'}
    return {'start': start, 'steps': cap, 'first_below': None, 'status': 'unresolved_at_cap'}


def accelerated_check(start, cap):
    """Separate implementation combines odd steps with the following halving."""
    value, elapsed = start, 0
    while value >= start and elapsed < cap:
        if value & 1 and elapsed + 2 <= cap:
            # While value >= start, 3*value+1 cannot be the first lower term.
            value = (3 * value + 1) >> 1
            elapsed += 2
        elif value & 1:
            value = 3 * value + 1
            elapsed += 1
        else:
            value >>= 1
            elapsed += 1
    return elapsed, value if value < start else None


def study(limit):
    if type(limit) is not int or not 2 <= limit <= 1000000:
        raise ValueError('Use an integer study bound from two through one million.')
    digest, histogram, records, unresolved = hashlib.sha256(), Counter(), [], []
    for start in range(2, limit + 1):
        result = first_descent(start)
        expected = accelerated_check(start, 1000)
        if (result['steps'], result['first_below']) != expected:
            raise RuntimeError(f'Independent descent calculation disagrees at start {start}.')
        digest.update((json.dumps(result, sort_keys=True, separators=(',', ':')) + '\n').encode())
        if result['status'] == 'descended':
            histogram[result['steps']] += 1
            if not records or result['steps'] > records[-1]['steps']:
                records.append(result)
        else:
            unresolved.append(start)
    return {'limit': limit, 'starts_checked': limit - 1, 'cap': 1000,
            'unresolved': unresolved, 'record_highs': records,
            'step_histogram': {str(k): v for k, v in sorted(histogram.items())},
            'independent_disagreements': 0, 'evidence_sha256': digest.hexdigest()}


def run():
    started = time.monotonic()
    report = {'suite': 'first-descent-v1', 'status': 'complete',
              'updated_at': datetime.now(timezone.utc).isoformat(),
              'engine_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'stages': [study(n) for n in (10000, 100000, 1000000)],
              'limits': 'Finite ordinary-step first descent. Start 1 is excluded. '
                        'Stages overlap. No universal termination claim.'}
    report['seconds'] = time.monotonic() - started
    encoded = json.dumps(report, indent=2) + '\n'
    atomic_write(ROOT / 'benchmarks/first-descent-latest.json', encoded)
    atomic_write(ROOT / 'landing/descent.json', encoded)
    return report


if __name__ == '__main__':
    report = run()
    print(json.dumps({'suite': report['suite'], 'seconds': report['seconds'],
                      'stages': [{'limit': s['limit'], 'checked': s['starts_checked'],
                                  'unresolved': len(s['unresolved']),
                                  'longest': s['record_highs'][-1]}
                                 for s in report['stages']]}, indent=2))

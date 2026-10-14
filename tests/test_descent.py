import unittest
from descent import first_descent, accelerated_check, study


class DescentTests(unittest.TestCase):
    def test_known_cases(self):
        self.assertEqual(first_descent(3), {'start': 3, 'steps': 6, 'first_below': 2, 'status': 'descended'})
        self.assertEqual(first_descent(27)['steps'], 96)
        self.assertEqual(first_descent(626331)['steps'], 287)
        self.assertEqual(first_descent(626331)['first_below'], 597017)
        self.assertEqual(first_descent(3, 5)['status'], 'unresolved_at_cap')
        self.assertEqual(first_descent(3, 6)['first_below'], 2)
        self.assertEqual(first_descent(2, 1)['first_below'], 1)
        for start in range(2, 1000, 2):
            self.assertEqual(first_descent(start)['steps'], 1)

    def test_acceleration_at_odd_caps(self):
        for start in (2, 3, 7, 27, 97, 6171):
            for cap in (1, 2, 5, 6, 95, 96, 1000):
                result = first_descent(start, cap)
                self.assertEqual((result['steps'], result['first_below']), accelerated_check(start, cap))

    def test_boundaries_and_coverage(self):
        for invalid in (0, 1, -1, 1.5, True, 1000001):
            with self.assertRaises(ValueError):
                first_descent(invalid)
        for invalid in (0, 1001, 1.5, True):
            with self.assertRaises(ValueError):
                first_descent(3, invalid)
        result = study(10000)
        self.assertEqual(result['starts_checked'], 9999)
        self.assertEqual(sum(result['step_histogram'].values()), 9999)
        self.assertEqual(result['unresolved'], [])
        self.assertEqual(result['independent_disagreements'], 0)

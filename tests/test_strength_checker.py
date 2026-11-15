"""
Unit tests for Password Strength Checker module.
"""

import unittest

from blueprints.strength_checker.analyzer import analyze_password


class TestStrengthChecker(unittest.TestCase):

    def test_empty_password(self):
        res = analyze_password("")
        self.assertEqual(res["score"], 0)
        self.assertEqual(res["length"], 0)
        self.assertEqual(res["entropy"], 0.0)

    def test_weak_password_pattern(self):
        res = analyze_password("password1234")
        self.assertLess(res["score"], 3)
        self.assertTrue(any("predictable" in f.lower() for f in res["findings"]))

    def test_repeated_characters_penalty(self):
        res = analyze_password("aaaaabbbbcccc")
        self.assertTrue(any("repeating" in f.lower() for f in res["findings"]))

    def test_strong_password(self):
        res = analyze_password("K8#vL9$mP2!qR5*w")
        self.assertGreaterEqual(res["score"], 4)
        self.assertGreater(res["entropy"], 65)
        self.assertEqual(res["composition"]["uppercase"], 4)
        self.assertEqual(res["composition"]["lowercase"], 4)
        self.assertEqual(res["composition"]["digits"], 4)
        self.assertEqual(res["composition"]["symbols"], 4)

    def test_composition_counts(self):
        res = analyze_password("ABCabc123!@#")
        comp = res["composition"]
        self.assertEqual(comp["uppercase"], 3)
        self.assertEqual(comp["lowercase"], 3)
        self.assertEqual(comp["digits"], 3)
        self.assertEqual(comp["symbols"], 3)


if __name__ == "__main__":
    unittest.main()

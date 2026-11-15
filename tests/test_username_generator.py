"""
Unit tests for the username generator module.
"""

import unittest

from username_generator import (
    generate_multiple_usernames,
    generate_username,
)


class TestUsernameGenerator(unittest.TestCase):

    def test_default_username(self):
        result = generate_username()
        self.assertIn("username", result)
        self.assertGreater(len(result["username"]), 0)
        self.assertEqual(result["style"], "classic")
        self.assertTrue(result["has_number"])

    def test_styles(self):
        for style in ["classic", "tech", "gamer", "minimal"]:
            result = generate_username(style=style)
            self.assertIn("username", result)
            self.assertEqual(result["style"], style)

    def test_casing_lower(self):
        result = generate_username(casing="lower", include_number=False)
        self.assertEqual(result["username"], result["username"].lower())

    def test_casing_upper(self):
        result = generate_username(casing="upper", include_number=False)
        self.assertEqual(result["username"], result["username"].upper())

    def test_separators(self):
        for sep in ["_", "-", "."]:
            result = generate_username(separator=sep, include_number=True)
            self.assertIn(sep, result["username"])

    def test_without_number(self):
        result = generate_username(include_number=False)
        # Should not end with a digit
        self.assertFalse(result["username"][-1].isdigit())

    def test_max_length_constraint(self):
        for max_len in [8, 12, 15]:
            result = generate_username(max_length=max_len)
            self.assertLessEqual(len(result["username"]), max_len)

    def test_multiple_usernames(self):
        count = 6
        results = generate_multiple_usernames(count=count, style="gamer")
        self.assertEqual(len(results), count)
        unique_names = {u["username"] for u in results}
        self.assertEqual(len(unique_names), count)


if __name__ == "__main__":
    unittest.main()

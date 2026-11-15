"""
Unit tests for the password generator module.
"""

import string
import unittest

from generator import (
    AMBIGUOUS_CHARS,
    DEFAULT_SYMBOL_CHARS,
    DIGIT_CHARS,
    LOWERCASE_CHARS,
    UPPERCASE_CHARS,
    calculate_entropy,
    generate_multiple_passwords,
    generate_password,
    get_strength_rating,
)


class TestPasswordGenerator(unittest.TestCase):

    def test_default_password_generation(self):
        result = generate_password()
        self.assertIn("password", result)
        self.assertEqual(len(result["password"]), 16)
        self.assertEqual(result["length"], 16)
        self.assertGreater(result["entropy"], 0)
        self.assertIn("label", result["strength"])

    def test_custom_lengths(self):
        for length in [6, 12, 24, 64, 128]:
            result = generate_password(length=length)
            self.assertEqual(len(result["password"]), length)

    def test_length_boundary_validation(self):
        with self.assertRaises(ValueError):
            generate_password(length=3)
        with self.assertRaises(ValueError):
            generate_password(length=129)

    def test_character_set_guarantees(self):
        # When all sets are requested, verify they are represented in generated passwords
        for _ in range(10):
            res = generate_password(
                length=16,
                include_uppercase=True,
                include_lowercase=True,
                include_digits=True,
                include_symbols=True,
            )
            pwd = res["password"]
            self.assertTrue(any(c in UPPERCASE_CHARS for c in pwd))
            self.assertTrue(any(c in LOWERCASE_CHARS for c in pwd))
            self.assertTrue(any(c in DIGIT_CHARS for c in pwd))
            self.assertTrue(any(c in DEFAULT_SYMBOL_CHARS for c in pwd))

    def test_digits_only(self):
        result = generate_password(
            length=10,
            include_uppercase=False,
            include_lowercase=False,
            include_digits=True,
            include_symbols=False,
        )
        self.assertTrue(result["password"].isdigit())

    def test_exclude_ambiguous(self):
        for _ in range(20):
            result = generate_password(
                length=30,
                include_uppercase=True,
                include_lowercase=True,
                include_digits=True,
                include_symbols=True,
                exclude_ambiguous=True,
            )
            for char in result["password"]:
                self.assertNotIn(char, AMBIGUOUS_CHARS)

    def test_empty_set_raises_error(self):
        with self.assertRaises(ValueError):
            generate_password(
                include_uppercase=False,
                include_lowercase=False,
                include_digits=False,
                include_symbols=False,
            )

    def test_entropy_and_strength(self):
        # 16 chars with 94 pool size: 16 * log2(94) ~ 104.8 bits
        entropy = calculate_entropy(16, 94)
        self.assertAlmostEqual(entropy, 104.87, places=1)
        rating = get_strength_rating(entropy)
        self.assertEqual(rating["label"], "Very Strong")

        # Weak entropy
        rating_weak = get_strength_rating(25.0)
        self.assertEqual(rating_weak["label"], "Very Weak")

    def test_multiple_passwords(self):
        count = 5
        passwords = generate_multiple_passwords(count=count, length=14)
        self.assertEqual(len(passwords), count)
        # Verify passwords in batch are distinct
        unique_pwds = {p["password"] for p in passwords}
        self.assertEqual(len(unique_pwds), count)


if __name__ == "__main__":
    unittest.main()

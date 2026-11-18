"""
Tests for Sinhala Unicode to FM Abhaya Font Conversion in static/humanizer/unicodeToFm.js.
Verifies exact character mappings, pāpilla distinctions, anusvara/visarga, and zero raw Unicode remnants.
"""

import json
import os
import subprocess
import unittest


class TestSinhalaUnicodeToFmAbhaya(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.js_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "static", "humanizer", "unicodeToFm.js")
        )
        if not os.path.exists(cls.js_path):
            raise FileNotFoundError(f"unicodeToFm.js not found at {cls.js_path}")

    def _convert(self, text):
        script = f"""
        const {{ convertUnicodeToFmAbhaya }} = require({json.dumps(self.js_path)});
        process.stdout.write(convertUnicodeToFmAbhaya({json.dumps(text)}));
        """
        res = subprocess.run(
            ["node", "-e", script],
            capture_output=True,
            text=True,
            check=True,
            encoding="utf-8"
        )
        return res.stdout

    def test_required_words_conversion_and_no_raw_unicode(self):
        """
        Verifies exact FM Abhaya conversion for specified test words
        and confirms zero leftover Sinhala Unicode characters ([\\u0D80-\\u0DFF]).
        """
        expected_outputs = {
            "භූමිකාව": "NQñldj",
            "\u0DB7\u0DD4\u0DDFමිකාව": "NQñldj",  # Decomposed Dīrgha Pāpilla (\u0DD4\u0DDF)
            "භුමි": "Nqñ",
            "අංශ": "wxY",
            "අංක": "wxl",
            "හූණා": "yQKd",
            "කූඩුව": "l+vqj",
            "ගූඪ": ".+V",
            "තූර්ය": ";+¾h",
            "නූල": "kQ,",
            "ළූණු": "<QKq",
        }

        for word, expected in expected_outputs.items():
            with self.subTest(word=word):
                output = self._convert(word)
                self.assertEqual(output, expected, f"Failed mapping for '{word}': expected '{expected}', got '{output}'")
                # Ensure no raw Sinhala Unicode codepoints remain
                has_raw = any("\u0D80" <= ch <= "\u0DFF" for ch in output)
                self.assertFalse(has_raw, f"Leftover Sinhala Unicode characters in '{output}' for input '{word}'")

    def test_distinct_short_vs_long_papilla(self):
        """
        Verifies distinct outputs for short Pāpilla (ු) vs long Dīrgha Pāpilla (ූ)
        across critical consonant combinations.
        """
        pairs = [
            ("භු", "භූ"),
            ("හු", "හූ"),
            ("කු", "කූ"),
            ("ගු", "ගූ"),
            ("තු", "තූ"),
            ("නු", "නූ"),
            ("ළු", "ළූ"),
            ("රු", "රූ"),
            ("ශු", "ශූ"),
            ("ක්‍රු", "ක්‍රූ"),
        ]

        for short_w, long_w in pairs:
            with self.subTest(short=short_w, long=long_w):
                short_out = self._convert(short_w)
                long_out = self._convert(long_w)
                self.assertNotEqual(
                    short_out,
                    long_out,
                    f"Pāpilla outputs must be distinct for '{short_w}' vs '{long_w}'"
                )
                self.assertFalse(any("\u0D80" <= ch <= "\u0DFF" for ch in short_out))
                self.assertFalse(any("\u0D80" <= ch <= "\u0DFF" for ch in long_out))

    def test_independent_vowels_with_anusvara_and_visarga(self):
        """
        Verifies that standalone vowels followed by Anusvara (ං -> x) or Visarga (ඃ -> X)
        convert cleanly without leaving raw Unicode characters.
        """
        test_cases = [
            ("අං", "wx"),
            ("ආං", "wdx"),
            ("ඇං", "wex"),
            ("ඈං", "wEx"),
            ("ඉං", "bx"),
            ("ඊං", "Bx"),
            ("උං", "Wx"),
            ("ඌං", "W!x"),
            ("එං", "tx"),
            ("ඒං", "tax"),
            ("ඔං", "Tx"),
            ("ඕං", "´x"),
            ("අඃ", "wX"),
            ("ආඃ", "wdX"),
            ("දුඃඛය", "ÿXLh"),
        ]

        for inp, exp in test_cases:
            with self.subTest(inp=inp):
                out = self._convert(inp)
                self.assertEqual(out, exp)
                self.assertFalse(any("\u0D80" <= ch <= "\u0DFF" for ch in out))


if __name__ == "__main__":
    unittest.main()

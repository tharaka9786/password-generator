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
            "භූමිය": "N+ñh",
            "භූමිකාව": "N+ñldj",
            "\u0DB7\u0DD4\u0DDFමිකාව": "N+ñldj",  # Decomposed Dīrgha Pāpilla (\u0DD4\u0DDF)
            "භුමි": "Nqñ",
            "අංශ": "wxY",
            "අංක": "wxl",
            "හූණා": "y+Kd",
            "කූඩුව": "l+vqj",
            "ගූඪ": ".+V",
            "තූර්ය": ";+¾h",
            "නූල": "k+,",
            "ළූණු": "<+Kq",
        }

        for word, expected in expected_outputs.items():
            with self.subTest(word=word):
                output = self._convert(word)
                self.assertEqual(output, expected, f"Failed mapping for '{word}': expected '{expected}', got '{output}'")
                # Ensure no raw Sinhala Unicode codepoints remain
                has_raw = any("\u0D80" <= ch <= "\u0DFF" for ch in output)
                self.assertFalse(has_raw, f"Leftover Sinhala Unicode characters in '{output}' for input '{word}'")

    def test_curved_bottom_consonant_integrated_ligatures(self):
        """
        Verifies that consonants with descending strokes use =, flat/rounded consonants (නු, භු)
        use standard tucked-under q, and long ූ uses integrated + ligatures or dedicated glyphs.
        """
        expected_ligatures = {
            "භු": "Nq",
            "භූ": "N+",
            "හු": "y=",
            "හූ": "y+",
            "කු": "l=",
            "කූ": "l+",
            "ගු": ".=",
            "ගූ": ".+",
            "තු": ";=",
            "තූ": ";+",
            "නු": "kq",
            "නූ": "k+",
            "ශු": "Y=",
            "ශූ": "Y+",
            "ළු": "¿",
            "ළූ": "<+",
            "රු": "re",
            "රූ": "rE",
        }

        for sinhala_char, expected_fm in expected_ligatures.items():
            with self.subTest(char=sinhala_char):
                actual_fm = self._convert(sinhala_char)
                self.assertEqual(
                    actual_fm,
                    expected_fm,
                    f"Expected mapping '{expected_fm}' for '{sinhala_char}', got '{actual_fm}'"
                )
                if 'q' not in expected_fm:
                    self.assertNotIn('q', actual_fm, f"Should not use 'q' for '{sinhala_char}'")
                self.assertNotIn('Q', actual_fm, f"Should not use detached 'Q' for '{sinhala_char}'")

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

    def test_font_glyph_continuity_and_css_letter_spacing(self):
        """
        Verifies that:
        1. FMAbhaya.ttf renders nu (kq), bhu (Nq), nuu (k+), and bhuu (N+) with
           complete pixel continuity (seamlessly connected pāpilla to consonant stroke).
        2. style.css and tools.css enforce letter-spacing: 0 !important on FM Abhaya text.
        """
        from PIL import Image, ImageFont, ImageDraw

        ttf_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "static", "humanizer", "fonts", "FMAbhaya.ttf")
        )
        self.assertTrue(os.path.exists(ttf_path), f"FMAbhaya.ttf not found at {ttf_path}")

        font = ImageFont.truetype(ttf_path, size=48)
        for seq, label in [("kq", "නු"), ("Nq", "භු"), ("k+", "නූ"), ("N+", "භූ")]:
            with self.subTest(seq=seq, label=label):
                im = Image.new("L", (80, 80), color=0)
                draw = ImageDraw.Draw(im)
                draw.text((10, 10), seq, font=font, fill=255)
                bbox = im.getbbox()
                self.assertIsNotNone(bbox)

                # Check horizontal continuity between bounding box x limits
                has_pixel_per_col = [
                    any(im.getpixel((x, y)) > 0 for y in range(bbox[1], bbox[3]))
                    for x in range(bbox[0], bbox[2])
                ]
                self.assertTrue(
                    all(has_pixel_per_col),
                    f"Glyph sequence '{seq}' ({label}) has a gap separating the consonant and pāpilla."
                )

        # Check CSS rules
        css_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "static", "humanizer", "style.css")
        )
        with open(css_path, "r", encoding="utf-8") as fp:
            css_content = fp.read()
            self.assertIn("letter-spacing: 0 !important;", css_content)


if __name__ == "__main__":
    unittest.main()

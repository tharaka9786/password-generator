"""
Unit and integration tests for PassForge Internationalization (i18n) Engine.
Tests English and Sinhala language switching and persistence.
"""

import json
import unittest

from app import app
from blueprints.translations import (
    get_localized_tools_catalog,
    get_translation,
)


class TestI18nUnit(unittest.TestCase):

    def test_default_translation_english(self):
        self.assertEqual(get_translation("nav.home", "en"), "Home")
        self.assertEqual(get_translation("nav.tools", "en"), "Tools")
        self.assertEqual(get_translation("tool.password.title", "en"), "Password Generator")

    def test_sinhala_translation(self):
        self.assertEqual(get_translation("nav.home", "si"), "මුල් පිටුව")
        self.assertEqual(get_translation("nav.tools", "si"), "මෙවලම්")
        self.assertEqual(get_translation("tool.password.title", "si"), "මුරපද උත්පාදකය")
        self.assertEqual(get_translation("tool.breach.title", "si"), "දත්ත කාන්දුවීම් පරීක්ෂකය")

    def test_unsupported_language_fallback(self):
        # Unsupported language code should fall back to English
        self.assertEqual(get_translation("nav.home", "fr"), "Home")

    def test_unknown_key_fallback(self):
        # Non-existent key should return the key itself
        self.assertEqual(get_translation("non.existent.key", "en"), "non.existent.key")
        self.assertEqual(get_translation("non.existent.key", "si"), "non.existent.key")

    def test_localized_tools_catalog_en(self):
        catalog = get_localized_tools_catalog("en")
        pwd_tool = next((t for t in catalog if t["id"] == "password"), None)
        self.assertIsNotNone(pwd_tool)
        self.assertEqual(pwd_tool["title"], "Password Generator")

    def test_localized_tools_catalog_si(self):
        catalog = get_localized_tools_catalog("si")
        pwd_tool = next((t for t in catalog if t["id"] == "password"), None)
        self.assertIsNotNone(pwd_tool)
        self.assertEqual(pwd_tool["title"], "මුරපද උත්පාදකය")
        self.assertIn("ආරක්ෂාව", pwd_tool["tags"])


class TestI18nIntegration(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_set_language_api_si(self):
        resp = self.client.post(
            "/api/set-language",
            data=json.dumps({"lang": "si"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.data)
        self.assertTrue(data["success"])
        self.assertEqual(data["lang"], "si")

        # Verify cookie was set
        cookies = resp.headers.getlist("Set-Cookie")
        self.assertTrue(any("passforge_lang=si" in c for c in cookies))

    def test_set_language_api_en(self):
        resp = self.client.post(
            "/api/set-language",
            data=json.dumps({"lang": "en"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.data)
        self.assertTrue(data["success"])
        self.assertEqual(data["lang"], "en")

        cookies = resp.headers.getlist("Set-Cookie")
        self.assertTrue(any("passforge_lang=en" in c for c in cookies))

    def test_render_with_sinhala_cookie(self):
        self.client.set_cookie("passforge_lang", "si")
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        # Sinhala string rendered server-side
        self.assertIn("මුල් පිටුව".encode("utf-8"), resp.data)
        self.assertIn("මුරපද උත්පාදකය".encode("utf-8"), resp.data)

    def test_render_with_english_cookie(self):
        self.client.set_cookie("passforge_lang", "en")
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b"Home", resp.data)
        self.assertIn(b"Password Generator", resp.data)

    def test_footer_built_with_translation_rendered(self):
        # Ensure raw "footer.built_with" is not displayed in the HTML output
        resp_en = self.client.get("/")
        self.assertEqual(resp_en.status_code, 200)
        self.assertIn(b"PassForge Security &amp; Identity Suite", resp_en.data)

        self.client.set_cookie("passforge_lang", "si")
        resp_si = self.client.get("/")
        self.assertEqual(resp_si.status_code, 200)
        self.assertIn("PassForge ආරක්ෂණ සහ අනන්‍යතා මෙවලම් කට්ටලය".encode("utf-8"), resp_si.data)

    def test_js_i18n_dictionary_contains_footer_built_with(self):
        import os
        js_path = os.path.join(os.path.dirname(__file__), "..", "static", "js", "shared", "i18n.js")
        with open(js_path, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn('"footer.built_with": "PassForge Security & Identity Suite"', content)
        self.assertIn('"footer.built_with": "PassForge ආරක්ෂණ සහ අනන්‍යතා මෙවලම් කට්ටලය"', content)


if __name__ == "__main__":
    unittest.main()

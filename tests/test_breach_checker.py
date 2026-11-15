"""
Unit tests for Data Breach & Credential Leak Auditor module.
"""

import json
import unittest
from unittest.mock import MagicMock, patch

from app import app
from blueprints.breach_checker.checker import (
    check_account_breach,
    check_password_breach,
)


class TestBreachCheckerUnit(unittest.TestCase):

    def test_empty_password(self):
        res = check_password_breach("")
        self.assertEqual(res["status"], "invalid")
        self.assertFalse(res["breached"])
        self.assertEqual(res["breach_count"], 0)

    def test_k_anonymity_prefix_format(self):
        res = check_password_breach("sample-test-password-12345")
        self.assertIn("sha1_prefix", res)
        self.assertEqual(len(res["sha1_prefix"]), 5)
        self.assertTrue(res["sha1_prefix"].isalnum())

    def test_clean_password_mocked(self):
        """Mock HIBP range API returning suffixes that do not match."""
        with patch("requests.get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            # Suffix that won't match our password's sha1 suffix
            mock_resp.text = "00000000000000000000000000000000000:10\n11111111111111111111111111111111111:5"
            mock_get.return_value = mock_resp

            res = check_password_breach("unique_safe_pass_xyz_998877!")
            self.assertEqual(res["status"], "clean")
            self.assertFalse(res["breached"])
            self.assertEqual(res["breach_count"], 0)
            self.assertEqual(res["severity"], "CLEAN")

    def test_breached_password_mocked(self):
        """Mock HIBP range API returning a matching suffix."""
        import hashlib
        pwd = "test-password-breached"
        sha1_full = hashlib.sha1(pwd.encode()).hexdigest().upper()
        suffix = sha1_full[5:]

        with patch("requests.get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.text = f"00000000000000000000000000000000000:10\n{suffix}:4210\n11111111111111111111111111111111111:5"
            mock_get.return_value = mock_resp

            res = check_password_breach(pwd)
            self.assertEqual(res["status"], "breached")
            self.assertTrue(res["breached"])
            self.assertEqual(res["breach_count"], 4210)
            self.assertEqual(res["severity"], "CRITICAL")
            self.assertEqual(res["severity_class"], "rose")

    def test_offline_fallback_known_breached_password(self):
        """When network fails, offline cache should identify 'password' as breached."""
        with patch("requests.get", side_effect=Exception("Network error")):
            res = check_password_breach("password")
            self.assertTrue(res["breached"])
            self.assertGreater(res["breach_count"], 0)
            self.assertIn("Offline", res["source"])

    def test_account_empty(self):
        res = check_account_breach("")
        self.assertEqual(res["status"], "invalid")
        self.assertEqual(res["breach_count"], 0)

    def test_account_invalid_email_format(self):
        res = check_account_breach("not-an-email")
        self.assertEqual(res["status"], "invalid")
        self.assertEqual(res["breach_count"], 0)
        self.assertIn("Invalid email", res["message"])

    def test_account_clean_mocked(self):
        with patch("requests.get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.json.return_value = {"Error": "Not found", "email": None}
            mock_get.return_value = mock_resp

            res = check_account_breach("clean_user@example.com")
            self.assertEqual(res["status"], "clean")
            self.assertEqual(res["breach_count"], 0)
            self.assertEqual(res["severity"], "CLEAN")

    def test_account_breached_mocked(self):
        with patch("requests.get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.json.return_value = {
                "status": "success",
                "email": "victim@example.com",
                "breaches": [["Adobe", "Canva", "Dropbox"]],
            }
            mock_get.return_value = mock_resp

            res = check_account_breach("victim@example.com")
            self.assertEqual(res["status"], "breached")
            self.assertEqual(res["breach_count"], 3)
            self.assertGreater(len(res["breaches"]), 0)
            # Verify metadata decoration
            adobe_entry = next((b for b in res["breaches"] if b["name"] == "Adobe"), None)
            self.assertIsNotNone(adobe_entry)
            self.assertEqual(adobe_entry["year"], "2013")


class TestBreachCheckerIntegration(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_breach_checker_page_renders(self):
        resp = self.client.get("/tools/breach-checker")
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b"Data Breach", resp.data)
        self.assertIn(b"k-Anonymity", resp.data)

    def test_api_check_password_breach(self):
        with patch("blueprints.breach_checker.routes.check_password_breach") as mock_chk:
            mock_chk.return_value = {
                "status": "clean",
                "breached": False,
                "breach_count": 0,
                "severity": "CLEAN",
                "severity_class": "emerald",
                "sha1_prefix": "ABCDE",
                "message": "Safe",
                "recommendation": "All good",
                "source": "HIBP",
            }
            resp = self.client.post(
                "/api/check-password-breach",
                data=json.dumps({"password": "safe-password"}),
                content_type="application/json",
            )
            self.assertEqual(resp.status_code, 200)
            data = json.loads(resp.data)
            self.assertTrue(data["success"])
            self.assertFalse(data["data"]["breached"])

    def test_api_check_account_breach(self):
        with patch("blueprints.breach_checker.routes.check_account_breach") as mock_chk:
            mock_chk.return_value = {
                "status": "clean",
                "account": "test@example.com",
                "breach_count": 0,
                "breaches": [],
                "compromised_data_types": [],
                "severity": "CLEAN",
                "severity_class": "emerald",
                "message": "Clean email",
                "recommendations": ["Keep it safe"],
                "source": "Directory",
            }
            resp = self.client.post(
                "/api/check-account-breach",
                data=json.dumps({"account": "test@example.com"}),
                content_type="application/json",
            )
            self.assertEqual(resp.status_code, 200)
            data = json.loads(resp.data)
            self.assertTrue(data["success"])
            self.assertEqual(data["data"]["breach_count"], 0)


if __name__ == "__main__":
    unittest.main()

"""
Integration tests for Flask Web Application.
"""

import json
import unittest

from app import app


class TestAppAPI(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_health_endpoint(self):
        response = self.app.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "ok")

    def test_index_page(self):
        response = self.app.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"PassForge", response.data)
        self.assertIn(b"Password Generator", response.data)
        self.assertIn(b"Username Generator", response.data)

    def test_generate_api_defaults(self):
        response = self.app.post(
            "/api/generate",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data["success"])
        self.assertEqual(len(data["primary"]["password"]), 16)

    def test_generate_api_custom(self):
        payload = {
            "length": 24,
            "count": 3,
            "include_symbols": False,
            "include_uppercase": True,
            "include_lowercase": True,
            "include_digits": True,
        }
        response = self.app.post(
            "/api/generate",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["count"], 3)
        self.assertEqual(len(data["passwords"]), 3)
        for item in data["passwords"]:
            self.assertEqual(len(item["password"]), 24)

    def test_generate_api_invalid_empty_set(self):
        payload = {
            "include_symbols": False,
            "include_uppercase": False,
            "include_lowercase": False,
            "include_digits": False,
        }
        response = self.app.post(
            "/api/generate",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data["success"])

    def test_generate_username_api_defaults(self):
        response = self.app.post(
            "/api/generate-username",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data["success"])
        self.assertIn("username", data["primary"])
        self.assertGreater(len(data["primary"]["username"]), 0)

    def test_generate_username_api_custom(self):
        payload = {
            "style": "gamer",
            "separator": "_",
            "casing": "lower",
            "include_number": True,
            "count": 4,
        }
        response = self.app.post(
            "/api/generate-username",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["count"], 4)
        self.assertEqual(len(data["usernames"]), 4)
        for u in data["usernames"]:
            self.assertIn("_", u["username"])
            self.assertEqual(u["username"], u["username"].lower())


if __name__ == "__main__":
    unittest.main()

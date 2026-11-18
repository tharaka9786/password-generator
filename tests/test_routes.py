"""
Integration tests for all PassForge multi-page routes and API endpoints.
"""

import json
import unittest

from app import app


class TestRoutes(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_pages_render(self):
        routes = [
            ("/", b"PassForge"),
            ("/tools", b"All Security"),
            ("/about", b"About PassForge"),
            ("/tools/password", b"Password Generator"),
            ("/tools/username", b"Username Generator"),
            ("/tools/account-pair", b"Instant Account Credentials"),
            ("/tools/strength-checker", b"Strength"),
            ("/tools/hash", b"Hash Generator"),
            ("/tools/breach-checker", b"Data Breach"),
            ("/tools/sinhala-humanizer", b"Sinhala Humanizer"),
            ("/login", b"Sign In to PassForge"),
            ("/register", b"Create PassForge Vault"),
        ]
        for route, expected_text in routes:
            with self.subTest(route=route):
                response = self.client.get(route)
                self.assertEqual(response.status_code, 200)
                self.assertIn(expected_text, response.data)

    def test_health_api(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "ok")

    def test_password_api(self):
        response = self.client.post(
            "/api/generate",
            data=json.dumps({"length": 20}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data["success"])
        self.assertEqual(len(data["primary"]["password"]), 20)

    def test_username_api(self):
        response = self.client.post(
            "/api/generate-username",
            data=json.dumps({"style": "gamer", "include_number": True}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data["success"])
        self.assertIn("username", data["primary"])

    def test_strength_checker_api(self):
        response = self.client.post(
            "/api/check-strength",
            data=json.dumps({"password": "SuperSecurePassword#2026!"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data["success"])
        self.assertIn("entropy", data["analysis"])

    def test_hash_api(self):
        response = self.client.post(
            "/api/generate-hash",
            data=json.dumps({"text": "PassForge"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data["success"])
        self.assertIn("sha256", data["data"]["hashes"])

    def test_encrypt_and_decrypt_api(self):
        # 1. Test Encrypt
        enc_res = self.client.post(
            "/api/encrypt-text",
            data=json.dumps({"text": "TopSecretInfo", "key": "SecretKey123", "cipher_type": "aes"}),
            content_type="application/json",
        )
        self.assertEqual(enc_res.status_code, 200)
        enc_data = json.loads(enc_res.data)
        self.assertTrue(enc_data["success"])
        ciphertext = enc_data["data"]["ciphertext"]

        # 2. Test Decrypt
        dec_res = self.client.post(
            "/api/decrypt-text",
            data=json.dumps({"ciphertext": ciphertext, "key": "SecretKey123", "cipher_type": "aes"}),
            content_type="application/json",
        )
        self.assertEqual(dec_res.status_code, 200)
        dec_data = json.loads(dec_res.data)
        self.assertTrue(dec_data["success"])
        self.assertEqual(dec_data["data"]["plaintext"], "TopSecretInfo")

    def test_decrypt_hash_api(self):
        # MD5 of 'password'
        res = self.client.post(
            "/api/decrypt-hash",
            data=json.dumps({"hash": "5f4dcc3b5aa765d61d8327deb882cf99"}),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data["success"])
        self.assertTrue(data["data"]["found"])
        self.assertEqual(data["data"]["plaintext"], "password")

    def test_sinhala_humanizer_page(self):
        response = self.client.get("/tools/sinhala-humanizer")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Sinhala Humanizer", response.data)
        self.assertIn(b"offlineEngineBundle.js", response.data)

    def test_collapsible_tools_sidebar_layout(self):
        """
        Verify that all tool pages contain the collapsible sidebar toggle button,
        persisted localStorage script, sidebar.js script, and responsive wrappers.
        """
        tool_urls = [
            "/tools/password",
            "/tools/username",
            "/tools/account-pair",
            "/tools/strength-checker",
            "/tools/hash",
            "/tools/breach-checker",
            "/tools/sinhala-humanizer",
        ]
        for url in tool_urls:
            with self.subTest(url=url):
                res = self.client.get(url)
                self.assertEqual(res.status_code, 200)
                body = res.get_data(as_text=True)
                self.assertIn('id="sidebar-toggle-btn"', body)
                self.assertIn('class="tool-sidebar-inner"', body)
                self.assertIn('passforge_sidebar_collapsed', body)
                self.assertIn('sidebar.js', body)
                self.assertIn('Ctrl+\\', body)

    def test_tools_session_history_boxes(self):
        """
        Verify that all PassForge tools contain a persistent Session History container
        and clear button in their rendered template.
        """
        history_configs = [
            ("/tools/password", "historyList", "clearHistoryBtn"),
            ("/tools/username", "usernameHistoryList", "clearUsernameHistoryBtn"),
            ("/tools/account-pair", "comboHistoryList", "clearComboHistoryBtn"),
            ("/tools/strength-checker", "strengthHistoryList", "clearStrengthHistoryBtn"),
            ("/tools/hash", "hashHistoryList", "clearHashHistoryBtn"),
            ("/tools/breach-checker", "breachHistoryList", "clearBreachHistoryBtn"),
        ]
        for url, list_id, clear_btn_id in history_configs:
            with self.subTest(url=url):
                res = self.client.get(url)
                self.assertEqual(res.status_code, 200)
                body = res.get_data(as_text=True)
                self.assertIn('class="history-box', body)
                self.assertIn(f'id="{list_id}"', body)
                self.assertIn(f'id="{clear_btn_id}"', body)


if __name__ == "__main__":
    unittest.main()

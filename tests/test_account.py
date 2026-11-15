"""
Integration tests for PassForge User Authentication, Vault, and History APIs.
"""

from __future__ import annotations

import json
import unittest

from app import create_app
from blueprints.account.crypto import decrypt_vault_password, encrypt_vault_password
from models import HumanizerHistory, ToolHistory, User, VaultItem, db


class TestAccountAndVault(unittest.TestCase):
    """Test suite for authentication, encrypted vault, and history APIs."""

    def setUp(self):
        # Create a dedicated testing app with in-memory SQLite database
        self.app = create_app(testing=True)
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def register_user(self, username="tester", email="tester@example.com", password="SecurePassword123!"):
        return self.client.post("/register", json={
            "username": username,
            "email": email,
            "password": password,
        })

    def login_user(self, identifier="tester", password="SecurePassword123!"):
        return self.client.post("/login", json={
            "identifier": identifier,
            "password": password,
        })

    def test_crypto_helpers(self):
        raw = "MySuperSecretPassword@2026!"
        encrypted = encrypt_vault_password(raw)
        self.assertNotEqual(raw, encrypted)
        decrypted = decrypt_vault_password(encrypted)
        self.assertEqual(raw, decrypted)

    def test_registration_validation(self):
        # Username too short
        res = self.client.post("/register", json={
            "username": "ab",
            "email": "test@example.com",
            "password": "Password123!",
        })
        self.assertEqual(res.status_code, 400)

        # Invalid email
        res = self.client.post("/register", json={
            "username": "valid_user",
            "email": "not-an-email",
            "password": "Password123!",
        })
        self.assertEqual(res.status_code, 400)

        # Password too short
        res = self.client.post("/register", json={
            "username": "valid_user",
            "email": "test@example.com",
            "password": "short",
        })
        self.assertEqual(res.status_code, 400)

        # Valid registration
        res = self.register_user("john_doe", "john@example.com", "LongSecurePassword123!")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])

        # Logout so we can test duplicate registration as an unauthenticated visitor
        self.client.get("/logout")

        # Duplicate registration
        res = self.register_user("john_doe", "other@example.com", "LongSecurePassword123!")
        self.assertEqual(res.status_code, 400)

    def test_login_and_logout(self):
        self.register_user("sarah_connor", "sarah@cyberdyne.com", "T800HastaLaVista!")
        self.client.get("/logout")

        # Invalid password
        res = self.login_user("sarah_connor", "WrongPassword!")
        self.assertEqual(res.status_code, 401)

        # Login by username
        res = self.login_user("sarah_connor", "T800HastaLaVista!")
        self.assertEqual(res.status_code, 200)

        # Dashboard accessible
        res = self.client.get("/dashboard")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"sarah_connor", res.data)

        # Logout
        res = self.client.get("/logout", follow_redirects=True)
        self.assertEqual(res.status_code, 200)

        # Dashboard requires login after logout
        res = self.client.get("/dashboard", follow_redirects=False)
        self.assertEqual(res.status_code, 302)

    def test_unauthorized_api_access(self):
        # Calls to /api/save/* without login should return 401 JSON
        res = self.client.post("/api/save/vault", json={"title": "Test"})
        self.assertEqual(res.status_code, 401)
        data = res.get_json()
        self.assertFalse(data["success"])
        self.assertFalse(data["authenticated"])

    def test_vault_save_and_reveal(self):
        self.register_user("vault_master", "vault@example.com", "MasterPass1234!")

        # Save credential
        save_res = self.client.post("/api/save/vault", json={
            "title": "AWS Production Root",
            "username_value": "admin@aws.com",
            "password": "SuperVaultSecretPassword99!",
            "category": "account_pair",
            "notes": "Root API credential",
        })
        self.assertEqual(save_res.status_code, 200)
        save_data = save_res.get_json()
        self.assertTrue(save_data["success"])
        item_id = save_data["item"]["id"]

        # Verify password in DB is encrypted (not plaintext)
        db_item = db.session.get(VaultItem, item_id)
        self.assertIsNotNone(db_item)
        self.assertNotEqual(db_item.encrypted_password, "SuperVaultSecretPassword99!")

        # Reveal password via API
        reveal_res = self.client.get(f"/api/vault/{item_id}/reveal")
        self.assertEqual(reveal_res.status_code, 200)
        reveal_data = reveal_res.get_json()
        self.assertEqual(reveal_data["password"], "SuperVaultSecretPassword99!")

    def test_sinhala_humanizer_history(self):
        self.register_user("sinhala_scholar", "scholar@example.com", "ScholarPass1234!")

        sinhala_orig = "කෘත්‍රිම බුද්ධිය මඟින් ජනනය කරන ලද ලේඛනයක්."
        sinhala_human = "ස්වභාවික මානව බුද්ධිමය ශෛලියෙන් යුත් රචනයක්."
        fm_text = "lD;%su nqoaêh u.ska..."

        res = self.client.post("/api/save/humanizer", json={
            "mode": "academic",
            "original_text": sinhala_orig,
            "humanized_text": sinhala_human,
            "fm_abhaya_text": fm_text,
            "ai_score": 0.08,
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])

        # Verify saved in DB
        history = HumanizerHistory.query.first()
        self.assertIsNotNone(history)
        self.assertEqual(history.original_text, sinhala_orig)
        self.assertEqual(history.humanized_text, sinhala_human)
        self.assertAlmostEqual(history.ai_score, 0.08, places=2)

    def test_tool_activity_and_delete(self):
        self.register_user("auditor", "auditor@example.com", "AuditorPass1234!")

        # Save activity
        res = self.client.post("/api/save/activity", json={
            "tool_name": "strength_checker",
            "input_summary": "Password audit (len 24)",
            "result_summary": "VERY STRONG (128 bits entropy)",
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        item_id = data["item"]["id"]

        # Verify in DB
        self.assertEqual(ToolHistory.query.count(), 1)

        # Delete activity
        del_res = self.client.delete(f"/api/history/activity/{item_id}")
        self.assertEqual(del_res.status_code, 200)
        self.assertEqual(ToolHistory.query.count(), 0)


if __name__ == "__main__":
    unittest.main()

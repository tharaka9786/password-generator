"""
Unit tests for PassForge SQLAlchemy database models.
"""

from __future__ import annotations

import unittest
from flask import Flask

from models import HumanizerHistory, ToolHistory, User, VaultItem, db


class TestModels(unittest.TestCase):
    """Test suite for PassForge ORM models and relationships."""

    def setUp(self):
        self.app = Flask(__name__)
        self.app.config["TESTING"] = True
        self.app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        self.app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
        db.init_app(self.app)

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_user_password_hashing(self):
        with self.app.app_context():
            user = User(username="security_expert", email="expert@passforge.io")
            user.set_password("CorrectHorseBatteryStaple!23")
            db.session.add(user)
            db.session.commit()

            self.assertIsNotNone(user.id)
            self.assertTrue(user.check_password("CorrectHorseBatteryStaple!23"))
            self.assertFalse(user.check_password("WrongPassword123!"))
            self.assertIn("security_expert", repr(user))
            self.assertEqual(user.to_dict()["username"], "security_expert")

    def test_vault_item_relationship_and_cascade(self):
        with self.app.app_context():
            user = User(username="alice", email="alice@passforge.io")
            user.set_password("StrongPass123!")
            db.session.add(user)
            db.session.commit()

            vault_item = VaultItem(
                user_id=user.id,
                title="GitHub Account",
                username_value="alice_dev",
                encrypted_password="gAAAAABl...enc",
                category="account_pair",
                notes="Primary dev account",
            )
            db.session.add(vault_item)
            db.session.commit()

            self.assertEqual(user.vault_items.count(), 1)
            self.assertEqual(user.vault_items.first().title, "GitHub Account")

            # Test cascade delete
            db.session.delete(user)
            db.session.commit()
            self.assertEqual(VaultItem.query.count(), 0)

    def test_humanizer_history(self):
        with self.app.app_context():
            user = User(username="bob", email="bob@passforge.io")
            user.set_password("Pass1234!")
            db.session.add(user)
            db.session.commit()

            history = HumanizerHistory(
                user_id=user.id,
                mode="academic",
                original_text="කෘත්‍රිම බුද්ධිය යනු...",
                humanized_text="ස්වභාවික මානව බුද්ධිය හා සමානව...",
                fm_abhaya_text="lD;%su nqoaêh hkq...",
                ai_score=0.12,
            )
            db.session.add(history)
            db.session.commit()

            self.assertEqual(user.humanizer_history.count(), 1)
            self.assertEqual(history.mode, "academic")
            self.assertAlmostEqual(history.ai_score, 0.12, places=2)
            d = history.to_dict()
            self.assertEqual(d["mode"], "academic")
            self.assertIn("කෘත්‍රිම", d["original_text"])

    def test_tool_history(self):
        with self.app.app_context():
            user = User(username="charlie", email="charlie@passforge.io")
            user.set_password("Pass1234!")
            db.session.add(user)
            db.session.commit()

            audit = ToolHistory(
                user_id=user.id,
                tool_name="strength_checker",
                input_summary="Password len 16",
                result_summary='{"score": 100, "verdict": "Very Strong"}',
            )
            db.session.add(audit)
            db.session.commit()

            self.assertEqual(user.tool_history.count(), 1)
            self.assertEqual(audit.tool_name, "strength_checker")
            self.assertIn("score", audit.to_dict()["result_summary"])


if __name__ == "__main__":
    unittest.main()

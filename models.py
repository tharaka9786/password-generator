"""
PassForge Database Models
-------------------------
SQLAlchemy ORM models for PassForge Security & Identity Suite.
Configured with InnoDB, UTF8MB4 charset, and utf8mb4_unicode_ci collation
for comprehensive multilingual and Sinhala Unicode support.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.mysql import LONGTEXT
from werkzeug.security import check_password_hash, generate_password_hash

db: SQLAlchemy = SQLAlchemy()


class User(UserMixin, db.Model):
    """PassForge user account model."""

    __tablename__ = "users"
    __table_args__ = {
        "mysql_engine": "InnoDB",
        "mysql_charset": "utf8mb4",
        "mysql_collate": "utf8mb4_unicode_ci",
    }

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Cascading relationships
    vault_items = db.relationship(
        "VaultItem",
        backref="user",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )
    humanizer_history = db.relationship(
        "HumanizerHistory",
        backref="user",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )
    tool_history = db.relationship(
        "ToolHistory",
        backref="user",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    def set_password(self, password: str) -> None:
        """Hash and store user password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify plain password against stored hash."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize user to dictionary."""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<User {self.username}>"


class VaultItem(db.Model):
    """Encrypted credential vault item model."""

    __tablename__ = "vault_items"
    __table_args__ = {
        "mysql_engine": "InnoDB",
        "mysql_charset": "utf8mb4",
        "mysql_collate": "utf8mb4_unicode_ci",
    }

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = db.Column(db.String(150), nullable=False)
    username_value = db.Column(db.String(255), nullable=True)
    encrypted_password = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # 'password', 'username', 'account_pair'
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize vault item to dictionary (excluding raw encrypted blob for safety)."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "username_value": self.username_value,
            "category": self.category,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<VaultItem {self.title} (User: {self.user_id})>"


class HumanizerHistory(db.Model):
    """Sinhala AI text humanizer execution history."""

    __tablename__ = "humanizer_history"
    __table_args__ = {
        "mysql_engine": "InnoDB",
        "mysql_charset": "utf8mb4",
        "mysql_collate": "utf8mb4_unicode_ci",
    }

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    mode = db.Column(db.String(30), nullable=False)  # 'academic', 'general'
    original_text = db.Column(db.Text().with_variant(LONGTEXT, "mysql"), nullable=False)
    humanized_text = db.Column(db.Text().with_variant(LONGTEXT, "mysql"), nullable=False)
    fm_abhaya_text = db.Column(db.Text().with_variant(LONGTEXT, "mysql"), nullable=True)
    ai_score = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize humanizer record to dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "mode": self.mode,
            "original_text": self.original_text,
            "humanized_text": self.humanized_text,
            "fm_abhaya_text": self.fm_abhaya_text,
            "ai_score": self.ai_score,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<HumanizerHistory {self.id} (User: {self.user_id})>"


class ToolHistory(db.Model):
    """Audit log and history for security utilities."""

    __tablename__ = "tool_history"
    __table_args__ = {
        "mysql_engine": "InnoDB",
        "mysql_charset": "utf8mb4",
        "mysql_collate": "utf8mb4_unicode_ci",
    }

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    tool_name = db.Column(db.String(50), nullable=False)  # 'strength_checker', 'hash_generator', 'breach_checker'
    input_summary = db.Column(db.String(255), nullable=True)
    result_summary = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize tool history to dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "tool_name": self.tool_name,
            "input_summary": self.input_summary,
            "result_summary": self.result_summary,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<ToolHistory {self.tool_name} (User: {self.user_id})>"

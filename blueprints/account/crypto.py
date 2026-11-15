"""
PassForge Vault Encryption & Decryption Helpers
-----------------------------------------------
Utilizes AES-128-CBC with HMAC-SHA256 authenticated encryption via cryptography.fernet.Fernet.
"""

from __future__ import annotations

import base64
import os
from cryptography.fernet import Fernet, InvalidToken

_FERNET_INSTANCE: Fernet | None = None
_FALLBACK_TEST_KEY = b"k9sH4P_Z8Jk3V1y6eW1R-qZ_F5X2p0A4b6C8d0E2g4I="


def get_fernet() -> Fernet:
    """Retrieve or initialize the global Fernet instance using VAULT_ENCRYPTION_KEY."""
    global _FERNET_INSTANCE
    if _FERNET_INSTANCE is not None:
        return _FERNET_INSTANCE

    raw_key = os.environ.get("VAULT_ENCRYPTION_KEY")
    if raw_key:
        try:
            key_bytes = raw_key.strip().encode("utf-8")
            _FERNET_INSTANCE = Fernet(key_bytes)
            return _FERNET_INSTANCE
        except Exception:
            pass

    # Fallback to test key if key is missing or invalid in environment
    _FERNET_INSTANCE = Fernet(_FALLBACK_TEST_KEY)
    return _FERNET_INSTANCE


def encrypt_vault_password(plaintext: str) -> str:
    """Encrypt a plaintext password into a base64-encoded ciphertext string."""
    if not plaintext:
        return ""
    f = get_fernet()
    token_bytes = f.encrypt(plaintext.encode("utf-8"))
    return token_bytes.decode("utf-8")


def decrypt_vault_password(ciphertext: str) -> str:
    """Decrypt a base64-encoded ciphertext string back to plaintext."""
    if not ciphertext:
        return ""
    f = get_fernet()
    try:
        plain_bytes = f.decrypt(ciphertext.strip().encode("utf-8"))
        return plain_bytes.decode("utf-8")
    except InvalidToken:
        return "[Error: Unable to decrypt with current key]"

"""
Cryptographic Hasher, Cipher Encryption & Decryption Engine
-----------------------------------------------------------
Supports:
1. One-way hash generation (MD5, SHA-1, SHA-256, SHA-512, BLAKE2b).
2. Hash identification and dictionary-based reverse lookup ("hash crack").
   Falls back to external rainbow-table APIs when the local dictionary misses.
3. Two-way symmetric encryption & decryption using authenticated AES (Fernet).
4. Classic ciphers (Base64, ROT13, Hex).
"""

from __future__ import annotations

import base64
import codecs
import hashlib
import os
import re
from typing import Any, Dict, List, Optional, Tuple

try:
    import requests as _requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

# External API timeout (seconds). Keep short so the UX doesn't stall.
_API_TIMEOUT = 6

try:
    from cryptography.fernet import Fernet, InvalidToken
    HAS_CRYPTOGRAPHY = True
except ImportError:
    HAS_CRYPTOGRAPHY = False

# Curated lookup dictionary of top common passwords, tech terms, and phrases
COMMON_WORDLIST = [
    # Top passwords & common credentials
    "password", "123456", "12345678", "123456789", "12345", "1234", "111111",
    "admin", "root", "toor", "guest", "welcome", "letmein", "pass123", "secret",
    "qwerty", "abc123", "password1", "monkey", "dragon", "master", "sunshine",
    "princess", "football", "shadow", "superman", "michael", "trustno1", "hunter",
    "iloveyou", "computer", "orange", "charlie", "jordan", "coffee", "freedom",
    "batman", "jessica", "starwars", "pokemon", "test", "testing", "sample",
    "PassForge", "passforge", "hello", "world", "helloworld", "Hello World",
    "admin123", "password123", "root123", "login", "auth", "system", "user",
    "123123", "654321", "000000", "7777777", "987654321", "default", "changeme",
]

# Generate basic numeric strings 0-1000 dynamically to expand rainbow coverage
DYNAMIC_DICTIONARY = COMMON_WORDLIST + [str(i) for i in range(1001)]


def derive_fernet_key(key_phrase: str) -> bytes:
    """
    Derive a 32-byte URL-safe base64 key suitable for Fernet from any passphrase.
    """
    digest = hashlib.sha256(key_phrase.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest)


# ==============================================================================
# 1. TWO-WAY ENCRYPTION & DECRYPTION (AES-256 / FERNET)
# ==============================================================================

def encrypt_text(text: str, key_phrase: Optional[str] = None, cipher_type: str = "aes") -> Dict[str, Any]:
    """
    Encrypt plaintext using symmetric encryption (AES/Fernet) or classic encoding.
    """
    if not text:
        raise ValueError("Text to encrypt cannot be empty.")

    cipher_type = cipher_type.lower()

    if cipher_type == "base64":
        encoded = base64.b64encode(text.encode("utf-8")).decode("utf-8")
        return {
            "cipher_type": "base64",
            "ciphertext": encoded,
            "key": "N/A (Standard Base64 encoding)",
        }

    if cipher_type == "rot13":
        encoded = codecs.encode(text, "rot_13")
        return {
            "cipher_type": "rot13",
            "ciphertext": encoded,
            "key": "N/A (Caesar ROT-13)",
        }

    if cipher_type == "hex":
        encoded = text.encode("utf-8").hex()
        return {
            "cipher_type": "hex",
            "ciphertext": encoded,
            "key": "N/A (Hexadecimal ASCII encoding)",
        }

    # Default: AES (Fernet authenticated AES-128-CBC + HMAC-SHA256)
    if not HAS_CRYPTOGRAPHY:
        raise RuntimeError("Cryptography library is not installed.")

    if not key_phrase or not key_phrase.strip():
        generated_key = Fernet.generate_key().decode("utf-8")
        fernet = Fernet(generated_key.encode("utf-8"))
        used_key = generated_key
    else:
        fernet_key = derive_fernet_key(key_phrase)
        fernet = Fernet(fernet_key)
        used_key = key_phrase

    ciphertext_bytes = fernet.encrypt(text.encode("utf-8"))
    ciphertext = ciphertext_bytes.decode("utf-8")

    return {
        "cipher_type": "aes",
        "ciphertext": ciphertext,
        "key": used_key,
    }


def decrypt_text(ciphertext: str, key_phrase: Optional[str] = None, cipher_type: str = "aes") -> Dict[str, Any]:
    """
    Decrypt ciphertext back to plaintext.
    """
    if not ciphertext or not ciphertext.strip():
        raise ValueError("Ciphertext to decrypt cannot be empty.")

    ciphertext = ciphertext.strip()
    cipher_type = cipher_type.lower()

    if cipher_type == "base64":
        try:
            decoded = base64.b64decode(ciphertext.encode("utf-8")).decode("utf-8")
            return {"plaintext": decoded, "cipher_type": "base64"}
        except Exception as e:
            raise ValueError(f"Invalid Base64 payload: {str(e)}")

    if cipher_type == "rot13":
        decoded = codecs.encode(ciphertext, "rot_13")
        return {"plaintext": decoded, "cipher_type": "rot13"}

    if cipher_type == "hex":
        try:
            decoded = bytes.fromhex(ciphertext).decode("utf-8")
            return {"plaintext": decoded, "cipher_type": "hex"}
        except Exception as e:
            raise ValueError(f"Invalid Hex string: {str(e)}")

    # Default: AES (Fernet)
    if not HAS_CRYPTOGRAPHY:
        raise RuntimeError("Cryptography library is not installed.")

    if not key_phrase or not key_phrase.strip():
        raise ValueError("A Secret Key or Passphrase is required to decrypt AES ciphertext.")

    try:
        # Check if the key provided is already a raw 32-byte Fernet key
        try:
            fernet = Fernet(key_phrase.strip().encode("utf-8"))
            decrypted = fernet.decrypt(ciphertext.encode("utf-8")).decode("utf-8")
            return {"plaintext": decrypted, "cipher_type": "aes"}
        except Exception:
            # Otherwise derive the key from the passphrase
            derived = derive_fernet_key(key_phrase.strip())
            fernet = Fernet(derived)
            decrypted = fernet.decrypt(ciphertext.encode("utf-8")).decode("utf-8")
            return {"plaintext": decrypted, "cipher_type": "aes"}

    except InvalidToken:
        raise ValueError("Decryption failed. Invalid secret key or corrupted ciphertext.")
    except Exception as e:
        raise ValueError(f"Decryption error: {str(e)}")


# ==============================================================================
# 2. ONE-WAY HASH GENERATION
# ==============================================================================

def generate_hashes(text: str) -> Dict[str, Any]:
    """
    Compute cryptographic hashes for an input text.
    """
    if text is None:
        text = ""

    text_bytes = text.encode("utf-8")

    hashes = {
        "md5": hashlib.md5(text_bytes).hexdigest(),
        "sha1": hashlib.sha1(text_bytes).hexdigest(),
        "sha224": hashlib.sha224(text_bytes).hexdigest(),
        "sha256": hashlib.sha256(text_bytes).hexdigest(),
        "sha384": hashlib.sha384(text_bytes).hexdigest(),
        "sha512": hashlib.sha512(text_bytes).hexdigest(),
        "sha3_256": hashlib.sha3_256(text_bytes).hexdigest(),
        "sha3_512": hashlib.sha3_512(text_bytes).hexdigest(),
        "blake2b": hashlib.blake2b(text_bytes).hexdigest(),
    }

    return {
        "input_length": len(text),
        "byte_length": len(text_bytes),
        "hashes": hashes,
    }


# ==============================================================================
# 3. HASH IDENTIFICATION & REVERSE LOOKUP ("DECRYPT / CRACK HASH")
# ==============================================================================

def identify_hash(hash_str: str) -> List[str]:
    """
    Determine possible hash algorithms based on string length and format.
    """
    h = hash_str.strip()
    is_hex = bool(re.fullmatch(r"^[a-fA-F0-9]+$", h))
    length = len(h)

    candidates: List[str] = []

    if is_hex:
        if length == 32:
            candidates.extend(["MD5", "NTLM", "MD4"])
        elif length == 40:
            candidates.extend(["SHA-1", "RIPEMD-160"])
        elif length == 56:
            candidates.extend(["SHA-224", "SHA3-224"])
        elif length == 64:
            candidates.extend(["SHA-256", "SHA3-256", "BLAKE2s"])
        elif length == 96:
            candidates.extend(["SHA-384", "SHA3-384"])
        elif length == 128:
            candidates.extend(["SHA-512", "SHA3-512", "BLAKE2b"])

    if h.startswith("$2a$") or h.startswith("$2b$") or h.startswith("$2y$"):
        candidates.append("bcrypt")

    if not candidates:
        if is_hex:
            candidates.append(f"Hex digest ({length * 4} bits)")
        else:
            candidates.append("Unknown format / Custom salt")

    return candidates


def _query_hashes_com(hash_str: str) -> Optional[Tuple[str, str]]:
    """
    Query hashes.com API.  Returns (plaintext, algorithm) or None.
    Free, no auth required for basic single-hash lookups.
    """
    if not HAS_REQUESTS:
        return None
    try:
        resp = _requests.post(
            "https://hashes.com/en/api/identifier",
            json={"hashvalue": hash_str},
            timeout=_API_TIMEOUT,
            headers={"Content-Type": "application/json"},
        )
        if resp.status_code == 200:
            j = resp.json()
            # Response shape: {"result": [{"plaintext": "...", "algorithm": "...", ...}]}
            results = j.get("result") or j.get("results") or []
            if results and isinstance(results, list):
                first = results[0]
                pt = first.get("plaintext") or first.get("plain")
                algo = first.get("algorithm") or first.get("type") or "Unknown"
                if pt:
                    return (pt, str(algo))
    except Exception:
        pass
    return None


def _query_nitrxgen(hash_str: str) -> Optional[Tuple[str, str]]:
    """
    Query nitrxgen.net MD5 database (MD5-only, no auth needed).
    Returns (plaintext, 'MD5') or None.
    """
    if not HAS_REQUESTS:
        return None
    # Only try when hash length matches MD5
    if len(hash_str) != 32:
        return None
    try:
        resp = _requests.get(
            f"https://www.nitrxgen.net/md5db/{hash_str}",
            timeout=_API_TIMEOUT,
        )
        if resp.status_code == 200:
            text = resp.text.strip()
            if text and len(text) < 256:   # sanity-check — should be a short word
                return (text, "MD5")
    except Exception:
        pass
    return None


def _query_md5decrypt(hash_str: str) -> Optional[Tuple[str, str]]:
    """
    Query md5decrypt.net public API (MD5 / SHA-1 / SHA-256, no-key free tier).
    Returns (plaintext, algorithm) or None.
    """
    if not HAS_REQUESTS:
        return None
    length_to_type = {32: "md5", 40: "sha1", 64: "sha256"}
    hash_type = length_to_type.get(len(hash_str))
    if not hash_type:
        return None
    try:
        resp = _requests.get(
            "https://md5decrypt.net/Api/api.php",
            params={"hash": hash_str, "hash_type": hash_type, "email": "a@a.co", "code": ""},
            timeout=_API_TIMEOUT,
        )
        if resp.status_code == 200:
            text = resp.text.strip()
            # API returns the plaintext on success, "ERROR CODE : 001" on miss
            if text and not text.upper().startswith("ERROR") and len(text) < 256:
                algo_name = {"md5": "MD5", "sha1": "SHA-1", "sha256": "SHA-256"}[hash_type]
                return (text, algo_name)
    except Exception:
        pass
    return None


def reverse_lookup_hash(hash_str: str) -> Dict[str, Any]:
    """
    Attempt to reverse a cryptographic hash.

    Strategy (in order):
      1. Local rainbow dictionary (fast, ~1 000+ entries).
      2. hashes.com public API  (large crowdsourced rainbow table).
      3. md5decrypt.net API     (MD5 / SHA-1 / SHA-256).
      4. nitrxgen.net           (MD5 only).
      5. Give up and return found=False with diagnostics.
    """
    if not hash_str or not hash_str.strip():
        raise ValueError("Hash string cannot be empty.")

    target_hash = hash_str.strip().lower()
    candidates = identify_hash(target_hash)

    # ------------------------------------------------------------------
    # STEP 1 — Local dictionary
    # ------------------------------------------------------------------
    for word in DYNAMIC_DICTIONARY:
        word_bytes = word.encode("utf-8")

        checks = (
            (hashlib.md5(word_bytes).hexdigest(),    "MD5"),
            (hashlib.sha1(word_bytes).hexdigest(),   "SHA-1"),
            (hashlib.sha256(word_bytes).hexdigest(), "SHA-256"),
            (hashlib.sha512(word_bytes).hexdigest(), "SHA-512"),
            (hashlib.sha224(word_bytes).hexdigest(), "SHA-224"),
            (hashlib.blake2b(word_bytes).hexdigest(),"BLAKE2b"),
        )
        for digest, algo_name in checks:
            if digest == target_hash:
                return {
                    "found": True,
                    "plaintext": word,
                    "algorithm": algo_name,
                    "hash": target_hash,
                    "source": "Local Rainbow Table",
                    "external_queried": False,
                    "dictionary_size": len(DYNAMIC_DICTIONARY),
                }

    # ------------------------------------------------------------------
    # STEP 2 — External APIs (queried in parallel via sequential fallback)
    # ------------------------------------------------------------------
    api_sources = [
        ("hashes.com",     _query_hashes_com),
        ("md5decrypt.net", _query_md5decrypt),
        ("nitrxgen.net",   _query_nitrxgen),
    ]

    for source_name, query_fn in api_sources:
        result = query_fn(target_hash)
        if result:
            plaintext, algorithm = result
            return {
                "found": True,
                "plaintext": plaintext,
                "algorithm": algorithm,
                "hash": target_hash,
                "source": source_name,
                "external_queried": True,
                "dictionary_size": len(DYNAMIC_DICTIONARY),
            }

    # ------------------------------------------------------------------
    # STEP 3 — Not found anywhere
    # ------------------------------------------------------------------
    return {
        "found": False,
        "hash": target_hash,
        "possible_types": candidates,
        "source": None,
        "external_queried": HAS_REQUESTS,
        "dictionary_size": len(DYNAMIC_DICTIONARY),
        "explanation": (
            "Cryptographic hashes are one-way mathematical functions designed to be irreversible. "
            "Reversing is only possible if the pre-image exists in a rainbow table. "
            "This hash was not found in our local dictionary or any of the external hash "
            "databases we queried (hashes.com, md5decrypt.net, nitrxgen.net)."
        ),
    }

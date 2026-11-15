"""
Unit tests for Cryptographic Hasher, Cipher Encryption & Decryption module.
"""

import hashlib
import unittest
from unittest.mock import MagicMock, patch

from blueprints.hash_generator.hasher import (
    decrypt_text,
    encrypt_text,
    generate_hashes,
    identify_hash,
    reverse_lookup_hash,
)


class TestHashAndCipher(unittest.TestCase):

    def test_known_hashes(self):
        text = "PassForge"
        res = generate_hashes(text)
        self.assertEqual(res["input_length"], len(text))
        hashes = res["hashes"]

        self.assertEqual(hashes["sha256"], hashlib.sha256(text.encode()).hexdigest())
        self.assertEqual(hashes["md5"], hashlib.md5(text.encode()).hexdigest())
        self.assertEqual(hashes["sha1"], hashlib.sha1(text.encode()).hexdigest())

    def test_digest_lengths(self):
        res = generate_hashes("sample-text")["hashes"]
        self.assertEqual(len(res["md5"]), 32)
        self.assertEqual(len(res["sha1"]), 40)
        self.assertEqual(len(res["sha256"]), 64)
        self.assertEqual(len(res["sha512"]), 128)
        self.assertEqual(len(res["sha3_256"]), 64)
        self.assertEqual(len(res["blake2b"]), 128)

    def test_empty_string(self):
        res = generate_hashes("")
        self.assertEqual(res["input_length"], 0)
        self.assertEqual(res["hashes"]["sha256"], hashlib.sha256(b"").hexdigest())

    def test_aes_encrypt_decrypt_roundtrip(self):
        secret_message = "Confidential Information #2026"
        key = "SuperSecretPassphrase123!"

        enc = encrypt_text(secret_message, key_phrase=key, cipher_type="aes")
        self.assertIn("ciphertext", enc)
        self.assertNotEqual(enc["ciphertext"], secret_message)

        dec = decrypt_text(enc["ciphertext"], key_phrase=key, cipher_type="aes")
        self.assertEqual(dec["plaintext"], secret_message)

    def test_aes_wrong_key_fails(self):
        enc = encrypt_text("Secret Data", key_phrase="CorrectKey", cipher_type="aes")
        with self.assertRaises(ValueError):
            decrypt_text(enc["ciphertext"], key_phrase="WrongKey", cipher_type="aes")

    def test_base64_roundtrip(self):
        text = "Hello World Base64"
        enc = encrypt_text(text, cipher_type="base64")
        dec = decrypt_text(enc["ciphertext"], cipher_type="base64")
        self.assertEqual(dec["plaintext"], text)

    def test_rot13_roundtrip(self):
        text = "Secret Message"
        enc = encrypt_text(text, cipher_type="rot13")
        dec = decrypt_text(enc["ciphertext"], cipher_type="rot13")
        self.assertEqual(dec["plaintext"], text)

    def test_hash_identification(self):
        md5_hash = hashlib.md5(b"password").hexdigest()
        self.assertIn("MD5", identify_hash(md5_hash))

        sha256_hash = hashlib.sha256(b"password").hexdigest()
        self.assertIn("SHA-256", identify_hash(sha256_hash))

    # ------------------------------------------------------------------
    # Reverse Lookup — local dictionary hits (no network required)
    # ------------------------------------------------------------------
    def test_reverse_lookup_found_local(self):
        """Words in local dictionary must be found instantly (local source)."""
        md5_pwd = hashlib.md5(b"password").hexdigest()
        res = reverse_lookup_hash(md5_pwd)
        self.assertTrue(res["found"])
        self.assertEqual(res["plaintext"], "password")
        self.assertEqual(res["algorithm"], "MD5")
        self.assertEqual(res["source"], "Local Rainbow Table")
        self.assertFalse(res["external_queried"])

    def test_reverse_lookup_numeric_local(self):
        sha256_num = hashlib.sha256(b"123456").hexdigest()
        res = reverse_lookup_hash(sha256_num)
        self.assertTrue(res["found"])
        self.assertEqual(res["plaintext"], "123456")
        self.assertEqual(res["source"], "Local Rainbow Table")

    # ------------------------------------------------------------------
    # Reverse Lookup — external API path (mocked)
    # ------------------------------------------------------------------
    def test_reverse_lookup_external_hashes_com(self):
        """Simulate hashes.com returning a result for an unknown hash."""
        unknown_hash = hashlib.md5(b"super_secret_xyz_not_in_dict").hexdigest()

        import blueprints.hash_generator.hasher as hasher_mod
        with patch.object(hasher_mod, "_query_hashes_com", return_value=("super_secret_xyz_not_in_dict", "MD5")) as mock_api, \
             patch.object(hasher_mod, "_query_md5decrypt", return_value=None), \
             patch.object(hasher_mod, "_query_nitrxgen", return_value=None):
            res = reverse_lookup_hash(unknown_hash)

        self.assertTrue(res["found"])
        self.assertEqual(res["plaintext"], "super_secret_xyz_not_in_dict")
        self.assertEqual(res["source"], "hashes.com")
        self.assertTrue(res["external_queried"])
        mock_api.assert_called_once_with(unknown_hash)

    def test_reverse_lookup_external_fallback_nitrxgen(self):
        """Simulate hashes.com and md5decrypt missing, nitrxgen succeeding."""
        unknown_hash = hashlib.md5(b"some_rare_word_abc").hexdigest()

        import blueprints.hash_generator.hasher as hasher_mod
        with patch.object(hasher_mod, "_query_hashes_com", return_value=None), \
             patch.object(hasher_mod, "_query_md5decrypt", return_value=None), \
             patch.object(hasher_mod, "_query_nitrxgen", return_value=("some_rare_word_abc", "MD5")):
            res = reverse_lookup_hash(unknown_hash)

        self.assertTrue(res["found"])
        self.assertEqual(res["source"], "nitrxgen.net")

    # ------------------------------------------------------------------
    # Reverse Lookup — not found anywhere
    # ------------------------------------------------------------------
    def test_reverse_lookup_not_found_all_sources(self):
        """All sources miss → found=False with external_queried=True."""
        complex_hash = hashlib.sha256(b"unlikely_to_exist_in_dict_xyz_998877").hexdigest()

        import blueprints.hash_generator.hasher as hasher_mod
        with patch.object(hasher_mod, "_query_hashes_com", return_value=None), \
             patch.object(hasher_mod, "_query_md5decrypt", return_value=None), \
             patch.object(hasher_mod, "_query_nitrxgen", return_value=None):
            res = reverse_lookup_hash(complex_hash)

        self.assertFalse(res["found"])
        self.assertIn("possible_types", res)
        self.assertTrue(res["external_queried"])
        self.assertIsNone(res["source"])

    def test_reverse_lookup_not_found_legacy(self):
        """Backwards-compat test: found=False structure still has possible_types."""
        complex_hash = hashlib.sha256(b"unlikely_to_exist_in_dict_xyz_998877").hexdigest()

        import blueprints.hash_generator.hasher as hasher_mod
        with patch.object(hasher_mod, "_query_hashes_com", return_value=None), \
             patch.object(hasher_mod, "_query_md5decrypt", return_value=None), \
             patch.object(hasher_mod, "_query_nitrxgen", return_value=None):
            res = reverse_lookup_hash(complex_hash)

        self.assertFalse(res["found"])
        self.assertIn("possible_types", res)

    # ------------------------------------------------------------------
    # Response schema validation
    # ------------------------------------------------------------------
    def test_found_response_has_source_field(self):
        """Success response must always include 'source' and 'external_queried'."""
        md5_pwd = hashlib.md5(b"password").hexdigest()
        res = reverse_lookup_hash(md5_pwd)
        self.assertIn("source", res)
        self.assertIn("external_queried", res)

    def test_not_found_response_has_source_field(self):
        """Not-found response must always include 'source' (None) and 'external_queried'."""
        complex_hash = hashlib.sha256(b"definitely_not_in_any_db_zzz").hexdigest()
        import blueprints.hash_generator.hasher as hasher_mod
        with patch.object(hasher_mod, "_query_hashes_com", return_value=None), \
             patch.object(hasher_mod, "_query_md5decrypt", return_value=None), \
             patch.object(hasher_mod, "_query_nitrxgen", return_value=None):
            res = reverse_lookup_hash(complex_hash)
        self.assertIn("source", res)
        self.assertIn("external_queried", res)


if __name__ == "__main__":
    unittest.main()

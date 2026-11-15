"""
Hash Generator & Cryptographic Cipher Blueprint
-----------------------------------------------
Routes and API for one-way hash generation, hash identification/reverse lookup,
and two-way symmetric encryption & decryption.
"""

from __future__ import annotations

from typing import Any, Dict

from flask import Blueprint, jsonify, render_template, request

from .hasher import (
    decrypt_text,
    encrypt_text,
    generate_hashes,
    identify_hash,
    reverse_lookup_hash,
)

hash_bp = Blueprint("hash_generator", __name__)


@hash_bp.route("/tools/hash")
def hash_tool():
    """Dedicated hash & cipher generator tool page."""
    return render_template("tools/hash_generator.html", active_tool="hash-generator")


@hash_bp.route("/api/generate-hash", methods=["POST"])
def api_generate_hash():
    """
    API endpoint to generate cryptographic digests for text.
    """
    payload: Dict[str, Any] = request.get_json(silent=True) or {}
    text = payload.get("text", "")

    try:
        results = generate_hashes(str(text))
        return jsonify({
            "success": True,
            "data": results,
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Hashing error: {str(e)}"}), 500


@hash_bp.route("/api/encrypt-text", methods=["POST"])
def api_encrypt_text():
    """
    API endpoint to encrypt text with AES-256 (Fernet) or classic ciphers.
    """
    payload: Dict[str, Any] = request.get_json(silent=True) or {}
    text = payload.get("text", "")
    key = payload.get("key", "")
    cipher_type = payload.get("cipher_type", "aes")

    try:
        result = encrypt_text(str(text), str(key) if key else None, str(cipher_type))
        return jsonify({
            "success": True,
            "data": result,
        })
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Encryption failed: {str(e)}"}), 500


@hash_bp.route("/api/decrypt-text", methods=["POST"])
def api_decrypt_text():
    """
    API endpoint to decrypt ciphertext back to plaintext.
    """
    payload: Dict[str, Any] = request.get_json(silent=True) or {}
    ciphertext = payload.get("ciphertext", "")
    key = payload.get("key", "")
    cipher_type = payload.get("cipher_type", "aes")

    try:
        result = decrypt_text(str(ciphertext), str(key) if key else None, str(cipher_type))
        return jsonify({
            "success": True,
            "data": result,
        })
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Decryption failed: {str(e)}"}), 500


@hash_bp.route("/api/decrypt-hash", methods=["POST"])
def api_decrypt_hash():
    """
    API endpoint to identify and reverse-lookup/crack a cryptographic hash.
    """
    payload: Dict[str, Any] = request.get_json(silent=True) or {}
    hash_str = payload.get("hash", "")

    try:
        result = reverse_lookup_hash(str(hash_str))
        return jsonify({
            "success": True,
            "data": result,
        })
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Hash lookup failed: {str(e)}"}), 500

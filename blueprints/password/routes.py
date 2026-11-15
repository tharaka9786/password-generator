"""
Password Generator Blueprint
----------------------------
Routes and API for Password and Account Pair Generation.
"""

from __future__ import annotations

import sys
import os
from typing import Any, Dict

from flask import Blueprint, jsonify, render_template, request

# Ensure root directory is accessible for existing modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from generator import (
    DEFAULT_SYMBOL_CHARS,
    generate_multiple_passwords,
    generate_password,
)

password_bp = Blueprint("password", __name__)


@password_bp.route("/tools/password")
def password_tool():
    """Dedicated password generator page."""
    return render_template("tools/password.html", active_tool="password")


@password_bp.route("/tools/account-pair")
def account_pair_tool():
    """Dedicated account pair credential generator page."""
    return render_template("tools/account_pair.html", active_tool="account-pair")


@password_bp.route("/api/generate", methods=["POST"])
def api_generate():
    """
    API endpoint to generate passwords based on customizable criteria.
    """
    payload: Dict[str, Any] = request.get_json(silent=True) or {}

    try:
        length = int(payload.get("length", 16))
        count = int(payload.get("count", 1))
        include_uppercase = bool(payload.get("include_uppercase", True))
        include_lowercase = bool(payload.get("include_lowercase", True))
        include_digits = bool(payload.get("include_digits", True))
        include_symbols = bool(payload.get("include_symbols", True))
        exclude_ambiguous = bool(payload.get("exclude_ambiguous", False))
        custom_symbols = str(payload.get("custom_symbols", DEFAULT_SYMBOL_CHARS))

        if count < 1 or count > 50:
            return jsonify({"success": False, "error": "Count must be between 1 and 50."}), 400

        if length < 4 or length > 128:
            return jsonify({"success": False, "error": "Length must be between 4 and 128."}), 400

        results = generate_multiple_passwords(
            count=count,
            length=length,
            include_uppercase=include_uppercase,
            include_lowercase=include_lowercase,
            include_digits=include_digits,
            include_symbols=include_symbols,
            exclude_ambiguous=exclude_ambiguous,
            custom_symbols=custom_symbols,
        )

        return jsonify({
            "success": True,
            "count": count,
            "passwords": results,
            "primary": results[0],
        })

    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Internal server error: {str(e)}"}), 500

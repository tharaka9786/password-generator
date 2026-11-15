"""
Username Generator Blueprint
----------------------------
Routes and API for Username Generation.
"""

from __future__ import annotations

import sys
import os
from typing import Any, Dict

from flask import Blueprint, jsonify, render_template, request

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from username_generator import (
    generate_multiple_usernames,
    generate_username,
)

username_bp = Blueprint("username", __name__)


@username_bp.route("/tools/username")
def username_tool():
    """Dedicated username generator page."""
    return render_template("tools/username.html", active_tool="username")


@username_bp.route("/api/generate-username", methods=["POST"])
def api_generate_username():
    """
    API endpoint to generate usernames based on customizable criteria.
    """
    payload: Dict[str, Any] = request.get_json(silent=True) or {}

    try:
        count = int(payload.get("count", 1))
        style = str(payload.get("style", "classic"))
        separator = str(payload.get("separator", ""))
        casing = str(payload.get("casing", "title"))
        include_number = bool(payload.get("include_number", True))
        max_length = payload.get("max_length")
        if max_length is not None and str(max_length).strip():
            max_length = int(max_length)
        else:
            max_length = None

        if count < 1 or count > 50:
            return jsonify({"success": False, "error": "Count must be between 1 and 50."}), 400

        results = generate_multiple_usernames(
            count=count,
            style=style,
            separator=separator,
            casing=casing,
            include_number=include_number,
            max_length=max_length,
        )

        return jsonify({
            "success": True,
            "count": count,
            "usernames": results,
            "primary": results[0],
        })

    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Internal server error: {str(e)}"}), 500

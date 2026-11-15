"""
Password Strength Checker Blueprint
-----------------------------------
Routes and API for evaluating password strength and vulnerability.
"""

from __future__ import annotations

from typing import Any, Dict

from flask import Blueprint, jsonify, render_template, request

from .analyzer import analyze_password

strength_bp = Blueprint("strength_checker", __name__)


@strength_bp.route("/tools/strength-checker")
def strength_checker_tool():
    """Dedicated strength analysis tool page."""
    return render_template("tools/strength_checker.html", active_tool="strength-checker")


@strength_bp.route("/api/check-strength", methods=["POST"])
def api_check_strength():
    """
    API endpoint to analyze arbitrary input passwords.
    """
    payload: Dict[str, Any] = request.get_json(silent=True) or {}
    password = str(payload.get("password", ""))

    try:
        analysis = analyze_password(password)
        return jsonify({
            "success": True,
            "analysis": analysis,
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"Analysis error: {str(e)}"}), 500

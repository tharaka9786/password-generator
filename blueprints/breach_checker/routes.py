"""
Breach Checker Blueprint Routes & API Endpoints
-----------------------------------------------
Endpoints for:
1. Web interface: /tools/breach-checker
2. POST /api/check-password-breach: k-Anonymity password compromise lookup
3. POST /api/check-account-breach: Email and identity exposure lookup
"""

from __future__ import annotations

from typing import Any, Dict
from flask import Blueprint, jsonify, render_template, request

from .checker import check_account_breach, check_password_breach

breach_bp = Blueprint("breach_checker", __name__)


@breach_bp.route("/tools/breach-checker")
def breach_checker_tool():
    """Dedicated Data Breach & Credential Leak Auditor page."""
    return render_template("tools/breach_checker.html", active_tool="breach-checker")


@breach_bp.route("/api/check-password-breach", methods=["POST"])
def api_check_password_breach():
    """
    Audit whether an input password is present in public breach databases.
    Operates securely via k-Anonymity.
    """
    payload: Dict[str, Any] = request.get_json(silent=True) or {}
    password = str(payload.get("password", ""))

    try:
        result = check_password_breach(password)
        return jsonify({
            "success": True,
            "data": result,
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Password breach audit failed: {str(e)}",
        }), 500


@breach_bp.route("/api/check-account-breach", methods=["POST"])
def api_check_account_breach():
    """
    Audit whether an email address has been exposed in corporate data breaches.
    """
    payload: Dict[str, Any] = request.get_json(silent=True) or {}
    account = str(payload.get("account", ""))

    try:
        result = check_account_breach(account)
        return jsonify({
            "success": True,
            "data": result,
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Account breach audit failed: {str(e)}",
        }), 500

"""
Sinhala AI Text Humanizer Blueprint
-----------------------------------
Routes for the Sinhala Humanizer v2.0 offline tool.
"""

from __future__ import annotations

from flask import Blueprint, render_template

humanizer_bp = Blueprint("sinhala_humanizer", __name__)


@humanizer_bp.route("/tools/sinhala-humanizer")
def sinhala_humanizer_tool():
    """Dedicated Sinhala AI Text Humanizer tool page."""
    return render_template(
        "tools/sinhala_humanizer.html",
        active_tool="sinhala-humanizer",
    )

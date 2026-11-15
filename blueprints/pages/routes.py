"""
Static Pages Blueprint
----------------------
Handles Home / Landing page, Tools Hub gallery, and About page.
"""

from __future__ import annotations

from flask import Blueprint, render_template, request
from blueprints.translations import get_localized_tools_catalog

pages_bp = Blueprint("pages", __name__)

# Default English catalog for backwards compatibility and tests
TOOLS_CATALOG = get_localized_tools_catalog("en")


@pages_bp.route("/")
def home():
    """Landing page with hero banner and featured tools."""
    lang = request.cookies.get("passforge_lang", "en")
    return render_template("pages/home.html", tools=get_localized_tools_catalog(lang))


@pages_bp.route("/tools")
def tools_hub():
    """Gallery and catalog of all security tools."""
    lang = request.cookies.get("passforge_lang", "en")
    return render_template("pages/tools_hub.html", tools=get_localized_tools_catalog(lang))


@pages_bp.route("/about")
def about():
    """Project info, privacy assurance, and technical documentation."""
    return render_template("pages/about.html")

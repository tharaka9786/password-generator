"""
PassForge Account, Authentication & Vault Routes
------------------------------------------------
Provides user registration, login, logout, dashboard, and encrypted vault / history APIs.
"""

from __future__ import annotations

import re
from typing import Any, Dict
from urllib.parse import urlparse

from flask import (
    Blueprint,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    url_for,
)
from flask_login import current_user, login_required, login_user, logout_user

from blueprints.account.crypto import decrypt_vault_password, encrypt_vault_password
from models import HumanizerHistory, ToolHistory, User, VaultItem, db

account_bp = Blueprint("account", __name__)

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9_\-\.]{3,80}$")


def is_safe_url(target: str | None) -> bool:
    """Ensure redirect URL is local to the current host."""
    if not target:
        return False
    ref_url = urlparse(request.host_url)
    test_url = urlparse(target)
    return test_url.scheme in ("http", "https") and ref_url.netloc == test_url.netloc or not test_url.netloc


# =============================================================================
# Authentication Pages
# =============================================================================

@account_bp.route("/register", methods=["GET", "POST"])
def register():
    """User registration page and handler."""
    if current_user.is_authenticated:
        return redirect(url_for("account.dashboard"))

    if request.method == "POST":
        # Support both form data and JSON payload
        data: Dict[str, Any] = request.get_json(silent=True) or request.form.to_dict()
        username = str(data.get("username", "")).strip()
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))

        errors = []
        if not USERNAME_REGEX.match(username):
            errors.append("Username must be 3-80 alphanumeric characters (underscores, dots, and hyphens allowed).")
        if not EMAIL_REGEX.match(email):
            errors.append("Please enter a valid email address.")
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long.")

        if not errors:
            if User.query.filter_by(username=username).first():
                errors.append("That username is already taken. Please choose another.")
            elif User.query.filter_by(email=email).first():
                errors.append("An account with that email already exists.")

        if errors:
            if request.is_json:
                return jsonify({"success": False, "errors": errors}), 400
            for err in errors:
                flash(err, "error")
            return render_template("account/register.html", username=username, email=email), 400

        # Create new user
        new_user = User(username=username, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        login_user(new_user, remember=True)

        if request.is_json:
            return jsonify({
                "success": True,
                "message": "Account created successfully!",
                "redirect": url_for("account.dashboard"),
            })

        flash("Welcome to PassForge! Your secure account is ready.", "success")
        return redirect(url_for("account.dashboard"))

    return render_template("account/register.html")


@account_bp.route("/login", methods=["GET", "POST"])
def login():
    """User authentication page and handler."""
    if current_user.is_authenticated:
        return redirect(url_for("account.dashboard"))

    if request.method == "POST":
        data: Dict[str, Any] = request.get_json(silent=True) or request.form.to_dict()
        identifier = str(data.get("identifier", "")).strip()
        password = str(data.get("password", ""))
        remember = bool(data.get("remember", True))

        if not identifier or not password:
            error_msg = "Please enter both your username/email and password."
            if request.is_json:
                return jsonify({"success": False, "error": error_msg}), 400
            flash(error_msg, "error")
            return render_template("account/login.html", identifier=identifier), 400

        # Query user by username OR email
        user = User.query.filter(
            (User.username == identifier) | (User.email == identifier.lower())
        ).first()

        if not user or not user.check_password(password):
            error_msg = "Invalid username/email or password."
            if request.is_json:
                return jsonify({"success": False, "error": error_msg}), 401
            flash(error_msg, "error")
            return render_template("account/login.html", identifier=identifier), 401

        login_user(user, remember=remember)

        next_page = request.args.get("next")
        if not is_safe_url(next_page):
            next_page = url_for("account.dashboard")

        if request.is_json:
            return jsonify({
                "success": True,
                "message": "Signed in successfully!",
                "redirect": next_page,
            })

        flash(f"Welcome back, {user.username}!", "success")
        return redirect(next_page)

    return render_template("account/login.html")


@account_bp.route("/logout", methods=["GET", "POST"])
@login_required
def logout():
    """Sign out current user."""
    logout_user()
    flash("You have been signed out.", "info")
    return redirect(url_for("account.login"))


# =============================================================================
# Dashboard Page
# =============================================================================

@account_bp.route("/dashboard")
@login_required
def dashboard():
    """User vault and activity history dashboard."""
    vault_items = VaultItem.query.filter_by(user_id=current_user.id).order_by(VaultItem.created_at.desc()).all()
    humanizer_history = HumanizerHistory.query.filter_by(user_id=current_user.id).order_by(HumanizerHistory.created_at.desc()).all()
    tool_history = ToolHistory.query.filter_by(user_id=current_user.id).order_by(ToolHistory.created_at.desc()).all()

    return render_template(
        "account/dashboard.html",
        vault_items=vault_items,
        humanizer_history=humanizer_history,
        tool_history=tool_history,
    )


# =============================================================================
# Vault & History JSON APIs
# =============================================================================

@account_bp.route("/api/save/vault", methods=["POST"])
@login_required
def save_vault_item():
    """Save an encrypted credential item to user's vault."""
    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()
    username_val = str(data.get("username_value", "")).strip() or None
    raw_password = str(data.get("password", "")).strip()
    category = str(data.get("category", "password")).strip()
    notes = str(data.get("notes", "")).strip() or None

    if not title:
        return jsonify({"success": False, "error": "Title/service name is required."}), 400

    if category not in ("password", "username", "account_pair"):
        category = "password"

    # Encrypt password using Fernet
    encrypted_pw = encrypt_vault_password(raw_password)

    item = VaultItem(
        user_id=current_user.id,
        title=title,
        username_value=username_val,
        encrypted_password=encrypted_pw,
        category=category,
        notes=notes,
    )
    db.session.add(item)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"'{title}' saved securely to your Vault!",
        "item": item.to_dict(),
    })


@account_bp.route("/api/save/humanizer", methods=["POST"])
@login_required
def save_humanizer_history():
    """Save Sinhala humanizer execution record to user's history."""
    data = request.get_json(silent=True) or {}
    mode = str(data.get("mode", "academic")).strip()
    original_text = str(data.get("original_text", "")).strip()
    humanized_text = str(data.get("humanized_text", "")).strip()
    fm_abhaya_text = str(data.get("fm_abhaya_text", "")).strip() or None
    raw_score = data.get("ai_score")

    ai_score = None
    if raw_score is not None:
        try:
            ai_score = float(raw_score)
        except (ValueError, TypeError):
            ai_score = None

    if not original_text or not humanized_text:
        return jsonify({"success": False, "error": "Both original and humanized text are required."}), 400

    record = HumanizerHistory(
        user_id=current_user.id,
        mode=mode,
        original_text=original_text,
        humanized_text=humanized_text,
        fm_abhaya_text=fm_abhaya_text,
        ai_score=ai_score,
    )
    db.session.add(record)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Saved to Sinhala Humanizer history!",
        "item": record.to_dict(),
    })


@account_bp.route("/api/save/activity", methods=["POST"])
@login_required
def save_tool_activity():
    """Save a security tool audit or generation result to user's history."""
    data = request.get_json(silent=True) or {}
    tool_name = str(data.get("tool_name", "")).strip()
    input_summary = str(data.get("input_summary", "")).strip() or None
    result_summary = str(data.get("result_summary", "")).strip()

    if not tool_name or not result_summary:
        return jsonify({"success": False, "error": "Tool name and result summary are required."}), 400

    entry = ToolHistory(
        user_id=current_user.id,
        tool_name=tool_name,
        input_summary=input_summary,
        result_summary=result_summary,
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Tool activity recorded successfully!",
        "item": entry.to_dict(),
    })


@account_bp.route("/api/vault/<int:item_id>/reveal", methods=["GET"])
@login_required
def reveal_vault_password(item_id: int):
    """Decrypt and return password for an item owned by current user."""
    item = VaultItem.query.filter_by(id=item_id, user_id=current_user.id).first()
    if not item:
        return jsonify({"success": False, "error": "Vault item not found or unauthorized."}), 404

    decrypted_pw = decrypt_vault_password(item.encrypted_password)
    return jsonify({
        "success": True,
        "id": item.id,
        "password": decrypted_pw,
    })


@account_bp.route("/api/history/<string:item_type>/<int:item_id>", methods=["DELETE"])
@login_required
def delete_history_item(item_type: str, item_id: int):
    """Delete a vault item or history record owned by current user."""
    clean_type = item_type.lower().strip()

    if clean_type in ("vault", "vault_items"):
        item = VaultItem.query.filter_by(id=item_id, user_id=current_user.id).first()
    elif clean_type in ("humanizer", "humanizer_history"):
        item = HumanizerHistory.query.filter_by(id=item_id, user_id=current_user.id).first()
    elif clean_type in ("activity", "tool", "tool_history"):
        item = ToolHistory.query.filter_by(id=item_id, user_id=current_user.id).first()
    else:
        return jsonify({"success": False, "error": f"Invalid item type: '{item_type}'"}), 400

    if not item:
        return jsonify({"success": False, "error": "Item not found or unauthorized."}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"{clean_type.capitalize()} entry removed successfully.",
    })

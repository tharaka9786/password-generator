"""
Flask Web Application for PassForge — Security & Identity Suite
---------------------------------------------------------------
Modular application utilizing Flask Blueprints for scalable multi-page architecture.
"""

from __future__ import annotations

import os
from flask import Flask, has_request_context, jsonify, make_response, redirect, request, url_for
from flask_login import LoginManager

# Load environment variables from .env if python-dotenv is installed
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from blueprints.pages.routes import pages_bp
from blueprints.password.routes import password_bp
from blueprints.username.routes import username_bp
from blueprints.strength_checker.routes import strength_bp
from blueprints.hash_generator.routes import hash_bp
from blueprints.breach_checker.routes import breach_bp
from blueprints.sinhala_humanizer.routes import humanizer_bp
from blueprints.account.routes import account_bp
from blueprints.translations import (
    DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES,
    get_localized_tools_catalog,
    get_translation,
)
from models import User, db

login_manager = LoginManager()


@login_manager.user_loader
def load_user(user_id: str) -> User | None:
    """Flask-Login user loader callback."""
    try:
        return db.session.get(User, int(user_id))
    except (ValueError, TypeError):
        return None


def create_app(testing: bool = False) -> Flask:
    """Application factory for PassForge."""
    app = Flask(__name__)
    if testing:
        app.config["TESTING"] = True

    # Security configuration
    app.config["SECRET_KEY"] = os.environ.get(
        "SECRET_KEY", "passforge-dev-secret-key-change-in-production"
    )

    # Database configuration
    if app.config.get("TESTING"):
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    else:
        database_url = os.environ.get("DATABASE_URL")
        if database_url:
            app.config["SQLALCHEMY_DATABASE_URI"] = database_url
        else:
            app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///passforge_fallback.db"

    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 280,
        "pool_pre_ping": True,
    }
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize database
    db.init_app(app)

    # Configure Flask-Login
    login_manager.init_app(app)
    login_manager.login_view = "account.login"
    login_manager.login_message = "Please sign in to access your secure vault and history."
    login_manager.login_message_category = "info"

    @login_manager.unauthorized_handler
    def unauthorized():
        if request.path.startswith("/api/") or request.is_json:
            return jsonify({
                "success": False,
                "error": "Authentication required. Please log in to access this feature.",
                "authenticated": False,
            }), 401
        return redirect(url_for("account.login", next=request.url))

    # Register Blueprints
    app.register_blueprint(pages_bp)
    app.register_blueprint(password_bp)
    app.register_blueprint(username_bp)
    app.register_blueprint(strength_bp)
    app.register_blueprint(hash_bp)
    app.register_blueprint(breach_bp)
    app.register_blueprint(humanizer_bp)
    app.register_blueprint(account_bp)

    def get_current_lang() -> str:
        if has_request_context():
            lang = request.cookies.get("passforge_lang", DEFAULT_LANGUAGE)
            if lang in SUPPORTED_LANGUAGES:
                return lang
        return DEFAULT_LANGUAGE

    # Register Jinja globals so macros have direct access to translations
    app.jinja_env.globals["t"] = lambda key: get_translation(key, get_current_lang())
    app.jinja_env.globals["get_tools_catalog"] = lambda: get_localized_tools_catalog(get_current_lang())

    @app.context_processor
    def inject_i18n():
        """Inject current language and translation helper into Jinja templates."""
        lang = get_current_lang()
        return {
            "current_lang": lang,
            "t": lambda key: get_translation(key, lang),
            "get_tools_catalog": lambda: get_localized_tools_catalog(lang),
        }

    @app.route("/api/set-language", methods=["POST"])
    def api_set_language():
        """Set user's preferred language in cookie."""
        payload = request.get_json(silent=True) or {}
        lang = str(payload.get("lang", "en")).lower()
        if lang not in SUPPORTED_LANGUAGES:
            lang = DEFAULT_LANGUAGE

        resp = make_response(jsonify({"success": True, "lang": lang}))
        resp.set_cookie("passforge_lang", lang, max_age=31536000, path="/", samesite="Lax")
        return resp

    @app.route("/api/health")
    def health():
        """Service health check endpoint."""
        return jsonify({
            "status": "ok",
            "app": "PassForge Suite",
            "version": "2.0.0",
        })

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "127.0.0.1")
    debug = os.environ.get("FLASK_DEBUG", "True").lower() in ("true", "1")
    print(f"Starting PassForge Web App on http://{host}:{port} (debug={debug})")
    app.run(host=host, port=port, debug=debug)

"""
PassForge Database Initializer & Migration Tool
-----------------------------------------------
Initializes the PassForge MySQL schema (locally on WAMP or in production on PythonAnywhere).
Ensures the database exists with utf8mb4 character set & collation, runs `db.create_all()`,
and verifies all tables and columns.
"""

from __future__ import annotations

import os
import sys
from urllib.parse import urlparse

# Ensure project root is in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Load environment variables from .env
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(BASE_DIR, ".env"))
except ImportError:
    pass

import pymysql
from sqlalchemy import text
from sqlalchemy.engine import make_url

from app import create_app
from models import HumanizerHistory, ToolHistory, User, VaultItem, db

EXPECTED_TABLES = [
    "users",
    "vault_items",
    "humanizer_history",
    "tool_history",
]


def ensure_database_exists(db_url: str) -> str:
    """Ensure the target MySQL database exists with utf8mb4 charset and collation."""
    url = make_url(db_url)
    db_name = url.database

    if not db_name:
        raise ValueError("DATABASE_URL must specify a database name.")

    if url.drivername.startswith("mysql"):
        host = url.host or "localhost"
        port = url.port or 3306
        user = url.username or "root"
        password = url.password or ""

        print(f"[*] Connecting to MySQL server at {host}:{port} as user '{user}'...")
        try:
            conn = pymysql.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                charset="utf8mb4",
                autocommit=True,
            )
        except pymysql.MySQLError as err:
            print(f"[!] Failed to connect to MySQL on port {port}: {err}")
            # Try fallback ports if on localhost
            if host in ("localhost", "127.0.0.1") and port == 3306:
                for alt_port in (3307, 3308):
                    print(f"[*] Trying alternative WAMP MySQL/MariaDB port {alt_port}...")
                    try:
                        conn = pymysql.connect(
                            host=host,
                            port=alt_port,
                            user=user,
                            password=password,
                            charset="utf8mb4",
                            autocommit=True,
                        )
                        port = alt_port
                        print(f"[+] Successfully connected on alternative port {alt_port}!")
                        break
                    except pymysql.MySQLError:
                        continue
                else:
                    raise

        with conn.cursor() as cursor:
            create_db_sql = (
                f"CREATE DATABASE IF NOT EXISTS `{db_name}` "
                f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
            cursor.execute(create_db_sql)
            print(f"[+] Database `{db_name}` verified (utf8mb4 / utf8mb4_unicode_ci).")

        conn.close()

    return db_name


def init_database() -> bool:
    """Create all ORM tables and print schema verification report."""
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        database_url = "mysql+pymysql://root:@localhost:3306/passforge_db?charset=utf8mb4"
        os.environ["DATABASE_URL"] = database_url

    print("=" * 70)
    print("PassForge Database Initialization")
    print(f"DATABASE_URL: {database_url}")
    print("=" * 70)

    try:
        db_name = ensure_database_exists(database_url)
    except Exception as e:
        print(f"[!] Error ensuring database exists: {e}")
        return False

    app = create_app()

    with app.app_context():
        print("\n[*] Creating all SQLAlchemy models with db.create_all()...")
        db.create_all()
        print("[+] Tables created successfully!")

        print("\n" + "=" * 70)
        print("DATABASE SCHEMA VERIFICATION REPORT")
        print("=" * 70)

        with db.engine.connect() as connection:
            # Query existing tables
            result = connection.execute(text("SHOW TABLES;"))
            tables = [row[0] for row in result.fetchall()]

            print(f"\n[+] Total Tables Found in `{db_name}`: {len(tables)}")
            for tbl in tables:
                status = "✔ OK" if tbl in EXPECTED_TABLES else "  (other)"
                print(f"    - {tbl:<25} {status}")

            missing = set(EXPECTED_TABLES) - set(tables)
            if missing:
                print(f"\n[!] WARNING: Missing expected tables: {missing}")
                return False

            # Inspect columns for each expected table
            print("\n" + "-" * 70)
            print("TABLE COLUMN STRUCTURES")
            print("-" * 70)

            for tbl in EXPECTED_TABLES:
                print(f"\nTABLE: `{tbl}`")
                print(f"{'Field':<22} {'Type':<22} {'Null':<8} {'Key':<6} {'Default'}")
                print("-" * 70)
                col_res = connection.execute(text(f"DESCRIBE `{tbl}`;"))
                for col in col_res.fetchall():
                    field, col_type, null, key, default, extra = col[0], col[1], col[2], col[3], col[4], col[5]
                    print(f"{field:<22} {col_type:<22} {null:<8} {key:<6} {str(default):<15} {extra}")

    print("\n" + "=" * 70)
    print("✔ PassForge database initialization completed successfully!")
    print("=" * 70)
    return True


if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)

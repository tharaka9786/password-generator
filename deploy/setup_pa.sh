#!/usr/bin/env bash
# ==============================================================================
# PassForge - PythonAnywhere Automated Environment Setup Script
# ==============================================================================
set -euo pipefail

# Determine repository root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "--------------------------------------------------------"
echo " Setting up PassForge environment on PythonAnywhere"
echo " Project root: ${PROJECT_ROOT}"
echo "--------------------------------------------------------"

cd "${PROJECT_ROOT}"

# 1. Detect Python 3 runtime
PYTHON_BIN=""
for cmd in python3.12 python3.11 python3.10 python3; do
    if command -v "$cmd" &>/dev/null; then
        PYTHON_BIN="$cmd"
        break
    fi
done

if [ -z "${PYTHON_BIN}" ]; then
    echo "[-] Error: Python 3 was not found in PATH."
    exit 1
fi

echo "[+] Using Python runtime: $($PYTHON_BIN --version) (${PYTHON_BIN})"

# 2. Create virtual environment if not already present
if [ ! -d ".venv" ]; then
    echo "[+] Creating virtual environment at .venv..."
    "$PYTHON_BIN" -m venv .venv
else
    echo "[+] Existing virtual environment found at .venv."
fi

# 3. Activate virtual environment
echo "[+] Activating virtual environment..."
# shellcheck source=/dev/null
source .venv/bin/activate

# 4. Upgrade pip
echo "[+] Upgrading pip..."
pip install --upgrade pip

# 5. Install Python dependencies
echo "[+] Installing project requirements from requirements.txt..."
pip install -r requirements.txt

# 6. Initialize .env file if missing
if [ ! -f ".env" ]; then
    echo "[+] Creating .env from .env.example..."
    cp .env.example .env
    # Generate a random secret key for Flask sessions
    RANDOM_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
    sed -i "s/SECRET_KEY=change-this-to-a-secure-random-secret-key/SECRET_KEY=${RANDOM_KEY}/" .env 2>/dev/null || true
    echo "[+] Generated random Flask SECRET_KEY in .env."
fi

# 7. Run smoke import test
echo "[+] Verifying application import..."
python -c "from app import app; print('✓ PassForge application factory and blueprints loaded successfully!')"

echo ""
echo "========================================================"
echo " Setup complete! Next steps for PythonAnywhere:"
echo " 1. Go to the 'Web' tab in PythonAnywhere dashboard."
echo " 2. Set 'Virtualenv' path to: ${PROJECT_ROOT}/.venv"
echo " 3. Update 'WSGI configuration file' using deploy/pythonanywhere_wsgi.py"
echo " 4. Set Static files mapping: /static/ -> ${PROJECT_ROOT}/static"
echo " 5. Click the green 'Reload' button."
echo "========================================================"

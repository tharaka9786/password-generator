# Deploying PassForge on PythonAnywhere (Free Beginner Plan)

This guide walks you through deploying **PassForge Security & Identity Suite** on [PythonAnywhere](https://www.pythonanywhere.com/) using the Free Beginner tier.

---

## 📋 Overview

- **Production URL**: `https://<YOUR_USERNAME>.pythonanywhere.com/` (served from root `/`)
- **Local Dev URL**: `http://localhost/password-generator/` (Apache/XAMPP/WAMP) or `http://127.0.0.1:5000/` (Flask dev server)
- **WSGI Entrypoint**: `deploy/pythonanywhere_wsgi.py`
- **Virtual Environment**: `/home/<YOUR_USERNAME>/password-generator/.venv`

The frontend (`static/js/shared/api.js`) dynamically detects the base path prefix using `<meta name="base-path">` injected by Jinja2 templates, so the application runs seamlessly at both root `/` and subpaths without hardcoded URLs.

---

## 🚀 Step-by-Step Deployment

### Step 1: Open a Bash Console on PythonAnywhere

1. Log in to your [PythonAnywhere dashboard](https://www.pythonanywhere.com/).
2. Under the **Consoles** tab, click **Bash** to open a new terminal session.

---

### Step 2: Clone or Upload the Repository

In the Bash terminal, clone the PassForge repository into your home directory:

```bash
cd ~
git clone <YOUR_GIT_REPO_URL> password-generator
cd password-generator
```

*(If you are uploading manually, ensure the folder name is `/home/<YOUR_USERNAME>/password-generator`)*.

---

### Step 3: Run the Automated Setup Script

Run the automated setup script to build the virtual environment, install dependencies, and generate `.env`:

```bash
chmod +x deploy/setup_pa.sh
bash deploy/setup_pa.sh
```

This script will:
- Detect Python 3 (3.10 / 3.11 / 3.12).
- Create a dedicated virtual environment at `.venv`.
- Upgrade `pip` and install all dependencies from `requirements.txt`.
- Copy `.env.example` to `.env` and generate a cryptographically random `SECRET_KEY`.
- Run an import test verifying that `app.py` and all Blueprints load without errors.

---

### Step 4: Configure the Web App

1. Go to the **Web** tab on the PythonAnywhere dashboard.
2. Click **Add a new web app**.
3. When prompted:
   - **Domain name**: Your default free domain (`<YOUR_USERNAME>.pythonanywhere.com`).
   - **Select a Python Web framework**: Choose **Manual configuration** *(do NOT select Flask template, as we already have a complete app factory)*.
   - **Python version**: Select **Python 3.10**, **3.11**, or **3.12** (match the version detected in Step 3).
4. Click **Next** to create the web app configuration.

---

### Step 5: Configure Virtualenv & WSGI

#### 1. Set the Virtualenv Path
In the **Virtualenv** section on the Web tab, click the path box and enter:
```text
/home/<YOUR_USERNAME>/password-generator/.venv
```
*(Replace `<YOUR_USERNAME>` with your actual PythonAnywhere username)*.

#### 2. Configure the WSGI File
In the **Code** section, click on the **WSGI configuration file** link (e.g. `/var/www/<YOUR_USERNAME>_pythonanywhere_com_wsgi.py`).

Delete all default boilerplate code in that editor and replace it with:

```python
import os
import sys

# Replace <YOUR_USERNAME> with your actual PythonAnywhere username
USERNAME = '<YOUR_USERNAME>'
PROJECT_DIR = f'/home/{USERNAME}/password-generator'

# Add project root to sys.path
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

# Load .env configuration
env_file = os.path.join(PROJECT_DIR, '.env')
if os.path.exists(env_file):
    try:
        from dotenv import load_dotenv
        load_dotenv(env_file)
    except ImportError:
        pass

# PythonAnywhere WSGI callable
from app import app as application
```

Click **Save** in the top right corner.

---

### Step 6: Configure Static Files Mapping

PythonAnywhere serves static files (CSS, JS, images, fonts) directly via Nginx for high performance:

In the **Static files** section of the Web tab, add the following mapping:

| URL | Directory |
|---|---|
| `/static/` | `/home/<YOUR_USERNAME>/password-generator/static` |

*(Ensure the trailing slash is included in `/static/`)*.

---

### Step 7: Configure Database (MySQL / SQLite)

PassForge supports both MySQL and SQLite. On PythonAnywhere:

#### Option A: Using PythonAnywhere MySQL (Recommended)
1. Go to the **Databases** tab on the PythonAnywhere dashboard.
2. Initialize MySQL by setting your database password.
3. Under **Create a database**, name it `passforge_db` (PythonAnywhere will create `<YOUR_USERNAME>$passforge_db`).
4. Edit `/home/<YOUR_USERNAME>/password-generator/.env` to configure `DATABASE_URL`:
   ```text
   DATABASE_URL=mysql+pymysql://<YOUR_USERNAME>:<YOUR_PASSWORD>@<YOUR_USERNAME>.mysql.pythonanywhere-services.com/<YOUR_USERNAME>$passforge_db?charset=utf8mb4
   ```
5. In a Bash console, initialize the schema:
   ```bash
   cd ~/password-generator
   source .venv/bin/activate
   python deploy/init_db.py
   ```
   *(Alternatively, you can run the SQL schema file directly in the MySQL console: `source deploy/schema_mysql.sql;`)*

#### Option B: Using SQLite (Default Fallback)
If `DATABASE_URL` is omitted from `.env`, PassForge automatically falls back to an internal SQLite database file (`sqlite:///passforge_fallback.db`).

---

### Step 8: Reload and Test

1. Scroll to the top of the **Web** tab.
2. Click the green button: **Reload <YOUR_USERNAME>.pythonanywhere.com**.
3. Visit your website:
   ```text
   https://<YOUR_USERNAME>.pythonanywhere.com/
   ```

Verify all pages and tools load cleanly:
- **Landing / Home**: `https://<YOUR_USERNAME>.pythonanywhere.com/`
- **Tools Hub**: `https://<YOUR_USERNAME>.pythonanywhere.com/tools`
- **Password Generator**: `https://<YOUR_USERNAME>.pythonanywhere.com/tools/password`
- **Username Generator**: `https://<YOUR_USERNAME>.pythonanywhere.com/tools/username`
- **Account Pair**: `https://<YOUR_USERNAME>.pythonanywhere.com/tools/account-pair`
- **Strength Checker**: `https://<YOUR_USERNAME>.pythonanywhere.com/tools/strength-checker`
- **Hash Suite**: `https://<YOUR_USERNAME>.pythonanywhere.com/tools/hash`
- **Data Breach Checker**: `https://<YOUR_USERNAME>.pythonanywhere.com/tools/breach-checker`
- **About & Privacy**: `https://<YOUR_USERNAME>.pythonanywhere.com/about`
- **Health API**: `https://<YOUR_USERNAME>.pythonanywhere.com/api/health`

---

## 🔄 Deploying Future Updates

Whenever you make changes to PassForge, update your PythonAnywhere deployment with these commands:

```bash
cd ~/password-generator
git pull origin main
source .venv/bin/activate
pip install -r requirements.txt
```

Then go to the **Web** tab and click **Reload**.

---

## 🛠️ Troubleshooting

- **500 Internal Server Error**:
  Check the error log linked on your Web tab under **Log files**:
  ```text
  /var/log/<YOUR_USERNAME>.pythonanywhere.com.error.log
  ```
- **Styling or Icons missing (404 on CSS/JS)**:
  Ensure the Static files table has URL `/static/` mapped to `/home/<YOUR_USERNAME>/password-generator/static`.
- **API calls 404**:
  PassForge's `static/js/shared/api.js` reads `<meta name="base-path">`. When hosted on PythonAnywhere, `base-path` is empty (`""`), meaning API calls hit `/api/<endpoint>` at root. Ensure you have not overridden `PASSFORGE_BASE_PATH` in global window scope.
- **PythonAnywhere Free Tier Outbound Proxy**:
  Free accounts on PythonAnywhere route outbound HTTP/HTTPS requests through an HTTP proxy to whitelisted domains. The Have I Been Pwned API (`api.pwnedpasswords.com`) is accessed via standard HTTPS. If rate-limited or blocked, PassForge automatically falls back to its built-in offline compromised password database.

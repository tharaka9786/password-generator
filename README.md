# PassForge — Multi-Page Security & Identity Suite

A complete, extensible multi-page web application built with Python 3, Flask Blueprints, Jinja2 template inheritance, Tailwind CSS, Lucide Icons, and Vanilla ES6 JavaScript, configured to run natively on XAMPP Apache.

---

## 🌟 Available Pages & Tools

| Page / Tool | URL Route | Description |
|---|---|---|
| **Home / Landing** | `/` | Hero section, quick live generator demo, featured tools gallery, and value pillars. |
| **Tools Hub** | `/tools` | Searchable and filterable directory of all security tools with real-time keyword search. |
| **Password Generator** | `/tools/password` | Cryptographically secure passwords powered by Python's `secrets` module (CSPRNG), entropy scoring, and bulk generation. |
| **Username Generator** | `/tools/username` | Creative identity generator across Classic, Tech/Cyber, Gamer Titans, and Minimalist themes with custom separators and casing. |
| **Account Pair** | `/tools/account-pair` | One-click credential generation producing matching username + password with dual copy. |
| **Strength Checker** | `/tools/strength-checker` | Real-time passkey vulnerability auditor evaluating Shannon entropy, composition breakdown, pattern detection, and GPU brute-force time. |
| **Hash & Cipher Suite** | `/tools/hash` | One-way message digests (SHA-256, MD5, SHA-512, BLAKE2b), two-way symmetric AES encryption & decryption, and rainbow hash reverse-lookup/cracking. |
| **Data Breach Checker** | `/tools/breach-checker` | Zero-knowledge password leak audit powered by the Have I Been Pwned API (k-Anonymity SHA-1 prefix model) and email/identity breach exposure search. |
| **Sinhala Humanizer** | `/tools/sinhala-humanizer` | 100% client-side offline text humanization engine converting robotic AI Sinhala into authentic human prose, with Unicode-to-FM Abhaya font conversion and Madura dictionary. |
| **My Vault & History** | `/dashboard` | Authenticated user vault: AES-encrypted credentials, Sinhala text history, and security audit activity logs. |
| **Sign In / Register** | `/login`, `/register` | Flask-Login authentication & user registration with password hashing and session management. |
| **About & Privacy** | `/about` | Technical architecture details, zero-tracking guarantee, and developer extensibility guide. |

---

## 📁 Directory Structure

```
C:\wamp64\www\password-generator\ (or /opt/lampp/htdocs/password-generator/)
│
├── .htaccess                     # Apache configuration (ExecCGI & mod_rewrite)
├── .env.example                  # Environment configuration template
├── DEPLOY_PYTHONANYWHERE.md      # PythonAnywhere production deployment guide
├── index.cgi                     # WSGI-to-CGI bridge for Apache
├── requirements.txt              # Python package dependencies
│
├── deploy/                       # Cloud deployment automation
│   ├── pythonanywhere_wsgi.py    # PythonAnywhere WSGI configuration
│   ├── setup_pa.sh               # Automated PythonAnywhere setup script
│   ├── schema_mysql.sql          # Raw MySQL DDL schema (utf8mb4_unicode_ci)
│   └── init_db.py                # Database initializer & verification script
│
├── app.py                        # Flask App Factory + Blueprint registrations
├── models.py                     # SQLAlchemy ORM models (User, Vault, History)
├── generator.py                  # Core password generator & CLI
├── username_generator.py         # Core username generator & CLI
│
├── blueprints/                   # Modular feature blueprints
│   ├── pages/routes.py           # Home, Tools Hub, About routes
│   ├── password/routes.py        # Password & Account Pair routes + /api/generate
│   ├── username/routes.py        # Username routes + /api/generate-username
│   ├── strength_checker/         # Password auditor logic & /api/check-strength
│   │   ├── analyzer.py
│   │   └── routes.py
│   ├── hash_generator/           # Cryptographic digest logic & /api/generate-hash
│   │   ├── hasher.py
│   │   └── routes.py
│   ├── breach_checker/           # Data breach auditor & /api/check-*-breach
│   │   ├── checker.py
│   │   └── routes.py
│   ├── sinhala_humanizer/        # Sinhala AI text humanizer & FM Abhaya converter
│   │   └── routes.py
│   └── account/                  # Authentication, Vault & History APIs
│       ├── crypto.py             # Fernet AES credential encryption
│       └── routes.py             # Login, register, dashboard & /api/save/*
│
├── templates/
│   ├── base.html                 # Master layout (Navbar, Footer, Toast, CDNs)
│   ├── components/               # Reusable Jinja2 partials and macros
│   │   ├── _navbar.html
│   │   ├── _footer.html
│   │   ├── _toast.html
│   │   └── _tool_card.html       # Macro for rendering tool cards
│   ├── pages/                    # Public site pages
│   │   ├── home.html
│   │   ├── tools_hub.html
│   │   └── about.html
│   ├── account/                  # User account & vault views
│   │   ├── login.html
│   │   ├── register.html
│   │   └── dashboard.html
│   └── tools/                    # Dedicated tool canvases
│       ├── _tool_layout.html     # Intermediate layout (breadcrumbs + sidebar mini-nav)
│       ├── password.html
│       ├── username.html
│       ├── account_pair.html
│       ├── strength_checker.html
│       ├── hash_generator.html
│       ├── breach_checker.html
│       └── sinhala_humanizer.html
│
├── static/
│   ├── css/
│   │   ├── base.css              # Dark theme tokens, typography, ambient glows
│   │   ├── components.css        # Navbar, footer, cards, toast, dropdowns
│   │   └── tools.css             # Tool canvases, sliders, strength meters, hash tables
│   ├── js/
│   │   ├── shared/               # Reusable ES6 utility modules
│   │   │   ├── api.js            # Path-aware fetch wrapper (/password-generator/api/...)
│   │   │   ├── clipboard.js      # One-click copy with toast feedback
│   │   │   ├── toast.js          # Dynamic toast notifications
│   │   │   └── nav.js            # Mobile drawer toggle & Lucide icon triggers
│   │   └── tools/                # Dedicated per-page scripts
│   │       ├── password.js
│   │       ├── username.js
│   │       ├── account-pair.js
│   │       ├── strength-checker.js
│   │       ├── hash-generator.js
│   │       └── breach-checker.js
│   ├── humanizer/                # Offline Sinhala humanizer engine & assets
│   │   ├── app.js                # Humanizer UI controller & base-path resolver
│   │   ├── offlineEngineBundle.js # Bundled offline NLP analysis engine
│   │   ├── unicodeToFm.js        # Real-time Unicode to FM Abhaya converter
│   │   ├── style.css             # Scoped Humanizer workspace styling
│   │   ├── fonts/FMAbhaya.ttf    # Sinhala FM font asset
│   │   └── data/                 # Madura dictionary lookup datasets
│   │       ├── en2sn.json
│   │       └── sn2en.json
│   └── img/
│       └── favicon.svg           # Scalable SVG site favicon
│
└── tests/                        # Automated unit and integration test suite
    ├── test_generator.py
    ├── test_username_generator.py
    ├── test_strength_checker.py
    ├── test_hash_generator.py
    ├── test_breach_checker.py
    ├── test_models.py            # Unit tests for SQLAlchemy ORM models
    ├── test_account.py           # Integration tests for Auth, Vault & History
    └── test_routes.py            # Integration test for all 12 pages and 12 APIs
```

---

## 🚀 How to Run

### 1. Run via WampServer / XAMPP (Apache)
Since the project is installed in `C:\wamp64\www\password-generator`, Apache serves it automatically on demand.
Ensure Apache is running in WampServer, then visit in your web browser:

**[http://localhost/password-generator/](http://localhost/password-generator/)**

### 2. Standalone Development Server
To run Flask's built-in development server with live reload:

```powershell
cd C:\wamp64\www\password-generator
.\.venv\Scripts\python.exe app.py
```
Then visit: `http://127.0.0.1:5000/`

### 3. Deploy to PythonAnywhere (Free Cloud Hosting)
Follow the step-by-step instructions in [DEPLOY_PYTHONANYWHERE.md](DEPLOY_PYTHONANYWHERE.md) to set up and run the app on PythonAnywhere with root-path routing (`https://<username>.pythonanywhere.com`).

---

## 💻 CLI Usage

You can also run the generator utilities directly in your terminal:

```powershell
cd C:\wamp64\www\password-generator

# Generate a 24-character password:
.\.venv\Scripts\python.exe generator.py -l 24 -c 1

# Generate 5 gamer usernames:
.\.venv\Scripts\python.exe username_generator.py -s gamer -c 5
```

---

## 🧪 Running Automated Tests

Run the complete test suite (87 unit and integration tests):

```powershell
cd C:\wamp64\www\password-generator
.\.venv\Scripts\python.exe -m unittest discover tests
```

---

## 🧩 Adding New Pages / Tools (Extensibility)

PassForge's Blueprint architecture is designed so you can add new utilities in 4 quick steps without modifying existing code:

1. **Create a Blueprint folder**: e.g., `blueprints/qr_generator/` with `routes.py` and logic.
2. **Register the Blueprint in `app.py`**:
   ```python
   from blueprints.qr_generator.routes import qr_bp
   app.register_blueprint(qr_bp)
   ```
3. **Create the HTML template**: extend `tools/_tool_layout.html` to automatically get the navbar, breadcrumbs, sidebar, and footer.
4. **Register in `TOOLS_CATALOG`**: add a dictionary item in `blueprints/pages/routes.py` so it appears in the Tools Hub search and on the Home page.

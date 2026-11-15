"""
PythonAnywhere WSGI Configuration for PassForge
------------------------------------------------
This file configures the WSGI entrypoint for hosting PassForge on PythonAnywhere.

Instructions for PythonAnywhere:
1. Go to the "Web" tab on pythonanywhere.com.
2. Click on the link next to "WSGI configuration file".
3. Replace its contents with this file.
4. Replace '<YOUR_USERNAME>' below with your actual PythonAnywhere username (in lowercase).
5. Save the file and click "Reload <your-username>.pythonanywhere.com".
"""

import os
import sys

# 1. Define paths (Replace <YOUR_USERNAME> with your actual PythonAnywhere username)
USERNAME = '<YOUR_USERNAME>'
PROJECT_DIR = f'/home/{USERNAME}/password-generator'

# 2. Add project directory to sys.path so blueprints and modules can be imported
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

# 3. Load environment variables from .env if present
env_file = os.path.join(PROJECT_DIR, '.env')
if os.path.exists(env_file):
    try:
        from dotenv import load_dotenv
        load_dotenv(env_file)
    except ImportError:
        pass

# 4. Import the Flask application instance
# PythonAnywhere's WSGI server expects the callable to be named 'application'
from app import app as application

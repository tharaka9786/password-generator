#!C:/wamp64/www/password-generator/.venv/Scripts/python.exe
import sys
import os
from wsgiref.handlers import CGIHandler

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app

class ReverseProxied:
    def __init__(self, application):
        self.application = application

    def __call__(self, environ, start_response):
        # Normalize SCRIPT_NAME for XAMPP subfolder
        script_name = environ.get('SCRIPT_NAME', '')
        if script_name.endswith('index.cgi') or script_name.endswith('index.py'):
            environ['SCRIPT_NAME'] = os.path.dirname(script_name)
        return self.application(environ, start_response)

app.wsgi_app = ReverseProxied(app.wsgi_app)

if __name__ == '__main__':
    CGIHandler().run(app)

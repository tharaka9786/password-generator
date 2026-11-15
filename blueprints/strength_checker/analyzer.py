"""
Strength Checker Analyzer
-------------------------
Detailed password entropy, character composition, pattern detection,
and crack time analysis.
"""

from __future__ import annotations

import math
import re
from typing import Any, Dict, List

COMMON_PATTERNS = [
    r"1234", r"abcd", r"qwerty", r"password", r"admin", r"welcome",
    r"letmein", r"monkey", r"dragon", r"master", r"football"
]


def analyze_password(password: str) -> Dict[str, Any]:
    """
    Perform deep security analysis on an input password.
    """
    if not password:
        return {
            "score": 0,
            "label": "Empty",
            "color": "#64748b",
            "entropy": 0.0,
            "crack_time": "Instantly",
            "length": 0,
            "composition": {
                "uppercase": 0,
                "lowercase": 0,
                "digits": 0,
                "symbols": 0,
            },
            "findings": ["No password provided."],
            "tips": ["Enter or generate a password to analyze its strength."],
        }

    length = len(password)
    upper_count = sum(1 for c in password if c.isupper())
    lower_count = sum(1 for c in password if c.islower())
    digit_count = sum(1 for c in password if c.isdigit())
    symbol_count = sum(1 for c in password if not c.isalnum() and not c.isspace())

    pool_size = 0
    if upper_count > 0:
        pool_size += 26
    if lower_count > 0:
        pool_size += 26
    if digit_count > 0:
        pool_size += 10
    if symbol_count > 0:
        pool_size += 32

    # Calculate raw Shannon entropy
    entropy = round(length * math.log2(max(pool_size, 2)), 2)

    findings: List[str] = []
    tips: List[str] = []

    # Penalty and pattern detections
    penalties = 0

    # Check for simple repeated characters (e.g., 'aaa')
    if re.search(r"(.)\1{2,}", password):
        penalties += 10
        findings.append("⚠️ Contains repeating characters (3+ identical in a row)")
        tips.append("Avoid consecutive repeating characters like 'aaa' or '111'.")

    # Check for common sequences / dictionary terms
    pwd_lower = password.lower()
    for pattern in COMMON_PATTERNS:
        if pattern in pwd_lower:
            penalties += 15
            findings.append(f"⚠️ Contains predictable pattern: '{pattern}'")
            tips.append(f"Replace common word '{pattern}' with unpredictable characters.")

    effective_entropy = max(0.0, round(entropy - penalties, 2))

    # Evaluate character variety
    variety_count = sum(1 for count in [upper_count, lower_count, digit_count, symbol_count] if count > 0)
    if variety_count >= 3:
        findings.append("✅ Diverse character mix (good entropy distribution)")
    else:
        tips.append("Include a mix of uppercase, lowercase, numbers, and special symbols.")

    if length >= 16:
        findings.append(f"✅ Strong length ({length} characters)")
    elif length >= 12:
        findings.append(f"ℹ️ Acceptable length ({length} characters)")
        tips.append("Increasing length to 16+ characters significantly increases brute-force protection.")
    else:
        findings.append(f"❌ Short length ({length} characters)")
        tips.append("Passkeys shorter than 12 characters are vulnerable to modern GPU clusters.")

    # Strength scoring
    if effective_entropy < 35:
        score = 1
        label = "Very Weak"
        color = "#ef4444"
        crack_time = "Instantly (< 1 sec)"
    elif effective_entropy < 50:
        score = 2
        label = "Weak"
        color = "#f97316"
        crack_time = "Seconds to hours"
    elif effective_entropy < 65:
        score = 3
        label = "Fair"
        color = "#eab308"
        crack_time = "Days to months"
    elif effective_entropy < 80:
        score = 4
        label = "Strong"
        color = "#22c55e"
        crack_time = "Years to centuries"
    else:
        score = 5
        label = "Very Strong"
        color = "#06b6d4"
        crack_time = "Millennia+ (Uncrackable with modern hardware)"

    if not tips:
        tips.append("Excellent passkey! Store it safely in an encrypted password manager.")

    return {
        "score": score,
        "label": label,
        "color": color,
        "entropy": effective_entropy,
        "raw_entropy": entropy,
        "pool_size": pool_size,
        "crack_time": crack_time,
        "length": length,
        "composition": {
            "uppercase": upper_count,
            "lowercase": lower_count,
            "digits": digit_count,
            "symbols": symbol_count,
        },
        "findings": findings,
        "tips": tips,
    }

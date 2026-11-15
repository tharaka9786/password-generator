"""
Password Generator Engine
-------------------------
Cryptographically secure password generation module using Python's `secrets` module.
Includes strength metrics, Shannon entropy calculation, and customizable character pools.
"""

from __future__ import annotations

import math
import secrets
import string
from typing import Any, Dict, List, Set

# Character set definitions
LOWERCASE_CHARS = string.ascii_lowercase
UPPERCASE_CHARS = string.ascii_uppercase
DIGIT_CHARS = string.digits
DEFAULT_SYMBOL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?"
AMBIGUOUS_CHARS: Set[str] = set("il1Lo0O`'\"~")


def calculate_entropy(length: int, pool_size: int) -> float:
    """
    Calculate Shannon entropy in bits for a given password length and pool size.
    Formula: Entropy = length * log2(pool_size)
    """
    if length <= 0 or pool_size <= 0:
        return 0.0
    return round(length * math.log2(pool_size), 2)


def get_strength_rating(entropy: float) -> Dict[str, Any]:
    """
    Categorize entropy into a human-readable strength rating and display styling.
    """
    if entropy < 36:
        return {
            "score": 1,
            "label": "Very Weak",
            "color": "#ef4444",  # red
            "crack_time": "Instantly",
        }
    if entropy < 50:
        return {
            "score": 2,
            "label": "Weak",
            "color": "#f97316",  # orange
            "crack_time": "Minutes to hours",
        }
    if entropy < 65:
        return {
            "score": 3,
            "label": "Fair",
            "color": "#eab308",  # yellow
            "crack_time": "Weeks to months",
        }
    if entropy < 80:
        return {
            "score": 4,
            "label": "Strong",
            "color": "#22c55e",  # green
            "crack_time": "Years to centuries",
        }
    return {
        "score": 5,
        "label": "Very Strong",
        "color": "#06b6d4",  # cyan
        "crack_time": "Millennia+",
    }


def generate_password(
    length: int = 16,
    include_uppercase: bool = True,
    include_lowercase: bool = True,
    include_digits: bool = True,
    include_symbols: bool = True,
    exclude_ambiguous: bool = False,
    custom_symbols: str = DEFAULT_SYMBOL_CHARS,
) -> Dict[str, Any]:
    """
    Generate a cryptographically secure random password.

    Args:
        length: Number of characters (minimum 4, maximum 128).
        include_uppercase: Whether to include 'A'-'Z'.
        include_lowercase: Whether to include 'a'-'z'.
        include_digits: Whether to include '0'-'9'.
        include_symbols: Whether to include special symbols.
        exclude_ambiguous: Whether to exclude visually similar characters (e.g. l, 1, O, 0).
        custom_symbols: Custom symbol set to use if include_symbols is True.

    Returns:
        Dict containing password, length, entropy, pool_size, and strength details.
    """
    if not isinstance(length, int) or length < 4 or length > 128:
        raise ValueError("Password length must be an integer between 4 and 128.")

    active_pools: List[str] = []

    def clean_pool(pool: str) -> str:
        if exclude_ambiguous:
            return "".join(c for c in pool if c not in AMBIGUOUS_CHARS)
        return pool

    if include_lowercase:
        pool = clean_pool(LOWERCASE_CHARS)
        if pool:
            active_pools.append(pool)

    if include_uppercase:
        pool = clean_pool(UPPERCASE_CHARS)
        if pool:
            active_pools.append(pool)

    if include_digits:
        pool = clean_pool(DIGIT_CHARS)
        if pool:
            active_pools.append(pool)

    if include_symbols:
        symbol_source = custom_symbols if custom_symbols else DEFAULT_SYMBOL_CHARS
        pool = clean_pool(symbol_source)
        if pool:
            active_pools.append(pool)

    if not active_pools:
        raise ValueError("At least one character set must be selected.")

    if length < len(active_pools):
        raise ValueError(
            f"Length {length} is too short to include at least one character from each of the "
            f"{len(active_pools)} selected character sets."
        )

    # 1. Guarantee at least one character from each selected category
    password_chars: List[str] = [secrets.choice(pool) for pool in active_pools]

    # 2. Fill remaining characters from combined pool
    combined_pool = "".join(active_pools)
    remaining_length = length - len(password_chars)
    for _ in range(remaining_length):
        password_chars.append(secrets.choice(combined_pool))

    # 3. Cryptographically secure in-place shuffle
    secrets.SystemRandom().shuffle(password_chars)
    final_password = "".join(password_chars)

    # 4. Strength calculation
    unique_pool_size = len(set(combined_pool))
    entropy = calculate_entropy(length, unique_pool_size)
    strength = get_strength_rating(entropy)

    return {
        "password": final_password,
        "length": length,
        "entropy": entropy,
        "pool_size": unique_pool_size,
        "strength": strength,
    }


def generate_multiple_passwords(
    count: int = 1,
    length: int = 16,
    include_uppercase: bool = True,
    include_lowercase: bool = True,
    include_digits: bool = True,
    include_symbols: bool = True,
    exclude_ambiguous: bool = False,
    custom_symbols: str = DEFAULT_SYMBOL_CHARS,
) -> List[Dict[str, Any]]:
    """
    Generate multiple passwords with the same criteria.
    """
    if not isinstance(count, int) or count < 1 or count > 50:
        raise ValueError("Count must be an integer between 1 and 50.")

    return [
        generate_password(
            length=length,
            include_uppercase=include_uppercase,
            include_lowercase=include_lowercase,
            include_digits=include_digits,
            include_symbols=include_symbols,
            exclude_ambiguous=exclude_ambiguous,
            custom_symbols=custom_symbols,
        )
        for _ in range(count)
    ]


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Cryptographically secure password generator.")
    parser.add_argument("-l", "--length", type=int, default=16, help="Password length (default: 16)")
    parser.add_argument("-c", "--count", type=int, default=1, help="Number of passwords to generate (default: 1)")
    parser.add_argument("--no-upper", action="store_true", help="Exclude uppercase letters")
    parser.add_argument("--no-lower", action="store_true", help="Exclude lowercase letters")
    parser.add_argument("--no-digits", action="store_true", help="Exclude numbers")
    parser.add_argument("--no-symbols", action="store_true", help="Exclude symbols")
    parser.add_argument("--exclude-ambiguous", action="store_true", help="Exclude visually ambiguous characters (l, 1, O, 0)")

    args = parser.parse_args()

    try:
        pwds = generate_multiple_passwords(
            count=args.count,
            length=args.length,
            include_uppercase=not args.no_upper,
            include_lowercase=not args.no_lower,
            include_digits=not args.no_digits,
            include_symbols=not args.no_symbols,
            exclude_ambiguous=args.exclude_ambiguous,
        )

        for p in pwds:
            print(f"Password : {p['password']}")
            print(f"Entropy  : {p['entropy']} bits ({p['strength']['label']})")
            print(f"Crack Est: {p['strength']['crack_time']}")
            if len(pwds) > 1:
                print("-" * 40)
    except Exception as exc:
        print(f"Error: {exc}")


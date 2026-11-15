"""
Username Generator Engine
-------------------------
Generates memorable, unique, and customizable usernames using cryptographically
secure selection from curated word pools.
"""

from __future__ import annotations

import secrets
from typing import Any, Dict, List, Optional

# Curated word pools for rich, friendly, and cool usernames
ADJECTIVES = [
    "Swift", "Silent", "Cosmic", "Brave", "Shadow", "Neon", "Crimson", "Golden",
    "Silver", "Mystic", "Iron", "Storm", "Frost", "Solar", "Lunar", "Cyber",
    "Wild", "Vivid", "Apex", "Nova", "Echo", "Noble", "Stealth", "Radiant",
    "Phantom", "Blazing", "Crystal", "Turbo", "Vortex", "Infinite", "Electric",
    "Stellar", "Hyper", "Prime", "Ancient", "Rapid", "Amber", "Velvet", "Giga",
    "Savage", "Ghost", "Zenith", "Sonic", "Thunder", "Titan", "Spectral", "Pulse",
    "Ember", "Cobalt", "Pixel", "Omega", "Astral", "Atomic", "Chrono", "Zero"
]

NOUNS = [
    "Falcon", "Wolf", "Tiger", "Fox", "Hawk", "Eagle", "Viper", "Panther",
    "Dragon", "Raven", "Knight", "Hunter", "Ronin", "Pilot", "Walker", "Ranger",
    "Phoenix", "Cipher", "Drifter", "Samurai", "Striker", "Specter", "Voyager",
    "Glitch", "Spark", "Blade", "Shield", "Panda", "Bear", "Otter", "Cobra",
    "Nomad", "Runner", "Titan", "Shadow", "Rider", "Seeker", "Warrior", "Forge",
    "Ghost", "Scout", "Ninja", "Rebel", "Nexus", "Matrix", "Sniper", "Matrix",
    "Wanderer", "Comet", "Meteor", "Horizon", "Prowler", "Archer", "Guardian"
]

TECH_WORDS = [
    "Byte", "Pixel", "Kernel", "Vector", "Node", "Bit", "Matrix", "Cyber",
    "Data", "Proxy", "Logic", "Packet", "Hash", "Cloud", "Script", "Stack",
    "Tensor", "Neural", "Laser", "Quantum", "Silicon", "Fiber", "Cache", "Flux"
]

GAMER_TITANS = [
    "Valkyrie", "Leviathan", "Juggernaut", "Overlord", "Immortal", "Crusader",
    "Centurion", "Gladiator", "Vanguard", "Predator", "Executioner", "Nemesis"
]


def format_casing(words: List[str], casing: str) -> List[str]:
    """Format casing of words: 'title', 'lower', or 'upper'."""
    if casing == "lower":
        return [w.lower() for w in words]
    if casing == "upper":
        return [w.upper() for w in words]
    # Default: TitleCase
    return [w.capitalize() for w in words]


def generate_username(
    style: str = "classic",
    separator: str = "",
    casing: str = "title",
    include_number: bool = True,
    max_length: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Generate a single customizable username.

    Args:
        style: 'classic' (Adjective + Noun), 'tech' (Tech Prefix + Noun),
               'gamer' (Adjective + Gamer Titan), 'minimal' (Adjective or Noun only).
        separator: Character separating parts ('', '_', '-', '.').
        casing: 'title', 'lower', 'upper'.
        include_number: Whether to append a 2-3 digit number.
        max_length: Maximum allowed character length (if exceeded, retries or truncates).

    Returns:
        Dict containing username, style, components, and length.
    """
    # Allowed separators
    if separator not in ("", "_", "-", "."):
        separator = ""

    attempts = 0
    max_attempts = 20

    while attempts < max_attempts:
        attempts += 1

        if style == "tech":
            part1 = secrets.choice(TECH_WORDS)
            part2 = secrets.choice(NOUNS)
            parts = [part1, part2]
        elif style == "gamer":
            part1 = secrets.choice(ADJECTIVES)
            part2 = secrets.choice(GAMER_TITANS)
            parts = [part1, part2]
        elif style == "minimal":
            part1 = secrets.choice(ADJECTIVES + NOUNS)
            parts = [part1]
        else:  # 'classic'
            part1 = secrets.choice(ADJECTIVES)
            part2 = secrets.choice(NOUNS)
            parts = [part1, part2]

        formatted_parts = format_casing(parts, casing)
        base_username = separator.join(formatted_parts)

        number_suffix = ""
        if include_number:
            # Generate 2 to 3 digit random number
            rand_num = secrets.choice([
                str(secrets.randbelow(90) + 10),    # 10 - 99
                str(secrets.randbelow(900) + 100),  # 100 - 999
            ])
            number_suffix = f"{separator}{rand_num}" if separator else rand_num

        final_username = f"{base_username}{number_suffix}"

        if max_length is not None and max_length > 0:
            if len(final_username) <= max_length:
                break
        else:
            break

    # If still over max_length, truncate cleanly
    if max_length and len(final_username) > max_length:
        final_username = final_username[:max_length]

    return {
        "username": final_username,
        "style": style,
        "length": len(final_username),
        "separator": separator,
        "casing": casing,
        "has_number": include_number,
    }


def generate_multiple_usernames(
    count: int = 1,
    style: str = "classic",
    separator: str = "",
    casing: str = "title",
    include_number: bool = True,
    max_length: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """
    Generate multiple unique usernames.
    """
    if not isinstance(count, int) or count < 1 or count > 50:
        raise ValueError("Count must be an integer between 1 and 50.")

    results: List[Dict[str, Any]] = []
    seen = set()

    for _ in range(count * 3):  # allow cushion for uniqueness
        item = generate_username(
            style=style,
            separator=separator,
            casing=casing,
            include_number=include_number,
            max_length=max_length,
        )
        if item["username"] not in seen:
            seen.add(item["username"])
            results.append(item)
            if len(results) == count:
                break

    # If count not met, fill remainder
    while len(results) < count:
        results.append(
            generate_username(
                style=style,
                separator=separator,
                casing=casing,
                include_number=include_number,
                max_length=max_length,
            )
        )

    return results


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Cryptographically secure username generator.")
    parser.add_argument("-c", "--count", type=int, default=5, help="Number of usernames (default: 5)")
    parser.add_argument("-s", "--style", choices=["classic", "tech", "gamer", "minimal"], default="classic", help="Naming style")
    parser.add_argument("--sep", choices=["", "_", "-", "."], default="", help="Separator between words")
    parser.add_argument("--case", choices=["title", "lower", "upper"], default="title", help="Casing style")
    parser.add_argument("--no-number", action="store_true", help="Do not append random numbers")
    parser.add_argument("-m", "--max-length", type=int, default=None, help="Maximum length limit")

    args = parser.parse_args()

    usernames = generate_multiple_usernames(
        count=args.count,
        style=args.style,
        separator=args.sep,
        casing=args.case,
        include_number=not args.no_number,
        max_length=args.max_length,
    )

    print(f"Generated {len(usernames)} usernames ({args.style}):")
    for u in usernames:
        print(f"  • {u['username']} (length: {u['length']})")

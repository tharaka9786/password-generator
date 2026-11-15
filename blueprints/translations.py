"""
Internationalization (i18n) Engine for PassForge
-------------------------------------------------
Supports English (en) and Sinhala (si) across all pages, navigation, and tools.
"""

from __future__ import annotations

from typing import Any, Dict, List

SUPPORTED_LANGUAGES = ("en", "si")
DEFAULT_LANGUAGE = "en"

TRANSLATIONS: Dict[str, Dict[str, str]] = {
    # -------------------------------------------------------------
    # Navigation & Global
    # -------------------------------------------------------------
    "nav.brand": {
        "en": "PassForge",
        "si": "PassForge",
    },
    "nav.home": {
        "en": "Home",
        "si": "මුල් පිටුව",
    },
    "nav.tools": {
        "en": "Tools",
        "si": "මෙවලම්",
    },
    "nav.about": {
        "en": "About",
        "si": "අප ගැන",
    },
    "nav.all_tools": {
        "en": "Browse All Tools Hub",
        "si": "සියලු මෙවලම් මධ්‍යස්ථානය",
    },
    "nav.language": {
        "en": "Language",
        "si": "භාෂාව",
    },
    "footer.built_with": {
        "en": "PassForge Security & Identity Suite",
        "si": "PassForge ආරක්ෂණ සහ අනන්‍යතා මෙවලම් කට්ටලය",
    },
    "footer.tagline": {
        "en": "Built with Python standard library secrets CSPRNG & Flask. Zero tracking, client-first encryption.",
        "si": "Python සම්මත පුස්තකාල secrets CSPRNG සහ Flask සමඟ නිර්මාණය කර ඇත. ශුන්‍ය ලුහුබැඳීම, සේවාදායක-ප්‍රමුඛ සංකේතනය.",
    },
    "footer.home": {
        "en": "Home",
        "si": "මුල් පිටුව",
    },
    "footer.tools_hub": {
        "en": "Tools Hub",
        "si": "මෙවලම් මධ්‍යස්ථානය",
    },
    "footer.about_privacy": {
        "en": "About & Privacy",
        "si": "විස්තර සහ පෞද්ගලිකත්වය",
    },
    "sidebar.title": {
        "en": "All Tools",
        "si": "සියලු මෙවලම්",
    },

    # -------------------------------------------------------------
    # Tool Names & Descriptions
    # -------------------------------------------------------------
    "tool.password.title": {
        "en": "Password Generator",
        "si": "මුරපද උත්පාදකය",
    },
    "tool.password.desc": {
        "en": "Generate cryptographically secure random passwords with configurable character sets and Shannon entropy scoring.",
        "si": "වින්‍යාසගත කළ හැකි අක්ෂර කට්ටල සහ ෂැනන් එන්ට්‍රොපි ලකුණු සමඟ ගුප්ත ලේඛනගතව ආරක්ෂිත අහඹු මුරපද උත්පාදනය කරන්න.",
    },
    "tool.username.title": {
        "en": "Username Generator",
        "si": "පරිශීලක නාම උත්පාදකය",
    },
    "tool.username.desc": {
        "en": "Create memorable, creative usernames across themes: Classic, Tech/Cyber, Gamer Titans, and Minimalist.",
        "si": "ක්ලැසික්, තාක්ෂණික/සයිබර්, ගේමර් සහ අවම තේමා ඔස්සේ මතකයේ රැඳෙන නිර්මාණශීලී පරිශීලක නාම සාදන්න.",
    },
    "tool.account_pair.title": {
        "en": "Account Pair Generator",
        "si": "ගිණුම් යුගල උත්පාදකය",
    },
    "tool.account_pair.desc": {
        "en": "Generate matching username and secure password credentials simultaneously with one-click dual clipboard copy.",
        "si": "එකවර ගැළපෙන පරිශීලක නාමයක් සහ ආරක්ෂිත මුරපදයක් සාදා එක් ක්ලික් කිරීමකින් පිටපත් කරගන්න.",
    },
    "tool.strength.title": {
        "en": "Password Strength Checker",
        "si": "මුරපද ශක්තිය පරීක්ෂකය",
    },
    "tool.strength.desc": {
        "en": "Analyze your existing passkeys with Shannon entropy calculation, dictionary pattern detection, and crack time estimation.",
        "si": "ෂැනන් එන්ට්‍රොපි ගණනය කිරීම්, ශබ්දකෝෂ රටා හඳුනාගැනීම සහ බිඳහෙලීමේ කාල ඇස්තමේන්තුව සමඟ පවතින මුරපද විශ්ලේෂණය කරන්න.",
    },
    "tool.hash.title": {
        "en": "Hash Generator",
        "si": "හෑෂ් උත්පාදකය",
    },
    "tool.hash.desc": {
        "en": "Compute instant cryptographic hashes including MD5, SHA-1, SHA-256, SHA-512, and BLAKE2b digests.",
        "si": "MD5, SHA-1, SHA-256, SHA-512, සහ BLAKE2b ඇතුළු ක්ෂණික ගුප්ත ලේඛන හෑෂ් ගණනය කරන්න.",
    },
    "tool.breach.title": {
        "en": "Data Breach Checker",
        "si": "දත්ත කාන්දුවීම් පරීක්ෂකය",
    },
    "tool.breach.desc": {
        "en": "Check if your passwords or email accounts have been compromised in corporate breaches using zero-knowledge k-Anonymity.",
        "si": "බිංදු-දැනුම k-Anonymity තාක්ෂණයෙන් ඔබේ මුරපද හෝ ඊමේල් ගිණුම් සමාගම් දත්ත කාන්දුවීම්වලට හසුවී ඇත්දැයි පරීක්ෂා කරන්න.",
    },

    # -------------------------------------------------------------
    # Common Actions & Badges
    # -------------------------------------------------------------
    "action.copy": {
        "en": "Copy",
        "si": "පිටපත්",
    },
    "action.copied": {
        "en": "Copied!",
        "si": "පිටපත් විය!",
    },
    "action.generate": {
        "en": "Generate",
        "si": "උත්පාදනය කරන්න",
    },
    "action.clear": {
        "en": "Clear",
        "si": "ඉවත් කරන්න",
    },
    "action.search": {
        "en": "Search",
        "si": "සොයන්න",
    },
    "action.lookup": {
        "en": "Lookup",
        "si": "සොයන්න",
    },
    "action.open_tool": {
        "en": "Open Tool",
        "si": "මෙවලම අරඹන්න",
    },
    "label.password_length": {
        "en": "Password Length",
        "si": "මුරපදයේ දිග",
    },
    "label.uppercase": {
        "en": "Uppercase Letters",
        "si": "ලොකු අකුරු (A-Z)",
    },
    "label.lowercase": {
        "en": "Lowercase Letters",
        "si": "කුඩා අකුරු (a-z)",
    },
    "label.digits": {
        "en": "Numbers / Digits",
        "si": "අංක (0-9)",
    },
    "label.symbols": {
        "en": "Special Symbols",
        "si": "විශේෂ සංකේත (!@#$)",
    },
    "label.ambiguous": {
        "en": "Avoid Ambiguous Characters",
        "si": "අපැහැදිලි අක්ෂර බැහැර කරන්න",
    },
    "label.ambiguous_hint": {
        "en": "Excludes: l, 1, I, O, 0, `, ', \"",
        "si": "බැහැර කරන්නේ: l, 1, I, O, 0, `, ', \"",
    },
    "label.generate_multiple": {
        "en": "Generate Multiple:",
        "si": "එකවර කිහිපයක් සාදන්න:",
    },
    "label.session_history": {
        "en": "Session History",
        "si": "මෙම වාරයේ ඉතිහාසය",
    },
    "label.history_empty": {
        "en": "Generated passwords will appear here.",
        "si": "උත්පාදනය කළ මුරපද මෙහි දිස්වනු ඇත.",
    },
    "badge.csprng": {
        "en": "CSPRNG",
        "si": "CSPRNG",
    },
    "badge.creative": {
        "en": "Creative",
        "si": "නිර්මාණශීලී",
    },
    "badge.combo": {
        "en": "Combo",
        "si": "යුගල",
    },
    "badge.audit": {
        "en": "Audit",
        "si": "විගණනය",
    },
    "badge.crypto": {
        "en": "Crypto",
        "si": "ගුප්ත ලේඛන",
    },
    "badge.live_audit": {
        "en": "Live Audit",
        "si": "සජීවී විගණනය",
    },

    # -------------------------------------------------------------
    # Home Page
    # -------------------------------------------------------------
    "home.badge": {
        "en": "Python CSPRNG · Zero Tracking · Client First",
        "si": "Python CSPRNG · ශුන්‍ය ලුහුබැඳීම · සේවාදායක-ප්‍රමුඛ",
    },
    "home.hero_title": {
        "en": "Security & Identity Tools Built with",
        "si": "ආරක්ෂිත සහ අනන්‍යතා මෙවලම් නිර්මාණය කර ඇත්තේ",
    },
    "home.hero_gradient": {
        "en": "True Cryptographic Entropy",
        "si": "සත්‍ය ගුප්ත ලේඛන එන්ට්‍රොපියෙන්",
    },
    "home.hero_subtitle": {
        "en": "Generate uncrackable passkeys, creative gamer & developer identities, audit password vulnerability, and compute cryptographic digests — instantly and privately.",
        "si": "බිඳහෙලිය නොහැකි මුරපද, ගේමර් සහ සංවර්ධක අනන්‍යතා සාදන්න, මුරපද අවදානම් පරීක්ෂා කරන්න සහ ගුප්ත ලේඛන හෑෂ් ක්ෂණිකව හා පෞද්ගලිකව ගණනය කරන්න.",
    },
    "home.quick_generator": {
        "en": "Quick Generator",
        "si": "ක්ෂණික උත්පාදකය",
    },
    "home.csprng_validated": {
        "en": "CSPRNG Validated",
        "si": "CSPRNG මඟින් තහවුරු කළ",
    },
    "home.full_customizer": {
        "en": "Full Customizer",
        "si": "සම්පූර්ණ අභිරුචිකරණය",
    },
    "home.explore_all": {
        "en": "Explore All Tools",
        "si": "සියලු මෙවලම් බලන්න",
    },
    "home.how_it_works": {
        "en": "How It Works",
        "si": "ක්‍රියාකාරීත්වය",
    },
    "home.essential_tools": {
        "en": "Essential Security Tools",
        "si": "අත්‍යවශ්‍ය ආරක්ෂක මෙවලම්",
    },
    "home.essential_subtitle": {
        "en": "Modular tools designed for developers, system administrators, and security-conscious users.",
        "si": "සංවර්ධකයින්, පද්ධති පරිපාලකයින් සහ ආරක්ෂාව ගැන සැලකිලිමත් වන පරිශීලකයින් සඳහා සැකසූ මෙවලම්.",
    },
    "home.view_all": {
        "en": "View all tools",
        "si": "සියලු මෙවලම් බලන්න",
    },
    "home.prop1_title": {
        "en": "Cryptographic CSPRNG",
        "si": "ගුප්ත ලේඛන CSPRNG",
    },
    "home.prop1_desc": {
        "en": "Unlike standard pseudo-random generators, PassForge leverages OS-level cryptographic entropy from Python's secrets library.",
        "si": "සාමාන්‍ය අහඹු උත්පාදක මෙන් නොව, PassForge විසින් Python හි secrets පුස්තකාලයේ මෙහෙයුම් පද්ධති මට්ටමේ ගුප්ත ලේඛන එන්ට්‍රොපිය භාවිත කරයි.",
    },
    "home.prop2_title": {
        "en": "Zero Data Collection",
        "si": "ශුන්‍ය දත්ත රැස්කිරීම",
    },
    "home.prop2_desc": {
        "en": "We do not store, log, or transmit your generated credentials or passwords. PassForge operates strictly in volatile memory.",
        "si": "අපි ඔබේ උත්පාදනය කළ මුරපද හෝ අක්තපත්‍ර කිසිවක් ගබඩා කිරීම, ලොග් කිරීම හෝ සම්ප්‍රේෂණය කිරීම සිදු නොකරමු.",
    },
    "home.prop3_title": {
        "en": "Modular Architecture",
        "si": "මොඩියුලර් ගෘහ නිර්මාණය",
    },
    "home.prop3_desc": {
        "en": "Constructed with Flask Blueprints and a lightweight component system, ensuring high-speed delivery and effortless scaling.",
        "si": "Flask Blueprints සහ සැහැල්ලු සංරචක පද්ධතියකින් නිමවා ඇති අතර, අධික වේගය සහ පහසු ප්‍රසාරණය සහතික කරයි.",
    },

    # -------------------------------------------------------------
    # Tools Hub
    # -------------------------------------------------------------
    "hub.directory": {
        "en": "Tool Directory",
        "si": "මෙවලම් නාමාවලිය",
    },
    "hub.title": {
        "en": "All Security & Identity Tools",
        "si": "සියලු ආරක්ෂක සහ අනන්‍යතා මෙවලම්",
    },
    "hub.subtitle": {
        "en": "A comprehensive suite of privacy-preserving utilities for credentials, random generation, and cryptographic hashing.",
        "si": "අක්තපත්‍ර, අහඹු උත්පාදනය සහ ගුප්ත ලේඛන හෑෂ් සඳහා පෞද්ගලිකත්වය සුරකින සම්පූර්ණ මෙවලම් කට්ටලය.",
    },
    "hub.search_placeholder": {
        "en": "Search tools by name, tag, or function...",
        "si": "නම, ටැගය හෝ කාර්යය අනුව මෙවලම් සොයන්න...",
    },
    "hub.filter_all": {
        "en": "All",
        "si": "සියල්ල",
    },
    "hub.filter_security": {
        "en": "Security",
        "si": "ආරක්ෂාව",
    },
    "hub.filter_identity": {
        "en": "Identity",
        "si": "අනන්‍යතාවය",
    },
    "hub.filter_crypto": {
        "en": "Crypto",
        "si": "ගුප්ත ලේඛන",
    },
    "hub.no_results": {
        "en": "No matching tools found",
        "si": "ගැළපෙන මෙවලම් කිසිවක් හමු නොවීය",
    },
    "hub.no_results_desc": {
        "en": "Try searching for a different keyword or reset the filter.",
        "si": "වෙනත් වචනයක් යොදා සොයන්න හෝ පෙරහන නැවත සකසන්න.",
    },
    "hub.future_title": {
        "en": "Need another cryptographic utility?",
        "si": "තවත් ගුප්ත ලේඛන මෙවලමක් අවශ්‍යද?",
    },
    "hub.future_desc": {
        "en": "PassForge's Blueprint architecture makes it effortless to add QR Code Generators, UUID v4 engines, and more.",
        "si": "PassForge හි Blueprint ගෘහ නිර්මාණය මඟින් QR කේත උත්පාදක, UUID v4 සහ තවත් මෙවලම් එක් කිරීම පහසු කරයි.",
    },
    "hub.future_link": {
        "en": "Learn About the Architecture",
        "si": "ගෘහ නිර්මාණය ගැන දැනගන්න",
    },

    # -------------------------------------------------------------
    # About Page
    # -------------------------------------------------------------
    "about.badge": {
        "en": "Architectural & Security Overview",
        "si": "ගෘහ නිර්මාණ සහ ආරක්ෂණ සමාලෝචනය",
    },
    "about.title": {
        "en": "About PassForge Security Suite",
        "si": "PassForge ආරක්ෂණ කට්ටලය පිළිබඳව",
    },
    "about.subtitle": {
        "en": "A modern, modular cybersecurity platform designed for zero-trust privacy, true cryptographic entropy, and developer-friendly extensibility.",
        "si": "ශුන්‍ය-විශ්වාස පෞද්ගලිකත්වය, සත්‍ය ගුප්ත ලේඛන එන්ට්‍රොපිය සහ සංවර්ධක-හිතකාමී ප්‍රසාරණය සඳහා නිර්මාණය කරන ලද නවීන වේදිකාවකි.",
    },
    "about.pillars_title": {
        "en": "Core Design Pillars",
        "si": "ප්‍රධාන සැලසුම් මූලධර්ම",
    },
    "about.pillar1_title": {
        "en": "CSPRNG Cryptographic Entropy",
        "si": "CSPRNG ගුප්ත ලේඛන එන්ට්‍රොපිය",
    },
    "about.pillar1_desc": {
        "en": "PassForge uses Python's secrets module directly interfacing with Linux /dev/urandom for cryptographically strong random bytes.",
        "si": "ගුප්ත ලේඛනගතව ප්‍රබල අහඹු බයිට් ලබා ගැනීමට PassForge විසින් Linux /dev/urandom සමඟ සෘජුව ක්‍රියාකරන Python secrets මොඩියුලය භාවිත කරයි.",
    },
    "about.pillar2_title": {
        "en": "Zero-Knowledge & Client Privacy",
        "si": "බිංදු-දැනුම සහ පෞද්ගලිකත්වය",
    },
    "about.pillar2_desc": {
        "en": "Zero tracking, zero analytics scripts, and no credential logging. Hash and breach audits employ k-Anonymity privacy models.",
        "si": "ශුන්‍ය ලුහුබැඳීම, කිසිදු විශ්ලේෂණ ස්ක්‍රිප්ට් එකක් නැත, අක්තපත්‍ර ලොග් කිරීමක් නැත. කාන්දු පරීක්ෂාවන් k-Anonymity ආකෘතිය භාවිත කරයි.",
    },
    "about.pillar3_title": {
        "en": "Flask Blueprint Modular Design",
        "si": "Flask Blueprint මොඩියුලර් සැලසුම",
    },
    "about.pillar3_desc": {
        "en": "Every tool is isolated in its own blueprint directory with independent routes, logic, and comprehensive unit tests.",
        "si": "සෑම මෙවලමක්ම ස්වාධීන මාර්ග, තර්කනය සහ ඒකක පරීක්ෂණ සහිතව තමන්ගේම blueprint බහලුම තුළ වෙන් කර ඇත.",
    },
    "about.tech_title": {
        "en": "Modern Tech Stack",
        "si": "නවීන තාක්ෂණික එකතුව",
    },
    "about.cta_title": {
        "en": "Ready to secure your credentials?",
        "si": "ඔබේ අක්තපත්‍ර සුරක්ෂිත කිරීමට සූදානම්ද?",
    },
    "about.cta_desc": {
        "en": "Try out the Password Generator or explore all available cybersecurity tools.",
        "si": "මුරපද උත්පාදකය අත්හදා බලන්න හෝ සියලු ආරක්ෂක මෙවලම් ගවේෂණය කරන්න.",
    },
    "about.cta_btn": {
        "en": "Explore Tools",
        "si": "මෙවලම් බලන්න",
    },
}


def get_translation(key: str, lang: str = "en") -> str:
    """
    Retrieve localized string for key. Falls back to English if not found.
    """
    if lang not in SUPPORTED_LANGUAGES:
        lang = DEFAULT_LANGUAGE

    entry = TRANSLATIONS.get(key)
    if entry:
        return entry.get(lang) or entry.get("en") or key
    return key


def get_localized_tools_catalog(lang: str = "en") -> List[Dict[str, Any]]:
    """
    Return TOOLS_CATALOG localized for the requested language.
    """
    is_si = lang == "si"
    return [
        {
            "id": "password",
            "title": "මුරපද උත්පාදකය" if is_si else "Password Generator",
            "description": (
                "වින්‍යාසගත කළ හැකි අක්ෂර කට්ටල සහ ෂැනන් එන්ට්‍රොපි ලකුණු සමඟ ගුප්ත ලේඛනගතව ආරක්ෂිත අහඹු මුරපද උත්පාදනය කරන්න."
                if is_si else
                "Generate cryptographically secure random passwords with configurable character sets and Shannon entropy scoring."
            ),
            "icon": "key-round",
            "endpoint": "password.password_tool",
            "badge": "CSPRNG",
            "tags": ["ආරක්ෂාව", "මුරපද", "එන්ට්‍රොපිය"] if is_si else ["Security", "Passwords", "Entropy"],
        },
        {
            "id": "username",
            "title": "පරිශීලක නාම උත්පාදකය" if is_si else "Username Generator",
            "description": (
                "ක්ලැසික්, තාක්ෂණික/සයිබර්, ගේමර් සහ අවම තේමා ඔස්සේ මතකයේ රැඳෙන නිර්මාණශීලී පරිශීලක නාම සාදන්න."
                if is_si else
                "Create memorable, creative usernames across themes: Classic, Tech/Cyber, Gamer Titans, and Minimalist."
            ),
            "icon": "user",
            "endpoint": "username.username_tool",
            "badge": "නිර්මාණශීලී" if is_si else "Creative",
            "tags": ["අනන්‍යතාවය", "ගේමිං", "බ්‍රෑන්ඩිං"] if is_si else ["Identity", "Gaming", "Branding"],
        },
        {
            "id": "account-pair",
            "title": "ගිණුම් යුගල උත්පාදකය" if is_si else "Account Pair Generator",
            "description": (
                "එකවර ගැළපෙන පරිශීලක නාමයක් සහ ආරක්ෂිත මුරපදයක් සාදා එක් ක්ලික් කිරීමකින් පිටපත් කරගන්න."
                if is_si else
                "Generate matching username and secure password credentials simultaneously with one-click dual clipboard copy."
            ),
            "icon": "sparkles",
            "endpoint": "password.account_pair_tool",
            "badge": "යුගල" if is_si else "Combo",
            "tags": ["ගිණුම්", "ක්ෂණික"] if is_si else ["Accounts", "Fast Setup"],
        },
        {
            "id": "strength-checker",
            "title": "මුරපද ශක්තිය පරීක්ෂකය" if is_si else "Password Strength Checker",
            "description": (
                "ෂැනන් එන්ට්‍රොපි ගණනය කිරීම්, ශබ්දකෝෂ රටා හඳුනාගැනීම සහ බිඳහෙලීමේ කාල ඇස්තමේන්තුව සමඟ පවතින මුරපද විශ්ලේෂණය කරන්න."
                if is_si else
                "Analyze your existing passkeys with Shannon entropy calculation, dictionary pattern detection, and crack time estimation."
            ),
            "icon": "shield-alert",
            "endpoint": "strength_checker.strength_checker_tool",
            "badge": "විගණනය" if is_si else "Audit",
            "tags": ["විශ්ලේෂණය", "බිඳහෙලීම", "එන්ට්‍රොපිය"] if is_si else ["Analysis", "Brute-force", "Entropy"],
        },
        {
            "id": "hash-generator",
            "title": "හෑෂ් උත්පාදකය" if is_si else "Hash Generator",
            "description": (
                "MD5, SHA-1, SHA-256, SHA-512, සහ BLAKE2b ඇතුළු ක්ෂණික ගුප්ත ලේඛන හෑෂ් ගණනය කරන්න."
                if is_si else
                "Compute instant cryptographic hashes including MD5, SHA-1, SHA-256, SHA-512, and BLAKE2b digests."
            ),
            "icon": "hash",
            "endpoint": "hash_generator.hash_tool",
            "badge": "ගුප්ත ලේඛන" if is_si else "Crypto",
            "tags": ["හෑෂිං", "චෙක්සම්", "SHA-256"] if is_si else ["Hashing", "Checksum", "SHA-256"],
        },
        {
            "id": "breach-checker",
            "title": "දත්ත කාන්දුවීම් පරීක්ෂකය" if is_si else "Data Breach Checker",
            "description": (
                "බිංදු-දැනුම k-Anonymity තාක්ෂණයෙන් ඔබේ මුරපද හෝ ඊමේල් ගිණුම් සමාගම් දත්ත කාන්දුවීම්වලට හසුවී ඇත්දැයි පරීක්ෂා කරන්න."
                if is_si else
                "Check if your passwords or email accounts have been compromised in corporate breaches using zero-knowledge k-Anonymity."
            ),
            "icon": "shield-ban",
            "endpoint": "breach_checker.breach_checker_tool",
            "badge": "සජීවී විගණනය" if is_si else "Live Audit",
            "tags": ["ආරක්ෂාව", "කාන්දුවීම්", "HIBP", "පෞද්ගලිකත්වය"] if is_si else ["Security", "Breach", "HIBP", "Privacy"],
        },
    ]

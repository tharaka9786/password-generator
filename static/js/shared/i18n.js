/**
 * PassForge Internationalization (i18n) Engine
 * Supports real-time client-side and server-side English / Sinhala translation.
 */

import { postJSON } from './api.js';

export const TRANSLATIONS = {
    en: {
        // Nav & Global
        "nav.brand": "PassForge",
        "nav.home": "Home",
        "nav.tools": "Tools",
        "nav.about": "About",
        "nav.all_tools": "Browse All Tools Hub",
        "nav.language": "Language",
        "footer.tagline": "Built with Python standard library secrets CSPRNG & Flask. Zero tracking, client-first encryption.",
        "footer.home": "Home",
        "footer.tools_hub": "Tools Hub",
        "footer.about_privacy": "About & Privacy",
        "sidebar.title": "All Tools",

        // Tool Names
        "tool.password.title": "Password Generator",
        "tool.password.desc": "Generate cryptographically secure random passwords with configurable character sets and Shannon entropy scoring.",
        "tool.username.title": "Username Generator",
        "tool.username.desc": "Create memorable, creative usernames across themes: Classic, Tech/Cyber, Gamer Titans, and Minimalist.",
        "tool.account_pair.title": "Account Pair Generator",
        "tool.account_pair.desc": "Generate matching username and secure password credentials simultaneously with one-click dual clipboard copy.",
        "tool.strength.title": "Password Strength Checker",
        "tool.strength.desc": "Analyze your existing passkeys with Shannon entropy calculation, dictionary pattern detection, and crack time estimation.",
        "tool.hash.title": "Hash Generator",
        "tool.hash.desc": "Compute instant cryptographic hashes including MD5, SHA-1, SHA-256, SHA-512, and BLAKE2b digests.",
        "tool.breach.title": "Data Breach Checker",
        "tool.breach.desc": "Check if your passwords or email accounts have been compromised in corporate breaches using zero-knowledge k-Anonymity.",

        // Common Actions & Labels
        "action.copy": "Copy",
        "action.copied": "Copied!",
        "action.generate": "Generate",
        "action.clear": "Clear",
        "action.search": "Search",
        "action.lookup": "Lookup",
        "action.audit": "Audit",
        "action.open_tool": "Open Tool",
        "label.password_length": "Password Length",
        "label.uppercase": "Uppercase Letters",
        "label.lowercase": "Lowercase Letters",
        "label.digits": "Numbers / Digits",
        "label.symbols": "Special Symbols",
        "label.ambiguous": "Avoid Ambiguous Characters",
        "label.ambiguous_hint": "Excludes: l, 1, I, O, 0, `, ', \"",
        "label.generate_multiple": "Generate Multiple:",
        "label.session_history": "Session History",
        "label.history_empty": "Generated passwords will appear here.",

        // Home
        "home.badge": "Python CSPRNG · Zero Tracking · Client First",
        "home.hero_title": "Security & Identity Tools Built with",
        "home.hero_gradient": "True Cryptographic Entropy",
        "home.hero_subtitle": "Generate uncrackable passkeys, creative gamer & developer identities, audit password vulnerability, and compute cryptographic digests — instantly and privately.",
        "home.quick_generator": "Quick Generator",
        "home.csprng_validated": "CSPRNG Validated",
        "home.full_customizer": "Full Customizer",
        "home.explore_all": "Explore All Tools",
        "home.how_it_works": "How It Works",
        "home.essential_tools": "Essential Security Tools",
        "home.essential_subtitle": "Modular tools designed for developers, system administrators, and security-conscious users.",
        "home.view_all": "View all tools",
        "home.prop1_title": "Cryptographic CSPRNG",
        "home.prop1_desc": "Unlike standard pseudo-random generators, PassForge leverages OS-level cryptographic entropy from Python's secrets library.",
        "home.prop2_title": "Zero Data Collection",
        "home.prop2_desc": "We do not store, log, or transmit your generated credentials or passwords. PassForge operates strictly in volatile memory.",
        "home.prop3_title": "Modular Architecture",
        "home.prop3_desc": "Constructed with Flask Blueprints and a lightweight component system, ensuring high-speed delivery and effortless scaling.",

        // Tools Hub
        "hub.directory": "Tool Directory",
        "hub.title": "All Security & Identity Tools",
        "hub.subtitle": "A comprehensive suite of privacy-preserving utilities for credentials, random generation, and cryptographic hashing.",
        "hub.search_placeholder": "Search tools by name, tag, or function...",
        "hub.filter_all": "All",
        "hub.filter_security": "Security",
        "hub.filter_identity": "Identity",
        "hub.filter_crypto": "Crypto",
        "hub.no_results": "No matching tools found",
        "hub.no_results_desc": "Try searching for a different keyword or reset the filter.",
        "hub.future_title": "Need another cryptographic utility?",
        "hub.future_desc": "PassForge's Blueprint architecture makes it effortless to add QR Code Generators, UUID v4 engines, and more.",
        "hub.future_link": "Learn About the Architecture",

        // About
        "about.badge": "Architectural & Security Overview",
        "about.title": "About PassForge Security Suite",
        "about.subtitle": "A modern, modular cybersecurity platform designed for zero-trust privacy, true cryptographic entropy, and developer-friendly extensibility.",
        "about.pillars_title": "Core Design Pillars",
        "about.pillar1_title": "CSPRNG Cryptographic Entropy",
        "about.pillar1_desc": "PassForge uses Python's secrets module directly interfacing with Linux /dev/urandom for cryptographically strong random bytes.",
        "about.pillar2_title": "Zero-Knowledge & Client Privacy",
        "about.pillar2_desc": "Zero tracking, zero analytics scripts, and no credential logging. Hash and breach audits employ k-Anonymity privacy models.",
        "about.pillar3_title": "Flask Blueprint Modular Design",
        "about.pillar3_desc": "Every tool is isolated in its own blueprint directory with independent routes, logic, and comprehensive unit tests.",
        "about.tech_title": "Modern Tech Stack",
        "about.cta_title": "Ready to secure your credentials?",
        "about.cta_desc": "Try out the Password Generator or explore all available cybersecurity tools.",
        "about.cta_btn": "Explore Tools",
    },
    si: {
        // Nav & Global
        "nav.brand": "PassForge",
        "nav.home": "මුල් පිටුව",
        "nav.tools": "මෙවලම්",
        "nav.about": "අප ගැන",
        "nav.all_tools": "සියලු මෙවලම් මධ්‍යස්ථානය",
        "nav.language": "භාෂාව",
        "footer.tagline": "Python සම්මත පුස්තකාල secrets CSPRNG සහ Flask සමඟ නිර්මාණය කර ඇත. ශුන්‍ය ලුහුබැඳීම, සේවාදායක-ප්‍රමුඛ සංකේතනය.",
        "footer.home": "මුල් පිටුව",
        "footer.tools_hub": "මෙවලම් මධ්‍යස්ථානය",
        "footer.about_privacy": "විස්තර සහ පෞද්ගලිකත්වය",
        "sidebar.title": "සියලු මෙවලම්",

        // Tool Names
        "tool.password.title": "මුරපද උත්පාදකය",
        "tool.password.desc": "වින්‍යාසගත කළ හැකි අක්ෂර කට්ටල සහ ෂැනන් එන්ට්‍රොපි ලකුණු සමඟ ගුප්ත ලේඛනගතව ආරක්ෂිත අහඹු මුරපද උත්පාදනය කරන්න.",
        "tool.username.title": "පරිශීලක නාම උත්පාදකය",
        "tool.username.desc": "ක්ලැසික්, තාක්ෂණික/සයිබර්, ගේමර් සහ අවම තේමා ඔස්සේ මතකයේ රැඳෙන නිර්මාණශීලී පරිශීලක නාම සාදන්න.",
        "tool.account_pair.title": "ගිණුම් යුගල උත්පාදකය",
        "tool.account_pair.desc": "එකවර ගැළපෙන පරිශීලක නාමයක් සහ ආරක්ෂිත මුරපදයක් සාදා එක් ක්ලික් කිරීමකින් පිටපත් කරගන්න.",
        "tool.strength.title": "මුරපද ශක්තිය පරීක්ෂකය",
        "tool.strength.desc": "ෂැනන් එන්ට්‍රොපි ගණනය කිරීම්, ශබ්දකෝෂ රටා හඳුනාගැනීම සහ බිඳහෙලීමේ කාල ඇස්තමේන්තුව සමඟ පවතින මුරපද විශ්ලේෂණය කරන්න.",
        "tool.hash.title": "හෑෂ් උත්පාදකය",
        "tool.hash.desc": "MD5, SHA-1, SHA-256, SHA-512, සහ BLAKE2b ඇතුළු ක්ෂණික ගුප්ත ලේඛන හෑෂ් ගණනය කරන්න.",
        "tool.breach.title": "දත්ත කාන්දුවීම් පරීක්ෂකය",
        "tool.breach.desc": "බිංදු-දැනුම k-Anonymity තාක්ෂණයෙන් ඔබේ මුරපද හෝ ඊමේල් ගිණුම් සමාගම් දත්ත කාන්දුවීම්වලට හසුවී ඇත්දැයි පරීක්ෂා කරන්න.",

        // Common Actions & Labels
        "action.copy": "පිටපත්",
        "action.copied": "පිටපත් විය!",
        "action.generate": "උත්පාදනය කරන්න",
        "action.clear": "ඉවත් කරන්න",
        "action.search": "සොයන්න",
        "action.lookup": "සොයන්න",
        "action.audit": "පරීක්ෂා කරන්න",
        "action.open_tool": "මෙවලම අරඹන්න",
        "label.password_length": "මුරපදයේ දිග",
        "label.uppercase": "ලොකු අකුරු (A-Z)",
        "label.lowercase": "කුඩා අකුරු (a-z)",
        "label.digits": "අංක (0-9)",
        "label.symbols": "විශේෂ සංකේත (!@#$)",
        "label.ambiguous": "අපැහැදිලි අක්ෂර බැහැර කරන්න",
        "label.ambiguous_hint": "බැහැර කරන්නේ: l, 1, I, O, 0, `, ', \"",
        "label.generate_multiple": "එකවර කිහිපයක් සාදන්න:",
        "label.session_history": "මෙම වාරයේ ඉතිහාසය",
        "label.history_empty": "උත්පාදනය කළ මුරපද මෙහි දිස්වනු ඇත.",

        // Home
        "home.badge": "Python CSPRNG · ශුන්‍ය ලුහුබැඳීම · සේවාදායක-ප්‍රමුඛ",
        "home.hero_title": "ආරක්ෂිත සහ අනන්‍යතා මෙවලම් නිර්මාණය කර ඇත්තේ",
        "home.hero_gradient": "සත්‍ය ගුප්ත ලේඛන එන්ට්‍රොපියෙන්",
        "home.hero_subtitle": "බිඳහෙලිය නොහැකි මුරපද, ගේමර් සහ සංවර්ධක අනන්‍යතා සාදන්න, මුරපද අවදානම් පරීක්ෂා කරන්න සහ ගුප්ත ලේඛන හෑෂ් ක්ෂණිකව හා පෞද්ගලිකව ගණනය කරන්න.",
        "home.quick_generator": "ක්ෂණික උත්පාදකය",
        "home.csprng_validated": "CSPRNG මඟින් තහවුරු කළ",
        "home.full_customizer": "සම්පූර්ණ අභිරුචිකරණය",
        "home.explore_all": "සියලු මෙවලම් බලන්න",
        "home.how_it_works": "ක්‍රියාකාරීත්වය",
        "home.essential_tools": "අත්‍යවශ්‍ය ආරක්ෂක මෙවලම්",
        "home.essential_subtitle": "සංවර්ධකයින්, පද්ධති පරිපාලකයින් සහ ආරක්ෂාව ගැන සැලකිලිමත් වන පරිශීලකයින් සඳහා සැකසූ මෙවලම්.",
        "home.view_all": "සියලු මෙවලම් බලන්න",
        "home.prop1_title": "ගුප්ත ලේඛන CSPRNG",
        "home.prop1_desc": "සාමාන්‍ය අහඹු උත්පාදක මෙන් නොව, PassForge විසින් Python හි secrets පුස්තකාලයේ මෙහෙයුම් පද්ධති මට්ටමේ ගුප්ත ලේඛන එන්ට්‍රොපිය භාවිත කරයි.",
        "home.prop2_title": "ශුන්‍ය දත්ත රැස්කිරීම",
        "home.prop2_desc": "අපි ඔබේ උත්පාදනය කළ මුරපද හෝ අක්තපත්‍ර කිසිවක් ගබඩා කිරීම, ලොග් කිරීම හෝ සම්ප්‍රේෂණය කිරීම සිදු නොකරමු.",
        "home.prop3_title": "මොඩියුලර් ගෘහ නිර්මාණය",
        "home.prop3_desc": "Flask Blueprints සහ සැහැල්ලු සංරචක පද්ධතියකින් නිමවා ඇති අතර, අධික වේගය සහ පහසු ප්‍රසාරණය සහතික කරයි.",

        // Tools Hub
        "hub.directory": "මෙවලම් නාමාවලිය",
        "hub.title": "සියලු ආරක්ෂක සහ අනන්‍යතා මෙවලම්",
        "hub.subtitle": "අක්තපත්‍ර, අහඹු උත්පාදනය සහ ගුප්ත ලේඛන හෑෂ් සඳහා පෞද්ගලිකත්වය සුරකින සම්පූර්ණ මෙවලම් කට්ටලය.",
        "hub.search_placeholder": "නම, ටැගය හෝ කාර්යය අනුව මෙවලම් සොයන්න...",
        "hub.filter_all": "සියල්ල",
        "hub.filter_security": "ආරක්ෂාව",
        "hub.filter_identity": "අනන්‍යතාවය",
        "hub.filter_crypto": "ගුප්ත ලේඛන",
        "hub.no_results": "ගැළපෙන මෙවලම් කිසිවක් හමු නොවීය",
        "hub.no_results_desc": "වෙනත් වචනයක් යොදා සොයන්න හෝ පෙරහන නැවත සකසන්න.",
        "hub.future_title": "තවත් ගුප්ත ලේඛන මෙවලමක් අවශ්‍යද?",
        "hub.future_desc": "PassForge හි Blueprint ගෘහ නිර්මාණය මඟින් QR කේත උත්පාදක, UUID v4 සහ තවත් මෙවලම් එක් කිරීම පහසු කරයි.",
        "hub.future_link": "ගෘහ නිර්මාණය ගැන දැනගන්න",

        // About
        "about.badge": "ගෘහ නිර්මාණ සහ ආරක්ෂණ සමාලෝචනය",
        "about.title": "PassForge ආරක්ෂණ කට්ටලය පිළිබඳව",
        "about.subtitle": "ශුන්‍ය-විශ්වාස පෞද්ගලිකත්වය, සත්‍ය ගුප්ත ලේඛන එන්ට්‍රොපිය සහ සංවර්ධක-හිතකාමී ප්‍රසාරණය සඳහා නිර්මාණය කරන ලද නවීන වේදිකාවකි.",
        "about.pillars_title": "ප්‍රධාන සැලසුම් මූලධර්ම",
        "about.pillar1_title": "CSPRNG ගුප්ත ලේඛන එන්ට්‍රොපිය",
        "about.pillar1_desc": "ගුප්ත ලේඛනගතව ප්‍රබල අහඹු බයිට් ලබා ගැනීමට PassForge විසින් Linux /dev/urandom සමඟ සෘජුව ක්‍රියාකරන Python secrets මොඩියුලය භාවිත කරයි.",
        "about.pillar2_title": "බිංදු-දැනුම සහ පෞද්ගලිකත්වය",
        "about.pillar2_desc": "ශුන්‍ය ලුහුබැඳීම, කිසිදු විශ්ලේෂණ ස්ක්‍රිප්ට් එකක් නැත, අක්තපත්‍ර ලොග් කිරීමක් නැත. කාන්දු පරීක්ෂාවන් k-Anonymity ආකෘතිය භාවිත කරයි.",
        "about.pillar3_title": "Flask Blueprint මොඩියුලර් සැලසුම",
        "about.pillar3_desc": "සෑම මෙවලමක්ම ස්වාධීන මාර්ග, තර්කනය සහ ඒකක පරීක්ෂණ සහිතව තමන්ගේම blueprint බහලුම තුළ වෙන් කර ඇත.",
        "about.tech_title": "නවීන තාක්ෂණික එකතුව",
        "about.cta_title": "ඔබේ අක්තපත්‍ර සුරක්ෂිත කිරීමට සූදානම්ද?",
        "about.cta_desc": "මුරපද උත්පාදකය අත්හදා බලන්න හෝ සියලු ආරක්ෂක මෙවලම් ගවේෂණය කරන්න.",
        "about.cta_btn": "මෙවලම් බලන්න",
    }
};

/**
 * Get cookie value by name
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

/**
 * Set cookie
 */
function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Current active language ('en' or 'si')
 */
export function getCurrentLanguage() {
    const fromStorage = localStorage.getItem('passforge_lang');
    if (fromStorage && (fromStorage === 'en' || fromStorage === 'si')) {
        return fromStorage;
    }
    const fromCookie = getCookie('passforge_lang');
    if (fromCookie && (fromCookie === 'en' || fromCookie === 'si')) {
        return fromCookie;
    }
    const htmlLang = document.documentElement.getAttribute('lang');
    if (htmlLang && (htmlLang === 'en' || htmlLang === 'si')) {
        return htmlLang;
    }
    return 'en';
}

/**
 * Translate a single key for a language
 */
export function t(key, lang = null) {
    const targetLang = lang || getCurrentLanguage();
    const dict = TRANSLATIONS[targetLang] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
}

/**
 * Apply language to all data-i18n elements in DOM
 */
export function applyLanguage(lang) {
    if (lang !== 'en' && lang !== 'si') lang = 'en';

    document.documentElement.setAttribute('lang', lang);

    // Save preferences
    localStorage.setItem('passforge_lang', lang);
    setCookie('passforge_lang', lang);

    // Update data-i18n text
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = t(key, lang);
        if (translated) {
            el.textContent = translated;
        }
    });

    // Update data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const translated = t(key, lang);
        if (translated) {
            el.setAttribute('placeholder', translated);
        }
    });

    // Update data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const translated = t(key, lang);
        if (translated) {
            el.setAttribute('title', translated);
        }
    });

    // Update UI language switchers
    const currentLangLabel = document.getElementById('currentLangLabel');
    if (currentLangLabel) {
        currentLangLabel.textContent = lang.toUpperCase();
    }

    document.querySelectorAll('.lang-option-btn').forEach(btn => {
        const btnLang = btn.getAttribute('data-lang');
        if (btnLang === lang) {
            btn.classList.add('active', 'bg-indigo-600', 'text-white');
            btn.classList.remove('text-slate-300');
        } else {
            btn.classList.remove('active', 'bg-indigo-600', 'text-white');
            btn.classList.add('text-slate-300');
        }
    });

    document.querySelectorAll('.mobile-lang-btn').forEach(btn => {
        const btnLang = btn.getAttribute('data-lang');
        if (btnLang === lang) {
            btn.classList.add('bg-indigo-600', 'text-white');
            btn.classList.remove('text-slate-400');
        } else {
            btn.classList.remove('bg-indigo-600', 'text-white');
            btn.classList.add('text-slate-400');
        }
    });

    // Notify listeners
    window.dispatchEvent(new CustomEvent('passforge:languageChanged', { detail: { lang } }));

    // Sync with backend API silently
    try {
        postJSON('set-language', { lang }).catch(() => {});
    } catch (_) {}

    // Refresh icons
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
}

/**
 * Initialize language switcher on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
    const initialLang = getCurrentLanguage();
    applyLanguage(initialLang);

    // Desktop Dropdown
    const langSwitcher = document.getElementById('langSwitcher');
    const langToggleBtn = document.getElementById('langToggleBtn');
    const langDropdownMenu = document.getElementById('langDropdownMenu');

    if (langToggleBtn && langDropdownMenu) {
        langToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = langDropdownMenu.classList.toggle('hidden');
            langToggleBtn.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
        });

        document.addEventListener('click', (e) => {
            if (langSwitcher && !langSwitcher.contains(e.target)) {
                langDropdownMenu.classList.add('hidden');
                langToggleBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Language Option Buttons (Desktop)
    document.querySelectorAll('.lang-option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const selectedLang = btn.getAttribute('data-lang');
            applyLanguage(selectedLang);
            if (langDropdownMenu) langDropdownMenu.classList.add('hidden');
        });
    });

    // Language Option Buttons (Mobile)
    document.querySelectorAll('.mobile-lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const selectedLang = btn.getAttribute('data-lang');
            applyLanguage(selectedLang);
        });
    });
});

/**
 * Security & Identity Suite — Password & Username Generator
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // Helper: Base URL Resolver
    // -------------------------------------------------------------
    function getApiEndpoint(endpointName) {
        const clean = endpointName.replace(/^\/+/, '');
        const metaTag = document.querySelector('meta[name="base-path"]') || document.querySelector('meta[name="base-url"]');
        let basePath = metaTag && metaTag.content !== undefined ? metaTag.content.replace(/\/+$/, '') : '';
        if (!basePath && window.location && window.location.pathname) {
            const match = window.location.pathname.match(/^(.*?)(?:\/(?:tools|about|api))(?:\/|$)/i);
            if (match && match[1]) basePath = match[1].replace(/\/+$/, '');
        }
        return `${basePath}/api/${clean}`;
    }

    // Toast Notification
    const toast = document.getElementById('toast');
    function showToast(message = 'Copied to clipboard!') {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1800);
    }

    async function copyToClipboard(text, customToastMsg) {
        if (!text) return;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }
            showToast(customToastMsg || 'Copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
            showToast('Failed to copy');
        }
    }

    // -------------------------------------------------------------
    // Tabs Navigation
    // -------------------------------------------------------------
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    let activeTab = 'passwordTab';

    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            activeTab = targetTab;

            tabButtons.forEach((b) => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach((p) => p.classList.add('hidden'));

            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            const panel = document.getElementById(targetTab);
            if (panel) panel.classList.remove('hidden');

            if (targetTab === 'comboTab' && (!lastComboUser || !lastComboPass)) {
                generateComboPair();
            }
        });
    });

    // -------------------------------------------------------------
    // SECTION 1: PASSWORD GENERATOR
    // -------------------------------------------------------------
    const passwordDisplay = document.getElementById('passwordDisplay');
    const copyBtn = document.getElementById('copyBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const lengthSlider = document.getElementById('lengthSlider');
    const lengthInput = document.getElementById('lengthInput');

    const optUppercase = document.getElementById('optUppercase');
    const optLowercase = document.getElementById('optLowercase');
    const optDigits = document.getElementById('optDigits');
    const optSymbols = document.getElementById('optSymbols');
    const optAmbiguous = document.getElementById('optAmbiguous');
    const batchCountSelect = document.getElementById('batchCount');

    const strengthLabel = document.getElementById('strengthLabel');
    const entropyTag = document.getElementById('entropyTag');
    const strengthFill = document.getElementById('strengthFill');
    const crackTimeInfo = document.getElementById('crackTimeInfo');

    const bulkContainer = document.getElementById('bulkResultsContainer');
    const bulkList = document.getElementById('bulkList');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const errorBanner = document.getElementById('errorBanner');

    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    let currentPasswords = [];
    const passwordHistory = [];

    function syncLength(value) {
        let val = parseInt(value, 10);
        if (isNaN(val)) val = 16;
        val = Math.max(4, Math.min(128, val));
        lengthSlider.value = Math.min(val, 64);
        lengthInput.value = val;
    }

    lengthSlider.addEventListener('input', (e) => {
        lengthInput.value = e.target.value;
        generatePassword();
    });

    lengthInput.addEventListener('change', (e) => {
        syncLength(e.target.value);
        generatePassword();
    });

    [optUppercase, optLowercase, optDigits, optSymbols, optAmbiguous, batchCountSelect].forEach((el) => {
        el.addEventListener('change', () => generatePassword());
    });

    async function generatePassword() {
        const payload = {
            length: parseInt(lengthInput.value, 10) || 16,
            include_uppercase: optUppercase.checked,
            include_lowercase: optLowercase.checked,
            include_digits: optDigits.checked,
            include_symbols: optSymbols.checked,
            exclude_ambiguous: optAmbiguous.checked,
            count: parseInt(batchCountSelect.value, 10) || 1,
        };

        if (
            !payload.include_uppercase &&
            !payload.include_lowercase &&
            !payload.include_digits &&
            !payload.include_symbols
        ) {
            errorBanner.textContent = 'Please select at least one character type.';
            errorBanner.classList.remove('hidden');
            return;
        }

        errorBanner.classList.add('hidden');

        try {
            const response = await fetch(getApiEndpoint('generate'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                errorBanner.textContent = data.error || 'Failed to generate password.';
                errorBanner.classList.remove('hidden');
                return;
            }

            currentPasswords = data.passwords;
            const primary = data.primary;

            passwordDisplay.textContent = primary.password;
            renderStrength(primary.entropy, primary.strength);
            addPasswordToHistory(primary.password);
            renderBulkPasswords(data.passwords);
        } catch (err) {
            console.error(err);
            errorBanner.textContent = 'Network error while contacting API.';
            errorBanner.classList.remove('hidden');
        }
    }

    function renderStrength(entropy, strength) {
        strengthLabel.textContent = strength.label;
        strengthLabel.style.color = strength.color;
        entropyTag.textContent = `${entropy} bits entropy`;

        const percent = Math.min(100, Math.round((strength.score / 5) * 100));
        strengthFill.style.width = `${percent}%`;
        strengthFill.style.backgroundColor = strength.color;
        crackTimeInfo.textContent = `Estimated crack time: ${strength.crack_time}`;
    }

    function renderBulkPasswords(passwords) {
        if (passwords.length <= 1) {
            bulkContainer.classList.add('hidden');
            return;
        }

        bulkContainer.classList.remove('hidden');
        bulkList.innerHTML = '';

        passwords.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'bulk-item';

            const pwdSpan = document.createElement('span');
            pwdSpan.textContent = item.password;

            const copyMiniBtn = document.createElement('button');
            copyMiniBtn.className = 'mini-copy';
            copyMiniBtn.textContent = 'Copy';
            copyMiniBtn.addEventListener('click', () => copyToClipboard(item.password));

            row.appendChild(pwdSpan);
            row.appendChild(copyMiniBtn);
            bulkList.appendChild(row);
        });
    }

    function addPasswordToHistory(password) {
        if (!password || passwordHistory.includes(password)) return;
        passwordHistory.unshift(password);
        if (passwordHistory.length > 10) passwordHistory.pop();
        renderPasswordHistory();
    }

    function renderPasswordHistory() {
        if (passwordHistory.length === 0) {
            historyList.innerHTML = '<p class="empty-history">Passwords generated in this session will appear here.</p>';
            return;
        }
        historyList.innerHTML = '';
        passwordHistory.forEach((pwd) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            const span = document.createElement('span');
            span.textContent = pwd;
            const copyMini = document.createElement('button');
            copyMini.className = 'mini-copy';
            copyMini.textContent = 'Copy';
            copyMini.addEventListener('click', () => copyToClipboard(pwd));

            item.appendChild(span);
            item.appendChild(copyMini);
            historyList.appendChild(item);
        });
    }

    copyBtn.addEventListener('click', () => {
        if (currentPasswords.length > 0) copyToClipboard(currentPasswords[0].password);
    });

    refreshBtn.addEventListener('click', () => generatePassword());

    copyAllBtn.addEventListener('click', () => {
        if (currentPasswords.length > 0) {
            const allText = currentPasswords.map((p) => p.password).join('\n');
            copyToClipboard(allText, `Copied ${currentPasswords.length} passwords!`);
        }
    });

    clearHistoryBtn.addEventListener('click', () => {
        passwordHistory.length = 0;
        renderPasswordHistory();
    });

    // -------------------------------------------------------------
    // SECTION 2: USERNAME GENERATOR
    // -------------------------------------------------------------
    const usernameDisplay = document.getElementById('usernameDisplay');
    const copyUsernameBtn = document.getElementById('copyUsernameBtn');
    const refreshUsernameBtn = document.getElementById('refreshUsernameBtn');
    const usernameLengthBadge = document.getElementById('usernameLengthBadge');
    const usernameStyleBadge = document.getElementById('usernameStyleBadge');

    const styleSelector = document.getElementById('styleSelector');
    const styleChips = styleSelector.querySelectorAll('.chip-btn');
    const uSeparator = document.getElementById('uSeparator');
    const uCasing = document.getElementById('uCasing');
    const uIncludeNumber = document.getElementById('uIncludeNumber');
    const uLimitLength = document.getElementById('uLimitLength');
    const usernameBatchCount = document.getElementById('usernameBatchCount');

    const usernameBulkContainer = document.getElementById('usernameBulkContainer');
    const usernameBulkList = document.getElementById('usernameBulkList');
    const copyAllUsernamesBtn = document.getElementById('copyAllUsernamesBtn');
    const usernameErrorBanner = document.getElementById('usernameErrorBanner');

    const usernameHistoryList = document.getElementById('usernameHistoryList');
    const clearUsernameHistoryBtn = document.getElementById('clearUsernameHistoryBtn');

    let currentStyle = 'classic';
    let currentUsernames = [];
    const usernameHistory = [];

    styleChips.forEach((chip) => {
        chip.addEventListener('click', () => {
            styleChips.forEach((c) => c.classList.remove('active'));
            chip.classList.add('active');
            currentStyle = chip.getAttribute('data-style');
            generateUsername();
        });
    });

    [uSeparator, uCasing, uIncludeNumber, uLimitLength, usernameBatchCount].forEach((el) => {
        el.addEventListener('change', () => generateUsername());
    });

    async function generateUsername() {
        const payload = {
            style: currentStyle,
            separator: uSeparator.value,
            casing: uCasing.value,
            include_number: uIncludeNumber.checked,
            max_length: uLimitLength.checked ? 15 : null,
            count: parseInt(usernameBatchCount.value, 10) || 1,
        };

        usernameErrorBanner.classList.add('hidden');

        try {
            const response = await fetch(getApiEndpoint('generate-username'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                usernameErrorBanner.textContent = data.error || 'Failed to generate username.';
                usernameErrorBanner.classList.remove('hidden');
                return;
            }

            currentUsernames = data.usernames;
            const primary = data.primary;

            usernameDisplay.textContent = primary.username;
            usernameLengthBadge.textContent = `${primary.length} characters`;
            usernameStyleBadge.textContent = `${primary.style.charAt(0).toUpperCase() + primary.style.slice(1)} Style`;

            addUsernameToHistory(primary.username);
            renderBulkUsernames(data.usernames);
        } catch (err) {
            console.error(err);
            usernameErrorBanner.textContent = 'Network error while contacting API.';
            usernameErrorBanner.classList.remove('hidden');
        }
    }

    function renderBulkUsernames(usernames) {
        if (usernames.length <= 1) {
            usernameBulkContainer.classList.add('hidden');
            return;
        }

        usernameBulkContainer.classList.remove('hidden');
        usernameBulkList.innerHTML = '';

        usernames.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'bulk-item';

            const userSpan = document.createElement('span');
            userSpan.textContent = item.username;

            const copyMiniBtn = document.createElement('button');
            copyMiniBtn.className = 'mini-copy';
            copyMiniBtn.textContent = 'Copy';
            copyMiniBtn.addEventListener('click', () => copyToClipboard(item.username));

            row.appendChild(userSpan);
            row.appendChild(copyMiniBtn);
            usernameBulkList.appendChild(row);
        });
    }

    function addUsernameToHistory(uname) {
        if (!uname || usernameHistory.includes(uname)) return;
        usernameHistory.unshift(uname);
        if (usernameHistory.length > 10) usernameHistory.pop();
        renderUsernameHistory();
    }

    function renderUsernameHistory() {
        if (usernameHistory.length === 0) {
            usernameHistoryList.innerHTML = '<p class="empty-history">Usernames generated in this session will appear here.</p>';
            return;
        }
        usernameHistoryList.innerHTML = '';
        usernameHistory.forEach((u) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            const span = document.createElement('span');
            span.textContent = u;
            const copyMini = document.createElement('button');
            copyMini.className = 'mini-copy';
            copyMini.textContent = 'Copy';
            copyMini.addEventListener('click', () => copyToClipboard(u));

            item.appendChild(span);
            item.appendChild(copyMini);
            usernameHistoryList.appendChild(item);
        });
    }

    copyUsernameBtn.addEventListener('click', () => {
        if (currentUsernames.length > 0) copyToClipboard(currentUsernames[0].username);
    });

    refreshUsernameBtn.addEventListener('click', () => generateUsername());

    copyAllUsernamesBtn.addEventListener('click', () => {
        if (currentUsernames.length > 0) {
            const allText = currentUsernames.map((u) => u.username).join('\n');
            copyToClipboard(allText, `Copied ${currentUsernames.length} usernames!`);
        }
    });

    clearUsernameHistoryBtn.addEventListener('click', () => {
        usernameHistory.length = 0;
        renderUsernameHistory();
    });

    // -------------------------------------------------------------
    // SECTION 3: COMBO ACCOUNT PAIR
    // -------------------------------------------------------------
    const comboUsername = document.getElementById('comboUsername');
    const comboPassword = document.getElementById('comboPassword');
    const copyComboUserBtn = document.getElementById('copyComboUserBtn');
    const copyComboPassBtn = document.getElementById('copyComboPassBtn');
    const generateComboBtn = document.getElementById('generateComboBtn');
    const copyBothBtn = document.getElementById('copyBothBtn');

    let lastComboUser = '';
    let lastComboPass = '';

    async function generateComboPair() {
        try {
            const [userRes, passRes] = await Promise.all([
                fetch(getApiEndpoint('generate-username'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ style: 'classic', include_number: true }),
                }),
                fetch(getApiEndpoint('generate'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ length: 16 }),
                }),
            ]);

            const userData = await userRes.json();
            const passData = await passRes.json();

            if (userData.success && passData.success) {
                lastComboUser = userData.primary.username;
                lastComboPass = passData.primary.password;

                comboUsername.textContent = lastComboUser;
                comboPassword.textContent = lastComboPass;

                addUsernameToHistory(lastComboUser);
                addPasswordToHistory(lastComboPass);
            }
        } catch (err) {
            console.error('Failed to generate combo pair:', err);
        }
    }

    generateComboBtn.addEventListener('click', () => generateComboPair());
    copyComboUserBtn.addEventListener('click', () => copyToClipboard(lastComboUser));
    copyComboPassBtn.addEventListener('click', () => copyToClipboard(lastComboPass));
    copyBothBtn.addEventListener('click', () => {
        if (lastComboUser && lastComboPass) {
            const formatted = `Username: ${lastComboUser}\nPassword: ${lastComboPass}`;
            copyToClipboard(formatted, 'Copied Username & Password credentials!');
        }
    });

    // -------------------------------------------------------------
    // Global Keyboard Shortcut: Spacebar
    // -------------------------------------------------------------
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            if (activeTab === 'passwordTab') {
                generatePassword();
            } else if (activeTab === 'usernameTab') {
                generateUsername();
            } else if (activeTab === 'comboTab') {
                generateComboPair();
            }
        }
    });

    // Initial triggers
    generatePassword();
    generateUsername();
});

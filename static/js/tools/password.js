/**
 * Password Generator Tool Script
 */
import { copyToClipboard } from '../shared/clipboard.js';
import { postJSON } from '../shared/api.js';
import { showToast } from '../shared/toast.js';
import { loadSessionHistory, saveSessionHistory, clearSessionHistory } from '../shared/history.js';

document.addEventListener('DOMContentLoaded', () => {
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

    const STORAGE_KEY = 'passforge_session_history_password';
    let currentPasswords = [];
    let passwordHistory = loadSessionHistory(STORAGE_KEY);

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
            const data = await postJSON('generate', payload);
            if (!data.success) {
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
            errorBanner.textContent = err.message || 'Network error.';
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
            row.className = 'flex items-center justify-between font-mono text-xs bg-white/[0.03] px-3 py-1.5 rounded';

            const pwdSpan = document.createElement('span');
            pwdSpan.textContent = item.password;
            pwdSpan.className = 'break-all';

            const copyMini = document.createElement('button');
            copyMini.className = 'mini-copy ml-2 shrink-0';
            copyMini.textContent = 'Copy';
            copyMini.addEventListener('click', () => copyToClipboard(item.password));

            row.appendChild(pwdSpan);
            row.appendChild(copyMini);
            bulkList.appendChild(row);
        });
    }

    function addPasswordToHistory(password) {
        if (!password || passwordHistory.includes(password)) return;
        passwordHistory.unshift(password);
        if (passwordHistory.length > 50) passwordHistory.pop();
        saveSessionHistory(STORAGE_KEY, passwordHistory);
        renderPasswordHistory();
    }

    function renderPasswordHistory() {
        if (!historyList) return;
        if (passwordHistory.length === 0) {
            historyList.innerHTML = '<p class="text-xs text-slate-500 italic text-center py-2" data-i18n="label.history_empty">Generated passwords will appear here.</p>';
            return;
        }
        historyList.innerHTML = '';
        passwordHistory.forEach((pwd) => {
            const item = document.createElement('div');
            item.className = 'history-entry';
            const span = document.createElement('span');
            span.textContent = pwd;
            span.className = 'break-all font-mono select-all';

            const actions = document.createElement('div');
            actions.className = 'flex items-center gap-1.5 ml-2 shrink-0';

            const copyMini = document.createElement('button');
            copyMini.type = 'button';
            copyMini.className = 'mini-copy';
            copyMini.textContent = 'Copy';
            copyMini.title = 'Copy password';
            copyMini.addEventListener('click', () => copyToClipboard(pwd));

            const saveMini = document.createElement('button');
            saveMini.type = 'button';
            saveMini.className = 'mini-copy text-emerald-400 hover:text-emerald-300';
            saveMini.textContent = 'Save';
            saveMini.title = 'Save to Vault';
            saveMini.addEventListener('click', async () => {
                const title = prompt('Enter a title or account name for this password (e.g., GitHub, Work Email):');
                if (!title || !title.trim()) return;
                try {
                    const res = await postJSON('save/vault', {
                        title: title.trim(),
                        password: pwd,
                        category: 'password',
                    });
                    if (res.success) {
                        showToast(res.message || 'Saved to Vault!');
                    }
                } catch (err) {
                    if (err.message && (err.message.includes('Authentication required') || err.message.includes('401'))) {
                        showToast('Please log in to save passwords to your Vault.');
                    } else {
                        showToast(err.message || 'Failed to save to Vault.');
                    }
                }
            });

            actions.appendChild(copyMini);
            actions.appendChild(saveMini);
            item.appendChild(span);
            item.appendChild(actions);
            historyList.appendChild(item);
        });
    }

    copyBtn.addEventListener('click', () => {
        if (currentPasswords.length > 0) copyToClipboard(currentPasswords[0].password);
    });

    const saveVaultBtn = document.getElementById('saveVaultBtn');
    if (saveVaultBtn) {
        saveVaultBtn.addEventListener('click', async () => {
            if (!currentPasswords.length) return;
            const pw = currentPasswords[0].password;
            const title = prompt('Enter a title or account name for this password (e.g., GitHub, Work Email):');
            if (!title || !title.trim()) return;

            try {
                const res = await postJSON('save/vault', {
                    title: title.trim(),
                    password: pw,
                    category: 'password',
                });
                if (res.success) {
                    showToast(res.message || 'Saved to Vault!');
                }
            } catch (err) {
                if (err.message && (err.message.includes('Authentication required') || err.message.includes('401'))) {
                    showToast('Please log in to save passwords to your Vault.');
                } else {
                    showToast(err.message || 'Failed to save to Vault.');
                }
            }
        });
    }

    refreshBtn.addEventListener('click', generatePassword);

    copyAllBtn.addEventListener('click', () => {
        if (currentPasswords.length > 0) {
            const allText = currentPasswords.map((p) => p.password).join('\n');
            copyToClipboard(allText, `Copied ${currentPasswords.length} passwords!`);
        }
    });

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            passwordHistory = [];
            clearSessionHistory(STORAGE_KEY);
            renderPasswordHistory();
        });
    }

    // Spacebar keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            generatePassword();
        }
    });

    renderPasswordHistory();
    generatePassword();
});

/**
 * Username Generator Tool Script
 */
import { copyToClipboard } from '../shared/clipboard.js';
import { postJSON } from '../shared/api.js';
import { showToast } from '../shared/toast.js';
import { loadSessionHistory, saveSessionHistory, clearSessionHistory } from '../shared/history.js';

document.addEventListener('DOMContentLoaded', () => {
    const usernameDisplay = document.getElementById('usernameDisplay');
    const copyUsernameBtn = document.getElementById('copyUsernameBtn');
    const refreshUsernameBtn = document.getElementById('refreshUsernameBtn');
    const usernameLengthBadge = document.getElementById('usernameLengthBadge');
    const usernameStyleBadge = document.getElementById('usernameStyleBadge');

    const styleSelector = document.getElementById('styleSelector');
    const styleChips = styleSelector.querySelectorAll('.style-chip');
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

    const STORAGE_KEY = 'passforge_session_history_username';
    let currentStyle = 'classic';
    let currentUsernames = [];
    let usernameHistory = loadSessionHistory(STORAGE_KEY);

    styleChips.forEach((chip) => {
        chip.addEventListener('click', () => {
            styleChips.forEach((c) => {
                c.classList.remove('bg-emerald-500/20', 'border-emerald-500/40', 'text-emerald-300');
                c.classList.add('bg-white/5', 'text-slate-300');
            });
            chip.classList.add('bg-emerald-500/20', 'border-emerald-500/40', 'text-emerald-300');
            chip.classList.remove('bg-white/5', 'text-slate-300');
            currentStyle = chip.getAttribute('data-style');
            generateUsername();
        });
    });

    [uSeparator, uCasing, uIncludeNumber, uLimitLength, usernameBatchCount].forEach((el) => {
        el.addEventListener('change', generateUsername);
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
            const data = await postJSON('generate-username', payload);
            if (!data.success) {
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
            usernameErrorBanner.textContent = err.message || 'Network error.';
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
            row.className = 'flex items-center justify-between font-mono text-xs bg-white/[0.03] px-3 py-1.5 rounded';

            const userSpan = document.createElement('span');
            userSpan.textContent = item.username;
            userSpan.className = 'break-all';

            const copyMini = document.createElement('button');
            copyMini.className = 'mini-copy ml-2 shrink-0';
            copyMini.textContent = 'Copy';
            copyMini.addEventListener('click', () => copyToClipboard(item.username));

            row.appendChild(userSpan);
            row.appendChild(copyMini);
            usernameBulkList.appendChild(row);
        });
    }

    function addUsernameToHistory(uname) {
        if (!uname || usernameHistory.includes(uname)) return;
        usernameHistory.unshift(uname);
        if (usernameHistory.length > 50) usernameHistory.pop();
        saveSessionHistory(STORAGE_KEY, usernameHistory);
        renderUsernameHistory();
    }

    function renderUsernameHistory() {
        if (!usernameHistoryList) return;
        if (usernameHistory.length === 0) {
            usernameHistoryList.innerHTML = '<p class="text-xs text-slate-500 italic text-center py-2" data-i18n="label.history_empty">Generated usernames will appear here.</p>';
            return;
        }
        usernameHistoryList.innerHTML = '';
        usernameHistory.forEach((u) => {
            const item = document.createElement('div');
            item.className = 'history-entry';
            const span = document.createElement('span');
            span.textContent = u;
            span.className = 'break-all font-mono select-all';

            const actions = document.createElement('div');
            actions.className = 'flex items-center gap-1.5 ml-2 shrink-0';

            const copyMini = document.createElement('button');
            copyMini.type = 'button';
            copyMini.className = 'mini-copy';
            copyMini.textContent = 'Copy';
            copyMini.title = 'Copy username';
            copyMini.addEventListener('click', () => copyToClipboard(u));

            const saveMini = document.createElement('button');
            saveMini.type = 'button';
            saveMini.className = 'mini-copy text-emerald-400 hover:text-emerald-300';
            saveMini.textContent = 'Save';
            saveMini.title = 'Save to Vault';
            saveMini.addEventListener('click', async () => {
                const title = prompt('Enter a title or service name for this username (e.g., Discord, Reddit):');
                if (!title || !title.trim()) return;
                try {
                    const res = await postJSON('save/vault', {
                        title: title.trim(),
                        username_value: u,
                        password: '',
                        category: 'username',
                    });
                    if (res.success) {
                        showToast(res.message || 'Saved to Vault!');
                    }
                } catch (err) {
                    if (err.message && (err.message.includes('Authentication required') || err.message.includes('401'))) {
                        showToast('Please log in to save usernames to your Vault.');
                    } else {
                        showToast(err.message || 'Failed to save to Vault.');
                    }
                }
            });

            actions.appendChild(copyMini);
            actions.appendChild(saveMini);
            item.appendChild(span);
            item.appendChild(actions);
            usernameHistoryList.appendChild(item);
        });
    }

    copyUsernameBtn.addEventListener('click', () => {
        if (currentUsernames.length > 0) copyToClipboard(currentUsernames[0].username);
    });

    const saveUsernameVaultBtn = document.getElementById('saveUsernameVaultBtn');
    if (saveUsernameVaultBtn) {
        saveUsernameVaultBtn.addEventListener('click', async () => {
            if (!currentUsernames.length) return;
            const uname = currentUsernames[0].username;
            const title = prompt('Enter a title or service name for this username (e.g., Discord, Reddit):');
            if (!title || !title.trim()) return;

            try {
                const res = await postJSON('save/vault', {
                    title: title.trim(),
                    username_value: uname,
                    password: '',
                    category: 'username',
                });
                if (res.success) {
                    showToast(res.message || 'Saved to Vault!');
                }
            } catch (err) {
                if (err.message && (err.message.includes('Authentication required') || err.message.includes('401'))) {
                    showToast('Please log in to save usernames to your Vault.');
                } else {
                    showToast(err.message || 'Failed to save to Vault.');
                }
            }
        });
    }

    refreshUsernameBtn.addEventListener('click', generateUsername);

    copyAllUsernamesBtn.addEventListener('click', () => {
        if (currentUsernames.length > 0) {
            const allText = currentUsernames.map((u) => u.username).join('\n');
            copyToClipboard(allText, `Copied ${currentUsernames.length} usernames!`);
        }
    });

    if (clearUsernameHistoryBtn) {
        clearUsernameHistoryBtn.addEventListener('click', () => {
            usernameHistory = [];
            clearSessionHistory(STORAGE_KEY);
            renderUsernameHistory();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            generateUsername();
        }
    });

    renderUsernameHistory();
    generateUsername();
});

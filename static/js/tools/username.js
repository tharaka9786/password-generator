/**
 * Username Generator Tool Script
 */
import { copyToClipboard } from '../shared/clipboard.js';
import { postJSON } from '../shared/api.js';

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

    let currentStyle = 'classic';
    let currentUsernames = [];
    const usernameHistory = [];

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
        if (usernameHistory.length > 10) usernameHistory.pop();
        renderUsernameHistory();
    }

    function renderUsernameHistory() {
        if (usernameHistory.length === 0) {
            usernameHistoryList.innerHTML = '<p class="text-xs text-slate-500 italic text-center py-2">Generated usernames will appear here.</p>';
            return;
        }
        usernameHistoryList.innerHTML = '';
        usernameHistory.forEach((u) => {
            const item = document.createElement('div');
            item.className = 'history-entry';
            const span = document.createElement('span');
            span.textContent = u;
            span.className = 'break-all';

            const copyMini = document.createElement('button');
            copyMini.className = 'mini-copy ml-2 shrink-0';
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

    refreshUsernameBtn.addEventListener('click', generateUsername);

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

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            generateUsername();
        }
    });

    generateUsername();
});

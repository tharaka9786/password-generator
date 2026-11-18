/**
 * Account Pair Tool Script
 */
import { copyToClipboard } from '../shared/clipboard.js';
import { postJSON } from '../shared/api.js';
import { showToast } from '../shared/toast.js';
import { loadSessionHistory, saveSessionHistory, clearSessionHistory } from '../shared/history.js';

document.addEventListener('DOMContentLoaded', () => {
    const comboUsername = document.getElementById('comboUsername');
    const comboPassword = document.getElementById('comboPassword');
    const copyComboUserBtn = document.getElementById('copyComboUserBtn');
    const copyComboPassBtn = document.getElementById('copyComboPassBtn');
    const generateComboBtn = document.getElementById('generateComboBtn');
    const copyBothBtn = document.getElementById('copyBothBtn');
    const saveComboVaultBtn = document.getElementById('saveComboVaultBtn');

    const comboHistoryList = document.getElementById('comboHistoryList');
    const clearComboHistoryBtn = document.getElementById('clearComboHistoryBtn');

    const STORAGE_KEY = 'passforge_session_history_account_pair';
    let lastUser = '';
    let lastPass = '';
    let comboHistory = loadSessionHistory(STORAGE_KEY);

    function addComboToHistory(user, pass) {
        if (!user || !pass) return;
        if (comboHistory.length > 0 && comboHistory[0].username === user && comboHistory[0].password === pass) return;
        comboHistory.unshift({ username: user, password: pass });
        if (comboHistory.length > 50) comboHistory.pop();
        saveSessionHistory(STORAGE_KEY, comboHistory);
        renderComboHistory();
    }

    function renderComboHistory() {
        if (!comboHistoryList) return;
        if (comboHistory.length === 0) {
            comboHistoryList.innerHTML = '<p class="text-xs text-slate-500 italic text-center py-2" data-i18n="label.history_empty">Generated account pairs will appear here.</p>';
            return;
        }
        comboHistoryList.innerHTML = '';
        comboHistory.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'history-entry flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-2 px-3';

            const creds = document.createElement('div');
            creds.className = 'flex flex-wrap items-center gap-2 font-mono text-xs sm:text-sm break-all';
            creds.innerHTML = `<span class="text-emerald-400 font-semibold select-all">${item.username}</span> <span class="text-slate-500">:</span> <span class="text-sky-400 font-semibold select-all">${item.password}</span>`;

            const actions = document.createElement('div');
            actions.className = 'flex items-center gap-1.5 shrink-0 self-end sm:self-center';

            const copyMini = document.createElement('button');
            copyMini.type = 'button';
            copyMini.className = 'mini-copy';
            copyMini.textContent = 'Copy';
            copyMini.title = 'Copy Username & Password';
            copyMini.addEventListener('click', () => {
                copyToClipboard(`Username: ${item.username}\nPassword: ${item.password}`, 'Copied account credentials!');
            });

            const saveMini = document.createElement('button');
            saveMini.type = 'button';
            saveMini.className = 'mini-copy text-emerald-400 hover:text-emerald-300';
            saveMini.textContent = 'Save';
            saveMini.title = 'Save to Vault';
            saveMini.addEventListener('click', async () => {
                const title = prompt('Enter a title or service name for this Account Pair (e.g., AWS, Netflix, Work Portal):');
                if (!title || !title.trim()) return;
                try {
                    const res = await postJSON('save/vault', {
                        title: title.trim(),
                        username_value: item.username,
                        password: item.password,
                        category: 'account_pair',
                    });
                    if (res.success) {
                        showToast(res.message || 'Account pair saved to Vault!');
                    }
                } catch (err) {
                    if (err.message && (err.message.includes('Authentication required') || err.message.includes('401'))) {
                        showToast('Please log in to save account credentials to your Vault.');
                    } else {
                        showToast(err.message || 'Failed to save to Vault.');
                    }
                }
            });

            actions.appendChild(copyMini);
            actions.appendChild(saveMini);
            row.appendChild(creds);
            row.appendChild(actions);
            comboHistoryList.appendChild(row);
        });
    }

    async function generatePair() {
        try {
            const [userData, passData] = await Promise.all([
                postJSON('generate-username', { style: 'classic', include_number: true }),
                postJSON('generate', { length: 16 }),
            ]);

            if (userData.success && passData.success) {
                lastUser = userData.primary.username;
                lastPass = passData.primary.password;

                comboUsername.textContent = lastUser;
                comboPassword.textContent = lastPass;
                addComboToHistory(lastUser, lastPass);
            }
        } catch (err) {
            console.error('Failed to generate account pair:', err);
        }
    }

    generateComboBtn.addEventListener('click', generatePair);
    copyComboUserBtn.addEventListener('click', () => copyToClipboard(lastUser));
    copyComboPassBtn.addEventListener('click', () => copyToClipboard(lastPass));

    copyBothBtn.addEventListener('click', () => {
        if (lastUser && lastPass) {
            const text = `Username: ${lastUser}\nPassword: ${lastPass}`;
            copyToClipboard(text, 'Copied Username & Password credentials!');
        }
    });

    if (clearComboHistoryBtn) {
        clearComboHistoryBtn.addEventListener('click', () => {
            comboHistory = [];
            clearSessionHistory(STORAGE_KEY);
            renderComboHistory();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            generatePair();
        }
    });

    if (saveComboVaultBtn) {
        saveComboVaultBtn.addEventListener('click', async () => {
            if (!lastUser || !lastPass) return;
            const title = prompt('Enter a title or service name for this Account Pair (e.g., AWS, Netflix, Work Portal):');
            if (!title || !title.trim()) return;

            try {
                const res = await postJSON('save/vault', {
                    title: title.trim(),
                    username_value: lastUser,
                    password: lastPass,
                    category: 'account_pair',
                });
                if (res.success) {
                    showToast(res.message || 'Account pair saved to Vault!');
                }
            } catch (err) {
                if (err.message && (err.message.includes('Authentication required') || err.message.includes('401'))) {
                    showToast('Please log in to save account credentials to your Vault.');
                } else {
                    showToast(err.message || 'Failed to save to Vault.');
                }
            }
        });
    }

    renderComboHistory();
    generatePair();
});

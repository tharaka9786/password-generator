/**
 * Account Pair Tool Script
 */
import { copyToClipboard } from '../shared/clipboard.js';
import { postJSON } from '../shared/api.js';
import { showToast } from '../shared/toast.js';

document.addEventListener('DOMContentLoaded', () => {
    const comboUsername = document.getElementById('comboUsername');
    const comboPassword = document.getElementById('comboPassword');
    const copyComboUserBtn = document.getElementById('copyComboUserBtn');
    const copyComboPassBtn = document.getElementById('copyComboPassBtn');
    const generateComboBtn = document.getElementById('generateComboBtn');
    const copyBothBtn = document.getElementById('copyBothBtn');

    let lastUser = '';
    let lastPass = '';

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

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            generatePair();
        }
    });

    const saveComboVaultBtn = document.getElementById('saveComboVaultBtn');
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

    generatePair();
});

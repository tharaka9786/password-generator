/**
 * Hash & Cipher Suite Tool Script
 */
import { copyToClipboard } from '../shared/clipboard.js';
import { postJSON } from '../shared/api.js';
import { showToast } from '../shared/toast.js';
import { loadSessionHistory, saveSessionHistory, clearSessionHistory } from '../shared/history.js';

document.addEventListener('DOMContentLoaded', () => {
    const hashHistoryList = document.getElementById('hashHistoryList');
    const clearHashHistoryBtn = document.getElementById('clearHashHistoryBtn');
    const STORAGE_KEY = 'passforge_session_history_hash';
    let hashHistory = loadSessionHistory(STORAGE_KEY);

    function addHashToHistory(entry) {
        if (!entry || !entry.title) return;
        if (hashHistory.length > 0 && hashHistory[0].title === entry.title && hashHistory[0].subtitle === entry.subtitle) return;
        hashHistory.unshift(entry);
        if (hashHistory.length > 50) hashHistory.pop();
        saveSessionHistory(STORAGE_KEY, hashHistory);
        renderHashHistory();
    }

    function renderHashHistory() {
        if (!hashHistoryList) return;
        if (hashHistory.length === 0) {
            hashHistoryList.innerHTML = '<p class="text-xs text-slate-500 italic text-center py-2" data-i18n="label.history_empty">Computed hashes and ciphers will appear here.</p>';
            return;
        }
        hashHistoryList.innerHTML = '';
        hashHistory.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'history-entry flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-2 px-3';

            const info = document.createElement('div');
            info.className = 'flex flex-col gap-0.5 font-mono text-xs break-all';
            info.innerHTML = `<span class="text-slate-200 font-medium select-all">${item.title}</span><span class="text-slate-400 text-[11px] select-all">${item.subtitle}</span>`;

            const actions = document.createElement('div');
            actions.className = 'flex items-center gap-1.5 shrink-0 self-end sm:self-center';

            if (item.copyValue) {
                const copyMini = document.createElement('button');
                copyMini.type = 'button';
                copyMini.className = 'mini-copy';
                copyMini.textContent = 'Copy';
                copyMini.title = 'Copy Result';
                copyMini.addEventListener('click', () => {
                    copyToClipboard(item.copyValue, 'Copied hash result!');
                });
                actions.appendChild(copyMini);
            }

            const saveMini = document.createElement('button');
            saveMini.type = 'button';
            saveMini.className = 'mini-copy text-amber-400 hover:text-amber-300';
            saveMini.textContent = 'Save';
            saveMini.title = 'Save to Activity History';
            saveMini.addEventListener('click', async () => {
                try {
                    const res = await postJSON('save/activity', {
                        tool_name: 'hash_generator',
                        input_summary: item.title,
                        result_summary: item.subtitle,
                    });
                    if (res.success) {
                        showToast(res.message || 'Saved to activity history!');
                    }
                } catch (err) {
                    if (err.message && (err.message.includes('Authentication required') || err.message.includes('401'))) {
                        showToast('Please log in to save to your history.');
                    } else {
                        showToast(err.message || 'Failed to save to activity history.');
                    }
                }
            });
            actions.appendChild(saveMini);

            row.appendChild(info);
            row.appendChild(actions);
            hashHistoryList.appendChild(row);
        });
    }

    if (clearHashHistoryBtn) {
        clearHashHistoryBtn.addEventListener('click', () => {
            hashHistory = [];
            clearSessionHistory(STORAGE_KEY);
            renderHashHistory();
        });
    }
    // -------------------------------------------------------------
    // Inner Mode Switcher
    // -------------------------------------------------------------
    const modeTabs = document.querySelectorAll('.mode-tab-btn');
    const modePanels = document.querySelectorAll('.tool-mode-panel');

    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetMode = tab.getAttribute('data-mode');

            modeTabs.forEach(t => {
                t.classList.remove('bg-indigo-600', 'text-white');
                t.classList.add('text-slate-400');
            });
            tab.classList.add('bg-indigo-600', 'text-white');
            tab.classList.remove('text-slate-400');

            modePanels.forEach(p => p.classList.add('hidden'));
            const panel = document.getElementById(targetMode);
            if (panel) panel.classList.remove('hidden');

            if (window.lucide) window.lucide.createIcons();
        });
    });

    // -------------------------------------------------------------
    // MODE 1: HASH GENERATOR
    // -------------------------------------------------------------
    const textInput = document.getElementById('hashTextInput');
    const charCountTag = document.getElementById('charCountTag');
    const clearBtn = document.getElementById('clearHashInputBtn');
    const copyAllBtn = document.getElementById('copyAllHashesBtn');
    const copyButtons = document.querySelectorAll('.copy-hash-btn');

    let currentHashes = {};
    let debounceTimer = null;
    let historyDebounce = null;

    async function computeHashes(val) {
        try {
            const data = await postJSON('generate-hash', { text: val });
            if (data.success && data.data) {
                currentHashes = data.data.hashes;
                charCountTag.textContent = `${data.data.input_length} characters · ${data.data.byte_length} bytes`;

                for (const [algo, hashVal] of Object.entries(currentHashes)) {
                    const el = document.getElementById(`digest-${algo}`);
                    if (el) el.textContent = hashVal;
                }
            }
        } catch (err) {
            console.error('Hashing error:', err);
        }
    }

    textInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            computeHashes(textInput.value);
        }, 120);

        clearTimeout(historyDebounce);
        historyDebounce = setTimeout(() => {
            const v = (textInput.value || '').trim();
            if (v && currentHashes.sha256) {
                const preview = v.length > 28 ? v.slice(0, 28) + '…' : v;
                addHashToHistory({
                    title: `Hash: "${preview}"`,
                    subtitle: `SHA-256: ${currentHashes.sha256.slice(0, 16)}… | MD5: ${currentHashes.md5 || '-'}`,
                    copyValue: currentHashes.sha256,
                });
            }
        }, 800);
    });

    clearBtn.addEventListener('click', () => {
        textInput.value = '';
        computeHashes('');
        textInput.focus();
    });

    copyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const algo = btn.getAttribute('data-algo');
            const hashVal = currentHashes[algo];
            if (hashVal) {
                copyToClipboard(hashVal, `Copied ${algo.toUpperCase()} digest!`);
            }
        });
    });

    copyAllBtn.addEventListener('click', () => {
        if (Object.keys(currentHashes).length > 0) {
            const formatted = Object.entries(currentHashes)
                .map(([k, v]) => `${k.toUpperCase().padEnd(10)}: ${v}`)
                .join('\n');
            copyToClipboard(formatted, 'Copied all computed digests!');
        }
    });

    const saveHashResultBtn = document.getElementById('saveHashResultBtn');
    if (saveHashResultBtn) {
        saveHashResultBtn.addEventListener('click', async () => {
            const raw = textInput ? textInput.value : '';
            if (!raw || Object.keys(currentHashes).length === 0) {
                showToast('Please enter text to compute hashes first.');
                return;
            }

            const inputSummary = `Text length: ${raw.length} chars (${raw.slice(0, 30)}${raw.length > 30 ? '...' : ''})`;
            const resultSummary = `SHA-256: ${currentHashes.sha256 || '-'} | MD5: ${currentHashes.md5 || '-'}`;

            try {
                const res = await postJSON('save/activity', {
                    tool_name: 'hash_generator',
                    input_summary: inputSummary,
                    result_summary: resultSummary,
                });
                if (res.success) {
                    showToast(res.message || 'Saved to activity history!');
                }
            } catch (err) {
                if (err.message && (err.message.includes('Authentication required') || err.message.includes('401'))) {
                    showToast('Please log in to save hash results to your history.');
                } else {
                    showToast(err.message || 'Failed to save to activity history.');
                }
            }
        });
    }

    // -------------------------------------------------------------
    // MODE 2: TWO-WAY CIPHER (ENCRYPT & DECRYPT)
    // -------------------------------------------------------------
    const cipherOpRadios = document.querySelectorAll('input[name="cipherOp"]');
    const cipherAlgorithm = document.getElementById('cipherAlgorithm');
    const keyInputGroup = document.getElementById('keyInputGroup');
    const cipherKeyInput = document.getElementById('cipherKeyInput');
    const autoGenKeyBtn = document.getElementById('autoGenKeyBtn');
    const cipherInput = document.getElementById('cipherInput');
    const cipherInputLabel = document.getElementById('cipherInputLabel');
    const executeCipherBtn = document.getElementById('executeCipherBtn');
    const cipherBtnText = document.getElementById('cipherBtnText');
    const cipherResultLabel = document.getElementById('cipherResultLabel');
    const cipherResultDisplay = document.getElementById('cipherResultDisplay');
    const copyCipherResultBtn = document.getElementById('copyCipherResultBtn');
    const cipherErrorBanner = document.getElementById('cipherErrorBanner');

    let currentCipherResult = '';

    function updateCipherUI() {
        const isEncrypt = document.querySelector('input[name="cipherOp"]:checked').value === 'encrypt';
        const algo = cipherAlgorithm.value;

        // Key visibility
        if (algo === 'base64' || algo === 'rot13' || algo === 'hex') {
            keyInputGroup.classList.add('opacity-40', 'pointer-events-none');
            cipherKeyInput.value = '';
            cipherKeyInput.placeholder = 'No key needed for this cipher';
        } else {
            keyInputGroup.classList.remove('opacity-40', 'pointer-events-none');
            cipherKeyInput.placeholder = 'Enter key or passphrase...';
        }

        if (isEncrypt) {
            cipherInputLabel.textContent = 'Plaintext to Encrypt';
            cipherInput.placeholder = 'Enter text to encrypt...';
            cipherBtnText.textContent = 'Encrypt Text';
            cipherResultLabel.textContent = 'Result (Ciphertext)';
        } else {
            cipherInputLabel.textContent = 'Ciphertext to Decrypt';
            cipherInput.placeholder = 'Enter ciphertext to decrypt...';
            cipherBtnText.textContent = 'Decrypt Ciphertext';
            cipherResultLabel.textContent = 'Result (Plaintext)';
        }
    }

    cipherOpRadios.forEach(r => r.addEventListener('change', updateCipherUI));
    cipherAlgorithm.addEventListener('change', updateCipherUI);

    autoGenKeyBtn.addEventListener('click', () => {
        // Generate high entropy random key
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
        let key = '';
        for (let i = 0; i < 32; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        cipherKeyInput.value = key;
    });

    executeCipherBtn.addEventListener('click', async () => {
        const isEncrypt = document.querySelector('input[name="cipherOp"]:checked').value === 'encrypt';
        const textVal = cipherInput.value.trim();
        const keyVal = cipherKeyInput.value.trim();
        const algo = cipherAlgorithm.value;

        cipherErrorBanner.classList.add('hidden');

        if (!textVal) {
            cipherErrorBanner.textContent = 'Please provide input text.';
            cipherErrorBanner.classList.remove('hidden');
            return;
        }

        try {
            if (isEncrypt) {
                const res = await postJSON('encrypt-text', {
                    text: textVal,
                    key: keyVal,
                    cipher_type: algo,
                });
                if (res.success && res.data) {
                    currentCipherResult = res.data.ciphertext;
                    cipherResultDisplay.textContent = currentCipherResult;
                    if (res.data.key && !cipherKeyInput.value) {
                        cipherKeyInput.value = res.data.key;
                    }
                    addHashToHistory({
                        title: `Cipher [${algo.toUpperCase()} - Encrypt]: "${textVal.slice(0, 24)}${textVal.length > 24 ? '…' : ''}"`,
                        subtitle: `Result: ${currentCipherResult.slice(0, 32)}${currentCipherResult.length > 32 ? '…' : ''}`,
                        copyValue: currentCipherResult,
                    });
                }
            } else {
                const res = await postJSON('decrypt-text', {
                    ciphertext: textVal,
                    key: keyVal,
                    cipher_type: algo,
                });
                if (res.success && res.data) {
                    currentCipherResult = res.data.plaintext;
                    cipherResultDisplay.textContent = currentCipherResult;
                    addHashToHistory({
                        title: `Cipher [${algo.toUpperCase()} - Decrypt]: "${textVal.slice(0, 24)}${textVal.length > 24 ? '…' : ''}"`,
                        subtitle: `Result: ${currentCipherResult.slice(0, 32)}${currentCipherResult.length > 32 ? '…' : ''}`,
                        copyValue: currentCipherResult,
                    });
                }
            }
        } catch (err) {
            cipherErrorBanner.textContent = err.message || 'Cipher operation failed.';
            cipherErrorBanner.classList.remove('hidden');
        }
    });

    copyCipherResultBtn.addEventListener('click', () => {
        if (currentCipherResult) {
            copyToClipboard(currentCipherResult, 'Copied cipher result!');
        }
    });

    // -------------------------------------------------------------
    // MODE 3: HASH DECRYPTOR / REVERSE LOOKUP
    // -------------------------------------------------------------
    const reverseHashInput = document.getElementById('reverseHashInput');
    const executeReverseBtn = document.getElementById('executeReverseBtn');
    const reverseResultCard = document.getElementById('reverseResultCard');
    const reverseStatusBadge = document.getElementById('reverseStatusBadge');
    const reverseSuccessBlock = document.getElementById('reverseSuccessBlock');
    const reversePlaintextDisplay = document.getElementById('reversePlaintextDisplay');
    const copyReversePlaintextBtn = document.getElementById('copyReversePlaintextBtn');
    const reverseAlgoDisplay = document.getElementById('reverseAlgoDisplay');
    const reverseSourceDisplay = document.getElementById('reverseSourceDisplay');
    const reverseFailBlock = document.getElementById('reverseFailBlock');
    const reverseFailMessage = document.getElementById('reverseFailMessage');
    const sampleHashes = document.querySelectorAll('.sample-hash');

    let currentDecryptedHash = '';

    async function lookupHash(hashVal) {
        if (!hashVal || !hashVal.trim()) return;

        // Show loading state
        executeReverseBtn.disabled = true;
        executeReverseBtn.innerHTML = '<span class="animate-spin inline-block mr-2">⟳</span> Searching...';

        try {
            const data = await postJSON('decrypt-hash', { hash: hashVal.trim() });
            reverseResultCard.classList.remove('hidden');

            if (data.success && data.data) {
                const res = data.data;
                if (res.found) {
                    currentDecryptedHash = res.plaintext;
                    reverseStatusBadge.textContent = 'MATCH FOUND';
                    reverseStatusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
                    reversePlaintextDisplay.textContent = res.plaintext;
                    reverseAlgoDisplay.textContent = res.algorithm;

                    // Show source (local dict vs external API)
                    if (reverseSourceDisplay) {
                        reverseSourceDisplay.textContent = res.source || 'Unknown';
                        const isExternal = res.external_queried;
                        reverseSourceDisplay.className = isExternal
                            ? 'font-mono text-sm font-semibold text-sky-400'
                            : 'font-mono text-sm font-semibold text-violet-400';
                    }

                    reverseSuccessBlock.classList.remove('hidden');
                    reverseFailBlock.classList.add('hidden');

                    addHashToHistory({
                        title: `Lookup [${res.algorithm}]: ${hashVal.slice(0, 16)}…`,
                        subtitle: `Match: "${res.plaintext}" (${res.source || 'Database'})`,
                        copyValue: res.plaintext,
                    });
                } else {
                    currentDecryptedHash = '';
                    reverseStatusBadge.textContent = 'NOT FOUND';
                    reverseStatusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30';

                    const candidates = (res.possible_types || []).join(', ') || 'Unknown';
                    const externalNote = res.external_queried
                        ? ' External hash databases (hashes.com, md5decrypt.net, nitrxgen.net) were also searched.'
                        : '';
                    reverseFailMessage.textContent =
                        `No pre-image matched this hash. Identified candidate format: ${candidates}.${externalNote}`;

                    reverseSuccessBlock.classList.add('hidden');
                    reverseFailBlock.classList.remove('hidden');

                    addHashToHistory({
                        title: `Lookup: ${hashVal.slice(0, 16)}…`,
                        subtitle: `Status: Not Found (${candidates})`,
                        copyValue: hashVal,
                    });
                }
            }
        } catch (err) {
            console.error('Hash lookup error:', err);
        } finally {
            executeReverseBtn.disabled = false;
            executeReverseBtn.innerHTML = '<i data-lucide="search" class="w-4 h-4 mr-2"></i><span>Lookup Hash</span>';
            if (window.lucide) window.lucide.createIcons();
        }
    }

    executeReverseBtn.addEventListener('click', () => lookupHash(reverseHashInput.value));
    reverseHashInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') lookupHash(reverseHashInput.value);
    });

    sampleHashes.forEach(sh => {
        sh.addEventListener('click', () => {
            const val = sh.getAttribute('data-hash');
            reverseHashInput.value = val;
            lookupHash(val);
        });
    });

    copyReversePlaintextBtn.addEventListener('click', () => {
        if (currentDecryptedHash) {
            copyToClipboard(currentDecryptedHash, 'Copied decrypted plaintext!');
        }
    });

    // Initial default execution
    renderHashHistory();
    computeHashes('PassForge');
    textInput.value = 'PassForge';
    updateCipherUI();
});

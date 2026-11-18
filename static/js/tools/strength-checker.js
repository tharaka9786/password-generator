/**
 * Password Strength Checker Tool Script
 */
import { copyToClipboard } from '../shared/clipboard.js';
import { postJSON } from '../shared/api.js';
import { showToast } from '../shared/toast.js';
import { loadSessionHistory, saveSessionHistory, clearSessionHistory } from '../shared/history.js';

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('checkInput');
    const toggleMaskBtn = document.getElementById('toggleMaskBtn');
    const eyeIcon = document.getElementById('eyeIcon');
    const clearBtn = document.getElementById('clearInputBtn');

    const auditLabel = document.getElementById('auditLabel');
    const auditEntropy = document.getElementById('auditEntropy');
    const auditFill = document.getElementById('auditFill');
    const auditCrackTime = document.getElementById('auditCrackTime');

    const compUpper = document.getElementById('compUpper');
    const compLower = document.getElementById('compLower');
    const compDigits = document.getElementById('compDigits');
    const compSymbols = document.getElementById('compSymbols');

    const findingsList = document.getElementById('findingsList');
    const tipsList = document.getElementById('tipsList');
    const saveStrengthResultBtn = document.getElementById('saveStrengthResultBtn');

    const strengthHistoryList = document.getElementById('strengthHistoryList');
    const clearStrengthHistoryBtn = document.getElementById('clearStrengthHistoryBtn');

    const STORAGE_KEY = 'passforge_session_history_strength';
    let strengthHistory = loadSessionHistory(STORAGE_KEY);

    let debounceTimer = null;
    let historyDebounce = null;
    let lastAudit = null;
    let lastPassword = '';

    function addStrengthToHistory(pwd, a) {
        if (!pwd || !a) return;
        if (strengthHistory.length > 0 && strengthHistory[0].password === pwd) return;
        strengthHistory.unshift({
            password: pwd,
            label: a.label,
            color: a.color,
            entropy: a.entropy,
            crack_time: a.crack_time,
            score: a.score,
        });
        if (strengthHistory.length > 50) strengthHistory.pop();
        saveSessionHistory(STORAGE_KEY, strengthHistory);
        renderStrengthHistory();
    }

    function renderStrengthHistory() {
        if (!strengthHistoryList) return;
        if (strengthHistory.length === 0) {
            strengthHistoryList.innerHTML = '<p class="text-xs text-slate-500 italic text-center py-2" data-i18n="label.history_empty">Audited passwords will appear here.</p>';
            return;
        }
        strengthHistoryList.innerHTML = '';
        strengthHistory.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'history-entry flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-2 px-3';

            const info = document.createElement('div');
            info.className = 'flex flex-wrap items-center gap-2 font-mono text-xs break-all';
            info.innerHTML = `
                <span class="text-slate-200 font-semibold select-all">${item.password}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style="background-color: ${item.color}22; color: ${item.color}; border: 1px solid ${item.color}44">${item.label}</span>
                <span class="text-slate-400 text-[11px]">${item.entropy} bits · ${item.crack_time}</span>
            `;

            const actions = document.createElement('div');
            actions.className = 'flex items-center gap-1.5 shrink-0 self-end sm:self-center';

            const copyMini = document.createElement('button');
            copyMini.type = 'button';
            copyMini.className = 'mini-copy';
            copyMini.textContent = 'Copy';
            copyMini.title = 'Copy password';
            copyMini.addEventListener('click', () => copyToClipboard(item.password));

            const saveMini = document.createElement('button');
            saveMini.type = 'button';
            saveMini.className = 'mini-copy text-amber-400 hover:text-amber-300';
            saveMini.textContent = 'Save';
            saveMini.title = 'Save Audit to Activity History';
            saveMini.addEventListener('click', async () => {
                try {
                    const res = await postJSON('save/activity', {
                        tool_name: 'strength_checker',
                        input_summary: `Password audit (len ${item.password.length})`,
                        result_summary: `${item.label} (${item.entropy} bits entropy, crack time: ${item.crack_time})`,
                    });
                    if (res.success) {
                        showToast(res.message || 'Audit saved to activity history!');
                    }
                } catch (err) {
                    if (err.message && (err.message.includes('Authentication required') || err.message.includes('401'))) {
                        showToast('Please log in to save audits to your history.');
                    } else {
                        showToast(err.message || 'Failed to save audit.');
                    }
                }
            });

            actions.appendChild(copyMini);
            actions.appendChild(saveMini);
            row.appendChild(info);
            row.appendChild(actions);
            strengthHistoryList.appendChild(row);
        });
    }

    toggleMaskBtn.addEventListener('click', () => {
        if (input.type === 'password') {
            input.type = 'text';
            eyeIcon.setAttribute('data-lucide', 'eye-off');
        } else {
            input.type = 'password';
            eyeIcon.setAttribute('data-lucide', 'eye');
        }
        if (window.lucide) window.lucide.createIcons();
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        runAudit('');
        input.focus();
    });

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            runAudit(input.value);
        }, 150);

        clearTimeout(historyDebounce);
        historyDebounce = setTimeout(() => {
            const v = (input.value || '').trim();
            if (v && lastAudit) {
                addStrengthToHistory(v, lastAudit);
            }
        }, 800);
    });

    input.addEventListener('change', () => {
        const v = (input.value || '').trim();
        if (v && lastAudit) {
            addStrengthToHistory(v, lastAudit);
        }
    });

    async function runAudit(pwd) {
        if (!pwd) {
            auditLabel.textContent = '-';
            auditLabel.style.color = '#64748b';
            auditEntropy.textContent = '0.0 bits entropy';
            auditFill.style.width = '0%';
            auditFill.style.backgroundColor = '#64748b';
            auditCrackTime.textContent = 'Estimated crack time: -';

            compUpper.textContent = '0';
            compLower.textContent = '0';
            compDigits.textContent = '0';
            compSymbols.textContent = '0';

            findingsList.innerHTML = '<li class="text-slate-400 italic text-xs">Enter a password above to begin analysis.</li>';
            tipsList.innerHTML = '<li class="text-slate-400 italic text-xs">Recommendations will be generated automatically.</li>';
            return;
        }

        try {
            const data = await postJSON('check-strength', { password: pwd });
            if (data.success && data.analysis) {
                lastAudit = data.analysis;
                lastPassword = pwd;
                renderAudit(data.analysis);
            }
        } catch (err) {
            console.error('Audit failed:', err);
        }
    }

    if (saveStrengthResultBtn) {
        saveStrengthResultBtn.addEventListener('click', async () => {
            if (!lastAudit || !lastPassword) {
                showToast('Please type a password to audit first.');
                return;
            }
            addStrengthToHistory(lastPassword, lastAudit);
            try {
                const res = await postJSON('save/activity', {
                    tool_name: 'strength_checker',
                    input_summary: `Password audit (len ${lastPassword.length})`,
                    result_summary: `${lastAudit.label} (${lastAudit.entropy} bits entropy, crack time: ${lastAudit.crack_time})`,
                });
                if (res.success) {
                    showToast(res.message || 'Audit saved to activity history!');
                }
            } catch (err) {
                if (err.message && (err.message.includes('Authentication required') || err.message.includes('401'))) {
                    showToast('Please log in to save audits to your history.');
                } else {
                    showToast(err.message || 'Failed to save audit.');
                }
            }
        });
    }

    if (clearStrengthHistoryBtn) {
        clearStrengthHistoryBtn.addEventListener('click', () => {
            strengthHistory = [];
            clearSessionHistory(STORAGE_KEY);
            renderStrengthHistory();
        });
    }

    renderStrengthHistory();

    function renderAudit(a) {
        auditLabel.textContent = a.label;
        auditLabel.style.color = a.color;
        auditEntropy.textContent = `${a.entropy} bits entropy`;

        const percent = Math.min(100, Math.round((a.score / 5) * 100));
        auditFill.style.width = `${percent}%`;
        auditFill.style.backgroundColor = a.color;
        auditCrackTime.textContent = `Estimated crack time: ${a.crack_time}`;

        compUpper.textContent = a.composition.uppercase;
        compLower.textContent = a.composition.lowercase;
        compDigits.textContent = a.composition.digits;
        compSymbols.textContent = a.composition.symbols;

        findingsList.innerHTML = '';
        a.findings.forEach(f => {
            const li = document.createElement('li');
            li.textContent = f;
            findingsList.appendChild(li);
        });

        tipsList.innerHTML = '';
        a.tips.forEach(t => {
            const li = document.createElement('li');
            li.className = 'text-slate-300';
            li.textContent = `• ${t}`;
            tipsList.appendChild(li);
        });
    }
});

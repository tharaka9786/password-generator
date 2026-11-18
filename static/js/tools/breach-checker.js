/**
 * Data Breach & Credential Leak Auditor Script
 * Handles k-Anonymity password audits and email exposure lookups.
 */

import { copyToClipboard } from '../shared/clipboard.js';
import { postJSON } from '../shared/api.js';
import { showToast } from '../shared/toast.js';
import { loadSessionHistory, saveSessionHistory, clearSessionHistory } from '../shared/history.js';

document.addEventListener('DOMContentLoaded', () => {
    const breachHistoryList = document.getElementById('breachHistoryList');
    const clearBreachHistoryBtn = document.getElementById('clearBreachHistoryBtn');

    const STORAGE_KEY = 'passforge_session_history_breach';
    let breachHistory = loadSessionHistory(STORAGE_KEY);

    function addBreachToHistory(entry) {
        if (!entry || !entry.title) return;
        if (breachHistory.length > 0 && breachHistory[0].title === entry.title && breachHistory[0].subtitle === entry.subtitle) return;
        breachHistory.unshift(entry);
        if (breachHistory.length > 50) breachHistory.pop();
        saveSessionHistory(STORAGE_KEY, breachHistory);
        renderBreachHistory();
    }

    function renderBreachHistory() {
        if (!breachHistoryList) return;
        if (breachHistory.length === 0) {
            breachHistoryList.innerHTML = '<p class="text-xs text-slate-500 italic text-center py-2" data-i18n="label.history_empty">Breach audit records will appear here.</p>';
            return;
        }
        breachHistoryList.innerHTML = '';
        breachHistory.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'history-entry flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-2 px-3';

            const info = document.createElement('div');
            info.className = 'flex flex-wrap items-center gap-2 font-mono text-xs break-all';
            const badgeClass = item.breached
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';

            info.innerHTML = `
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeClass}">${item.type}</span>
                <span class="text-slate-200 font-semibold select-all">${item.title}</span>
                <span class="text-slate-400 text-[11px] select-all">${item.subtitle}</span>
            `;

            const actions = document.createElement('div');
            actions.className = 'flex items-center gap-1.5 shrink-0 self-end sm:self-center';

            if (item.copyValue) {
                const copyMini = document.createElement('button');
                copyMini.type = 'button';
                copyMini.className = 'mini-copy';
                copyMini.textContent = 'Copy';
                copyMini.title = 'Copy summary';
                copyMini.addEventListener('click', () => {
                    copyToClipboard(item.copyValue, 'Copied breach summary!');
                });
                actions.appendChild(copyMini);
            }

            const saveMini = document.createElement('button');
            saveMini.type = 'button';
            saveMini.className = 'mini-copy text-amber-400 hover:text-amber-300';
            saveMini.textContent = 'Save';
            saveMini.title = 'Save Audit to Activity History';
            saveMini.addEventListener('click', async () => {
                try {
                    const res = await postJSON('save/activity', {
                        tool_name: 'breach_checker',
                        input_summary: item.title,
                        result_summary: item.subtitle,
                    });
                    if (res.success) {
                        showToast(res.message || 'Saved to activity history!');
                    }
                } catch (err) {
                    if (err.message && (err.message.includes('Authentication required') || err.message.includes('401'))) {
                        showToast('Please log in to save breach audits to your history.');
                    } else {
                        showToast(err.message || 'Failed to save audit.');
                    }
                }
            });
            actions.appendChild(saveMini);

            row.appendChild(info);
            row.appendChild(actions);
            breachHistoryList.appendChild(row);
        });
    }

    if (clearBreachHistoryBtn) {
        clearBreachHistoryBtn.addEventListener('click', () => {
            breachHistory = [];
            clearSessionHistory(STORAGE_KEY);
            renderBreachHistory();
        });
    }
    // -------------------------------------------------------------------------
    // 1. Inner Mode Tabs
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // 2. Mode 1: Password Leak Audit
    // -------------------------------------------------------------------------
    const passInput = document.getElementById('breachPasswordInput');
    const toggleMaskBtn = document.getElementById('togglePasswordMaskBtn');
    const eyeIcon = document.getElementById('passwordEyeIcon');
    const clearPassBtn = document.getElementById('clearPasswordInputBtn');
    const execPassBtn = document.getElementById('executePasswordAuditBtn');

    const passResultCard = document.getElementById('passwordResultCard');
    const passStatusBadge = document.getElementById('passwordStatusBadge');
    const passMetricBox = document.getElementById('passwordMetricBox');
    const passBreachCount = document.getElementById('passwordBreachCountDisplay');
    const passSeverity = document.getElementById('passwordSeverityDisplay');
    const passMessage = document.getElementById('passwordMessageDisplay');
    const passRecBox = document.getElementById('passwordRecommendationBox');
    const passSource = document.getElementById('passwordSourceDisplay');
    const passPrefix = document.getElementById('passwordPrefixDisplay');
    const samplePasses = document.querySelectorAll('.sample-pass');
    const savePasswordBreachResultBtn = document.getElementById('savePasswordBreachResultBtn');

    let lastPasswordAudit = null;
    let lastEmailAudit = null;

    // Toggle password mask
    toggleMaskBtn.addEventListener('click', () => {
        const isMasked = passInput.type === 'password';
        passInput.type = isMasked ? 'text' : 'password';
        eyeIcon.setAttribute('data-lucide', isMasked ? 'eye-off' : 'eye');
        if (window.lucide) window.lucide.createIcons();
    });

    // Clear password input
    clearPassBtn.addEventListener('click', () => {
        passInput.value = '';
        passResultCard.classList.add('hidden');
        passInput.focus();
    });

    // Quick samples
    samplePasses.forEach(s => {
        s.addEventListener('click', () => {
            passInput.value = s.getAttribute('data-val');
            auditPassword(passInput.value);
        });
    });

    async function auditPassword(val) {
        if (!val) return;

        execPassBtn.disabled = true;
        execPassBtn.innerHTML = '<span class="animate-spin inline-block mr-1.5">⟳</span> Auditing...';

        try {
            const res = await postJSON('check-password-breach', { password: val });
            if (res.success && res.data) {
                renderPasswordResult(res.data);
            }
        } catch (err) {
            console.error('Password audit error:', err);
        } finally {
            execPassBtn.disabled = false;
            execPassBtn.innerHTML = '<i data-lucide="search" class="w-3.5 h-3.5"></i><span>Audit Password</span>';
            if (window.lucide) window.lucide.createIcons();
        }
    }

    function renderPasswordResult(data) {
        lastPasswordAudit = data;
        passResultCard.classList.remove('hidden');

        const isClean = !data.breached;
        const count = data.breach_count || 0;
        const sev = data.severity || 'CLEAN';

        // Badge styling
        passStatusBadge.textContent = isClean ? 'CLEAN & SAFE' : `${sev} RISK`;
        passStatusBadge.className = isClean
            ? 'px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : (sev === 'LOW'
                ? 'px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30');

        // Metric box styling
        passMetricBox.className = isClean
            ? 'p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3'
            : (sev === 'LOW'
                ? 'p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3'
                : 'p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3');

        passBreachCount.textContent = isClean ? '0 Breaches' : `${count.toLocaleString()} Times`;
        passBreachCount.className = isClean
            ? 'text-2xl sm:text-3xl font-extrabold font-mono mt-0.5 text-emerald-400'
            : (sev === 'LOW' ? 'text-2xl sm:text-3xl font-extrabold font-mono mt-0.5 text-amber-400' : 'text-2xl sm:text-3xl font-extrabold font-mono mt-0.5 text-rose-400');

        passSeverity.textContent = isClean ? 'Zero Leaks' : `${sev} Exposure`;
        passSeverity.className = isClean ? 'text-sm font-bold uppercase tracking-wider mt-0.5 text-emerald-300' : 'text-sm font-bold uppercase tracking-wider mt-0.5 text-rose-300';

        passMessage.textContent = data.message;

        passRecBox.textContent = data.recommendation;
        passRecBox.className = isClean
            ? 'p-3.5 rounded-xl text-xs leading-relaxed border border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
            : (sev === 'LOW'
                ? 'p-3.5 rounded-xl text-xs leading-relaxed border border-amber-500/20 bg-amber-500/10 text-amber-200'
                : 'p-3.5 rounded-xl text-xs leading-relaxed border border-rose-500/20 bg-rose-500/10 text-rose-200');

        passSource.textContent = data.source || 'HIBP k-Anonymity';
        passPrefix.textContent = data.sha1_prefix ? `${data.sha1_prefix}...` : 'N/A';

        if (window.lucide) window.lucide.createIcons();

        addBreachToHistory({
            type: 'Password',
            title: `Password (SHA-1: ${data.sha1_prefix || 'N/A'}…)`,
            subtitle: isClean
                ? 'CLEAN: Zero known breach occurrences (k-Anonymity)'
                : `LEAKED: Found in ${count.toLocaleString()} breaches (${sev})`,
            breached: data.breached,
            copyValue: isClean ? 'CLEAN: 0 leaks' : `LEAKED: ${count.toLocaleString()} breaches (${sev})`,
        });
    }

    execPassBtn.addEventListener('click', () => auditPassword(passInput.value));
    passInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') auditPassword(passInput.value);
    });

    // -------------------------------------------------------------------------
    // 3. Mode 2: Email & Identity Breach Search
    // -------------------------------------------------------------------------
    const emailInput = document.getElementById('breachEmailInput');
    const clearEmailBtn = document.getElementById('clearEmailInputBtn');
    const execEmailBtn = document.getElementById('executeEmailAuditBtn');

    const emailResultCard = document.getElementById('emailResultCard');
    const emailStatusBadge = document.getElementById('emailStatusBadge');
    const emailMetricBox = document.getElementById('emailMetricBox');
    const emailBreachCount = document.getElementById('emailBreachCountDisplay');
    const emailSeverity = document.getElementById('emailSeverityDisplay');
    const emailMessage = document.getElementById('emailMessageDisplay');

    const compromisedSection = document.getElementById('compromisedDataSection');
    const pillsContainer = document.getElementById('compromisedPillsContainer');

    const breachedSection = document.getElementById('breachedServicesSection');
    const breachesGrid = document.getElementById('breachesGrid');

    const remediationList = document.getElementById('remediationList');
    const sampleEmails = document.querySelectorAll('.sample-email');

    clearEmailBtn.addEventListener('click', () => {
        emailInput.value = '';
        emailResultCard.classList.add('hidden');
        emailInput.focus();
    });

    sampleEmails.forEach(s => {
        s.addEventListener('click', () => {
            emailInput.value = s.getAttribute('data-val');
            auditEmail(emailInput.value);
        });
    });

    async function auditEmail(val) {
        if (!val || !val.trim()) return;

        execEmailBtn.disabled = true;
        execEmailBtn.innerHTML = '<span class="animate-spin inline-block mr-1.5">⟳</span> Searching...';

        try {
            const res = await postJSON('check-account-breach', { account: val.trim() });
            if (res.success && res.data) {
                renderEmailResult(res.data);
            }
        } catch (err) {
            console.error('Email breach lookup error:', err);
        } finally {
            execEmailBtn.disabled = false;
            execEmailBtn.innerHTML = '<i data-lucide="search" class="w-3.5 h-3.5"></i><span>Search Breaches</span>';
            if (window.lucide) window.lucide.createIcons();
        }
    }

    function renderEmailResult(data) {
        lastEmailAudit = data;
        emailResultCard.classList.remove('hidden');

        const count = data.breach_count || 0;
        const isClean = count === 0;
        const sev = data.severity || 'CLEAN';

        // Badge styling
        emailStatusBadge.textContent = isClean ? 'CLEAN & UNEXPOSED' : `${count} BREACHES DETECTED`;
        emailStatusBadge.className = isClean
            ? 'px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : (sev === 'MODERATE'
                ? 'px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30');

        // Metric Box
        emailMetricBox.className = isClean
            ? 'p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3'
            : (sev === 'MODERATE'
                ? 'p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3'
                : 'p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3');

        emailBreachCount.textContent = isClean ? '0 Incidents' : `${count} Compromised Site${count === 1 ? '' : 's'}`;
        emailBreachCount.className = isClean
            ? 'text-2xl sm:text-3xl font-extrabold font-mono mt-0.5 text-emerald-400'
            : (sev === 'MODERATE' ? 'text-2xl sm:text-3xl font-extrabold font-mono mt-0.5 text-amber-400' : 'text-2xl sm:text-3xl font-extrabold font-mono mt-0.5 text-rose-400');

        emailSeverity.textContent = isClean ? 'No Exposure' : `${sev} Severity`;
        emailSeverity.className = isClean ? 'text-sm font-bold uppercase tracking-wider mt-0.5 text-emerald-300' : 'text-sm font-bold uppercase tracking-wider mt-0.5 text-rose-300';

        emailMessage.textContent = data.message;

        // Compromised data categories
        const types = data.compromised_data_types || [];
        if (types.length > 0 && !isClean) {
            pillsContainer.innerHTML = '';
            types.forEach(t => {
                const pill = document.createElement('span');
                pill.className = 'px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20';
                pill.textContent = t;
                pillsContainer.appendChild(pill);
            });
            compromisedSection.classList.remove('hidden');
        } else {
            compromisedSection.classList.add('hidden');
        }

        // Breached Services Grid
        const breaches = data.breaches || [];
        if (breaches.length > 0 && !isClean) {
            breachesGrid.innerHTML = '';
            breaches.forEach(b => {
                const card = document.createElement('div');
                card.className = 'p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col gap-1.5 hover:border-indigo-500/30 transition';

                const compTags = (b.compromised || []).map(c =>
                    `<span class="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-slate-400">${c}</span>`
                ).join('');

                card.innerHTML = `
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-sm text-slate-100">${b.name}</span>
                        <span class="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">${b.year}</span>
                    </div>
                    <p class="text-xs text-slate-400 leading-relaxed">${b.description}</p>
                    <div class="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-white/5 mt-1">
                        <span>Records: <strong class="text-slate-300">${b.records}</strong></span>
                        <div class="flex flex-wrap gap-1">${compTags}</div>
                    </div>
                `;
                breachesGrid.appendChild(card);
            });
            breachedSection.classList.remove('hidden');
        } else {
            breachedSection.classList.add('hidden');
        }

        // Recommendations
        remediationList.innerHTML = '';
        (data.recommendations || []).forEach(r => {
            const li = document.createElement('li');
            li.textContent = r;
            remediationList.appendChild(li);
        });

        if (window.lucide) window.lucide.createIcons();

        addBreachToHistory({
            type: 'Email',
            title: `Email: ${data.email || 'Account'}`,
            subtitle: isClean
                ? 'SAFE: No known corporate breach leaks found'
                : `COMPROMISED: ${count} breach${count === 1 ? '' : 'es'} (${(types || []).slice(0, 3).join(', ')})`,
            breached: !isClean,
            copyValue: `${data.email} - ${isClean ? 'SAFE' : count + ' breaches detected'}`,
        });
    }

    execEmailBtn.addEventListener('click', () => auditEmail(emailInput.value));
    emailInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') auditEmail(emailInput.value);
    });

    if (savePasswordBreachResultBtn) {
        savePasswordBreachResultBtn.addEventListener('click', async () => {
            if (!lastPasswordAudit) {
                showToast('Please audit a password first.');
                return;
            }
            try {
                const count = lastPasswordAudit.breach_count || 0;
                const statusStr = lastPasswordAudit.breached
                    ? `LEAKED: Found in ${count.toLocaleString()} breaches (${lastPasswordAudit.severity} exposure)`
                    : 'CLEAN: Zero known breach occurrences (k-Anonymity)';
                const res = await postJSON('save/activity', {
                    tool_name: 'breach_checker',
                    input_summary: `Password leak audit (SHA-1 prefix: ${lastPasswordAudit.sha1_prefix || 'N/A'})`,
                    result_summary: statusStr,
                });
                if (res.success) {
                    showToast(res.message || 'Saved to activity history!');
                }
            } catch (err) {
                if (err.message && (err.message.includes('Authentication required') || err.message.includes('401'))) {
                    showToast('Please log in to save breach audits to your history.');
                } else {
                    showToast(err.message || 'Failed to save audit.');
                }
            }
        });
    }

    const saveEmailBreachResultBtn = document.getElementById('saveEmailBreachResultBtn');
    if (saveEmailBreachResultBtn) {
        saveEmailBreachResultBtn.addEventListener('click', async () => {
            if (!lastEmailAudit) {
                showToast('Please search an email address first.');
                return;
            }
            try {
                const count = lastEmailAudit.breach_count || 0;
                const statusStr = lastEmailAudit.breached
                    ? `COMPROMISED: Exposed in ${count} breaches (${(lastEmailAudit.compromised_data || []).join(', ')})`
                    : 'SAFE: No known corporate breach leaks found';
                const res = await postJSON('save/activity', {
                    tool_name: 'breach_checker',
                    input_summary: `Email breach check: ${lastEmailAudit.email}`,
                    result_summary: statusStr,
                });
                if (res.success) {
                    showToast(res.message || 'Saved to activity history!');
                }
            } catch (err) {
                if (err.message && (err.message.includes('Authentication required') || err.message.includes('401'))) {
                    showToast('Please log in to save breach audits to your history.');
                } else {
                    showToast(err.message || 'Failed to save audit.');
                }
            }
        });
    }

    renderBreachHistory();
});

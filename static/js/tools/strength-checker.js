/**
 * Password Strength Checker Tool Script
 */
import { postJSON } from '../shared/api.js';
import { showToast } from '../shared/toast.js';

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

    let debounceTimer = null;
    let lastAudit = null;
    let lastPassword = '';

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

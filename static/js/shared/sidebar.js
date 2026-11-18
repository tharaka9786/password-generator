/**
 * PassForge — Tools Sidebar Collapsible Controller
 *
 * Features:
 * - Smooth 320ms cubic-bezier slide-and-collapse animation
 * - Persistent collapse preference via localStorage ('passforge_sidebar_collapsed')
 * - Interactive toggle button with rotating SVG chevron/sidebar icon
 * - Global shortcut: Ctrl+\ (or Cmd+\) when focus is outside editable elements
 * - Dynamic ARIA attributes and descriptive localized tooltips
 * - Prevents layout flashes and initial-render animations
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'passforge_sidebar_collapsed';

    function initSidebar() {
        const toggleBtn = document.getElementById('sidebar-toggle-btn');
        if (!toggleBtn) return;

        const html = document.documentElement;

        function updateUi(isCollapsed) {
            toggleBtn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');

            const isSi = (html.getAttribute('lang') || '').startsWith('si');
            const hideTooltip = isSi
                ? 'මෙවලම් පැති තීරුව සඟවන්න (Ctrl+\\)'
                : (toggleBtn.getAttribute('data-tooltip-hide') || 'Hide Tools Sidebar (Ctrl+\\)');
            const showTooltip = isSi
                ? 'මෙවලම් පැති තීරුව පෙන්වන්න (Ctrl+\\)'
                : (toggleBtn.getAttribute('data-tooltip-show') || 'Show Tools Sidebar (Ctrl+\\)');

            const activeTooltip = isCollapsed ? showTooltip : hideTooltip;
            toggleBtn.setAttribute('title', activeTooltip);
            toggleBtn.setAttribute('aria-label', activeTooltip);
        }

        // Initialize UI state matching current class (from early head script)
        const initialCollapsed = html.classList.contains('sidebar-collapsed');
        updateUi(initialCollapsed);

        // Enable smooth transitions on the next frame so initial load never animates
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                html.classList.add('sidebar-transitions-ready');
            });
        });

        function toggleSidebar() {
            const isCollapsed = html.classList.toggle('sidebar-collapsed');
            try {
                localStorage.setItem(STORAGE_KEY, isCollapsed ? 'true' : 'false');
            } catch (e) {}
            updateUi(isCollapsed);
        }

        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSidebar();
        });

        // Global keyboard shortcut: Ctrl+\ (or Cmd+\)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === '\\' || e.code === 'Backslash')) {
                const active = document.activeElement;
                const tag = active ? active.tagName.toLowerCase() : '';
                const isEditable = active && (
                    tag === 'input' ||
                    tag === 'textarea' ||
                    active.isContentEditable ||
                    active.classList.contains('sinhala-input')
                );
                if (!isEditable) {
                    e.preventDefault();
                    toggleSidebar();
                }
            }
        });

        // Listen for language changes to update tooltips in real time
        window.addEventListener('passforge:languageChanged', () => {
            updateUi(html.classList.contains('sidebar-collapsed'));
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSidebar);
    } else {
        initSidebar();
    }
})();

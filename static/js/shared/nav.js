/**
 * Navigation, Dropdowns, and Mobile Drawer Manager
 */
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Drawer Toggle
    const toggleBtn = document.getElementById('mobileNavToggle');
    const drawer = document.getElementById('mobileNavDrawer');

    if (toggleBtn && drawer) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            drawer.classList.toggle('open');
        });
    }

    // Tools Dropdown Toggle
    const dropdown = document.getElementById('toolsDropdown');
    const dropdownBtn = document.getElementById('toolsDropdownBtn');

    if (dropdown && dropdownBtn) {
        // Toggle on click
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.toggle('open');
            dropdownBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close on clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
                dropdownBtn.setAttribute('aria-expanded', 'false');
            }
            if (drawer && !drawer.contains(e.target) && e.target !== toggleBtn) {
                drawer.classList.remove('open');
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdown.classList.remove('open');
                dropdownBtn.setAttribute('aria-expanded', 'false');
                if (drawer) drawer.classList.remove('open');
            }
        });
    }

    // Initialize Lucide icons if loaded
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
});

/**
 * PassForge Toast Notification Utility
 */
export function showToast(message = 'Copied to clipboard!', duration = 1800) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast-box';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');

    if (window._toastTimeout) {
        clearTimeout(window._toastTimeout);
    }

    window._toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

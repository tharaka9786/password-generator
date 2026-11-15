/**
 * PassForge Clipboard Copy Utility
 */
import { showToast } from './toast.js';

export async function copyToClipboard(text, customMessage = 'Copied to clipboard!') {
    if (!text) return false;
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
        showToast(customMessage);
        return true;
    } catch (err) {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy');
        return false;
    }
}

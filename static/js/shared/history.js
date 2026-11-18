/**
 * PassForge Session History Manager
 * Manages persistent client-side session history in localStorage across tools.
 * History items persist across navigation/reloads and are only deleted on explicit Clear.
 */

const MAX_HISTORY_ITEMS = 50;

/**
 * Loads session history array from localStorage for a given tool key.
 *
 * @param {string} storageKey - LocalStorage key
 * @returns {Array} Array of history items (max 50)
 */
export function loadSessionHistory(storageKey) {
    if (!storageKey) return [];
    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY_ITEMS) : [];
    } catch (err) {
        console.warn(`[PassForge] Failed to load session history for '${storageKey}':`, err);
        return [];
    }
}

/**
 * Saves session history array to localStorage for a given tool key.
 * Caps to the most recent 50 items.
 *
 * @param {string} storageKey - LocalStorage key
 * @param {Array} items - Items array
 */
export function saveSessionHistory(storageKey, items) {
    if (!storageKey) return;
    try {
        const trimmed = (Array.isArray(items) ? items : []).slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(storageKey, JSON.stringify(trimmed));
    } catch (err) {
        console.warn(`[PassForge] Failed to save session history for '${storageKey}':`, err);
    }
}

/**
 * Removes session history array from localStorage for a given tool key.
 *
 * @param {string} storageKey - LocalStorage key
 */
export function clearSessionHistory(storageKey) {
    if (!storageKey) return;
    try {
        localStorage.removeItem(storageKey);
    } catch (err) {
        console.warn(`[PassForge] Failed to clear session history for '${storageKey}':`, err);
    }
}

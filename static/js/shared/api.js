/**
 * PassForge API Client with dynamic path resolution
 * Supports both root deployments (e.g. PythonAnywhere at '/') and
 * subpath mount points (e.g. local XAMPP/WAMP at '/password-generator/').
 */

/**
 * Returns the detected base path prefix of the application (e.g. "" or "/password-generator").
 * Dynamically resolves via template meta tags or pathname inspection without hardcoding.
 */
export function getBasePath() {
    // 1. Meta tag injected by Flask template (request.script_root)
    const metaTag = document.querySelector('meta[name="base-path"]') || document.querySelector('meta[name="base-url"]');
    if (metaTag && metaTag.content !== undefined) {
        return metaTag.content.replace(/\/+$/, '');
    }

    // 2. Global window configuration if present
    if (typeof window !== 'undefined' && window.PASSFORGE_BASE_PATH !== undefined) {
        return window.PASSFORGE_BASE_PATH.replace(/\/+$/, '');
    }

    // 3. Dynamic URL pathname heuristic:
    // If running under a subpath (e.g. /password-generator/tools/... or /app/about),
    // detect known route prefixes (/tools, /about, /api)
    if (typeof window !== 'undefined' && window.location && window.location.pathname) {
        const pathname = window.location.pathname;
        const match = pathname.match(/^(.*?)(?:\/(?:tools|about|api))(?:\/|$)/i);
        if (match && match[1]) {
            return match[1].replace(/\/+$/, '');
        }
    }

    return '';
}

/**
 * Resolve full path to an API endpoint relative to the application's base path.
 */
export function getApiEndpoint(endpointName) {
    const cleanEndpoint = endpointName.replace(/^\/+/, '');
    const basePath = getBasePath();
    return `${basePath}/api/${cleanEndpoint}`;
}

export async function postJSON(endpointName, payload) {
    const url = getApiEndpoint(endpointName);
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }
    return data;
}

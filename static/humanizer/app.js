/**
 * Sinhala AI Text Humanizer - Frontend Controller
 * Minimalist, ultra-clean UI with client-side offline HelaSinhalaEngine and FM Abhaya font conversion.
 * Dynamically resolves dictionary datasets (/static/humanizer/data/) across environments.
 */

// -------------------------------------------------------------
// Dynamic Base Path & Madura Dictionary Path Resolution
// -------------------------------------------------------------
function resolveHumanizerBasePath() {
  if (typeof window !== 'undefined' && window.HUMANIZER_STATIC_BASE) {
    return window.HUMANIZER_STATIC_BASE.replace(/\/+$/, '');
  }
  const metaTag = document.querySelector('meta[name="base-path"]') || document.querySelector('meta[name="base-url"]');
  let basePath = metaTag && metaTag.content !== undefined ? metaTag.content.replace(/\/+$/, '') : '';
  if (!basePath && typeof window !== 'undefined' && window.location && window.location.pathname) {
    const match = window.location.pathname.match(/^(.*?)(?:\/(?:tools|about|api))(?:\/|$)/i);
    if (match && match[1]) basePath = match[1].replace(/\/+$/, '');
  }
  return `${basePath}/static/humanizer`;
}

const HUMANIZER_DATA_PATH = `${resolveHumanizerBasePath()}/data`;
window.__MADURA_DATA_PATH__ = HUMANIZER_DATA_PATH;

// Preload the browser dictionary into memory in the background
if (typeof window !== 'undefined' && window.HelaOfflineEngine && typeof window.HelaOfflineEngine.loadBrowserDictionary === 'function') {
  window.HelaOfflineEngine.loadBrowserDictionary(HUMANIZER_DATA_PATH).catch((e) => {
    console.warn('[SinhalaHumanizer] Preloading offline dictionary will retry on demand:', e);
  });
}

// State
let currentMode = 'academic';
let currentOutputFormat = 'unicode'; // 'unicode' (default) or 'fm'
let rawHumanizedUnicode = '';
let apiBaseUrl = 'http://127.0.0.1:8000';
let isProcessing = false;
let lastAnalysisResult = null;

// DOM Elements
const inputText = document.getElementById('input-text');
const inputStats = document.getElementById('input-stats');
const outputPlaceholder = document.getElementById('output-placeholder');
const outputText = document.getElementById('output-text');
const fmPreview = document.getElementById('fm-preview');
const outputStats = document.getElementById('output-stats');

const btnAnalyze = document.getElementById('btn-analyze');
const btnHumanize = document.getElementById('btn-humanize');
const btnPaste = document.getElementById('btn-paste');
const btnClear = document.getElementById('btn-clear');
const btnConvertOnly = document.getElementById('btn-convert-only');
const btnCopy = document.getElementById('btn-copy');
const btnDownload = document.getElementById('btn-download');
const copyLabel = document.getElementById('copy-label');

const serverStatus = document.getElementById('server-status');
const progressWrap = document.getElementById('progress-indicator');
const progressText = document.getElementById('progress-text');

const resultStrip = document.getElementById('result-strip');
const pillRisk = document.getElementById('pill-risk');
const valRisk = document.getElementById('val-risk');
const tagRisk = document.getElementById('tag-risk');
const pillBurstiness = document.getElementById('pill-burstiness');
const valBurstiness = document.getElementById('val-burstiness');
const pillDiversity = document.getElementById('pill-diversity');
const valDiversity = document.getElementById('val-diversity');
const pillParaphrase = document.getElementById('pill-paraphrase');
const valParaphrase = document.getElementById('val-paraphrase');
const pillIterations = document.getElementById('pill-iterations');
const valIterations = document.getElementById('val-iterations');
const flaggedReasonsNote = document.getElementById('flagged-reasons-note');

const btnToggleMarkers = document.getElementById('btn-toggle-markers');
const toggleMarkersLabel = document.getElementById('toggle-markers-label');
const markersPanel = document.getElementById('markers-panel');
const markersContainer = document.getElementById('markers-container');

// Madura Offline Dictionary Popover Elements
const dictPopover = document.getElementById('dict-popover');
const dictPopoverWord = document.getElementById('dict-popover-word');
const btnDictClose = document.getElementById('btn-dict-close');
const popoverLoading = document.getElementById('popover-loading');
const popoverContent = document.getElementById('popover-content');
const popoverMeaningsSection = document.getElementById('popover-meanings-section');
const dictPopoverMeanings = document.getElementById('dict-popover-meanings');
const popoverSynonymsSection = document.getElementById('popover-synonyms-section');
const dictPopoverSynonyms = document.getElementById('dict-popover-synonyms');
const popoverEmpty = document.getElementById('popover-empty');

let currentWordSelection = null;

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const modeButtons = document.querySelectorAll('.segment-btn');
const formatButtons = document.querySelectorAll('.format-tab');

/* ==========================================================================
   1. Smart API Detection & Health Check (Auto-Fallback)
   ========================================================================== */
async function detectApiEndpoint() {
  const statusDot = serverStatus.querySelector('.status-dot');
  const statusLabel = serverStatus.querySelector('.status-text');

  // 1. Primary: In-Browser Client Offline Engine (Firebase Hosting / Static Client)
  if (window.HelaOfflineEngine && window.HelaOfflineEngine.isReady) {
    statusDot.className = 'status-dot online';
    statusLabel.textContent = 'Ready • 100% Client Offline';
    return;
  }

  // 2. Direct backend check on port 8000
  try {
    const res = await fetch('http://127.0.0.1:8000/health', { method: 'GET' });
    if (res.ok) {
      apiBaseUrl = 'http://127.0.0.1:8000';
      statusDot.className = 'status-dot online';
      statusLabel.textContent = 'Ready • Zero API';
      return;
    }
  } catch (e) {
    // If direct fails, try Apache proxy
  }

  // 3. Fallback: Apache Proxy (/AI_Humanizor/api/health)
  try {
    const res = await fetch('/AI_Humanizor/api/health', { method: 'GET' });
    if (res.ok) {
      apiBaseUrl = '/AI_Humanizor/api';
      statusDot.className = 'status-dot online';
      statusLabel.textContent = 'Ready • Zero API (Proxy)';
      return;
    }
  } catch (e) {
    // Both unavailable
  }

  statusDot.className = 'status-dot offline';
  statusLabel.textContent = 'Offline (Start backend)';
}

/* ==========================================================================
   2. Mode & Output Format Selectors
   ========================================================================== */
modeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    modeButtons.forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    currentMode = btn.dataset.mode || 'academic';
  });
});

formatButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetFormat = btn.dataset.format || 'unicode';

    // Smart Fallback: If switching to FM Abhaya and right box is empty, pull from left input
    if (targetFormat === 'fm') {
      if (!rawHumanizedUnicode || !rawHumanizedUnicode.trim()) {
        const leftText = inputText ? inputText.value.trim() : '';
        if (leftText) {
          rawHumanizedUnicode = inputText.value;
        }
      }
    }

    formatButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentOutputFormat = targetFormat;
    renderOutputText();
  });
});

/**
 * Safely renders the humanized text into the visible output box
 * with support for Unicode (editable textarea) and FM Abhaya (Dual-Font live HTML preview).
 */
function renderOutputText() {
  if (!rawHumanizedUnicode || !rawHumanizedUnicode.trim()) {
    resetOutputArea();
    return;
  }

  // Hide placeholder
  if (outputPlaceholder) {
    outputPlaceholder.classList.add('hidden');
  }

  if (currentOutputFormat === 'fm') {
    // FM Abhaya Mode: Hide editable textarea, show Dual-Font HTML preview container
    if (outputText) {
      outputText.classList.add('hidden');
    }

    let previewHtml = '';
    try {
      if (typeof renderFmAbhayaPreviewHtml === 'function') {
        previewHtml = renderFmAbhayaPreviewHtml(rawHumanizedUnicode);
      } else if (typeof window.renderFmAbhayaPreviewHtml === 'function') {
        previewHtml = window.renderFmAbhayaPreviewHtml(rawHumanizedUnicode);
      } else if (typeof convertUnicodeToFmAbhaya === 'function') {
        previewHtml = `<span class="fm-text">${convertUnicodeToFmAbhaya(rawHumanizedUnicode)}</span>`;
      }
    } catch (err) {
      console.warn('FM Abhaya preview render error:', err);
      previewHtml = rawHumanizedUnicode;
    }

    if (fmPreview) {
      fmPreview.classList.remove('hidden');
      fmPreview.className = 'sinhala-output fm-preview fade-in';
      fmPreview.innerHTML = previewHtml;
    }

    const words = countSinhalaWords(rawHumanizedUnicode);
    outputStats.textContent = `${words} වචන (FM Abhaya Preview)`;
  } else {
    // Unicode Mode: Hide FM preview, show editable textarea
    if (fmPreview) {
      fmPreview.classList.add('hidden');
      fmPreview.innerHTML = '';
    }

    if (outputText) {
      outputText.classList.remove('hidden');
      outputText.className = 'sinhala-output fade-in';
      outputText.value = rawHumanizedUnicode;
      outputText.readOnly = false;
    }

    const words = countSinhalaWords(rawHumanizedUnicode);
    outputStats.textContent = `${words} වචන (${words} words)`;
  }

  btnCopy.disabled = false;
  btnDownload.disabled = false;
}

/* ==========================================================================
   3. Word & Character Counting & Editable Sync
   ========================================================================== */
function countSinhalaWords(text) {
  if (!text || !text.trim()) return 0;
  const matches = text.match(/[\p{Script=Sinhala}\u200C\u200D\w]+/gu);
  return matches ? matches.length : 0;
}

inputText.addEventListener('input', () => {
  const text = inputText.value;
  const words = countSinhalaWords(text);
  const chars = text.length;
  inputStats.textContent = `${words} වචන (${words} words • ${chars} chars)`;
});

// Allow clicking anywhere on the empty output card to focus and paste directly
if (outputPlaceholder) {
  outputPlaceholder.addEventListener('click', () => {
    outputPlaceholder.classList.add('hidden');
    if (fmPreview) {
      fmPreview.classList.add('hidden');
      fmPreview.innerHTML = '';
    }
    if (outputText) {
      outputText.classList.remove('hidden');
      outputText.className = 'sinhala-output fade-in';
      outputText.readOnly = false;
      outputText.focus();
    }
    currentOutputFormat = 'unicode';
    formatButtons.forEach((b) => b.classList.toggle('active', b.dataset.format === 'unicode'));
  });
}

// Real-time synchronization when user manually types or pastes text in the output box
if (outputText) {
  outputText.addEventListener('input', () => {
    if (currentOutputFormat === 'unicode') {
      rawHumanizedUnicode = outputText.value;
      const words = countSinhalaWords(rawHumanizedUnicode);
      outputStats.textContent = `${words} වචන (${words} words)`;
      const hasContent = Boolean(rawHumanizedUnicode.trim());
      btnCopy.disabled = !hasContent;
      btnDownload.disabled = !hasContent;
      if (hasContent && outputPlaceholder) {
        outputPlaceholder.classList.add('hidden');
      }
    }
  });

  // Double-click or select word in editable output to trigger Madura Dictionary Popover
  outputText.addEventListener('dblclick', (e) => {
    if (currentOutputFormat !== 'unicode') return;
    handleWordLookupFromOutput(e);
  });

  outputText.addEventListener('mouseup', (e) => {
    if (currentOutputFormat !== 'unicode') return;
    setTimeout(() => {
      const start = outputText.selectionStart;
      const end = outputText.selectionEnd;
      if (start !== end) {
        handleWordLookupFromOutput(e);
      }
    }, 20);
  });
}

/* ==========================================================================
   3.1. Madura Offline Dictionary & Click-to-Synonym Popover
   ========================================================================== */
function handleWordLookupFromOutput(e) {
  if (!outputText) return;
  const start = outputText.selectionStart;
  const end = outputText.selectionEnd;
  if (start === end) return;

  const rawSelected = outputText.value.substring(start, end);
  const cleanWord = rawSelected.replace(/^[.,!?;:'"“”()\[\]\s]+|[.,!?;:'"“”()\[\]\s]+$/gu, '').trim();
  if (!cleanWord || cleanWord.length < 2) return;

  currentWordSelection = {
    start,
    end,
    rawSelected,
    word: cleanWord
  };

  const x = e ? e.clientX : window.innerWidth / 2;
  const y = e ? e.clientY : window.innerHeight / 2;

  showDictionaryPopover(cleanWord, x, y);
}

async function showDictionaryPopover(word, clientX, clientY) {
  if (!dictPopover) return;

  dictPopover.classList.remove('hidden');
  dictPopoverWord.textContent = word;
  popoverLoading.classList.remove('hidden');
  popoverContent.classList.add('hidden');
  popoverEmpty.classList.add('hidden');

  // Intelligent screen positioning
  const popoverWidth = 320;
  const popoverHeight = 240;
  let posX = clientX + 10;
  let posY = clientY + 12;

  if (posX + popoverWidth > window.innerWidth - 16) {
    posX = window.innerWidth - popoverWidth - 16;
  }
  if (posY + popoverHeight > window.innerHeight - 16) {
    posY = clientY - popoverHeight - 8;
  }
  if (posX < 16) posX = 16;
  if (posY < 16) posY = 16;

  dictPopover.style.left = `${posX}px`;
  dictPopover.style.top = `${posY}px`;

  try {
    let data;
    if (window.HelaOfflineEngine && typeof window.HelaOfflineEngine.lookupMaduraWord === 'function') {
      data = await window.HelaOfflineEngine.lookupMaduraWord(word);
    } else {
      const endpoint = apiBaseUrl.startsWith('http')
        ? `${apiBaseUrl}/api/dictionary/lookup?word=${encodeURIComponent(word)}`
        : `${apiBaseUrl}/dictionary/lookup?word=${encodeURIComponent(word)}`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    }

    popoverLoading.classList.add('hidden');

    const hasMeanings = Array.isArray(data.meanings) && data.meanings.length > 0;
    const hasSynonyms = Array.isArray(data.synonyms) && data.synonyms.length > 0;

    if (!hasMeanings && !hasSynonyms) {
      popoverEmpty.classList.remove('hidden');
      popoverContent.classList.add('hidden');
      return;
    }

    popoverContent.classList.remove('hidden');

    // 1. Render Meanings
    if (hasMeanings) {
      popoverMeaningsSection.classList.remove('hidden');
      dictPopoverMeanings.textContent = data.meanings.slice(0, 8).join(', ');
    } else {
      popoverMeaningsSection.classList.add('hidden');
    }

    // 2. Render Clickable Synonym Chips
    dictPopoverSynonyms.innerHTML = '';
    if (hasSynonyms) {
      popoverSynonymsSection.classList.remove('hidden');
      data.synonyms.slice(0, 12).forEach((syn) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'synonym-chip';
        chip.textContent = syn;
        chip.title = `Click to replace with "${syn}"`;
        chip.addEventListener('click', (ev) => {
          ev.stopPropagation();
          replaceSelectedWordWithSynonym(syn);
        });
        dictPopoverSynonyms.appendChild(chip);
      });
    } else {
      popoverSynonymsSection.classList.add('hidden');
    }
  } catch (err) {
    console.warn('Madura lookup error:', err);
    popoverLoading.classList.add('hidden');
    popoverEmpty.classList.remove('hidden');
  }
}

function replaceSelectedWordWithSynonym(synonym) {
  if (!currentWordSelection || !outputText) return;

  const { start, end } = currentWordSelection;
  const fullText = outputText.value;
  const before = fullText.substring(0, start);
  const after = fullText.substring(end);

  outputText.value = before + synonym + after;
  rawHumanizedUnicode = outputText.value;

  const newCursor = start + synonym.length;
  outputText.setSelectionRange(newCursor, newCursor);
  outputText.focus();

  const words = countSinhalaWords(rawHumanizedUnicode);
  outputStats.textContent = `${words} වචන (${words} words)`;

  closeDictionaryPopover();
}

function closeDictionaryPopover() {
  if (dictPopover) {
    dictPopover.classList.add('hidden');
  }
  currentWordSelection = null;
}

if (btnDictClose) {
  btnDictClose.addEventListener('click', closeDictionaryPopover);
}

// Close popover when clicking outside or pressing Escape
document.addEventListener('click', (e) => {
  if (dictPopover && !dictPopover.classList.contains('hidden')) {
    if (!dictPopover.contains(e.target) && e.target !== outputText) {
      closeDictionaryPopover();
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDictionaryPopover();
  }
});

/* ==========================================================================
   4. Toolbar Actions (Paste, Clear, Convert Only, Copy, Download)
   ========================================================================== */
if (btnConvertOnly) {
  btnConvertOnly.addEventListener('click', () => {
    const text = inputText ? inputText.value.trim() : '';
    if (!text) {
      alert('කරුණාකර පරිවර්තනය කිරීමට සිංහල පාඨයක් ඇතුළත් කරන්න. (Please enter Sinhala text to convert.)');
      if (inputText) inputText.focus();
      return;
    }

    // Direct conversion: pull left input text to right and convert to FM Abhaya immediately
    rawHumanizedUnicode = inputText.value;
    currentOutputFormat = 'fm';

    // Update format tabs UI
    formatButtons.forEach((b) => b.classList.toggle('active', b.dataset.format === 'fm'));

    // Render directly in FM Abhaya mode
    renderOutputText();

    // Visual feedback on button
    const origHtml = btnConvertOnly.innerHTML;
    btnConvertOnly.innerHTML = '<span>Converted ✓</span>';
    btnConvertOnly.style.color = '#059669';
    setTimeout(() => {
      btnConvertOnly.innerHTML = origHtml;
      btnConvertOnly.style.color = '';
    }, 1800);
  });
}
btnPaste.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      inputText.value = text;
      inputText.dispatchEvent(new Event('input'));
    }
  } catch (err) {
    console.warn('Clipboard read error:', err);
  }
});

btnClear.addEventListener('click', () => {
  inputText.value = '';
  rawHumanizedUnicode = '';
  inputText.dispatchEvent(new Event('input'));
  resetOutputArea();
  hideResultStrip();
});

btnCopy.addEventListener('click', async () => {
  if (!rawHumanizedUnicode || !rawHumanizedUnicode.trim()) return;

  let textToCopy = '';
  if (currentOutputFormat === 'fm') {
    try {
      if (typeof convertUnicodeToFmAbhaya === 'function') {
        textToCopy = convertUnicodeToFmAbhaya(rawHumanizedUnicode);
      } else if (typeof window.convertUnicodeToFmAbhaya === 'function') {
        textToCopy = window.convertUnicodeToFmAbhaya(rawHumanizedUnicode);
      }
    } catch (e) {
      console.warn('Copy FM Abhaya fallback:', e);
      textToCopy = rawHumanizedUnicode;
    }
  } else {
    textToCopy = outputText ? outputText.value : rawHumanizedUnicode;
  }

  if (!textToCopy) return;

  try {
    await navigator.clipboard.writeText(textToCopy);
    copyLabel.textContent = 'Copied ✓';
    btnCopy.style.color = '#059669';
    setTimeout(() => {
      copyLabel.textContent = 'Copy';
      btnCopy.style.color = '';
    }, 2000);
  } catch (err) {
    console.error('Clipboard copy failed:', err);
  }
});

btnDownload.addEventListener('click', () => {
  if (!rawHumanizedUnicode || !rawHumanizedUnicode.trim()) return;

  const isFm = currentOutputFormat === 'fm';
  let textToDownload = '';

  if (isFm) {
    try {
      if (typeof convertUnicodeToFmAbhaya === 'function') {
        textToDownload = convertUnicodeToFmAbhaya(rawHumanizedUnicode);
      } else if (typeof window.convertUnicodeToFmAbhaya === 'function') {
        textToDownload = window.convertUnicodeToFmAbhaya(rawHumanizedUnicode);
      }
    } catch (e) {
      textToDownload = rawHumanizedUnicode;
    }
  } else {
    textToDownload = outputText ? outputText.value : rawHumanizedUnicode;
  }

  if (!textToDownload) return;

  // Use UTF-8 BOM for Unicode so Windows Notepad/Word renders Sinhala diacritics cleanly
  const fileContent = isFm ? textToDownload : '\uFEFF' + textToDownload;
  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = isFm ? `Humanized_FMAbhaya_${Date.now()}.txt` : `Humanized_Sinhala_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

btnToggleMarkers.addEventListener('click', () => {
  markersPanel.classList.toggle('hidden');
  btnToggleMarkers.classList.toggle('open');
});

/* ==========================================================================
   5. Check AI Score (/analyze)
   ========================================================================== */
btnAnalyze.addEventListener('click', async () => {
  const text = inputText.value.trim();
  if (!text) {
    alert('කරුණාකර විශ්ලේෂණය කිරීමට සිංහල පාඨයක් ඇතුළත් කරන්න. (Please enter Sinhala text to analyze.)');
    return;
  }

  setLoading(true, 'AI පරිවර්තන ලක්ෂණ හා වාක්‍ය රටා විශ්ලේෂණය කරමින්... (Analyzing AI patterns & sentence rhythm...)');

  try {
    // 1. Primary: Direct In-Browser Client Offline Engine (Zero network calls)
    if (window.HelaOfflineEngine && typeof window.HelaOfflineEngine.analyzeText === 'function') {
      const metrics = window.HelaOfflineEngine.analyzeText(text);
      renderAnalysisMetrics(metrics);
      return;
    }

    // 2. Fallback: Network API call
    const endpoint = apiBaseUrl.startsWith('http') ? `${apiBaseUrl}/analyze` : 'http://127.0.0.1:8000/analyze';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    renderAnalysisMetrics(data.metrics);
  } catch (error) {
    console.error('Analysis error:', error);
    alert(`විශ්ලේෂණයේදී දෝෂයක් සිදුවිය: ${error.message || error}`);
  } finally {
    setLoading(false);
  }
});

/* ==========================================================================
   6. Humanize Text (/humanize)
   ========================================================================== */
btnHumanize.addEventListener('click', async () => {
  const text = inputText.value.trim();
  if (!text) {
    alert('කරුණාකර සැකසීමට සිංහල පාඨයක් ඇතුළත් කරන්න. (Please enter Sinhala text to humanize.)');
    return;
  }

  setLoading(true, 'දේශීය හෙළ සිංහල වාග් රීතියට පරිවර්තනය කරමින්... (Transforming into authentic Hela Sinhala...)');

  try {
    // 1. Primary: Direct In-Browser Client Offline Engine (Zero network calls)
    if (window.HelaOfflineEngine && typeof window.HelaOfflineEngine.humanizeSinhalaText === 'function') {
      const data = await window.HelaOfflineEngine.humanizeSinhalaText(text, currentMode);
      displayHumanizedOutput(data);
      return;
    }

    // 2. Fallback: Network API call to Node.js backend port 8000
    const endpoint = apiBaseUrl.startsWith('http') ? `${apiBaseUrl}/humanize` : 'http://127.0.0.1:8000/humanize';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ text, mode: currentMode })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      const detailMsg = errData?.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(detailMsg);
    }

    const data = await response.json();
    displayHumanizedOutput(data);
  } catch (error) {
    console.error('Humanize error:', error);
    alert(`සැකසීමේදී දෝෂයක් සිදුවිය:\n${error.message || error}`);
  } finally {
    setLoading(false);
  }
});

/* ==========================================================================
   7. UI Render Helpers
   ========================================================================== */
function setLoading(loading, message = '') {
  isProcessing = loading;
  btnAnalyze.disabled = loading;
  btnHumanize.disabled = loading;

  if (loading) {
    progressWrap.classList.remove('hidden');
    progressText.textContent = message;
  } else {
    progressWrap.classList.add('hidden');
  }
}

function resetOutputArea() {
  rawHumanizedUnicode = '';
  if (outputText) {
    outputText.value = '';
    outputText.className = 'sinhala-output hidden';
    outputText.readOnly = false;
  }
  if (fmPreview) {
    fmPreview.innerHTML = '';
    fmPreview.className = 'sinhala-output fm-preview hidden';
  }
  if (outputPlaceholder) {
    outputPlaceholder.classList.remove('hidden');
  }
  outputStats.textContent = 'Ready';
  btnCopy.disabled = true;
  btnDownload.disabled = true;
}

function displayHumanizedOutput(data) {
  const { humanizedText, finalMetrics, originalMetrics, iterationsUsed } = data;

  // Cache raw Unicode text in state
  rawHumanizedUnicode = humanizedText || '';

  // Render text into the output area
  renderOutputText();

  // Update output footer meta
  const wordCount = finalMetrics.wordCount;
  outputStats.textContent = `${wordCount} වචන (${wordCount} words)`;
  btnCopy.disabled = false;
  btnDownload.disabled = false;

  // Display Metrics Comparison in Result Strip
  renderComparisonMetrics(originalMetrics, finalMetrics, iterationsUsed);
}

function renderAnalysisMetrics(metrics) {
  resultStrip.classList.remove('hidden');
  resultStrip.classList.add('slide-in');

  // AI Risk Score & Classification Tag
  const overallRisk = metrics.overallRisk !== undefined ? metrics.overallRisk : metrics.aiRiskScore;
  applyRiskPillStyle(pillRisk, overallRisk);
  valRisk.textContent = `${overallRisk}%`;

  if (tagRisk) {
    tagRisk.classList.remove('hidden', 'tag-human', 'tag-paraphrased', 'tag-ai');
    const classification = metrics.classification || (overallRisk < 20 ? 'Human' : (metrics.paraphraseRisk >= 40 ? 'AI-Paraphrased' : 'Raw AI'));
    if (classification === 'Human') {
      tagRisk.textContent = 'Human';
      tagRisk.classList.add('tag-human');
    } else if (classification === 'AI-Paraphrased') {
      tagRisk.textContent = 'Paraphrased';
      tagRisk.classList.add('tag-paraphrased');
    } else {
      tagRisk.textContent = 'AI Generated';
      tagRisk.classList.add('tag-ai');
    }
  }

  // Natural Flow / Burstiness
  const flowStatus = metrics.burstinessDetails?.rhythmStatus || (metrics.naturalFlow >= 0.45 || metrics.burstiness >= 0.45 ? 'Natural' : 'Uniform');
  const cvVal = metrics.naturalFlow !== undefined ? metrics.naturalFlow : metrics.burstiness;
  valBurstiness.textContent = `${flowStatus} (CV: ${cvVal})`;

  // MATTR Diversity
  const mattrVal = metrics.mattrDiversity !== undefined ? metrics.mattrDiversity : Math.round(metrics.lexicalDiversity * 100);
  valDiversity.textContent = `${mattrVal}%`;

  // Paraphrase Risk / Structural Parallelism
  if (pillParaphrase && valParaphrase) {
    pillParaphrase.classList.remove('hidden');
    const pRisk = metrics.paraphraseRisk !== undefined ? metrics.paraphraseRisk : 0;
    const pScore = metrics.structuralParallelism !== undefined ? metrics.structuralParallelism : 0;
    applyRiskPillStyle(pillParaphrase, pRisk);
    valParaphrase.textContent = `${pRisk}% (Parallel: ${pScore}%)`;
  }

  pillIterations.classList.add('hidden');

  // Flagged Reasons & Linguistic Notes
  if (flaggedReasonsNote) {
    const hasFlags = Array.isArray(metrics.flaggedReasons) && metrics.flaggedReasons.length > 0;
    const pRisk = metrics.paraphraseRisk !== undefined ? metrics.paraphraseRisk : 0;
    if (hasFlags || overallRisk >= 20 || pRisk >= 25) {
      let contentHtml = `<div class="note-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>Linguistic Analysis & Flags:</span>
      </div>`;

      if (hasFlags) {
        contentHtml += `<ul>${metrics.flaggedReasons.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>`;
      }
      if (metrics.feedback) {
        contentHtml += `<div style="margin-top: 6px; font-weight: 500;">${escapeHtml(metrics.feedback)}</div>`;
      }
      flaggedReasonsNote.innerHTML = contentHtml;
      flaggedReasonsNote.classList.remove('hidden');
    } else {
      flaggedReasonsNote.innerHTML = '';
      flaggedReasonsNote.classList.add('hidden');
    }
  }

  // Detected Markers Panel
  renderMarkers(metrics.detectedMarkers);
}

function renderComparisonMetrics(orig, final, iterations) {
  resultStrip.classList.remove('hidden');
  resultStrip.classList.add('slide-in');

  const origRisk = orig.overallRisk !== undefined ? orig.overallRisk : orig.aiRiskScore;
  const finalRisk = final.overallRisk !== undefined ? final.overallRisk : final.aiRiskScore;

  // Compare AI Risk: e.g. "80% → 0%"
  applyRiskPillStyle(pillRisk, finalRisk);
  valRisk.textContent = `${origRisk}% → ${finalRisk}%`;

  if (tagRisk) {
    tagRisk.classList.remove('hidden', 'tag-human', 'tag-paraphrased', 'tag-ai');
    tagRisk.textContent = 'Humanized';
    tagRisk.classList.add('tag-human');
  }

  // Burstiness
  const finalCv = final.naturalFlow !== undefined ? final.naturalFlow : final.burstiness;
  valBurstiness.textContent = `Natural (CV: ${finalCv})`;

  // Lexical Diversity
  const finalMattr = final.mattrDiversity !== undefined ? final.mattrDiversity : Math.round(final.lexicalDiversity * 100);
  valDiversity.textContent = `${finalMattr}%`;

  // Paraphrase Risk
  if (pillParaphrase && valParaphrase) {
    pillParaphrase.classList.remove('hidden');
    const origPara = orig.paraphraseRisk !== undefined ? orig.paraphraseRisk : 0;
    const finalPara = final.paraphraseRisk !== undefined ? final.paraphraseRisk : 0;
    applyRiskPillStyle(pillParaphrase, finalPara);
    valParaphrase.textContent = `${origPara}% → ${finalPara}%`;
  }

  // Iterations
  pillIterations.classList.remove('hidden');
  valIterations.textContent = `${iterations} loop${iterations > 1 ? 's' : ''}`;

  // Flagged Reasons Resolved Note
  if (flaggedReasonsNote) {
    flaggedReasonsNote.innerHTML = `
      <div class="note-title" style="color: #166534;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>සාර්ථකව මානව ශෛලියට පරිවර්තනය කරන ලදී (Successfully humanized with diversified rhythm & eliminated markers)</span>
      </div>
    `;
    flaggedReasonsNote.classList.remove('hidden');
  }

  // Markers from original that were addressed
  renderMarkers(orig.detectedMarkers, true);
}

function applyRiskPillStyle(pillElement, score) {
  pillElement.classList.remove('badge-low', 'badge-med', 'badge-high');
  if (score < 20) {
    pillElement.classList.add('badge-low');
  } else if (score < 50) {
    pillElement.classList.add('badge-med');
  } else {
    pillElement.classList.add('badge-high');
  }
}

function renderMarkers(markers, isRemovedComparison = false) {
  if (!markers || markers.length === 0) {
    btnToggleMarkers.classList.add('hidden');
    markersPanel.classList.add('hidden');
    return;
  }

  btnToggleMarkers.classList.remove('hidden');
  toggleMarkersLabel.textContent = isRemovedComparison
    ? `View removed AI words (${markers.length})`
    : `Detected AI markers (${markers.length})`;

  markersContainer.innerHTML = '';
  markers.forEach((m) => {
    const chip = document.createElement('span');
    chip.className = 'marker-chip';
    chip.textContent = m;
    markersContainer.appendChild(chip);
  });
}

function hideResultStrip() {
  resultStrip.classList.add('hidden');
  markersPanel.classList.add('hidden');
  if (flaggedReasonsNote) flaggedReasonsNote.classList.add('hidden');
  if (tagRisk) tagRisk.classList.add('hidden');
  btnToggleMarkers.classList.remove('open');
}

// Initial health check on page load
detectApiEndpoint();
// Periodic health check every 15 seconds
setInterval(detectApiEndpoint, 15000);

// Save to Account History Handler
const btnSaveHumanizer = document.getElementById('btn-save-humanizer');
if (btnSaveHumanizer) {
  btnSaveHumanizer.addEventListener('click', async () => {
    const origText = inputText ? inputText.value.trim() : '';
    const humanizedText = rawHumanizedUnicode || (outputText ? outputText.value.trim() : '');

    if (!origText || !humanizedText) {
      alert('Please enter Sinhala text and humanize it before saving.');
      return;
    }

    let fmText = '';
    if (typeof window.convertUnicodeToFm === 'function') {
      try {
        fmText = window.convertUnicodeToFm(humanizedText);
      } catch (e) {
        fmText = '';
      }
    }

    let score = null;
    if (lastAnalysisResult && lastAnalysisResult.overallRisk !== undefined) {
      score = parseFloat(lastAnalysisResult.overallRisk) / 100.0;
    }

    // Determine base path for save endpoint
    const metaTag = document.querySelector('meta[name="base-path"]') || document.querySelector('meta[name="base-url"]');
    let basePath = metaTag && metaTag.content !== undefined ? metaTag.content.replace(/\/+$/, '') : '';
    if (!basePath && typeof window !== 'undefined' && window.location && window.location.pathname) {
      const match = window.location.pathname.match(/^(.*?)(?:\/(?:tools|about|api))(?:\/|$)/i);
      if (match && match[1]) basePath = match[1].replace(/\/+$/, '');
    }
    const saveUrl = `${basePath}/api/save/humanizer`;

    try {
      const resp = await fetch(saveUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: currentMode,
          original_text: origText,
          humanized_text: humanizedText,
          fm_abhaya_text: fmText,
          ai_score: score,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        alert(data.message || 'Saved to Sinhala Humanizer history!');
      } else {
        if (resp.status === 401 || (data.error && data.error.includes('Authentication required'))) {
          alert('Please log in to save text to your history.');
        } else {
          alert(data.error || 'Failed to save.');
        }
      }
    } catch (err) {
      alert('Failed to save to history.');
    }
  });
}

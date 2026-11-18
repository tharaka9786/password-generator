/**
 * Sinhala Unicode to FM Abhaya (Legacy ASCII) Converter & Segment Tokenizer
 * Follows the standard UCSC / FM Abhaya (FMAbhaya.ttf) character and glyph mappings.
 *
 * Features:
 * - Segment-aware: Splits input into Sinhala segments and English/Latin segments.
 *   English words, acronyms, citations (e.g. (Canada), (University of Toronto), (Perera, 2024)),
 *   and bracketed references ([1], [1-3]) remain 100% untouched.
 * - Accurate Ligatures:
 *   * Rakaranshaya (්ර / \u0DCA\u200D?\u0DBB) maps to '%' (ASCII 37, glyphId 8 in FMAbhaya.ttf, overhanging hook)
 *   * Yansaya (්ය / \u0DCA\u200D?\u0DBA) maps to 'H'
 *   * Rephaya (ර් + ZWJ before consonant) places '¾' after the consonant cluster
 *   * Kombuwa reordering moves 'f', 'ff', 'fda', 'fd', 'f!' before conjunct clusters
 *   * Verified Sanyaka characters (ඟ -> Õ, ඳ -> |, ඬ -> ~, ඹ -> U, ඥ -> {, ඤ -> [, ක්ෂ -> Ë, ළු -> ¿)
 *   * Verified Pillam mappings (කු/ගු/තු -> l=/ .= / ;=, කූ/ගූ/තූ -> l+/ .+ / ;+, etc.)
 *   * Protected Sinhala punctuation (full stop -> ', comma -> ", question -> @, etc.)
 */

(function () {
  'use strict';

  // List of mathematical, scientific, currency, and technical symbols to protect from FM Abhaya font distortion
  const SYMBOLS = '+-−=≠≈×÷*\\/<>≤≥±√∑∞→←↔%°^~|\\\\#@$&€£¥₹¢';
  const SYM_CLASS = '[+\\-−=≠≈×÷*\\/<>≤≥±√∑∞→←↔%°^~|\\\\#@$&€£¥₹¢]';

  // Atom pattern: matches individual non-Sinhala units on a SINGLE line (never spanning \r or \n):
  // 1. Double-quoted strings containing Latin characters or math/tech symbols: "[^"”\r\n\u0D80-\u0DFF]*[A-Za-zSYMBOLS][^"”\r\n\u0D80-\u0DFF]*"
  // 2. Single-quoted strings containing Latin characters or math/tech symbols: '[^'’\r\n\u0D80-\u0DFF]*[A-Za-zSYMBOLS][^'’\r\n\u0D80-\u0DFF]*'
  // 3. Parenthesized expressions containing Latin or symbols: \([^()\r\n\u0D80-\u0DFF]*[A-Za-zSYMBOLS][^()\r\n\u0D80-\u0DFF]*\)
  // 4. Bracketed expressions / citations containing Latin or symbols: \[[^\[\]\r\n\u0D80-\u0DFF]*[A-Za-zSYMBOLS][^\[\]\r\n\u0D80-\u0DFF]*\]
  // 5. URLs / Web links: (?:https?:\/\/|www\.)[^\s\u0D80-\u0DFF]+
  // 6. Decimal numbers or percentages: \d+(?:\.\d+)?%?
  // 7. Latin alphanumeric words/acronyms/identifiers: [A-Za-z][A-Za-z0-9_\-.'’]*
  // 8. Standalone math / tech symbol: SYM_CLASS
  const atomPatternStr = `(?:["“][^"”\\r\\n\\u0D80-\\u0DFF]*[A-Za-z${SYMBOLS}][^"”\\r\\n\\u0D80-\\u0DFF]*["”]|['‘][^'’\\r\\n\\u0D80-\\u0DFF]*[A-Za-z${SYMBOLS}][^'’\\r\\n\\u0D80-\\u0DFF]*['’]|\\([^\\(\\)\\r\\n\\u0D80-\\u0DFF]*[A-Za-z${SYMBOLS}][^\\(\\)\\r\\n\\u0D80-\\u0DFF]*\\)|\\[[^\\[\\]\\r\\n\\u0D80-\\u0DFF]*[A-Za-z${SYMBOLS}][^\\[\\]\\r\\n\\u0D80-\\u0DFF]*\\]|(?:https?:\\/\\/|www\\.)[^\\s\\u0D80-\\u0DFF]+|\\d+(?:\\.\\d+)?%?|[A-Za-z][A-Za-z0-9_\\-.'’]*|${SYM_CLASS})`;

  // Composite expression regex:
  // An expression starts with an atom containing Latin characters or math symbols,
  // or a number immediately followed by horizontal space and a math symbol.
  // It chains contiguous atoms and numbers separated by horizontal whitespace only ([^\S\r\n]*),
  // NEVER spanning across newline characters (\r or \n).
  const exprPattern = new RegExp(`(?:["“][^"”\\r\\n\\u0D80-\\u0DFF]*[A-Za-z${SYMBOLS}][^"”\\r\\n\\u0D80-\\u0DFF]*["”]|['‘][^'’\\r\\n\\u0D80-\\u0DFF]*[A-Za-z${SYMBOLS}][^'’\\r\\n\\u0D80-\\u0DFF]*['’]|\\([^\\(\\)\\r\\n\\u0D80-\\u0DFF]*[A-Za-z${SYMBOLS}][^\\(\\)\\r\\n\\u0D80-\\u0DFF]*\\)|\\[[^\\[\\]\\r\\n\\u0D80-\\u0DFF]*[A-Za-z${SYMBOLS}][^\\[\\]\\r\\n\\u0D80-\\u0DFF]*\\]|(?:https?:\\/\\/|www\\.)[^\\s\\u0D80-\\u0DFF]+|[A-Za-z][A-Za-z0-9_\\-.'’]*|\\d+(?:\\.\\d+)?%|\\d+(?:\\.\\d+)?(?=[^\\S\\r\\n]*${SYM_CLASS})|${SYM_CLASS})(?:[^\\S\\r\\n]*(?:${atomPatternStr}|\\d+(?:\\.\\d+)?))*`, 'g');

  /**
   * Tokenizes mixed text into Sinhala segments and English/Latin/Math segments.
   * Latin & mathematical segments are kept 100% verbatim.
   *
   * @param {string} text - The input mixed text.
   * @returns {Array<{type: 'sinhala'|'english', text: string}>}
   */
  function tokenizeSinhalaAndLatin(text) {
    if (!text || typeof text !== 'string') return [];

    const segments = [];
    let lastIndex = 0;
    let match;
    exprPattern.lastIndex = 0;

    while ((match = exprPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          type: 'sinhala',
          text: text.slice(lastIndex, match.index)
        });
      }
      segments.push({
        type: 'english',
        text: match[0]
      });
      lastIndex = exprPattern.lastIndex;
    }

    if (lastIndex < text.length) {
      segments.push({
        type: 'sinhala',
        text: text.slice(lastIndex)
      });
    }

    return segments;
  }

  /**
   * Sinhala Orthographic Syllable Grammar Parser
   * Converts a pure Sinhala text segment into standard FM Abhaya ASCII.
   *
   * Follows Sinhala grammar rules:
   * [Optional Rephaya] + [Base Consonant / Conjunct] + [Optional Medial: Rakaranshaya / Yansaya] +
   * [Optional Vowel Sign / Hal Virama] + [Optional Anusvara / Visarga]
   */

  const BASE_CONSONANTS = {
    'ක්‍ෂ': 'Ë', 'ක්ෂ': 'Ë',
    'ඥ': '{', 'ඤ': '[', 'ඦ': '`P',
    'ඟ': 'Õ', 'ඳ': '|', 'ඬ': '~', 'ඹ': 'U',
    'ක': 'l', 'ඛ': 'L', 'ග': '.', 'ඝ': '>', 'ඞ': 'X',
    'ච': 'p', 'ඡ': 'P', 'ජ': 'c', 'ඣ': 'CO',
    'ට': 'g', 'ඨ': 'G', 'ඩ': 'v', 'ඪ': 'V', 'ණ': 'K',
    'ත': ';', 'ථ': ':', 'ද': 'o', 'ධ': 'O', 'න': 'k',
    'ප': 'm', 'ඵ': 'M', 'බ': 'n', 'භ': 'N', 'ම': 'u',
    'ය': 'h', 'ර': 'r', 'ල': ',', 'ව': 'j', 'ශ': 'Y',
    'ෂ': 'I', 'ස': 'i', 'හ': 'y', 'ළ': '<', 'ෆ': '*'
  };

  const INDEPENDENT_VOWELS = {
    'ආ': 'wd', 'ඇ': 'we', 'ඈ': 'wE', 'ඌ': 'W!',
    'ඒ': 'ta', 'ඓ': 'ft', 'ඕ': '´', 'ඖ': 'T!',
    'අ': 'w', 'ඉ': 'b', 'ඊ': 'B', 'උ': 'W',
    'එ': 't', 'ඔ': 'T', 'ඍ': 'R'
  };

  // Special Consonant + Hal (Virama ්) indexed by baseCons
  const SPECIAL_HAL_BY_CONS = {
    'ක': 'la', 'ඛ': 'Ä', 'ච': 'É', 'ජ': 'Ê', 'ට': 'Ü',
    'ඩ': 'â', 'ඬ': 'å', 'ධ': 'è', 'බ': 'í', 'ම': 'ï',
    'ඹ': 'ò', 'ව': 'õ', 'ඡ': 'þ', 'ඞ': 'Ù', 'ර': '¾',
    'ත': ';a'
  };

  // Special Consonant + Is-pilla (ි) indexed by baseCons
  const SPECIAL_IS_BY_CONS = {
    'ද': 'È', 'ඳ': '¢', 'ඬ': 'ç', 'ම': 'ñ', 'බ': 'ì',
    'ව': 'ú', 'ජ': 'ð', 'ච': 'Ñ', 'ර': 'ß', 'ට': 'á',
    'ඩ': 'ä', 'ධ': 'ê', 'ඛ': 'Å', 'ථ': 'Ó', 'ඨ': 'À',
    'ඡ': 'ý', 'ඵ': 'Ý', 'ඪ': 'Î', 'ඹ': 'ô', 'ණ': '\u201A'
  };

  // Special Consonant + Diga Is-pilla (ී) indexed by baseCons
  const SPECIAL_DIGA_IS_BY_CONS = {
    'ද': '§', 'ඳ': '£', 'ඬ': 'é', 'ම': 'ó', 'බ': 'î',
    'ව': 'ù', 'ජ': 'Ô', 'ච': 'Ö', 'ර': 'Í', 'ට': 'à',
    'ඩ': 'ã', 'ධ': 'ë', 'ඛ': 'Ç', 'ථ': 'Ò', 'ඨ': 'Á',
    'ඡ': 'Â', 'ඵ': 'Ú', 'ඪ': 'Ð', 'ඹ': 'ö', 'ණ': '\u0152'
  };

  // Special Consonant + Papi-pilla (ු) indexed by baseCons (tucked-under q vs descending hook = vs dedicated glyphs)
  const SPECIAL_PAPI_BY_CONS = {
    'ද': 'ÿ', 'ඳ': '÷', 'ර': 're', 'ක': 'l=', 'ග': '.=',
    'ත': ';=', 'ඟ': 'Õ=', 'ල': '¨',
    'ඤ': 'û', 'ළ': '¿', 'න': 'kq', 'භ': 'N=', 'හ': 'yq', 'ශ': 'Yq'
  };

  // Special Consonant + Diga Papi-pilla (ූ) indexed by baseCons (smooth curved-bottom ligatures & dedicated glyphs)
  const SPECIAL_DIGA_PAPI_BY_CONS = {
    'ද': '¥', 'ඳ': 'ª', 'ර': 'rE', 'ක': 'l+', 'ග': '.+',
    'ත': ';+', 'භ': 'N+', 'හ': 'y+', 'න': 'k+', 'ශ': 'Y+',
    'ඟ': 'Õ+', 'ල': 'Æ', 'ඤ': 'ü', 'ළ': '<+'
  };

  // Special Consonant + Aeda-pilla (ැ) indexed by baseCons
  const SPECIAL_AEDA_BY_CONS = {
    'ද': '±', 'ඳ': '\u0192', 'ර': '/'
  };

  // Special Consonant + Diga Aeda-pilla (ෑ) indexed by baseCons
  const SPECIAL_DIGA_AEDA_BY_CONS = {
    'ර': '?'
  };

  // Special Consonant + Kombuwa + Hal (ේ) indexed by baseCons
  const SPECIAL_KOMBUWA_HAL_BY_CONS = {
    'ව': 'fõ', 'ම': 'fï', 'බ': 'fí', 'ඩ': 'fâ', 'ට': 'fÜ',
    'ච': 'fÉ', 'ජ': 'fÊ', 'ධ': 'fè', 'ඬ': 'få', 'ඹ': 'fò',
    'ඡ': 'fþ', 'ඛ': 'fÄ', 'ර': 'f¾'
  };

  const PUNCTUATION = {
    '.': "'",
    ',': '"',
    '?': '@',
    ':': '(',
    ';': '\u00A6',
    '!': '!',
    '(': '^',
    ')': '&',
    '%': ']'
  };

  const REPH_PREFIX_REGEX = /^\u0DBB\u0DCA\u200D?/;
  const CONJUNCT_OR_CONS_REGEX = /^(?:ක්‍ෂ|ක්ෂ|[ක-ෆඟඳඬඹඥඤ])/;
  const MEDIAL_REGEX = /^(?:\u0DCA\u200D?\u0DBB|\u0DCA\u200D?\u0DBA)/; // Rakaranshaya or Yansaya
  const VOWEL_SIGN_REGEX = /^[\u0DCA\u0DCF-\u0DDF\u0DF2\u0DF3]/; // Includes Hal Virama \u0DCA
  const ANUSVARA_VISARGA_REGEX = /^[\u0D82\u0D83]/;

  /**
   * Converts a pure Sinhala text segment into standard FM Abhaya ASCII.
   *
   * @param {string} text - Sinhala Unicode text
   * @returns {string} FM Abhaya legacy ASCII string
   */
  function convertSinhalaSegmentToFm(text) {
    if (!text) return '';

    // Step 1: Normalize input (NFC) and strip stray ZWNJ (\u200C)
    let input = text.normalize('NFC').replace(/\u200C/g, '');

    // Canonicalize decomposed Sinhala vowel signs & independent vowels
    // Prevents decomposed Dīrgha Pāpilla (\u0DD4\u0DDF) falling back to short Pāpilla (\u0DD4)
    input = input
      .replace(/\u0DD4\u0DDF/g, '\u0DD6') // \u0DD4 + \u0DDF -> \u0DD6 (Dīrgha Pāpilla ූ)
      .replace(/\u0DD2\u0DDF/g, '\u0DD3') // \u0DD2 + \u0DDF -> \u0DD3 (Dīrgha Is-pilla ී)
      .replace(/\u0DD0\u0DDF/g, '\u0DD1') // \u0DD0 + \u0DDF -> \u0DD1 (Dīrgha Aeda-pilla ෑ)
      .replace(/\u0DD8\u0DDF/g, '\u0DF2') // \u0DD8 + \u0DDF -> \u0DF2 (Dīrgha Gayanukitta ෲ)
      .replace(/\u0D85\u0DCF/g, 'ආ')      // \u0D85 + \u0DCF -> ආ
      .replace(/\u0D85\u0DD0/g, 'ඇ')      // \u0D85 + \u0DD0 -> ඇ
      .replace(/\u0D85\u0DD1/g, 'ඈ')      // \u0D85 + \u0DD1 -> ඈ
      .replace(/\u0D8B\u0DDF/g, 'ඌ')      // \u0D8B + \u0DDF -> ඌ
      .replace(/\u0D91\u0DCA/g, 'ඒ')      // \u0D91 + \u0DCA -> ඒ
      .replace(/\u0D94\u0DDF/g, 'ඖ');     // \u0D94 + \u0DDF -> ඖ

    let out = '';
    let i = 0;
    const len = input.length;

    while (i < len) {
      const remaining = input.slice(i);

      // 1. Check Sinhala punctuation
      if (PUNCTUATION[remaining[0]]) {
        out += PUNCTUATION[remaining[0]];
        i += 1;
        continue;
      }

      // 2. Check Independent Vowels
      let matchedIndep = null;
      for (const [iv, code] of Object.entries(INDEPENDENT_VOWELS)) {
        if (remaining.startsWith(iv)) {
          matchedIndep = { iv, code };
          break;
        }
      }
      if (matchedIndep) {
        let indepOut = matchedIndep.code;
        let consumed = matchedIndep.iv.length;

        // Check if immediately followed by Anusvara (ං \u0D82) or Visarga (ඃ \u0D83)
        if (consumed < remaining.length) {
          const nextChar = remaining[consumed];
          if (nextChar === '\u0D82') {
            indepOut += 'x';
            consumed += 1;
          } else if (nextChar === '\u0D83') {
            indepOut += 'X';
            consumed += 1;
          }
        }

        out += indepOut;
        i += consumed;
        continue;
      }

      // 3. Check Precomposed Special Words: ශ්‍රී / ශ්රී
      if (remaining.startsWith('ශ්‍රී')) {
        out += '›';
        i += 5;
        continue;
      }
      if (remaining.startsWith('ශ්රී')) {
        out += '›';
        i += 4;
        continue;
      }

      // 4. Parse Orthographic Syllable:
      // [Optional Rephaya] + [Base Consonant] + [Optional Medial] + [Optional Vowel Sign / Hal] + [Optional Anusvara/Visarga]
      let hasRephaya = false;
      let rephLen = 0;
      const rephMatch = remaining.match(REPH_PREFIX_REGEX);
      if (rephMatch) {
        const afterReph = remaining.slice(rephMatch[0].length);
        if (CONJUNCT_OR_CONS_REGEX.test(afterReph)) {
          hasRephaya = true;
          rephLen = rephMatch[0].length;
        }
      }

      const restAfterReph = remaining.slice(rephLen);
      const consMatch = restAfterReph.match(CONJUNCT_OR_CONS_REGEX);

      if (consMatch) {
        const baseCons = consMatch[0];
        let consLen = baseCons.length;
        let afterCons = restAfterReph.slice(consLen);

        // Check Medial (Rakaranshaya or Yansaya)
        let medial = null;
        let medialLen = 0;
        const medialMatch = afterCons.match(MEDIAL_REGEX);
        if (medialMatch) {
          medial = medialMatch[0];
          medialLen = medial.length;
          afterCons = afterCons.slice(medialLen);
        }

        // Check Vowel Sign or Hal Virama
        let vowelSign = null;
        let vowelSignLen = 0;
        const vowelMatch = afterCons.match(VOWEL_SIGN_REGEX);
        if (vowelMatch) {
          vowelSign = vowelMatch[0];
          vowelSignLen = vowelMatch[0].length;
          afterCons = afterCons.slice(vowelSignLen);
        }

        // Check Anusvara or Visarga
        let anusvara = null;
        let anusvaraLen = 0;
        const anusvaraMatch = afterCons.match(ANUSVARA_VISARGA_REGEX);
        if (anusvaraMatch) {
          anusvara = anusvaraMatch[0];
          anusvaraLen = anusvaraMatch[0].length;
        }

        const totalSyllableLen = rephLen + consLen + medialLen + vowelSignLen + anusvaraLen;

        // Assemble FM Abhaya:
        let syllOut = '';

        // 1. Rephaya hook:
        // In FM Abhaya visual order, Rephaya '¾' is typed BEFORE the base consonant and Kombuwa
        if (hasRephaya) {
          syllOut += '¾';
        }

        // 2. Kombuwa prefix (left-side vowel sign)
        const isKombuwa = vowelSign && ['\u0DD9', '\u0DDA', '\u0DDB', '\u0DDC', '\u0DDD', '\u0DDE'].includes(vowelSign);
        if (isKombuwa) {
          if (vowelSign === '\u0DDB') {
            syllOut += 'ff'; // Deka Kombuwa
          } else {
            syllOut += 'f';  // Kombuwa
          }
        }

        // 3. Base Consonant + Medials + Right/Top/Bottom Vowel Signs
        const baseFm = BASE_CONSONANTS[baseCons] || baseCons;

        if (!medial) {
          if (vowelSign === '\u0DCA') { // Hal Virama
            if (SPECIAL_HAL_BY_CONS[baseCons]) {
              syllOut += SPECIAL_HAL_BY_CONS[baseCons];
            } else {
              syllOut += baseFm + 'a';
            }
          } else if (vowelSign === '\u0DD2') { // Is-pilla (ි)
            syllOut += SPECIAL_IS_BY_CONS[baseCons] || (baseFm + 's');
          } else if (vowelSign === '\u0DD3') { // Diga Is-pilla (ී)
            syllOut += SPECIAL_DIGA_IS_BY_CONS[baseCons] || (baseFm + 'S');
          } else if (vowelSign === '\u0DD4') { // Papi-pilla (ු)
            syllOut += SPECIAL_PAPI_BY_CONS[baseCons] || (baseFm + 'q');
          } else if (vowelSign === '\u0DD6') { // Diga Papi-pilla (ූ)
            syllOut += SPECIAL_DIGA_PAPI_BY_CONS[baseCons] || (baseFm + 'Q');
          } else if (vowelSign === '\u0DD0') { // Aeda-pilla (ැ)
            syllOut += SPECIAL_AEDA_BY_CONS[baseCons] || (baseFm + 'e');
          } else if (vowelSign === '\u0DD1') { // Diga Aeda-pilla (ෑ)
            syllOut += SPECIAL_DIGA_AEDA_BY_CONS[baseCons] || (baseFm + 'E');
          } else if (vowelSign === '\u0DCF') { // Aela-pilla (ා)
            if (baseCons === 'ද') {
              syllOut += 'Þ';
            } else {
              syllOut += baseFm + 'd';
            }
          } else if (vowelSign === '\u0DD8') { // Gayanukitta (ෘ)
            syllOut += baseFm + 'D';
          } else if (vowelSign === '\u0DF2') { // Diga Gayanukitta (ෲ)
            syllOut += baseFm + 'DD';
          } else if (vowelSign === '\u0DDA') { // Kombuwa + Hal (ේ)
            if (SPECIAL_KOMBUWA_HAL_BY_CONS[baseCons]) {
              syllOut += SPECIAL_KOMBUWA_HAL_BY_CONS[baseCons].slice(1);
            } else {
              syllOut += baseFm + 'a';
            }
          } else if (vowelSign === '\u0DDC') { // Kombuwa + Aela-pilla (ො)
            syllOut += baseFm + 'd';
          } else if (vowelSign === '\u0DDD') { // Kombuwa + Hal Aela-pilla (ෝ)
            syllOut += baseFm + 'da';
          } else if (vowelSign === '\u0DDE') { // Kombuwa + Gayanukitta (ෞ)
            syllOut += baseFm + '!';
          } else {
            // No vowel sign (inherent 'a')
            syllOut += baseFm;
          }
        } else {
          // Has Medial (Rakaranshaya or Yansaya)
          let medialCode = '';
          if (medial.includes('\u0DBB')) {
            // Rakaranshaya
            if (baseCons === 'ද') {
              medialCode = 'ø'; // precomposed ද්‍ර
            } else {
              medialCode = baseFm + '%';
            }
          } else if (medial.includes('\u0DBA')) {
            // Yansaya
            medialCode = baseFm + 'H';
          }

          // Attach vowel pillam to medial cluster
          if (vowelSign === '\u0DCA') { // Hal
            syllOut += medialCode + 'a';
          } else if (vowelSign === '\u0DCF') { // Aela-pilla
            syllOut += medialCode + 'd';
          } else if (vowelSign === '\u0DD0') { // Aeda-pilla
            syllOut += medialCode + 'e';
          } else if (vowelSign === '\u0DD1') { // Diga Aeda-pilla
            syllOut += medialCode + 'E';
          } else if (vowelSign === '\u0DD2') { // Is-pilla
            syllOut += medialCode + 's';
          } else if (vowelSign === '\u0DD3') { // Diga Is-pilla
            syllOut += medialCode + 'S';
          } else if (vowelSign === '\u0DD4') { // Papi-pilla
            syllOut += medialCode + 'q';
          } else if (vowelSign === '\u0DD6') { // Diga Papi-pilla
            syllOut += medialCode + 'Q';
          } else if (vowelSign === '\u0DDA') { // Kombuwa + Hal (ේ)
            syllOut += medialCode + 'a';
          } else if (vowelSign === '\u0DDC') { // Kombuwa + Aela-pilla (ො)
            syllOut += medialCode + 'd';
          } else if (vowelSign === '\u0DDD') { // Kombuwa + Hal Aela-pilla (ෝ)
            syllOut += medialCode + 'da';
          } else if (vowelSign === '\u0DDE') { // Kombuwa + Gayanukitta (ෞ)
            syllOut += medialCode + '!';
          } else {
            syllOut += medialCode;
          }
        }

        // 4. Anusvara / Visarga
        if (anusvara) {
          if (anusvara === '\u0D82') syllOut += 'x';
          if (anusvara === '\u0D83') syllOut += 'X';
        }

        out += syllOut;
        i += totalSyllableLen;
        continue;
      }

      // 5. Standalone Anusvara (ං) or Visarga (ඃ)
      if (remaining[0] === '\u0D82') {
        out += 'x';
        i += 1;
        continue;
      }
      if (remaining[0] === '\u0D83') {
        out += 'X';
        i += 1;
        continue;
      }

      // 6. Unrecognized character (spaces, symbols, newlines, etc.) - pass verbatim
      out += remaining[0];
      i += 1;
    }

    return out;
  }

  /**
   * Main conversion function: Converts full Sinhala Unicode text to FM Abhaya legacy ASCII.
   * Preserves all English words, acronyms, citations, and numbers 100% verbatim.
   *
   * @param {string} unicodeText - Mixed Sinhala/English text.
   * @returns {string} Clean plain text in FM Abhaya ASCII.
   */
  function convertUnicodeToFmAbhaya(unicodeText) {
    if (!unicodeText || typeof unicodeText !== 'string') return '';
    const segments = tokenizeSinhalaAndLatin(unicodeText);
    return segments.map(seg => {
      return seg.type === 'sinhala' ? convertSinhalaSegmentToFm(seg.text) : seg.text;
    }).join('');
  }

  /**
   * Generates styled HTML for Dual-Font visual preview in FM Abhaya mode.
   * Wraps Sinhala FM Abhaya segments in <span class="fm-text"> and English/citations
   * in <span class="en-text"> so English does NOT render as distorted Sinhala glyphs.
   *
   * @param {string} unicodeText - Mixed Sinhala/English text.
   * @returns {string} Sanitized HTML markup.
   */
  function renderFmAbhayaPreviewHtml(unicodeText) {
    if (!unicodeText || typeof unicodeText !== 'string') return '';
    const segments = tokenizeSinhalaAndLatin(unicodeText);

    return segments.map(seg => {
      if (seg.type === 'sinhala') {
        const converted = convertSinhalaSegmentToFm(seg.text);
        const escaped = converted
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `<span class="fm-text">${escaped}</span>`;
      } else {
        const escaped = seg.text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `<span class="en-text">${escaped}</span>`;
      }
    }).join('');
  }

  // Export functions to window / module environments
  const exportsObj = {
    convertUnicodeToFmAbhaya,
    convertSinhalaSegmentToFm,
    tokenizeSinhalaAndLatin,
    renderFmAbhayaPreviewHtml
  };

  if (typeof window !== 'undefined') {
    window.convertUnicodeToFmAbhaya = convertUnicodeToFmAbhaya;
    window.convertSinhalaSegmentToFm = convertSinhalaSegmentToFm;
    window.tokenizeSinhalaAndLatin = tokenizeSinhalaAndLatin;
    window.renderFmAbhayaPreviewHtml = renderFmAbhayaPreviewHtml;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exportsObj;
  }
})();

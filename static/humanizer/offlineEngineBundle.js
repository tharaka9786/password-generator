"use strict";
var HelaOfflineBundle = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/browserEntry.ts
  var browserEntry_exports = {};
  __export(browserEntry_exports, {
    HelaOfflineEngine: () => HelaOfflineEngine,
    default: () => browserEntry_default,
    loadBrowserDictionary: () => loadBrowserDictionary,
    lookupMaduraWord: () => lookupMaduraWord,
    setDictionaryData: () => setDictionaryData
  });

  // src/analyzer.ts
  var SINHALA_ROBOTIC_MARKERS = [
    "\u0DAD\u0DC0\u0DAF",
    "\u0DAD\u0DC0 \u0DAF",
    "\u0DB8\u0DD3\u0DA7 \u0D85\u0DB8\u0DAD\u0DBB\u0DC0",
    "\u0D91\u0DB6\u0DD0\u0DC0\u0DD2\u0DB1\u0DCA",
    "\u0DB8\u0DD9\u0DBA\u0DD2\u0DB1\u0DCA \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0DC0\u0DB1\u0DCA\u0DB1\u0DDA",
    "\u0D85\u0DC0\u0DC3\u0DCF\u0DB1 \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA",
    "\u0DC3\u0DB3\u0DC4\u0DB1\u0DCA \u0D9A\u0DC5 \u0DC4\u0DD0\u0D9A\u0DD2\u0DBA",
    "\u0DC0\u0DD2\u0DC3\u0DD2\u0DB1\u0DCA \u0DC3\u0DD2\u0DAF\u0DD4 \u0D9A\u0DBB\u0DB1\u0DD4 \u0DBD\u0DD0\u0DB6\u0DDA",
    "\u0DC0\u0DD2\u0DC3\u0DD2\u0DB1\u0DCA \u0DC3\u0DD2\u0DAF\u0DD4 \u0D9A\u0DBB\u0DB1\u0DD4 \u0DBD\u0DB6\u0DBA\u0DD2",
    "\u0DB8\u0DDA \u0D85\u0DB1\u0DD4\u0DC0 \u0DB6\u0DBD\u0DB1 \u0D9A\u0DBD",
    "\u0D92 \u0D85\u0DB1\u0DD4\u0DC0",
    "\u0DB4\u0DCA\u200D\u0DBB\u0DB0\u0DCF\u0DB1 \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA",
    "\u0DB4\u0DCA\u0DBB\u0DB0\u0DCF\u0DB1 \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA",
    "\u0DC3\u0DD0\u0DBD\u0D9A\u0DD2\u0DBA \u0DBA\u0DD4\u0DAD\u0DD4\u0DBA",
    "\u0DC0\u0DD0\u0DAF\u0D9C\u0DAD\u0DCA \u0D9A\u0DCF\u0DBB\u0DCA\u0DBA\u0DB7\u0DCF\u0DBB\u0DBA\u0D9A\u0DCA \u0D89\u0DA7\u0DD4 \u0D9A\u0DBB\u0DBA\u0DD2",
    "\u0DB6\u0DC0 \u0D9A\u0DD2\u0DC0 \u0DBA\u0DD4\u0DAD\u0DD4\u0DBA",
    "\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DBA\u0DD9\u0DB1\u0DCA \u0DC3\u0DB3\u0DC4\u0DB1\u0DCA \u0D9A\u0DC5 \u0DBA\u0DD4\u0DAD\u0DD4\u0DBA",
    "\u0DB8\u0DD9\u0DC4\u0DD2\u0DAF\u0DD3 \u0D85\u0DC0\u0DB0\u0DCF\u0DB1\u0DBA \u0DBA\u0DDC\u0DB8\u0DD4 \u0D9A\u0DC5 \u0DBA\u0DD4\u0DAD\u0DD4\u0DBA",
    "\u0DC3\u0DD0\u0DBD\u0D9A\u0DD2\u0DBD\u0DCA\u0DBD\u0DA7 \u0D9C\u0DAD \u0DBA\u0DD4\u0DAD\u0DD4\u0DBA",
    "\u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA",
    "\u0D85\u0DAD\u0DCA\u200D\u0DBA\u0DC0\u0DC1\u0DCA\u200D\u0DBA \u0DC0\u0DDA",
    "\u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0DC0\u0DDA",
    "\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8",
    "\u0DB4\u0DCA\u200D\u0DBB\u0DAD\u0DD2\u0DB5\u0DBD\u0DBA\u0D9A\u0DCA \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA",
    "\u0DB4\u0DCA\u0DBB\u0DAD\u0DD2\u0DB5\u0DBD\u0DBA\u0D9A\u0DCA \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA",
    "\u0DB8\u0DD9\u0DC4\u0DD2 \u0DB4\u0DCA\u200D\u0DBB\u0DAD\u0DD2\u0DB5\u0DBD\u0DBA\u0D9A\u0DCA \u0DBD\u0DD9\u0DC3",
    "\u0DC0\u0DA9\u0DCF\u0DAD\u0DCA \u0DC0\u0DD0\u0DAF\u0D9C\u0DAD\u0DCA \u0DC0\u0DB1\u0DCA\u0DB1\u0DDA"
  ];
  var ENGLISH_ROBOTIC_MARKERS = [
    "furthermore",
    "moreover",
    "in addition",
    "it is important to note",
    "it is worth noting",
    "in conclusion",
    "to summarize",
    "crucial",
    "pivotal role",
    "play a pivotal role",
    "delve into",
    "delve",
    "tapestry",
    "testament",
    "underscores",
    "seamlessly",
    "beacon of",
    "ever-evolving",
    "by and large",
    "it is crucial to",
    "it can be seen that",
    "it is evident that"
  ];
  var REPETITIVE_SINHALA_ENDINGS = [
    "\u0D9A\u0DBB\u0DBA\u0DD2",
    "\u0D9A\u0DBB\u0DB1\u0DD4 \u0DBD\u0DD0\u0DB6\u0DDA",
    "\u0D9A\u0DBB\u0DB1\u0DD4 \u0DBD\u0DB6\u0DBA\u0DD2",
    "\u0DC0\u0DDA",
    "\u0DB4\u0DC0\u0DAD\u0DD3",
    "\u0D87\u0DAD",
    "\u0DAF\u0DD0\u0D9A\u0DCA\u0DC0\u0DDA",
    "\u0DC3\u0DD0\u0DBD\u0D9A\u0DDA",
    "\u0DBD\u0DD0\u0DB6\u0DDA",
    "\u0DB1\u0DDC\u0DC0\u0DDA",
    "\u0DC0\u0DB1\u0DCA\u0DB1\u0DDA\u0DBA"
  ];
  function extractSentences(text) {
    if (!text || !text.trim()) {
      return [];
    }
    let sanitized = text.normalize("NFC");
    sanitized = sanitized.replace(/\((?:[^()]*\d{4}[^()]*)\)/g, (match) => {
      return match.replace(/\./g, "__DOT__");
    });
    sanitized = sanitized.replace(/\[\d+(?:[\s,\-–—]\d+)*\]/g, (match) => {
      return match.replace(/\./g, "__DOT__");
    });
    sanitized = sanitized.replace(/(\d+)\.(\d+)/g, "$1__DEC__$2");
    const abbreviations = [
      "\u0D86\u0DAF\u0DD3",
      "\u0DC0\u0DD0\u0DB1\u0DD2",
      "\u0DB8\u0DC4\u0DCF",
      "\u0DB4\u0DD9.\u0DC0",
      "\u0DB4.\u0DC0",
      "\u0DBB\u0DD4",
      "etc",
      "e.g",
      "i.e",
      "Dr",
      "Prof",
      "Mr",
      "Mrs",
      "Ms",
      "vs",
      "al",
      "Fig",
      "Jan",
      "Feb",
      "No"
    ];
    for (const abbr of abbreviations) {
      const regex = new RegExp(`\\b${abbr}\\.`, "gui");
      sanitized = sanitized.replace(regex, `${abbr}__DOT__`);
    }
    const rawSentences = sanitized.split(/[.?!।\u0df4]+(?:\s+|$)/u);
    return rawSentences.map((s) => s.replace(/__DOT__/g, ".").replace(/__DEC__/g, ".").trim()).filter((s) => s.length > 0);
  }
  function extractWords(text) {
    if (!text) return [];
    const matches = text.normalize("NFC").match(/[\p{Script=Sinhala}\u200C\u200D]+|[A-Za-z0-9]+(?:'[A-Za-z]+)?/gu);
    return matches || [];
  }
  function calculateCadenceMetrics(sentences, allWords) {
    if (sentences.length < 2) {
      return {
        standardDeviation: 0,
        meanSentenceLength: allWords.length,
        iqr: 0,
        burstiness: 0,
        rhythmStatus: "Natural"
      };
    }
    const lengths = sentences.map((s) => extractWords(s).length).filter((l) => l > 0);
    if (lengths.length < 2) {
      return {
        standardDeviation: 0,
        meanSentenceLength: lengths[0] || 0,
        iqr: 0,
        burstiness: 0,
        rhythmStatus: "Natural"
      };
    }
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
    const standardDev = Math.sqrt(variance);
    const burstiness = mean > 0 ? standardDev / mean : 0;
    const sorted = [...lengths].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    let rhythmStatus = "Natural";
    if (lengths.length >= 3 && (standardDev < 2.5 || iqr <= 2)) {
      rhythmStatus = "Monotonous";
    } else if (lengths.length >= 2 && (burstiness < 0.35 || standardDev < 3.5)) {
      rhythmStatus = "Uniform";
    }
    return {
      standardDeviation: Math.round(standardDev * 100) / 100,
      meanSentenceLength: Math.round(mean * 100) / 100,
      iqr,
      burstiness: Math.round(burstiness * 100) / 100,
      rhythmStatus
    };
  }
  function calculateMATTR(words, windowSize = 50) {
    if (!words || words.length === 0) return 0;
    const tokens = words.map((w) => w.toLowerCase());
    const M = tokens.length;
    const W = Math.min(M, windowSize);
    if (M <= W) {
      const unique = new Set(tokens);
      return Math.round(unique.size / M * 100);
    }
    const freqMap = /* @__PURE__ */ new Map();
    let uniqueCount = 0;
    for (let i = 0; i < W; i++) {
      const t = tokens[i];
      const count = freqMap.get(t) || 0;
      if (count === 0) uniqueCount++;
      freqMap.set(t, count + 1);
    }
    let totalTTR = uniqueCount / W;
    const numWindows = M - W + 1;
    for (let i = 1; i < numWindows; i++) {
      const exiting = tokens[i - 1];
      const entering = tokens[i + W - 1];
      const exitingCount = freqMap.get(exiting);
      if (exitingCount === 1) {
        freqMap.delete(exiting);
        uniqueCount--;
      } else {
        freqMap.set(exiting, exitingCount - 1);
      }
      const enteringCount = freqMap.get(entering) || 0;
      if (enteringCount === 0) uniqueCount++;
      freqMap.set(entering, enteringCount + 1);
      totalTTR += uniqueCount / W;
    }
    const avgTTR = totalTTR / numWindows;
    return Math.round(avgTTR * 100);
  }
  function calculateStructuralParallelism(sentences) {
    if (sentences.length < 3) {
      return { score: 0, rigidSentenceRatio: 0, repetitiveEndingCount: 0 };
    }
    const lengths = sentences.map((s) => extractWords(s).length);
    let rigidSentences = 0;
    for (let i = 0; i < lengths.length - 2; i++) {
      const d1 = Math.abs(lengths[i] - lengths[i + 1]);
      const d2 = Math.abs(lengths[i + 1] - lengths[i + 2]);
      if (d1 <= 2 && d2 <= 2) {
        rigidSentences += 3;
        i += 2;
      }
    }
    const lengthMatchRatio = Math.min(1, rigidSentences / lengths.length);
    let repetitiveEndings = 0;
    let prevEnding = "";
    for (const s of sentences) {
      const sWords = extractWords(s);
      if (sWords.length === 0) continue;
      const lastWord = sWords[sWords.length - 1];
      let matchedEnding = "";
      for (const end of REPETITIVE_SINHALA_ENDINGS) {
        if (s.endsWith(end) || lastWord === end) {
          matchedEnding = end;
          break;
        }
      }
      if (!matchedEnding) {
        const lower = s.toLowerCase();
        if (lower.endsWith("crucial") || lower.endsWith("important") || lower.endsWith("significant")) {
          matchedEnding = "adj_crucial";
        }
      }
      if (matchedEnding && matchedEnding === prevEnding) {
        repetitiveEndings++;
      }
      prevEnding = matchedEnding;
    }
    const endingRepetitionRatio = Math.min(1, repetitiveEndings / Math.max(1, sentences.length - 1));
    const combinedScore = Math.min(100, Math.round((lengthMatchRatio * 0.6 + endingRepetitionRatio * 0.4) * 100));
    return {
      score: combinedScore,
      rigidSentenceRatio: Math.round(lengthMatchRatio * 100),
      repetitiveEndingCount: repetitiveEndings
    };
  }
  function scanFormulaicConnectors(text, wordCount) {
    const detectedSet = /* @__PURE__ */ new Set();
    const normalized = text.normalize("NFC");
    const lowerText = normalized.toLowerCase();
    let totalOccurrences = 0;
    for (const marker of SINHALA_ROBOTIC_MARKERS) {
      const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|\\s|[.,!?;])${escaped}($|\\s|[.,!?;])`, "gu");
      const matches = normalized.match(regex);
      if (matches && matches.length > 0) {
        detectedSet.add(marker);
        totalOccurrences += matches.length;
      }
    }
    for (const marker of ENGLISH_ROBOTIC_MARKERS) {
      const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|\\s|[.,!?;])${escaped}($|\\s|[.,!?;])`, "gui");
      const matches = lowerText.match(regex);
      if (matches && matches.length > 0) {
        detectedSet.add(marker);
        totalOccurrences += matches.length;
      }
    }
    const detectedMarkers = Array.from(detectedSet);
    const densityPer100Words = wordCount > 0 ? Math.round(totalOccurrences / wordCount * 1e3) / 10 : 0;
    return {
      detectedMarkers,
      densityPer100Words
    };
  }
  function calculateStarterEntropy(sentences) {
    if (sentences.length < 3) {
      return { repetitionRatio: 0, frequentStarters: [] };
    }
    const starters = [];
    for (const s of sentences) {
      const sWords = extractWords(s);
      if (sWords.length > 0) {
        starters.push(sWords[0].toLowerCase());
      }
    }
    const freq = /* @__PURE__ */ new Map();
    for (const st of starters) {
      freq.set(st, (freq.get(st) || 0) + 1);
    }
    let repeatedCount = 0;
    const frequentStarters = [];
    freq.forEach((count, word) => {
      if (count >= 2) {
        repeatedCount += count;
        frequentStarters.push(word);
      }
    });
    const repetitionRatio = Math.min(1, repeatedCount / starters.length);
    return { repetitionRatio, frequentStarters };
  }
  var TRANSLATIONESE_PHRASES = [
    "\u0DC3\u0DD2\u0DAF\u0DD4 \u0D9A\u0DBB\u0DB1\u0DD4 \u0DBD\u0DB6\u0DBA\u0DD2",
    "\u0DC3\u0DD2\u0DAF\u0DD4 \u0D9A\u0DBB\u0DB1\u0DD4 \u0DBD\u0DD0\u0DB6\u0DDA",
    "\u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0D9A\u0DCA \u0DC3\u0DD2\u0DAF\u0DD4 \u0D9A\u0DBB\u0DBA\u0DD2",
    "\u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0D9A\u0DCA \u0DC3\u0DD2\u0DAF\u0DD4 \u0D9A\u0DBB\u0DB1\u0DD4",
    "\u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0D9A\u0DCA \u0DC3\u0DD2\u0DAF\u0DD4 \u0D9A\u0DD9\u0DBB\u0DDA",
    "\u0DC3\u0DB3\u0DC4\u0DB1\u0DCA \u0D9A\u0DC5 \u0DC4\u0DD0\u0D9A\u0DD2\u0DBA",
    "\u0DC4\u0DB3\u0DD4\u0DB1\u0DCF\u0D9C\u0DAD \u0DC4\u0DD0\u0D9A\u0DD2\u0DBA",
    "\u0DB6\u0DC0 \u0D9A\u0DD2\u0DC0 \u0DBA\u0DD4\u0DAD\u0DD4\u0DBA",
    "\u0DB6\u0DC0\u0DA7 \u0DB4\u0DAD\u0DCA\u0DC0 \u0D87\u0DAD",
    "\u0DC0\u0DD0\u0DAF\u0D9C\u0DAD\u0DCA \u0D9A\u0DCF\u0DBB\u0DCA\u0DBA\u0DB7\u0DCF\u0DBB\u0DBA\u0D9A\u0DCA \u0D89\u0DA7\u0DD4 \u0D9A\u0DBB\u0DBA\u0DD2",
    "\u0DB8\u0DD9\u0DC4\u0DD2\u0DAF\u0DD3 \u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DBA\u0DD9\u0DB1\u0DCA",
    "\u0DB8\u0DD9\u0DBA\u0DD2\u0DB1\u0DCA \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0DC0\u0DB1\u0DCA\u0DB1\u0DDA",
    "\u0DC0\u0DD2\u0DC3\u0DD2\u0DB1\u0DCA \u0DC3\u0DD2\u0DAF\u0DD4 \u0D9A\u0DBB\u0DB1\u0DD4",
    "\u0DB4\u0DCA\u200D\u0DBB\u0DB0\u0DCF\u0DB1 \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA",
    "\u0DB4\u0DCA\u0DBB\u0DB0\u0DCF\u0DB1 \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA"
  ];
  function scanTranslationeseDensity(text, wordCount) {
    const detected = /* @__PURE__ */ new Set();
    const normalized = text.normalize("NFC");
    let count = 0;
    for (const phrase of TRANSLATIONESE_PHRASES) {
      const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gu");
      const matches = normalized.match(regex);
      if (matches && matches.length > 0) {
        detected.add(phrase);
        count += matches.length;
      }
    }
    const density = wordCount > 0 ? Math.round(count / wordCount * 1e3) / 10 : 0;
    return {
      detectedTranslationese: Array.from(detected),
      translationeseDensity: density
    };
  }
  function analyzeTextHeuristics(text) {
    const normalized = (text || "").normalize("NFC").trim();
    if (!normalized) {
      return {
        overallRisk: 0,
        classification: "Human",
        naturalFlow: 0,
        burstinessDetails: { standardDeviation: 0, meanSentenceLength: 0, iqr: 0, rhythmStatus: "Natural" },
        mattrDiversity: 0,
        paraphraseRisk: 0,
        structuralParallelism: 0,
        formulaicConnectorDensity: 0,
        detectedMarkers: [],
        flaggedReasons: [],
        feedback: "\u0DB4\u0DCF\u0DA8\u0DBA\u0D9A\u0DCA \u0D87\u0DAD\u0DD4\u0DC5\u0DAD\u0DCA \u0D9A\u0DBB \u0DB1\u0DDC\u0DB8\u0DD0\u0DAD. (No text provided for analysis.)",
        sentenceCount: 0,
        wordCount: 0,
        aiRiskScore: 0,
        burstiness: 0,
        lexicalDiversity: 0
      };
    }
    const sentences = extractSentences(normalized);
    const words = extractWords(normalized);
    const sentenceCount = sentences.length;
    const wordCount = words.length;
    const cadence = calculateCadenceMetrics(sentences, words);
    const mattr = calculateMATTR(words);
    const parallelism = calculateStructuralParallelism(sentences);
    const connectors = scanFormulaicConnectors(normalized, wordCount);
    const starterEntropy = calculateStarterEntropy(sentences);
    const translationese = scanTranslationeseDensity(normalized, wordCount);
    const flaggedReasons = [];
    let connectorScore = 0;
    if (connectors.detectedMarkers.length === 1) connectorScore = 15;
    else if (connectors.detectedMarkers.length === 2) connectorScore = 28;
    else if (connectors.detectedMarkers.length >= 3) {
      connectorScore = Math.min(45, 28 + (connectors.detectedMarkers.length - 2) * 6);
    }
    if (connectors.densityPer100Words > 2.5) {
      connectorScore += 8;
    }
    if (connectors.detectedMarkers.length > 0) {
      flaggedReasons.push(`Formulaic AI transition markers: ${connectors.detectedMarkers.slice(0, 3).join(", ")}`);
    }
    if (translationese.detectedTranslationese.length > 0) {
      connectorScore += Math.min(18, translationese.detectedTranslationese.length * 6);
      flaggedReasons.push(`Bloated passive / nominalized verb patterns: ${translationese.detectedTranslationese.slice(0, 2).join(", ")}`);
    }
    if (/විසින්\s+[^\s.]{2,}\s+(?:සිදු\s+)?කරනු\s+(?:ලැබේ|ලබයි)/u.test(normalized)) {
      connectorScore += 10;
      flaggedReasons.push("Mechanical passive voice translation pattern (\u0DC0\u0DD2\u0DC3\u0DD2\u0DB1\u0DCA ... \u0DC3\u0DD2\u0DAF\u0DD4 \u0D9A\u0DBB\u0DB1\u0DD4 \u0DBD\u0DD0\u0DB6\u0DDA)");
    }
    let cadenceScore = 0;
    if (sentenceCount >= 2) {
      if (cadence.rhythmStatus === "Monotonous") {
        cadenceScore = 26;
        flaggedReasons.push(`Over-smoothed, monotonous sentence lengths (StdDev: ${cadence.standardDeviation}, IQR: ${cadence.iqr})`);
      } else if (cadence.rhythmStatus === "Uniform") {
        cadenceScore = 16;
        flaggedReasons.push(`Uniform sentence pacing typical of AI prose (Burstiness: ${cadence.burstiness})`);
      } else if (cadence.burstiness > 0.6 && cadence.standardDeviation >= 5) {
        cadenceScore = -8;
      }
    }
    let parallelismScore = 0;
    if (parallelism.score >= 50) {
      parallelismScore = 22;
      flaggedReasons.push(`High structural parallelism (${parallelism.score}%): consecutive sentences share rigid templates`);
    } else if (parallelism.score >= 30) {
      parallelismScore = 12;
    }
    if (parallelism.repetitiveEndingCount >= 2) {
      flaggedReasons.push("Repetitive sentence-final grammatical predicates");
    }
    let starterScore = 0;
    if (starterEntropy.repetitionRatio >= 0.5) {
      starterScore = 14;
      flaggedReasons.push(`Repetitive sentence-starter patterns: "${starterEntropy.frequentStarters.slice(0, 2).join('", "')}"`);
    } else if (starterEntropy.repetitionRatio >= 0.34) {
      starterScore = 8;
    }
    let diversityScore = 0;
    if (wordCount >= 30) {
      if (mattr < 55) {
        diversityScore = 15;
        flaggedReasons.push(`Low MATTR lexical diversity (${mattr}%): repetitive vocabulary`);
      } else if (mattr >= 85) {
        diversityScore = -5;
      }
    }
    let paraphraseRisk = 0;
    if (sentenceCount >= 3) {
      let pPoints = 0;
      if (parallelism.score >= 40) pPoints += 35;
      else if (parallelism.score >= 25) pPoints += 20;
      if (cadence.rhythmStatus === "Monotonous" || cadence.rhythmStatus === "Uniform") pPoints += 25;
      if (mattr >= 70 && parallelism.score >= 30) pPoints += 25;
      if (connectors.detectedMarkers.length >= 1 || translationese.detectedTranslationese.length >= 1) pPoints += 15;
      paraphraseRisk = Math.min(100, pPoints);
    }
    if (paraphraseRisk >= 50) {
      flaggedReasons.push(`QuillBot / Grammarly paraphrasing signature detected (Paraphrase Risk: ${paraphraseRisk}%)`);
    }
    const rawRisk = Math.max(0, Math.min(100, Math.round(connectorScore + cadenceScore + parallelismScore + starterScore + diversityScore)));
    const overallRisk = Math.max(rawRisk, Math.round(paraphraseRisk * 0.7));
    let classification = "Human";
    if (paraphraseRisk >= 50 || parallelism.score >= 50 && mattr >= 72) {
      classification = "AI-Paraphrased";
    } else if (overallRisk >= 35 || connectors.detectedMarkers.length >= 2 || translationese.detectedTranslationese.length >= 2) {
      classification = "Raw AI";
    } else {
      classification = "Human";
    }
    let feedback = "";
    if (classification === "Human") {
      feedback = "\u0DC3\u0DCA\u0DC0\u0DB7\u0DCF\u0DC0\u0DD2\u0D9A \u0DB8\u0DCF\u0DB1\u0DC0 \u0DBD\u0DD2\u0DC0\u0DD3\u0DB8\u0DDA \u0DBB\u0DA7\u0DCF\u0DC0\u0D9A\u0DD2 (Natural human writing with organic rhythm and varied structures).";
    } else if (classification === "AI-Paraphrased") {
      feedback = "QuillBot / Grammarly \u0DC1\u0DDB\u0DBD\u0DD2\u0DBA\u0DDA \u0D92\u0D9A\u0DCF\u0D9A\u0DCF\u0DBB\u0DD3 \u0DC0\u0DCF\u0D9A\u0DCA\u200D\u0DBA \u0DC3\u0DD0\u0D9A\u0DD2\u0DBD\u0DD2 \u0DC3\u0DC4 \u0DC3\u0DB8\u0DCF\u0DB1 \u0DB4\u0DAF \u0D86\u0DAF\u0DDA\u0DC1\u0DB1 \u0DC4\u0DB3\u0DD4\u0DB1\u0DCF\u0D9C\u0DD0\u0DB1\u0DD2\u0DAB\u0DD2 (Paraphrased with rigid templates and smoothed cadence).";
    } else {
      feedback = "\u0D9A\u0DD8\u0DAD\u0DCA\u200D\u0DBB\u0DD2\u0DB8 AI \u0DB4\u0DBB\u0DD2\u0DC0\u0DBB\u0DCA\u0DAD\u0DB1 \u0DC3\u0DB8\u0DCA\u0DB6\u0DB1\u0DCA\u0DB0\u0D9A \u0DC4\u0DCF \u0DC3\u0DD8\u0DA2\u0DD4 AI \u0DBB\u0DA7\u0DCF \u0D85\u0DA9\u0D82\u0D9C\u0DD4\u0DBA\u0DD2 (Direct LLM generation with formulaic markers).";
    }
    const allDetected = Array.from(/* @__PURE__ */ new Set([...connectors.detectedMarkers, ...translationese.detectedTranslationese]));
    return {
      overallRisk,
      classification,
      naturalFlow: cadence.burstiness,
      burstinessDetails: cadence,
      mattrDiversity: mattr,
      paraphraseRisk,
      structuralParallelism: parallelism.score,
      formulaicConnectorDensity: connectors.densityPer100Words,
      detectedMarkers: allDetected,
      flaggedReasons,
      feedback,
      sentenceCount,
      wordCount,
      aiRiskScore: overallRisk,
      burstiness: cadence.burstiness,
      lexicalDiversity: Math.round(mattr / 100 * 100) / 100
    };
  }
  var analyzeSinhalaText = analyzeTextHeuristics;

  // src/helaSinhalaEngine.ts
  function lockImmutableTokens(text) {
    const tokenMap = /* @__PURE__ */ new Map();
    let lockIndex = 0;
    function lock(match) {
      const key = `___LOCK_${lockIndex++}___`;
      tokenMap.set(key, match);
      return key;
    }
    let result = text.normalize("NFC");
    result = result.replace(/https?:\/\/[^\s]+/gi, lock);
    result = result.replace(/www\.[^\s]+/gi, lock);
    result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, lock);
    result = result.replace(/\[\d+(?:[\s,\-–—]\d+)*\]/g, lock);
    result = result.replace(/\((?:[^()]*\d{4}[^()]*)\)/g, lock);
    result = result.replace(/(\d+(?:\.\d+)?)\s*([+\-−=≠≈×÷*\/<>≤≥±√∑∞→←↔°^~#@$&€£¥₹¢%]+)\s*(\d+(?:\.\d+)?)/gu, lock);
    result = result.replace(/(?<=\s|^)[+\-−=≠≈×÷*\/<>≤≥±√∑∞→←↔°^~#@$&€£¥₹¢](?=\s|$)/gu, lock);
    result = result.replace(/\b[A-Za-z][A-Za-z0-9_\-.'’]*(?:\s+[A-Za-z][A-Za-z0-9_\-.'’]*)*\b/g, lock);
    result = result.replace(/\b\d+(?:,\d{3})*(?:\.\d+)?%?\b/g, lock);
    return { lockedText: result, tokenMap };
  }
  function unlockImmutableTokens(text, tokenMap) {
    let result = text;
    tokenMap.forEach((originalValue, key) => {
      result = result.split(key).join(originalValue);
    });
    return result;
  }
  var PROTECTED_DOMAIN_ROOTS = [
    // Academic & Research Terminology
    "\u0DB4\u0DBB\u0DCA\u0DBA\u0DDA\u0DC2\u0DAB",
    "\u0DB4\u0DBB\u0DCA\u0DBA\u0DDA\u0DC2\u0DAB\u0DBA",
    "\u0DB4\u0DBB\u0DCA\u0DBA\u0DDA\u0DC2\u0DAB\u0DCF\u0DAD\u0DCA\u0DB8\u0D9A",
    "\u0D9C\u0DC0\u0DDA\u0DC2\u0DAB",
    "\u0D9C\u0DC0\u0DDA\u0DC2\u0DAB\u0DBA",
    "\u0DC0\u0DD2\u0DB8\u0DBB\u0DCA\u0DC1\u0DB1",
    "\u0DC0\u0DD2\u0DB8\u0DBB\u0DCA\u0DC1\u0DB1\u0DBA",
    "\u0D85\u0DB0\u0DCA\u200D\u0DBA\u0DBA\u0DB1",
    "\u0D85\u0DB0\u0DCA\u200D\u0DBA\u0DBA\u0DB1\u0DBA",
    "\u0DB1\u0DD2\u0DB6\u0DB1\u0DCA\u0DB0\u0DB1",
    "\u0DB1\u0DD2\u0DB6\u0DB1\u0DCA\u0DB0\u0DB1\u0DBA",
    "\u0DB8\u0DD6\u0DBD\u0DCF\u0DC1\u0DCA\u200D\u0DBB",
    "\u0DB8\u0DD6\u0DBD\u0DCF\u0DC1\u0DCA\u200D\u0DBB\u0DBA",
    "\u0DC3\u0DCF\u0DBB\u0DCF\u0D82\u0DC1",
    "\u0DC3\u0DCF\u0DBB\u0DCF\u0D82\u0DC1\u0DBA",
    "\u0DC3\u0DCF\u0DC4\u0DD2\u0DAD\u0DCA\u200D\u0DBA",
    "\u0DC0\u0DD2\u0DC1\u0DCA\u0DBD\u0DDA\u0DC2\u0DAB",
    "\u0DC0\u0DD2\u0DC1\u0DCA\u0DBD\u0DDA\u0DC2\u0DAB\u0DBA",
    "\u0D9A\u0DCA\u200D\u0DBB\u0DB8\u0DC0\u0DDA\u0DAF",
    "\u0D9A\u0DCA\u200D\u0DBB\u0DB8\u0DC0\u0DDA\u0DAF\u0DBA",
    // Library & Information Systems
    "\u0DB4\u0DD4\u0DC3\u0DCA\u0DAD\u0D9A\u0DCF\u0DBD",
    "\u0DB4\u0DD4\u0DC3\u0DCA\u0DAD\u0D9A\u0DCF\u0DBD\u0DBA",
    "\u0DAD\u0DDC\u0DBB\u0DAD\u0DD4\u0DBB\u0DD4",
    "\u0DAF\u0DAD\u0DCA\u0DAD",
    "\u0DAF\u0DAD\u0DCA\u0DAD\u0DBA\u0DB1\u0DCA",
    "\u0DB4\u0DAF\u0DCA\u0DB0\u0DAD\u0DD2",
    "\u0DB4\u0DAF\u0DCA\u0DB0\u0DAD\u0DD2\u0DBA",
    "\u0DBD\u0DDA\u0D9B\u0DB1",
    "\u0DBD\u0DDA\u0D9B\u0DB1\u0DCF\u0D9C\u0DCF\u0DBB",
    "\u0DB1\u0DCF\u0DB8\u0DCF\u0DC0\u0DBD\u0DD2",
    "\u0DB1\u0DCF\u0DB8\u0DCF\u0DC0\u0DBD\u0DD2\u0DBA",
    "\u0DC3\u0DD4\u0DA0\u0DD2\u0D9C\u0DAD",
    // Management, Marketing, Commerce & Economics
    "\u0D85\u0DBD\u0DD9\u0DC0\u0DD2\u0D9A\u0DBB\u0DAB",
    "\u0D85\u0DBD\u0DD9\u0DC0\u0DD2\u0D9A\u0DBB\u0DAB\u0DBA",
    "\u0D9A\u0DC5\u0DB8\u0DB1\u0DCF\u0D9A\u0DBB\u0DAB",
    "\u0D9A\u0DC5\u0DB8\u0DB1\u0DCF\u0D9A\u0DBB\u0DAB\u0DBA",
    "\u0DC0\u0DD9\u0DC5\u0DB3\u0DB4\u0DBD",
    "\u0DC0\u0DD9\u0DC5\u0DD9\u0DB3\u0DB4\u0DDC\u0DC5",
    "\u0D86\u0DBB\u0DCA\u0DAE\u0DD2\u0D9A",
    "\u0D86\u0DBB\u0DCA\u0DAE\u0DD2\u0D9A\u0DBA",
    "\u0DB8\u0DD6\u0DBD\u0DCA\u200D\u0DBA",
    "\u0DB8\u0DD6\u0DBD\u0DCA\u200D\u0DBA\u0DBA",
    "\u0DC0\u0DCF\u0DAB\u0DD2\u0DA2",
    "\u0DC0\u0DCA\u200D\u0DBA\u0DCF\u0DB4\u0DCF\u0DBB",
    "\u0DC0\u0DCA\u200D\u0DBA\u0DCF\u0DB4\u0DCF\u0DBB\u0DD2\u0D9A",
    "\u0DB4\u0DCF\u0DBB\u0DD2\u0DB7\u0DDD\u0D9C\u0DD2\u0D9A",
    "\u0DB4\u0DCF\u0DBB\u0DD2\u0DB7\u0DDD\u0D9C\u0DD2\u0D9A\u0DBA\u0DCF",
    "\u0DB1\u0DD2\u0DC2\u0DCA\u0DB4\u0DCF\u0DAF\u0DB1",
    "\u0DB1\u0DD2\u0DC2\u0DCA\u0DB4\u0DCF\u0DAF\u0DB1\u0DBA",
    // Higher Education & Institutions
    "\u0DC0\u0DD2\u0DC1\u0DCA\u0DC0\u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DBD",
    "\u0DC0\u0DD2\u0DC1\u0DCA\u0DC0\u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DBD\u0DBA",
    "\u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DB4\u0DD3\u0DA8",
    "\u0DB4\u0DD3\u0DA8",
    "\u0DAF\u0DD9\u0DB4\u0DCF\u0DBB\u0DCA\u0DAD\u0DB8\u0DDA\u0DB1\u0DCA\u0DAD\u0DD4\u0DC0",
    "\u0D86\u0DBA\u0DAD\u0DB1",
    "\u0D86\u0DBA\u0DAD\u0DB1\u0DBA",
    "\u0DC1\u0DD2\u0DC2\u0DCA\u200D\u0DBA",
    "\u0DC3\u0DD2\u0DC3\u0DD4\u0DB1\u0DCA",
    "\u0D86\u0DA0\u0DCF\u0DBB\u0DCA\u0DBA",
    "\u0DB8\u0DC4\u0DCF\u0DA0\u0DCF\u0DBB\u0DCA\u0DBA",
    "\u0DB4\u0DCF\u0DC3\u0DBD\u0DCA",
    "\u0DB4\u0DCF\u0DC3\u0DBD",
    // Law, Governance & Public Administration
    "\u0DB1\u0DD3\u0DAD\u0DD2",
    "\u0DB1\u0DD3\u0DAD\u0DD2\u0DBA",
    "\u0DB1\u0DD3\u0DAD\u0DD2\u0DB8\u0DBA",
    "\u0DC0\u0DCA\u200D\u0DBA\u0DC0\u0DC3\u0DCA\u0DAE\u0DCF",
    "\u0DC0\u0DCA\u200D\u0DBA\u0DC0\u0DC3\u0DCA\u0DAE\u0DCF\u0DC0",
    "\u0D85\u0DB0\u0DD2\u0D9A\u0DBB\u0DAB",
    "\u0D85\u0DB0\u0DD2\u0D9A\u0DBB\u0DAB\u0DBA",
    "\u0DB4\u0DCA\u200D\u0DBB\u0DAD\u0DD2\u0DB4\u0DAD\u0DCA\u0DAD\u0DD2",
    "\u0DB4\u0DCA\u200D\u0DBB\u0DAD\u0DD2\u0DB4\u0DAD\u0DCA\u0DAD\u0DD2\u0DBA",
    "\u0DBB\u0DCF\u0DA2\u0DCA\u200D\u0DBA",
    "\u0DBB\u0DA2\u0DBA",
    "\u0DAF\u0DDA\u0DC1\u0DB4\u0DCF\u0DBD\u0DB1",
    "\u0DAF\u0DDA\u0DC1\u0DB4\u0DCF\u0DBD\u0DB1\u0DBA",
    // Science, Technology, Health & Medicine
    "\u0DAD\u0DCF\u0D9A\u0DCA\u0DC2\u0DAB",
    "\u0DAD\u0DCF\u0D9A\u0DCA\u0DC2\u0DAB\u0DBA",
    "\u0DAD\u0DCF\u0D9A\u0DCA\u0DC2\u0DAB\u0DD2\u0D9A",
    "\u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF",
    "\u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0",
    "\u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DAD\u0DCA\u0DB8\u0D9A",
    "\u0DC0\u0DDB\u0DAF\u0DCA\u200D\u0DBA",
    "\u0DC0\u0DDB\u0DAF\u0DCA\u200D\u0DBA\u0DC0\u0DBB\u0DBA\u0DCF",
    "\u0DBB\u0DDD\u0D9C",
    "\u0DBB\u0DDD\u0D9C\u0DD2\u0DBA\u0DCF",
    "\u0D96\u0DC2\u0DB0",
    "\u0DB4\u0DCA\u200D\u0DBB\u0DAD\u0DD2\u0D9A\u0DCF\u0DBB",
    "\u0DC3\u0DDE\u0D9B\u0DCA\u200D\u0DBA",
    "\u0DB4\u0DBB\u0DD2\u0D9C\u0DAB\u0D9A",
    "\u0DB8\u0DD8\u0DAF\u0DD4\u0D9A\u0DCF\u0D82\u0D9C",
    "\u0DAF\u0DD8\u0DAA\u0DCF\u0D82\u0D9C",
    "\u0DA2\u0DCF\u0DBD",
    "\u0DA2\u0DCF\u0DBD\u0D9A\u0DBB\u0DAB",
    "\u0D9A\u0DCA\u200D\u0DBB\u0DB8\u0DBD\u0DDA\u0D9B\u0DB1",
    "\u0DA2\u0DD3\u0DC0\u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF",
    "\u0DB7\u0DDE\u0DAD\u0DD2\u0D9A",
    "\u0DBB\u0DC3\u0DCF\u0DBA\u0DB1",
    "\u0DB4\u0DBB\u0DD2\u0DC3\u0DBB",
    "\u0DB4\u0DBB\u0DD2\u0DC3\u0DBB\u0DBA"
  ];
  var NEGATION_MARKERS = [
    "\u0DB1\u0DD0\u0DAD",
    "\u0DB1\u0DD0\u0DAD\u0DD2",
    "\u0DB1\u0DD0\u0DAD\u0DD0\u0DBA\u0DD2",
    "\u0DB1\u0DD0\u0DAD\u0DD4\u0DC0",
    "\u0DB1\u0DDC\u0DC0\u0DDA",
    "\u0DB1\u0DDC\u0DC0",
    "\u0DB1\u0DDC\u0DC0\u0DB1",
    "\u0DB1\u0DDC\u0DC0\u0DB1\u0DD4",
    "\u0DB1\u0DDC\u0DC0\u0DDA\u0DAF",
    "\u0DB1\u0DDC\u0DC4\u0DD0\u0D9A",
    "\u0DB1\u0DDC\u0DC4\u0DD0\u0D9A\u0DD2\u0DBA",
    "\u0DB1\u0DDC\u0DC4\u0DD0\u0D9A\u0DD2",
    "\u0DB1\u0DDC\u0DC4\u0DD0\u0D9A\u0DCA\u0D9A\u0DDA",
    "\u0DB1\u0DDC\u0DB8\u0DD0\u0DAD",
    "\u0DB1\u0DDC\u0DB8\u0DD0\u0DAD\u0DD2",
    "\u0DB1\u0DDC\u0DB8\u0DD0\u0DAD\u0DCA\u0DAD\u0DDA",
    "\u0D9A\u0DD2\u0DC3\u0DD2\u0DC3\u0DDA\u0DAD\u0DCA",
    "\u0D9A\u0DD2\u0DC3\u0DD2\u0DC0\u0D9A\u0DCA"
  ];
  function isNegationWord(word) {
    const normalized = (word || "").normalize("NFC").trim();
    if (!normalized) return false;
    if (NEGATION_MARKERS.includes(normalized)) return true;
    if (normalized.startsWith("\u0DB1\u0DDC") && normalized.length >= 4) return true;
    return false;
  }
  var TRANSLATIONESE_CALQUE_RULES = [
    // 1. Robotic Sentence Openers (Frequently dropped entirely so sentence starts with subject)
    {
      pattern: /(^|[.?!।\n]\s*)(?:තවද|තව ද)[,\s]+/gu,
      academic: ["", "\u0D8A\u0DA7 \u0D85\u0DB8\u0DAD\u0DBB\u0DC0, ", "\u0D91\u0DB8\u0DD9\u0DB1\u0DCA\u0DB8, ", "\u0DB8\u0DD3\u0DA7 \u0DC3\u0DB8\u0D9C\u0DCF\u0DB8\u0DD3\u0DC0, ", "\u0DAD\u0DC0\u0DAD\u0DCA \u0D85\u0DAD\u0D9A\u0DD2\u0DB1\u0DCA, "],
      general: ["", "\u0D92 \u0DC0\u0D9C\u0DDA\u0DB8, ", "\u0D8A\u0DA7 \u0D85\u0DB8\u0DAD\u0DBB\u0DC0, ", "\u0D92 \u0D91\u0D9A\u0DCA\u0D9A\u0DB8, ", "\u0D85\u0DB1\u0DD9\u0D9A\u0DCA \u0D85\u0DAD\u0DA7, "]
    },
    {
      pattern: /(^|[.?!।\n]\s*)මීට අමතරව[,\s]+/gu,
      academic: ["", "\u0D8A\u0DA7 \u0DC3\u0DB8\u0D9C\u0DCF\u0DB8\u0DD3\u0DC0, ", "\u0DAD\u0DC0\u0DAD\u0DCA \u0D85\u0DAD\u0D9A\u0DD2\u0DB1\u0DCA, ", "\u0D92 \u0DC3\u0DB8\u0D9F\u0DB8, ", "\u0D91\u0DB8\u0DD9\u0DB1\u0DCA\u0DB8, "],
      general: ["", "\u0D92 \u0D91\u0D9A\u0DCA\u0D9A\u0DB8, ", "\u0DAD\u0DC0\u0DAD\u0DCA \u0DB4\u0DD0\u0DAD\u0DCA\u0DAD\u0D9A\u0DD2\u0DB1\u0DCA, ", "\u0D92 \u0DC0\u0D9C\u0DDA\u0DB8, ", ""]
    },
    {
      pattern: /(^|[.?!।\n]\s*)(?:සමස්තයක් වශයෙන් ගත් කල|සමස්තයක් වශයෙන් ගත්කල)[,\s]+/gu,
      academic: ["\u0DC3\u0DB8\u0DC3\u0DCA\u0DAD\u0DBA\u0D9A\u0DCA \u0DBD\u0DD9\u0DC3, ", "\u0DC3\u0DCF\u0DBB\u0DCF\u0D82\u0DC1\u0DBA\u0D9A\u0DCA \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA, ", "\u0DB8\u0DDA \u0D85\u0DB1\u0DD4\u0DC0, ", "\u0DC3\u0DB8\u0DC3\u0DCA\u0DAD \u0DC0\u0DD2\u0D9C\u0DCA\u200D\u0DBB\u0DC4\u0DBA \u0D85\u0DB1\u0DD4\u0DC0, "],
      general: ["\u0D9A\u0DD9\u0DA7\u0DD2\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8 \u0D9A\u0DD2\u0DBA\u0DB1\u0DC0\u0DCF \u0DB1\u0DB8\u0DCA, ", "\u0DB8\u0DD4\u0DC5\u0DD4\u0DB8\u0DB1\u0DD2\u0DB1\u0DCA\u0DB8 \u0DB6\u0DD0\u0DBD\u0DD4\u0DC0\u0DB8, ", "\u0D85\u0DC0\u0DC3\u0DCF\u0DB1\u0DBA\u0DDA\u0DAF\u0DD3, "]
    },
    {
      pattern: /(^|[.?!।\n]\s*)අවසාන වශයෙන්[,\s]+/gu,
      academic: ["\u0DC3\u0DB8\u0DC3\u0DCA\u0DAD\u0DBA\u0D9A\u0DCA \u0DBD\u0DD9\u0DC3, ", "\u0D85\u0DC0\u0DC3\u0DB1\u0DCA \u0DB1\u0DD2\u0D9C\u0DB8\u0DB1\u0DBA \u0DBD\u0DD9\u0DC3, ", "\u0D9A\u0DD9\u0DA7\u0DD2\u0DBA\u0DD9\u0DB1\u0DCA \u0D9A\u0DD2\u0DC0\u0DC4\u0DDC\u0DAD\u0DCA, ", "\u0DB8\u0DDA \u0D85\u0DB1\u0DD4\u0DC0, "],
      general: ["\u0D9A\u0DD9\u0DA7\u0DD2\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8 \u0D9A\u0DD2\u0DC0\u0DCA\u0DC0\u0DDC\u0DAD\u0DCA, ", "\u0D85\u0DC0\u0DC3\u0DCF\u0DB1\u0DBA\u0DA7 \u0D9C\u0DAD\u0DCA\u0DAD\u0DDC\u0DAD\u0DCA, ", "\u0DC3\u0DCF\u0DBB\u0DCF\u0D82\u0DC1\u0DBA\u0D9A\u0DCA \u0DC0\u0DD2\u0DAF\u0DD2\u0DBA\u0DA7, "]
    },
    {
      pattern: /(^|[.?!।\n]\s*)මෙයින් පැහැදිලි වන්නේ[,\s]+/gu,
      academic: ["\u0DB8\u0DD9\u0DC4\u0DD2\u0DAF\u0DD3 \u0DB1\u0DD2\u0DBB\u0DD3\u0D9A\u0DCA\u0DC2\u0DAB\u0DBA \u0DC0\u0DB1\u0DCA\u0DB1\u0DDA ", "\u0DB8\u0DD9\u0DC4\u0DD2 \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0DC3\u0DCF\u0DB0\u0D9A\u0DBA \u0DB1\u0DB8\u0DCA ", "\u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0DC0\u0DB1 \u0D9A\u0DBB\u0DD4\u0DAB \u0DB1\u0DB8\u0DCA ", "\u0DB4\u0DD9\u0DB1\u0DD3 \u0DBA\u0DB1\u0DCA\u0DB1\u0DDA "],
      general: ["\u0DB8\u0DDA\u0D9A\u0DD9\u0DB1\u0DCA \u0DB4\u0DDA\u0DB1\u0DCA\u0DB1\u0DD9 ", "\u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2\u0DC0\u0DB8 \u0DB4\u0DDA\u0DB1 \u0D9A\u0DCF\u0DBB\u0DAB\u0DBA \u0DB1\u0DB8\u0DCA ", "\u0D85\u0DB4\u0DD2\u0DA7 \u0DB4\u0DDA\u0DB1\u0DCA\u0DB1\u0DDA "]
    },
    {
      pattern: /(^|[.?!।\n]\s*)මේ අනුව බලන කල[,\s]+/gu,
      academic: ["\u0D92 \u0D85\u0DB1\u0DD4\u0DC0 \u0DC0\u0DD2\u0DB8\u0DC3\u0DD3\u0DB8\u0DDA\u0DAF\u0DD3, ", "\u0DB8\u0DD9\u0DB8 \u0DC3\u0DCF\u0DB0\u0D9A \u0D85\u0DB1\u0DD4\u0DC0, ", "\u0DB8\u0DD9\u0DC4\u0DD2\u0DAF\u0DD3 \u0DB4\u0DD9\u0DB1\u0DD3 \u0DBA\u0DB1\u0DCA\u0DB1\u0DDA, ", "\u0D92 \u0D85\u0DB1\u0DD4\u0DC0, "],
      general: ["\u0DB8\u0DDA \u0DC0\u0DD2\u0DAF\u0DD2\u0DBA\u0DA7 \u0DB6\u0DD0\u0DBD\u0DD4\u0DC0\u0DB8, ", "\u0D92 \u0D85\u0DB1\u0DD4\u0DC0, ", "\u0DB6\u0DD0\u0DBD\u0DD6 \u0DB6\u0DD0\u0DBD\u0DCA\u0DB8\u0DA7, "]
    },
    {
      pattern: /විශේෂයෙන් සඳහන් කළ යුතුය[,\s]*/gu,
      academic: ["\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8 \u0D85\u0DC0\u0DB0\u0DCF\u0DBB\u0DAB\u0DBA \u0DC0\u0DB1\u0DCA\u0DB1\u0DDA ", "\u0DC3\u0DD4\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DD3 \u0DBD\u0DD9\u0DC3 \u0DB4\u0DD9\u0DB1\u0DCA\u0DC0\u0DCF \u0DAF\u0DD2\u0DBA \u0DC4\u0DD0\u0D9A\u0DCA\u0D9A\u0DDA ", "\u0DB8\u0DD6\u0DBD\u0DD2\u0D9A\u0DC0\u0DB8 \u0D9A\u0DD0\u0DB4\u0DD3 \u0DB4\u0DD9\u0DB1\u0DD9\u0DB1\u0DCA\u0DB1\u0DDA "],
      general: ["\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8 \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1 \u0D95\u0DB1\u0DDA ", "\u0DC0\u0DD0\u0DAF\u0D9C\u0DAD\u0DCA\u0DB8 \u0DAF\u0DDA \u0DAD\u0DB8\u0DBA\u0DD2 "]
    },
    {
      pattern: /බව කිව යුතුය[,\s]*/gu,
      academic: ["\u0DBA\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2\u0DBA. ", "\u0DBA\u0DB1\u0DCA\u0DB1 \u0DB1\u0DD2\u0DBB\u0DD3\u0D9A\u0DCA\u0DC2\u0DAB\u0DBA \u0DC0\u0DDA. ", "\u0DB6\u0DC0 \u0D85\u0DC0\u0DB0\u0DCF\u0DBB\u0DAB\u0DBA \u0D9A\u0DC5 \u0DBA\u0DD4\u0DAD\u0DD4\u0DBA. "],
      general: ["\u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1 \u0D95\u0DB1\u0DDA. ", "\u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0D9A\u0DCF\u0DBB\u0DAB\u0DBA\u0D9A\u0DCA. "]
    },
    // 2. Robotic Calque Predicates
    {
      pattern: /වැදගත් කාර්යභාරයක් ඉටු කරයි/gu,
      academic: ["\u0DC3\u0DD4\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DD3 \u0DB8\u0DD9\u0DC4\u0DD9\u0DC0\u0DBB\u0D9A\u0DCA \u0D89\u0DA7\u0DD4 \u0D9A\u0DBB\u0DBA\u0DD2", "\u0DB8\u0DC4\u0DAD\u0DCA \u0DB4\u0DD2\u0DA7\u0DD4\u0DC0\u0DC4\u0DBD\u0D9A\u0DCA \u0DC0\u0DDA", "\u0DB4\u0DCA\u200D\u0DBB\u0DB8\u0DD4\u0D9B \u0DAF\u0DCF\u0DBA\u0D9A\u0DAD\u0DCA\u0DC0\u0DBA\u0D9A\u0DCA \u0DC3\u0DB4\u0DBA\u0DBA\u0DD2", "\u0DC3\u0DD4\u0DC0\u0DD2\u0DC3\u0DBD\u0DCA \u0DB8\u0DD9\u0DC4\u0DD9\u0DBA\u0D9A\u0DCA \u0D89\u0DA7\u0DD4 \u0D9A\u0DBB\u0DBA\u0DD2"],
      general: ["\u0DBD\u0DDC\u0D9A\u0DD4 \u0DB8\u0DD9\u0DC4\u0DD9\u0DC0\u0DBB\u0D9A\u0DCA \u0D9A\u0DBB\u0DB1\u0DC0\u0DCF", "\u0DC0\u0DD2\u0DC1\u0DCF\u0DBD \u0DC3\u0DC4\u0DBA\u0DDD\u0D9C\u0DBA\u0D9A\u0DCA \u0DC0\u0DD9\u0DB1\u0DC0\u0DCF", "\u0D89\u0DAD\u0DCF \u0DC0\u0DD0\u0DAF\u0D9C\u0DAD\u0DCA \u0DC0\u0DD9\u0DB1\u0DC0\u0DCF", "\u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0DAD\u0DD0\u0DB1\u0D9A\u0DCA \u0D9C\u0DB1\u0DCA\u0DB1\u0DC0\u0DCF"]
    },
    {
      pattern: /වැදගත් කාර්යභාරයක් ඉටු කරනු ලබයි/gu,
      academic: ["\u0DC3\u0DD4\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DD3 \u0DB8\u0DD9\u0DC4\u0DD9\u0DC0\u0DBB\u0D9A\u0DCA \u0D89\u0DA7\u0DD4 \u0D9A\u0DBB\u0DBA\u0DD2", "\u0DB8\u0DC4\u0DAD\u0DCA \u0DB4\u0DD2\u0DA7\u0DD4\u0DC0\u0DC4\u0DBD\u0D9A\u0DCA \u0DC0\u0DDA", "\u0DB4\u0DCA\u200D\u0DBB\u0DB8\u0DD4\u0D9B \u0DAF\u0DCF\u0DBA\u0D9A\u0DAD\u0DCA\u0DC0\u0DBA\u0D9A\u0DCA \u0DC3\u0DB4\u0DBA\u0DBA\u0DD2"],
      general: ["\u0DBD\u0DDC\u0D9A\u0DD4 \u0DB8\u0DD9\u0DC4\u0DD9\u0DC0\u0DBB\u0D9A\u0DCA \u0D9A\u0DBB\u0DB1\u0DC0\u0DCF", "\u0DC0\u0DD2\u0DC1\u0DCF\u0DBD \u0DB8\u0DD9\u0DC4\u0DD9\u0DBA\u0D9A\u0DCA \u0D89\u0DA7\u0DD4 \u0D9A\u0DBB\u0DB1\u0DC0\u0DCF"]
    },
    {
      pattern: /(?:සඳහන් කළ හැකිය|සඳහන් කළ හැක)/gu,
      academic: ["\u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0DC0\u0DDA", "\u0DB4\u0DD9\u0DB1\u0DD3 \u0DBA\u0DBA\u0DD2", "\u0DAF\u0DD0\u0D9A\u0D9C\u0DAD \u0DC4\u0DD0\u0D9A\u0DD2\u0DBA", "\u0DC0\u0DD2\u0DAF\u0DC4\u0DCF \u0DAF\u0DD0\u0D9A\u0DCA\u0DC0\u0DD2\u0DBA \u0DC4\u0DD0\u0D9A\u0DD2\u0DBA", "\u0DB1\u0DD2\u0DBB\u0DD3\u0D9A\u0DCA\u0DC2\u0DAB\u0DBA \u0DC0\u0DDA"],
      general: ["\u0DB4\u0DDA\u0DB1\u0DCA\u0DB1 \u0DAD\u0DD2\u0DBA\u0DD9\u0DB1\u0DC0\u0DCF", "\u0DAF\u0D9A\u0DD2\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD4\u0DC5\u0DD4\u0DC0\u0DB1\u0DCA", "\u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD4\u0DC5\u0DD4\u0DC0\u0DB1\u0DCA", "\u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0DC0\u0DD9\u0DB1\u0DC0\u0DCF"]
    },
    {
      pattern: /(?:හඳුනාගත හැකිය|හඳුනාගත හැක)/gu,
      academic: ["\u0DB1\u0DD2\u0DBB\u0DD3\u0D9A\u0DCA\u0DC2\u0DAB\u0DBA \u0D9A\u0DC5 \u0DC4\u0DD0\u0D9A\u0DD2\u0DBA", "\u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0DC0\u0DDA", "\u0DC0\u0DD2\u0DAF\u0DC4\u0DCF \u0DAF\u0DD0\u0D9A\u0DCA\u0DC0\u0DD2\u0DBA \u0DC4\u0DD0\u0D9A\u0DD2\u0DBA", "\u0D85\u0DB1\u0DCF\u0DC0\u0DBB\u0DAB\u0DBA \u0DC0\u0DDA"],
      general: ["\u0DAF\u0D9A\u0DD2\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD4\u0DC5\u0DD4\u0DC0\u0DB1\u0DCA", "\u0DB4\u0DDA\u0DB1\u0DCA\u0DB1 \u0DAD\u0DD2\u0DBA\u0DD9\u0DB1\u0DC0\u0DCF", "\u0DC4\u0DB3\u0DD4\u0DB1\u0DCF\u0D9C\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD4\u0DC5\u0DD4\u0DC0\u0DB1\u0DCA"]
    },
    {
      pattern: /බවට පත්ව ඇත/gu,
      academic: ["\u0DC0\u0DD3 \u0D87\u0DAD", "\u0DB6\u0DC0\u0DA7 \u0DB4\u0DAD\u0DCA\u0DC0 \u0DAD\u0DD2\u0DB6\u0DDA", "\u0DB4\u0DAD\u0DCA\u0DC0 \u0D87\u0DAD", "\u0DC3\u0DCA\u0DAE\u0DCF\u0DB4\u0DD2\u0DAD \u0DC0\u0DD3 \u0D87\u0DAD"],
      general: ["\u0DC0\u0DD9\u0DBD\u0DCF \u0DAD\u0DD2\u0DBA\u0DD9\u0DB1\u0DC0\u0DCF", "\u0DB6\u0DC0\u0DA7 \u0DB4\u0DAD\u0DCA\u0DC0\u0DD9\u0DBD\u0DCF", "\u0DC0\u0DD3 \u0D87\u0DAD"]
    },
    {
      pattern: /ප්‍රතිඵලයක් වශයෙන්/gu,
      academic: ["\u0DB1\u0DD2\u0DC3\u0DCF", "\u0DB6\u0DD0\u0DC0\u0DD2\u0DB1\u0DCA", "\u0DC4\u0DDA\u0DAD\u0DD4\u0DC0\u0DD9\u0DB1\u0DCA", "\u0DB8\u0DDA \u0DC4\u0DDA\u0DAD\u0DD4\u0DC0\u0DD9\u0DB1\u0DCA"],
      general: ["\u0D92 \u0DB1\u0DD2\u0DC3\u0DCF", "\u0DC4\u0DD2\u0DB1\u0DCA\u0DAF\u0DCF", "\u0DB8\u0DDA\u0D9A\u0DD9 \u0DB4\u0DCA\u200D\u0DBB\u0DAD\u0DD2\u0DB5\u0DBD\u0DBA\u0D9A\u0DCA \u0DC0\u0DD2\u0DAF\u0DD2\u0DBA\u0DA7"]
    },
    {
      pattern: /අත්‍යවශ්‍ය වේ/gu,
      academic: ["\u0D85\u0DAD\u0DCA\u200D\u0DBA\u0DC0\u0DC1\u0DCA\u200D\u0DBA \u0DC3\u0DCF\u0DB0\u0D9A\u0DBA\u0D9A\u0DD2", "\u0D85\u0DAD\u0DD2\u0DC1\u0DBA \u0DC0\u0DD0\u0DAF\u0D9C\u0DAD\u0DCA \u0DC0\u0DDA", "\u0DB4\u0DCA\u200D\u0DBB\u0DB8\u0DD4\u0D9B \u0D85\u0DC0\u0DC1\u0DCA\u200D\u0DBA\u0DAD\u0DCF\u0DC0\u0D9A\u0DD2"],
      general: ["\u0DB1\u0DD0\u0DAD\u0DD4\u0DC0\u0DB8 \u0DB6\u0DD0\u0DBB\u0DD2 \u0DAF\u0DD9\u0DBA\u0D9A\u0DCA", "\u0D89\u0DAD\u0DCF\u0DB8 \u0DC0\u0DD0\u0DAF\u0D9C\u0DAD\u0DCA \u0DC0\u0DD9\u0DB1\u0DC0\u0DCF", "\u0D85\u0DB1\u0DD2\u0DC0\u0DCF\u0DBB\u0DCA\u0DBA\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8 \u0D95\u0DB1"]
    },
    {
      pattern: /සැලකිය යුතුය/gu,
      academic: ["\u0D85\u0DC0\u0DB0\u0DCF\u0DB1\u0DBA\u0DA7 \u0DBD\u0D9A\u0DCA\u0DC0\u0DD2\u0DBA \u0DBA\u0DD4\u0DAD\u0DD4\u0DBA", "\u0DC3\u0DD0\u0DBD\u0D9A\u0DD2\u0DBD\u0DCA\u0DBD\u0DA7 \u0D9C\u0DAD \u0DC4\u0DD0\u0D9A\u0DD2\u0DBA", "\u0DC0\u0DD2\u0DB8\u0DC3\u0DCF \u0DB6\u0DD0\u0DBD\u0DD3\u0DB8 \u0DC0\u0DA7\u0DD3"],
      general: ["\u0DC4\u0DD2\u0DAD\u0DB1\u0DCA\u0DB1 \u0D95\u0DB1 \u0D9A\u0DCF\u0DBB\u0DAB\u0DBA\u0D9A\u0DCA", "\u0D85\u0DC0\u0DB0\u0DCF\u0DB1\u0DBA \u0DBA\u0DDC\u0DB8\u0DD4 \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1 \u0D95\u0DB1"]
    },
    {
      pattern: /මූලික වශයෙන්/gu,
      academic: ["\u0DB4\u0DCA\u200D\u0DBB\u0DB0\u0DCF\u0DB1 \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8", "\u0DB4\u0DCA\u200D\u0DBB\u0DB8\u0DD4\u0D9B \u0D9A\u0DDC\u0DA7", "\u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0DB4\u0DAF\u0DB1\u0DB8 \u0DBD\u0DD9\u0DC3", "\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8"],
      general: ["\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8", "\u0DC0\u0DD0\u0DA9\u0DD2\u0DB4\u0DD4\u0DBB\u0DB8", "\u0DB4\u0DCA\u200D\u0DBB\u0DB0\u0DCF\u0DB1 \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA"]
    },
    {
      pattern: /(?:ප්‍රධාන වශයෙන්|ප්රධාන වශයෙන්)/gu,
      academic: ["\u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8", "\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2 \u0D9A\u0DDC\u0DA7", "\u0DB4\u0DCA\u200D\u0DBB\u0DB8\u0DD4\u0D9B \u0D9A\u0DDC\u0DA7", "\u0DB4\u0DCA\u200D\u0DBB\u0DB0\u0DCF\u0DB1 \u0DC3\u0DCF\u0DB0\u0D9A\u0DBA\u0D9A\u0DCA \u0DBD\u0DD9\u0DC3"],
      general: ["\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8", "\u0DC0\u0DD0\u0DA9\u0DD2\u0DB4\u0DD4\u0DBB\u0DB8", "\u0DB4\u0DCA\u200D\u0DBB\u0DB0\u0DCF\u0DB1 \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA"]
    },
    {
      pattern: /විසින් සිදු කරනු ලැබේ/gu,
      academic: ["\u0DC0\u0DD2\u0DC3\u0DD2\u0DB1\u0DCA \u0DC3\u0DD2\u0DAF\u0DD4 \u0D9A\u0DD9\u0DBB\u0DDA", "\u0DC0\u0DD2\u0DC3\u0DD2\u0DB1\u0DCA \u0DB8\u0DD9\u0DC4\u0DD9\u0DBA\u0DC0\u0DB1\u0DD4 \u0DBD\u0DD0\u0DB6\u0DDA", "\u0DC0\u0DD2\u0DC3\u0DD2\u0DB1\u0DCA \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF\u0DC0\u0DA7 \u0DB1\u0D82\u0DC0\u0DBA\u0DD2"],
      general: ["\u0DC0\u0DD2\u0DC3\u0DD2\u0DB1\u0DCA \u0DC3\u0DD2\u0DAF\u0DD4 \u0D9A\u0DBB\u0DBA\u0DD2", "\u0DC0\u0DD2\u0DC3\u0DD2\u0DB1\u0DCA \u0D9A\u0DD9\u0DBB\u0DDA", "\u0DB8\u0D9F\u0DD2\u0DB1\u0DCA \u0D9A\u0DBB\u0DBA\u0DD2"]
    },
    {
      pattern: /විසින් සිදු කරනු ලබයි/gu,
      academic: ["\u0DC0\u0DD2\u0DC3\u0DD2\u0DB1\u0DCA \u0DC3\u0DD2\u0DAF\u0DD4 \u0D9A\u0DD9\u0DBB\u0DDA", "\u0DC0\u0DD2\u0DC3\u0DD2\u0DB1\u0DCA \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF\u0DC0\u0DA7 \u0DB1\u0D82\u0DC0\u0DBA\u0DD2", "\u0DC0\u0DD2\u0DC3\u0DD2\u0DB1\u0DCA \u0D89\u0DA7\u0DD4 \u0D9A\u0DD9\u0DBB\u0DDA"],
      general: ["\u0DC0\u0DD2\u0DC3\u0DD2\u0DB1\u0DCA \u0DC3\u0DD2\u0DAF\u0DD4 \u0D9A\u0DBB\u0DBA\u0DD2", "\u0DC0\u0DD2\u0DC3\u0DD2\u0DB1\u0DCA \u0D9A\u0DBB\u0DB1\u0DC0\u0DCF"]
    }
  ];
  function deCalqueTranslationese(text, mode, seed) {
    let result = text;
    let counter = seed;
    for (const rule of TRANSLATIONESE_CALQUE_RULES) {
      const replacements = mode === "academic" ? rule.academic : rule.general;
      result = result.replace(rule.pattern, (_match, ...args) => {
        const prefix = typeof args[0] === "string" ? args[0] : "";
        const choice = replacements[counter % replacements.length];
        counter++;
        if (!choice) {
          return prefix;
        }
        return `${prefix}${choice}`;
      });
    }
    return result;
  }
  function deNominalizeVerbs(text) {
    let result = text;
    const directMap = [
      [/(?:වර්ධනය කිරීමක් සිදු කරයි|වර්ධනය සිදු කරයි|වර්ධනය කරනු ලබයි)/gu, "\u0DC0\u0DBB\u0DCA\u0DB0\u0DB1\u0DBA \u0D9A\u0DBB\u0DBA\u0DD2"],
      [/(?:පාලනය කිරීමක් සිදු කරයි|පාලනය කරනු ලබයි)/gu, "\u0DB4\u0DCF\u0DBD\u0DB1\u0DBA \u0D9A\u0DBB\u0DBA\u0DD2"],
      [/(?:භාවිතා කරනු ලබයි|භාවිතා කිරීමක් සිදු කරයි|භාවිත කරනු ලබයි)/gu, "\u0DB7\u0DCF\u0DC0\u0DD2\u0DAD \u0D9A\u0DBB\u0DBA\u0DD2"],
      [/(?:ක්‍රියාත්මක කරනු ලබයි|ක්‍රියාත්මක කිරීමක් සිදු කරයි)/gu, "\u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF\u0DAD\u0DCA\u0DB8\u0D9A \u0D9A\u0DBB\u0DBA\u0DD2"],
      [/(?:අධ්‍යයනය කිරීමක් සිදු කරයි|අධ්‍යයනය කරනු ලබයි)/gu, "\u0D85\u0DB0\u0DCA\u200D\u0DBA\u0DBA\u0DB1\u0DBA \u0D9A\u0DBB\u0DBA\u0DD2"],
      [/(?:විමර්ශනය කිරීමක් සිදු කරයි|විමර්ශනය කරනු ලබයි)/gu, "\u0DC0\u0DD2\u0DB8\u0DBB\u0DCA\u0DC1\u0DB1\u0DBA \u0D9A\u0DBB\u0DBA\u0DD2"],
      [/(?:තක්සේරු කිරීමක් සිදු කරයි|තක්සේරු කරනු ලබයි)/gu, "\u0DAD\u0D9A\u0DCA\u0DC3\u0DDA\u0DBB\u0DD4 \u0D9A\u0DBB\u0DBA\u0DD2"],
      [/(?:ඉදිරිපත් කිරීමක් සිදු කරයි|ඉදිරිපත් කරනු ලබයි)/gu, "\u0D89\u0DAF\u0DD2\u0DBB\u0DD2\u0DB4\u0DAD\u0DCA \u0D9A\u0DBB\u0DBA\u0DD2"],
      [/(?:සැපයීමක් සිදු කරයි|සැපයීම සිදු කරයි)/gu, "\u0DC3\u0DB4\u0DBA\u0DBA\u0DD2"],
      [/(?:ලබා දීමක් සිදු කරයි|ලබාදීමක් සිදු කරයි)/gu, "\u0DBD\u0DB6\u0DCF \u0DAF\u0DD9\u0DBA\u0DD2"],
      [/(?:තහවුරු කිරීමක් සිදු කරයි|තහවුරු කරනු ලබයි)/gu, "\u0DAD\u0DC4\u0DC0\u0DD4\u0DBB\u0DD4 \u0D9A\u0DBB\u0DBA\u0DD2"],
      [/(?:දැනුවත් කිරීමක් සිදු කරයි|දැනුවත් කරනු ලබයි)/gu, "\u0DAF\u0DD0\u0DB1\u0DD4\u0DC0\u0DAD\u0DCA \u0D9A\u0DBB\u0DBA\u0DD2"],
      [/(?:සංවිධානය කිරීමක් සිදු කරයි|සංවිධානය කරනු ලබයි)/gu, "\u0DC3\u0D82\u0DC0\u0DD2\u0DB0\u0DCF\u0DB1\u0DBA \u0D9A\u0DBB\u0DBA\u0DD2"],
      [/(?:ප්‍රකාශ කිරීමක් සිදු කරයි|ප්‍රකාශ කරනු ලබයි)/gu, "\u0DB4\u0DCA\u200D\u0DBB\u0D9A\u0DCF\u0DC1 \u0D9A\u0DBB\u0DBA\u0DD2"],
      [/(?:ආරම්භ කිරීමක් සිදු කරයි|ආරම්භ කරනු ලබයි)/gu, "\u0D86\u0DBB\u0DB8\u0DCA\u0DB7 \u0D9A\u0DBB\u0DBA\u0DD2"],
      [/(?:නිගමනය කිරීමක් සිදු කරයි|නිගමනය කරනු ලබයි)/gu, "\u0DB1\u0DD2\u0D9C\u0DB8\u0DB1\u0DBA \u0D9A\u0DBB\u0DBA\u0DD2"],
      [/(?:පරිවර්තනය කිරීමක් සිදු කරයි|පරිවර්තනය කරනු ලබයි)/gu, "\u0DB4\u0DBB\u0DD2\u0DC0\u0DBB\u0DCA\u0DAD\u0DB1\u0DBA \u0D9A\u0DBB\u0DBA\u0DD2"]
    ];
    for (const [pattern, replacement] of directMap) {
      result = result.replace(pattern, replacement);
    }
    result = result.replace(/([\u0D80-\u0DFF]+)\s+(?:කිරීමක්|කිරීම්)\s+සිදු\s+(?:කරයි|කරනු ලබයි)/gu, "$1 \u0D9A\u0DBB\u0DBA\u0DD2");
    result = result.replace(/([\u0D80-\u0DFF]+)\s+(?:කිරීමක්|කිරීම්)\s+සිදු\s+(?:කෙරේ|කරනු ලැබේ)/gu, "$1 \u0D9A\u0DD9\u0DBB\u0DDA");
    result = result.replace(/([\u0D80-\u0DFF]+)\s+කරනු\s+ලබයි/gu, "$1 \u0D9A\u0DBB\u0DBA\u0DD2");
    return result;
  }
  var CONTEXT_SAFE_DISCOURSE_LEXICON = [
    { phrase: "\u0D8B\u0DAF\u0DCF\u0DC4\u0DBB\u0DAB\u0DBA\u0D9A\u0DCA \u0DBD\u0DD9\u0DC3", academic: ["\u0DB1\u0DD2\u0DAF\u0DC3\u0DD4\u0DB1\u0D9A\u0DCA \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA", "\u0DAF\u0DBB\u0DCA\u0DC1\u0D9A\u0DBA\u0D9A\u0DCA \u0DBD\u0DD9\u0DC3"], general: ["\u0D8B\u0DAF\u0DCF\u0DC4\u0DBB\u0DAB\u0DBA\u0D9A\u0DCA \u0DC0\u0DD2\u0DAF\u0DD2\u0DBA\u0DA7", "\u0DB1\u0DD2\u0DAF\u0DC3\u0DD4\u0DB1\u0D9A\u0DCA \u0DBD\u0DD9\u0DC3"] },
    { phrase: "\u0D8B\u0DAF\u0DCF\u0DC4\u0DBB\u0DAB\u0DBA\u0D9A\u0DCA \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA", academic: ["\u0DB1\u0DD2\u0DAF\u0DC3\u0DD4\u0DB1\u0D9A\u0DCA \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA", "\u0DAF\u0DBB\u0DCA\u0DC1\u0D9A\u0DBA\u0D9A\u0DCA \u0DBD\u0DD9\u0DC3"], general: ["\u0D8B\u0DAF\u0DCF\u0DC4\u0DBB\u0DAB\u0DBA\u0D9A\u0DCA \u0DC0\u0DD2\u0DAF\u0DD2\u0DBA\u0DA7", "\u0DB1\u0DD2\u0DAF\u0DC3\u0DD4\u0DB1\u0D9A\u0DCA \u0DBD\u0DD9\u0DC3"] },
    { phrase: "\u0DB4\u0DC5\u0DB8\u0DD4\u0DC0\u0DD9\u0DB1\u0DCA\u0DB8", academic: ["\u0DB4\u0DCA\u200D\u0DBB\u0DAE\u0DB8\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8", "\u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0DB4\u0DD2\u0DBA\u0DC0\u0DBB\u0D9A\u0DCA \u0DBD\u0DD9\u0DC3"], general: ["\u0DB8\u0DD4\u0DBD\u0DD2\u0DB1\u0DCA\u0DB8", "\u0DB4\u0DC5\u0DB8\u0DD4\u0DC0\u0DD9\u0DB1\u0DCA\u0DB8"] },
    { phrase: "\u0DAF\u0DD9\u0DC0\u0DB1\u0DD4\u0DC0", academic: ["\u0DAF\u0DCA\u0DC0\u0DD2\u0DAD\u0DD3\u0DBA\u0DD2\u0D9A \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA", "\u0D8A\u0DC5\u0D9F \u0D9A\u0DBB\u0DD4\u0DAB \u0DBD\u0DD9\u0DC3"], general: ["\u0D8A\u0DC5\u0D9F\u0DA7", "\u0DAF\u0DD9\u0DC0\u0DB1\u0DD4\u0DC0"] },
    { phrase: "\u0DAD\u0DD9\u0DC0\u0DB1\u0DD4\u0DC0", academic: ["\u0DAD\u0DD8\u0DAD\u0DD3\u0DBA\u0DD2\u0D9A \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA", "\u0DAD\u0DD9\u0DC0\u0DB1 \u0D9A\u0DBB\u0DD4\u0DAB \u0DBD\u0DD9\u0DC3"], general: ["\u0DAD\u0DD4\u0DB1\u0DCA\u0DC0\u0DD9\u0DB1\u0DD4\u0DC0", "\u0DAD\u0DD9\u0DC0\u0DB1\u0DD4\u0DC0"] },
    { phrase: "\u0DB1\u0DD2\u0DAD\u0DBB\u0DB8", academic: ["\u0DB1\u0DD2\u0DBB\u0DB1\u0DCA\u0DAD\u0DBB\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8", "\u0DC3\u0DB1\u0DCA\u0DAD\u0DAD\u0DD2\u0D9A\u0DC0"], general: ["\u0DC4\u0DD0\u0DB8\u0DAD\u0DD2\u0DC3\u0DCA\u0DC3\u0DD9\u0DB8", "\u0DB1\u0DD2\u0DAD\u0DBB\u0DB8"] },
    { phrase: "\u0DB1\u0DD2\u0DBB\u0DAD\u0DD4\u0DBB\u0DD4\u0DC0", academic: ["\u0DB1\u0DD2\u0DBB\u0DB1\u0DCA\u0DAD\u0DBB\u0DBA\u0DD9\u0DB1\u0DCA", "\u0DC3\u0DB1\u0DCA\u0DAD\u0DAD\u0DD2\u0D9A\u0DC0"], general: ["\u0DB1\u0DD2\u0DAD\u0DBB\u0DB8", "\u0DC4\u0DD0\u0DB8\u0DC0\u0DD9\u0DBD\u0DDA\u0DB8"] },
    { phrase: "\u0D9A\u0DBD\u0DCF\u0DAD\u0DD4\u0DBB\u0D9A\u0DD2\u0DB1\u0DCA", academic: ["\u0D9A\u0DBD\u0DCF\u0DAD\u0DD4\u0DBB\u0D9A\u0DD2\u0DB1\u0DCA \u0DC4\u0DDD \u0DC3\u0DD3\u0DB8\u0DD2\u0DAD\u0DC0", "\u0D85\u0DBD\u0DCA\u0DB4 \u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA"], general: ["\u0D89\u0DB3\u0DC4\u0DD2\u0DA7", "\u0D9A\u0DBD\u0DCF\u0DAD\u0DD4\u0DBB\u0D9A\u0DD2\u0DB1\u0DCA"] },
    { phrase: "\u0DB8\u0DD4\u0DC5\u0DD4\u0DB8\u0DB1\u0DD2\u0DB1\u0DCA\u0DB8", academic: ["\u0DC3\u0DB8\u0DCA\u0DB4\u0DD6\u0DBB\u0DCA\u0DAB\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8 \u0DB4\u0DCF\u0DC4\u0DDA", "\u0DC3\u0DB8\u0DC3\u0DCA\u0DAD\u0DBA\u0D9A\u0DCA \u0DBD\u0DD9\u0DC3"], general: ["\u0DC3\u0DB8\u0DCA\u0DB4\u0DD6\u0DBB\u0DCA\u0DAB\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8", "\u0DB8\u0DD4\u0DC5\u0DD4\u0DB8\u0DB1\u0DD2\u0DB1\u0DCA\u0DB8"] },
    { phrase: "\u0DB1\u0DD0\u0DC0\u0DAD\u0DAD\u0DCA", academic: ["\u0DBA\u0DC5\u0DD2\u0DAD\u0DCA \u0DC0\u0DBB\u0D9A\u0DCA", "\u0DB4\u0DD4\u0DB1\u0DBB\u0DCF\u0DC0\u0DBB\u0DCA\u0DAD\u0DB1\u0DBA \u0D9A\u0DBB\u0DB8\u0DD2\u0DB1\u0DCA"], general: ["\u0DB1\u0DD0\u0DC0\u0DAD\u0DAD\u0DCA", "\u0D86\u0DBA\u0DD9\u0DB8\u0DAD\u0DCA"] },
    { phrase: "\u0DB1\u0DD0\u0DC0\u0DAD", academic: ["\u0DBA\u0DC5\u0DD2\u0DAD\u0DCA", "\u0DBA\u0DC5\u0DD2\u0DAD\u0DCA \u0DC0\u0DBB\u0D9A\u0DCA"], general: ["\u0DB1\u0DD0\u0DC0\u0DAD\u0DAD\u0DCA", "\u0D86\u0DBA\u0DD9\u0DB8\u0DAD\u0DCA"] },
    { phrase: "\u0D91\u0D9A\u0DA7", academic: ["\u0D92\u0D9A\u0DCF\u0DB6\u0DAF\u0DCA\u0DB0\u0DC0", "\u0DC3\u0DCF\u0DB8\u0DD6\u0DC4\u0DD2\u0D9A\u0DC0"], general: ["\u0D91\u0D9A\u0DCA\u0D9A\u0DC4\u0DD4 \u0DC0\u0DD9\u0DBD\u0DCF", "\u0D91\u0D9A\u0DA7"] },
    { phrase: "\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DBA\u0DD9\u0DB1\u0DCA", academic: ["\u0DC3\u0DD4\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DD3 \u0DBD\u0DD9\u0DC3", "\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2 \u0D9A\u0DDC\u0DA7"], general: ["\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8", "\u0DC0\u0DD2\u0DC1\u0DDA\u0DC2\u0DBA\u0DD9\u0DB1\u0DCA"] },
    { phrase: "\u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2\u0DC0", academic: ["\u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0DBD\u0DD9\u0DC3\u0DB8", "\u0DB1\u0DD2\u0DBB\u0DC0\u0DD4\u0DBD\u0DCA\u0DC0"], general: ["\u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2\u0DC0\u0DB8", "\u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2\u0DC0"] },
    { phrase: "\u0DC3\u0DD8\u0DA2\u0DD4\u0DC0", academic: ["\u0DC3\u0DD8\u0DA2\u0DD4 \u0DBD\u0DD9\u0DC3", "\u0DB4\u0DCA\u200D\u0DBB\u0DAD\u0DCA\u200D\u0DBA\u0D9A\u0DCA\u0DC2\u0DC0"], general: ["\u0D9A\u0DD9\u0DBD\u0DD2\u0DB1\u0DCA\u0DB8", "\u0DC3\u0DD8\u0DA2\u0DD4\u0DC0"] },
    { phrase: "\u0D9A\u0DCA\u0DC2\u0DAB\u0DD2\u0D9A\u0DC0", academic: ["\u0D9A\u0DCA\u0DC2\u0DAB\u0DD2\u0D9A \u0DBD\u0DD9\u0DC3", "\u0DC0\u0DC4\u0DCF\u0DB8"], general: ["\u0D91\u0DC3\u0DD0\u0DB1\u0DD2\u0DB1\u0DCA", "\u0D89\u0D9A\u0DCA\u0DB8\u0DB1\u0DD2\u0DB1\u0DCA\u0DB8"] },
    { phrase: "\u0DB4\u0DCA\u200D\u0DBB\u0DB8\u0DCF\u0DAB\u0DC0\u0DAD\u0DCA \u0DAD\u0DBB\u0DB8\u0DCA", academic: ["\u0DB4\u0DCA\u200D\u0DBB\u0DC1\u0DC3\u0DCA\u0DAD \u0DB8\u0DA7\u0DCA\u0DA7\u0DB8\u0DD2\u0DB1\u0DCA", "\u0DB4\u0DCA\u200D\u0DBB\u0DB8\u0DCF\u0DAB\u0DC0\u0DAD\u0DCA\u0DC0"], general: ["\u0D87\u0DAD\u0DD2 \u0DAD\u0DBB\u0DB8\u0DCA", "\u0DB4\u0DCA\u200D\u0DBB\u0DB8\u0DCF\u0DAB\u0DC0\u0DAD\u0DCA\u0DC0"] }
  ];
  function applyRegisterLexicon(text, mode, seed) {
    let result = text;
    let counter = seed;
    for (const entry of CONTEXT_SAFE_DISCOURSE_LEXICON) {
      const replacements = mode === "academic" ? entry.academic : entry.general;
      const regex = new RegExp(`(?<=^|\\s|[.,!?;])(${entry.phrase})(?=$|\\s|[.,!?;])`, "gu");
      result = result.replace(regex, () => {
        const chosen = replacements[counter % replacements.length];
        counter++;
        return chosen;
      });
    }
    return result;
  }
  function splitLongSentences(sentences) {
    const result = [];
    for (const s of sentences) {
      const words = extractWords(s);
      if (words.length <= 22) {
        result.push(s);
        continue;
      }
      const clauseRegex = /([\u0D80-\u0DFF]+(?:වන|වූ|පවතින|සිදුවන|දක්වන)\s+අතර),\s+/u;
      const match = s.match(clauseRegex);
      if (match && match.index !== void 0) {
        const splitIndex = match.index + match[1].length;
        let part1 = s.substring(0, splitIndex).trim();
        const part2 = s.substring(match.index + match[0].length).trim();
        part1 = part1.replace(/වන\s+අතර$/u, "\u0DC0\u0DDA").replace(/වූ\s+අතර$/u, "\u0DC0\u0DD2\u0DBA").replace(/පවතින\s+අතර$/u, "\u0DB4\u0DC0\u0DAD\u0DD3").replace(/සිදුවන\s+අතර$/u, "\u0DC3\u0DD2\u0DAF\u0DD4 \u0DC0\u0DDA").replace(/දක්වන\s+අතර$/u, "\u0DAF\u0D9A\u0DCA\u0DC0\u0DBA\u0DD2");
        if (extractWords(part1).length >= 5 && extractWords(part2).length >= 5) {
          result.push(part1);
          result.push(part2);
          continue;
        }
      }
      result.push(s);
    }
    return result;
  }
  function mergeChoppySentences(sentences, mode) {
    if (sentences.length < 2) return sentences;
    const result = [];
    let i = 0;
    while (i < sentences.length) {
      const current = sentences[i];
      const next = sentences[i + 1];
      if (next) {
        const curWords = extractWords(current).length;
        const nextWords = extractWords(next).length;
        if (curWords < 9 && nextWords < 9 && curWords + nextWords <= 16) {
          const connector = mode === "academic" ? "\u0D91\u0DB8\u0DD9\u0DB1\u0DCA\u0DB8" : "\u0D92 \u0DC0\u0D9C\u0DDA\u0DB8";
          result.push(`${current}. ${connector} ${next}`);
          i += 2;
          continue;
        }
      }
      result.push(current);
      i++;
    }
    return result;
  }
  function diversifySentenceEndings(sentences) {
    if (sentences.length < 3) return sentences;
    const result = [...sentences];
    let consecutiveCount = 1;
    let lastEnding = "";
    for (let i = 0; i < result.length; i++) {
      const s = result[i].trim();
      let currentEnding = "";
      if (s.endsWith("\u0D9A\u0DBB\u0DBA\u0DD2")) currentEnding = "\u0D9A\u0DBB\u0DBA\u0DD2";
      else if (s.endsWith("\u0DC0\u0DDA")) currentEnding = "\u0DC0\u0DDA";
      else if (s.endsWith("\u0D87\u0DAD")) currentEnding = "\u0D87\u0DAD";
      else if (s.endsWith("\u0DB4\u0DC0\u0DAD\u0DD3")) currentEnding = "\u0DB4\u0DC0\u0DAD\u0DD3";
      if (currentEnding && currentEnding === lastEnding) {
        consecutiveCount++;
        if (consecutiveCount >= 3) {
          if (currentEnding === "\u0D9A\u0DBB\u0DBA\u0DD2") {
            result[i] = s.replace(/කරයි$/u, "\u0D9A\u0DBB\u0DB1\u0DD4 \u0DBD\u0DD0\u0DB6\u0DDA");
          } else if (currentEnding === "\u0DC0\u0DDA") {
            result[i] = s.replace(/වේ$/u, "\u0DB6\u0DC0 \u0DB4\u0DD9\u0DB1\u0DDA");
          } else if (currentEnding === "\u0D87\u0DAD") {
            result[i] = s.replace(/ඇත$/u, "\u0DAD\u0DD2\u0DB6\u0DDA");
          } else if (currentEnding === "\u0DB4\u0DC0\u0DAD\u0DD3") {
            result[i] = s.replace(/පවතී$/u, "\u0DAF\u0DD0\u0D9A\u0D9C\u0DAD \u0DC4\u0DD0\u0D9A\u0DD2\u0DBA");
          }
          consecutiveCount = 1;
        }
      } else {
        consecutiveCount = 1;
        lastEnding = currentEnding;
      }
    }
    return result;
  }
  function restructureRhythm(text, mode) {
    const rawSentences = extractSentences(text);
    if (rawSentences.length === 0) return text;
    const split = splitLongSentences(rawSentences);
    const merged = mergeChoppySentences(split, mode);
    const diversified = diversifySentenceEndings(merged);
    return diversified.map((s) => s.trim().replace(/\.+$/, "")).join(". ") + ".";
  }
  var DISCOURSE_AND_CALQUE_TOKENS = /* @__PURE__ */ new Set([
    "\u0DC4\u0DCF",
    "\u0DC3\u0DC4",
    "\u0DAF",
    "\u0DC4\u0DDD",
    "\u0DB1\u0DB8\u0DCA",
    "\u0DB1\u0DB8\u0DD4\u0DAD\u0DCA",
    "\u0D91\u0DC4\u0DD9\u0DAD\u0DCA",
    "\u0DB8\u0DD9\u0DB1\u0DCA\u0DB8",
    "\u0DAD\u0DC0\u0DAF",
    "\u0D91\u0DB8\u0DD9\u0DB1\u0DCA\u0DB8",
    "\u0DB8\u0DD9\u0DC4\u0DD2",
    "\u0D91\u0DC4\u0DD2",
    "\u0DB8\u0DDA",
    "\u0D92",
    "\u0DB8\u0DD9\u0DB8",
    "\u0D91\u0DB8",
    "\u0DC0\u0DD0\u0DB1\u0DD2",
    "\u0DBD\u0DD9\u0DC3",
    "\u0DC0\u0DC1\u0DBA\u0DD9\u0DB1\u0DCA",
    "\u0DAD\u0DD4\u0DC5",
    "\u0DB8\u0DAD",
    "\u0DC3\u0DB3\u0DC4\u0DCF",
    "\u0D9C\u0DD0\u0DB1",
    "\u0DB4\u0DD2\u0DC5\u0DD2\u0DB6\u0DB3",
    "\u0DB4\u0DD2\u0DC5\u0DD2\u0DB6\u0DB3\u0DC0",
    "\u0DC0\u0DD2\u0DC3\u0DD2\u0DB1\u0DCA",
    "\u0DB8\u0D9F\u0DD2\u0DB1\u0DCA",
    "\u0D85\u0DAD\u0DBB",
    // Verbal nouns & de-nominalized auxiliaries
    "\u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0D9A\u0DCA",
    "\u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DCA",
    "\u0D9A\u0DD2\u0DBB\u0DD3\u0DB8",
    "\u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DA7",
    "\u0D9A\u0DBB\u0DB1\u0DD4",
    "\u0DBD\u0DB6\u0DBA\u0DD2",
    "\u0DBD\u0DD0\u0DB6\u0DDA",
    "\u0DC3\u0DD2\u0DAF\u0DD4",
    "\u0D9A\u0DBB\u0DBA\u0DD2",
    "\u0D9A\u0DD9\u0DBB\u0DDA",
    "\u0DAF\u0DD3\u0DB8\u0D9A\u0DCA",
    "\u0DAF\u0DD3\u0DB8\u0DCA",
    "\u0DAF\u0DD3\u0DB8",
    "\u0DAF\u0DD3\u0DB8\u0DA7",
    "\u0DAF\u0DD9\u0DBA\u0DD2",
    "\u0DBD\u0DB6\u0DCF",
    "\u0D9C\u0DD0\u0DB1\u0DD3\u0DB8\u0D9A\u0DCA",
    "\u0D9C\u0DD0\u0DB1\u0DD3\u0DB8\u0DCA",
    "\u0D9C\u0DD0\u0DB1\u0DD3\u0DB8",
    "\u0D9C\u0DD0\u0DB1\u0DD3\u0DB8\u0DA7",
    "\u0D9C\u0DB1\u0DD3",
    "\u0DBD\u0DD0\u0DB6\u0DD3\u0DB8\u0D9A\u0DCA",
    "\u0DBD\u0DD0\u0DB6\u0DD3\u0DB8\u0DCA",
    "\u0DBD\u0DD0\u0DB6\u0DD3\u0DB8",
    "\u0DBD\u0DD0\u0DB6\u0DD3\u0DB8\u0DA7",
    // Common translationese predicates & idioms
    "\u0DC0\u0DD0\u0DAF\u0D9C\u0DAD\u0DCA",
    "\u0D9A\u0DCF\u0DBB\u0DCA\u0DBA\u0DB7\u0DCF\u0DBB\u0DBA\u0D9A\u0DCA",
    "\u0D89\u0DA7\u0DD4",
    "\u0DB4\u0DD2\u0DA7\u0DD4\u0DC0\u0DC4\u0DBD\u0D9A\u0DCA",
    "\u0DB8\u0DD9\u0DC4\u0DD9\u0DC0\u0DBB\u0D9A\u0DCA",
    "\u0DB8\u0DD9\u0DC4\u0DD9\u0DBA\u0D9A\u0DCA",
    "\u0DB8\u0DD3\u0DA7",
    "\u0D85\u0DB8\u0DAD\u0DBB\u0DC0",
    "\u0DC3\u0DB3\u0DC4\u0DB1\u0DCA",
    "\u0DC4\u0DD0\u0D9A\u0DD2\u0DBA",
    "\u0DC4\u0DD0\u0D9A",
    "\u0DC4\u0DB3\u0DD4\u0DB1\u0DCF\u0D9C\u0DAD",
    "\u0DB4\u0DAD\u0DCA",
    "\u0D87\u0DAD",
    "\u0DC0\u0DB1\u0DCA\u0DB1\u0DDA",
    "\u0DB4\u0DC0\u0DAD\u0DD3",
    "\u0DB4\u0DD9\u0DB1\u0DDA",
    "\u0DB4\u0DD9\u0DB1\u0DD3",
    "\u0DBA\u0DBA\u0DD2",
    "\u0DAD\u0DD2\u0DB6\u0DDA",
    "\u0DC0\u0DD3",
    "\u0DC3\u0DB8\u0DC3\u0DCA\u0DAD\u0DBA\u0D9A\u0DCA",
    "\u0D85\u0DC0\u0DC3\u0DCF\u0DB1",
    "\u0D85\u0DC0\u0DC3\u0DB1\u0DCA",
    "\u0DAF\u0DD0\u0D9A\u0D9C\u0DAD",
    "\u0DC0\u0DD2\u0DAF\u0DC4\u0DCF",
    "\u0DAF\u0DD0\u0D9A\u0DCA\u0DC0\u0DD2\u0DBA",
    "\u0D85\u0DB1\u0DCF\u0DC0\u0DBB\u0DAB\u0DBA",
    "\u0DB1\u0DD2\u0DBB\u0DD3\u0D9A\u0DCA\u0DC2\u0DAB\u0DBA",
    "\u0DC3\u0DCF\u0DB0\u0D9A\u0DBA",
    "\u0D9A\u0DBB\u0DD4\u0DAB",
    "\u0DB8\u0DD6\u0DBD\u0DD2\u0D9A",
    "\u0DB4\u0DCA\u200D\u0DBB\u0DB0\u0DCF\u0DB1"
  ]);
  function verifySemanticIntegrity(originalText, candidateText) {
    const violations = [];
    const normOriginal = originalText.normalize("NFC");
    const normCandidate = candidateText.normalize("NFC");
    const parenCitationsOrig = normOriginal.match(/\((?:[^()]*\d{4}[^()]*)\)/g) || [];
    for (const cite of parenCitationsOrig) {
      if (!normCandidate.includes(cite)) {
        violations.push(`Missing citation: ${cite}`);
      }
    }
    const bracketCitationsOrig = normOriginal.match(/\[\d+(?:[\s,\-–—]\d+)*\]/g) || [];
    for (const cite of bracketCitationsOrig) {
      if (!normCandidate.includes(cite)) {
        violations.push(`Missing bracketed citation: ${cite}`);
      }
    }
    const englishWordsOrig = normOriginal.match(/\b[A-Za-z]{2,}\b/g) || [];
    for (const word of englishWordsOrig) {
      if (!normCandidate.includes(word)) {
        violations.push(`Missing English terminology/name: ${word}`);
      }
    }
    const numbersOrig = normOriginal.match(/\b\d+(?:,\d{3})*(?:\.\d+)?%?\b/g) || [];
    for (const num of numbersOrig) {
      if (!normCandidate.includes(num)) {
        violations.push(`Missing numerical value or statistic: ${num}`);
      }
    }
    const origWords = extractWords(normOriginal);
    const candWords = extractWords(normCandidate);
    const origNegations = origWords.filter(isNegationWord);
    const candNegations = candWords.filter(isNegationWord);
    if (origNegations.length !== candNegations.length) {
      violations.push(
        `Negation count mismatch: original has ${origNegations.length} negations (${origNegations.join(", ")}), candidate has ${candNegations.length} (${candNegations.join(", ")})`
      );
    }
    for (const neg of NEGATION_MARKERS) {
      const origCount = origWords.filter((w) => w === neg).length;
      const candCount = candWords.filter((w) => w === neg).length;
      if (origCount > 0 && candCount !== origCount) {
        violations.push(`Negation token "${neg}" count changed (original: ${origCount}, candidate: ${candCount})`);
      } else if (origCount === 0 && candCount > 0) {
        violations.push(`Negation token "${neg}" was introduced into candidate`);
      }
    }
    for (const root of PROTECTED_DOMAIN_ROOTS) {
      const origHasRoot = origWords.some((w) => w === root || w.startsWith(root));
      if (origHasRoot) {
        const origRootCount = origWords.filter((w) => w === root || w.startsWith(root)).length;
        const candRootCount = candWords.filter((w) => w === root || w.startsWith(root)).length;
        if (candRootCount < origRootCount) {
          violations.push(
            `Protected domain root "${root}" was reduced or altered (original: ${origRootCount}, candidate: ${candRootCount})`
          );
        }
      }
    }
    const origContentWords = origWords.filter(
      (w) => w.length >= 3 && !DISCOURSE_AND_CALQUE_TOKENS.has(w) && !isNegationWord(w)
    );
    let retainedContentWords = 0;
    for (const w of origContentWords) {
      if (candWords.some((cw) => cw === w || cw.startsWith(w) || w.startsWith(cw))) {
        retainedContentWords++;
      }
    }
    const fidelityScore = origContentWords.length > 0 ? retainedContentWords / origContentWords.length : 1;
    if (fidelityScore < 0.98) {
      violations.push(`Content word fidelity score too low: ${(fidelityScore * 100).toFixed(1)}% < 98%`);
    }
    const isSafe = violations.length === 0 && fidelityScore >= 0.98;
    return {
      isSafe,
      fidelityScore,
      violations
    };
  }
  function executeSinglePass(text, mode, seed, tokenMap) {
    let transformed = deCalqueTranslationese(text, mode, seed);
    transformed = deNominalizeVerbs(transformed);
    transformed = applyRegisterLexicon(transformed, mode, seed);
    transformed = restructureRhythm(transformed, mode);
    transformed = transformed.replace(/\s{2,}/g, " ").replace(/\s+([.,!?;])/gu, "$1").replace(/\.{2,}/g, ".").replace(/,\s*,/g, ",").trim();
    const restored = unlockImmutableTokens(transformed, tokenMap);
    return restored;
  }
  async function humanizeSinhalaText(text, mode = "academic") {
    const normalized = (text || "").normalize("NFC").trim();
    const originalMetrics = analyzeSinhalaText(normalized);
    if (!normalized) {
      return {
        originalMetrics,
        humanizedText: "",
        finalMetrics: originalMetrics,
        iterationsUsed: 0,
        semanticIntegrity: { isSafe: true, fidelityScore: 1, violations: [] }
      };
    }
    const { lockedText, tokenMap } = lockImmutableTokens(normalized);
    let bestText = normalized;
    let bestMetrics = originalMetrics;
    let bestIteration = 0;
    let bestIntegrity = { isSafe: true, fidelityScore: 1, violations: [] };
    for (let pass = 1; pass <= 3; pass++) {
      const candidateText = executeSinglePass(lockedText, mode, pass * 7, tokenMap);
      const integrity = verifySemanticIntegrity(normalized, candidateText);
      if (!integrity.isSafe || integrity.fidelityScore < 0.98) {
        continue;
      }
      const candidateMetrics = analyzeSinhalaText(candidateText);
      if (bestIteration === 0 || candidateMetrics.overallRisk < bestMetrics.overallRisk) {
        bestText = candidateText;
        bestMetrics = candidateMetrics;
        bestIteration = pass;
        bestIntegrity = integrity;
      }
      if (candidateMetrics.overallRisk <= 20) {
        break;
      }
    }
    if (bestIteration === 0) {
      bestText = normalized;
      bestMetrics = originalMetrics;
    }
    return {
      originalMetrics,
      humanizedText: bestText,
      finalMetrics: bestMetrics,
      iterationsUsed: bestIteration,
      semanticIntegrity: bestIntegrity
    };
  }

  // src/browserEntry.ts
  var enToSnMap = null;
  var snToEnMap = null;
  var dictLoadPromise = null;
  var SINHALA_SUFFIXES = [
    "\u0DBA\u0DD9\u0DB1\u0DCA",
    "\u0DBA\u0DDA",
    "\u0DBA\u0DA7",
    "\u0D9C\u0DD9\u0DB1\u0DCA",
    "\u0DD9\u0DC4\u0DD2",
    "\u0DBA\u0DB1\u0DCA",
    "\u0DD9\u0DB1\u0DCA",
    "\u0D9C\u0DDA",
    "\u0DC4\u0DD2",
    "\u0D9A\u0DCA",
    "\u0DA7",
    "\u0DDA",
    "\u0DC0",
    "\u0DAF",
    "\u0DAD\u0DCA",
    "\u0DBD"
  ];
  function setDictionaryData(enData, snData) {
    const enMap = /* @__PURE__ */ new Map();
    for (const item of enData) {
      if (item.word && Array.isArray(item.definitions)) {
        enMap.set(item.word.toLowerCase().trim(), item.definitions);
      }
    }
    const snMap = /* @__PURE__ */ new Map();
    for (const item of snData) {
      if (item.word && Array.isArray(item.definitions)) {
        snMap.set(item.word.normalize("NFC").trim(), item.definitions);
      }
    }
    enToSnMap = enMap;
    snToEnMap = snMap;
  }
  async function loadBrowserDictionary(customBasePath) {
    if (enToSnMap && snToEnMap) return true;
    if (dictLoadPromise) return dictLoadPromise;
    dictLoadPromise = (async () => {
      try {
        const customPath = customBasePath || typeof window !== "undefined" && window.__MADURA_DATA_PATH__ || "";
        const baseCandidates = customPath ? [customPath] : [
          typeof window !== "undefined" && window.HUMANIZER_STATIC_BASE ? `${window.HUMANIZER_STATIC_BASE}/data` : null,
          "/static/humanizer/data",
          "/password-generator/static/humanizer/data",
          "./data",
          "data",
          "../data"
        ].filter(Boolean);
        let enData = null;
        let snData = null;
        for (const base of baseCandidates) {
          try {
            const [enRes, snRes] = await Promise.all([
              fetch(`${base}/en2sn.json`),
              fetch(`${base}/sn2en.json`)
            ]);
            if (enRes.ok && snRes.ok) {
              enData = await enRes.json();
              snData = await snRes.json();
              break;
            }
          } catch {
          }
        }
        if (!enData || !snData) {
          console.warn("[HelaOfflineEngine] Could not locate dictionary JSON files via fetch.");
          dictLoadPromise = null;
          return false;
        }
        setDictionaryData(enData, snData);
        console.log(
          `[HelaOfflineEngine] Dictionary ready in memory: ${enToSnMap?.size} English, ${snToEnMap?.size} Sinhala entries.`
        );
        return true;
      } catch (err) {
        console.error("[HelaOfflineEngine] Failed to load offline dictionary in browser:", err);
        dictLoadPromise = null;
        return false;
      }
    })();
    return dictLoadPromise;
  }
  function findSinhalaStem(word) {
    if (!snToEnMap) return null;
    const normalized = word.normalize("NFC").trim();
    if (snToEnMap.has(normalized)) {
      return { stem: normalized, suffix: "", defs: snToEnMap.get(normalized) };
    }
    for (const suffix of SINHALA_SUFFIXES) {
      if (normalized.endsWith(suffix) && normalized.length > suffix.length + 1) {
        const stem = normalized.slice(0, -suffix.length);
        if (snToEnMap.has(stem)) {
          return { stem, suffix, defs: snToEnMap.get(stem) };
        }
        const stemWithYa = stem + "\u0DBA";
        if (snToEnMap.has(stemWithYa)) {
          return { stem: stemWithYa, suffix, defs: snToEnMap.get(stemWithYa) };
        }
      }
    }
    return null;
  }
  function getMaduraSynonymsForSinhala(word) {
    if (!enToSnMap || !snToEnMap) return [];
    const stemResult = findSinhalaStem(word);
    if (!stemResult) return [];
    const { stem, defs } = stemResult;
    const synonyms = /* @__PURE__ */ new Set();
    for (const enMeaning of defs) {
      const cleanEn = enMeaning.toLowerCase().trim();
      const snList = enToSnMap.get(cleanEn);
      if (snList) {
        for (const s of snList) {
          const normS = s.normalize("NFC").trim();
          if (normS !== word && normS !== stem && normS.length > 1) {
            synonyms.add(normS);
          }
        }
      }
    }
    return Array.from(synonyms).slice(0, 15);
  }
  async function lookupMaduraWord(rawQuery) {
    const query = (rawQuery || "").normalize("NFC").trim();
    if (!query) {
      return {
        word: "",
        language: "en",
        meanings: [],
        synonyms: [],
        source: "madura-offline-browser"
      };
    }
    await loadBrowserDictionary();
    const isEn = /^[A-Za-z0-9_\-\s.]+$/.test(query);
    if (isEn) {
      const lower = query.toLowerCase();
      let meanings2 = [];
      if (enToSnMap) {
        meanings2 = enToSnMap.get(lower) || [];
        if (meanings2.length === 0) {
          if (lower.endsWith("s")) meanings2 = enToSnMap.get(lower.slice(0, -1)) || [];
          else if (lower.endsWith("ing")) meanings2 = enToSnMap.get(lower.slice(0, -3)) || [];
          else if (lower.endsWith("ed")) meanings2 = enToSnMap.get(lower.slice(0, -2)) || [];
        }
      }
      return {
        word: query,
        language: "en",
        meanings: meanings2.slice(0, 10),
        synonyms: meanings2.slice(0, 12),
        source: "madura-offline-browser"
      };
    }
    const stemResult = findSinhalaStem(query);
    const meanings = stemResult ? stemResult.defs : [];
    const synonyms = getMaduraSynonymsForSinhala(query);
    return {
      word: query,
      language: "si",
      stem: stemResult?.stem,
      suffix: stemResult?.suffix,
      meanings: meanings.slice(0, 10),
      synonyms,
      source: "madura-offline-browser"
    };
  }
  var HelaOfflineEngine = {
    version: "2.0-static-client",
    isReady: true,
    mode: "offline-browser",
    humanizeSinhalaText,
    analyzeText: analyzeSinhalaText,
    analyzeSinhalaText,
    lookupMaduraWord,
    loadBrowserDictionary,
    setDictionaryData
  };
  if (typeof window !== "undefined") {
    window.HelaOfflineEngine = HelaOfflineEngine;
  }
  var browserEntry_default = HelaOfflineEngine;
  return __toCommonJS(browserEntry_exports);
})();

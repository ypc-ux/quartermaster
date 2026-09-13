// Humanizer — rule-based AI writing pattern detection + cleanup.
// 37 patterns from Wikipedia's "Signs of AI writing" + StoryScope.
// Returns cleaned text + pattern count. Zero API keys.

const STOCK_WORDS = new Set([
  "pivotal", "testament", "vital", "significant", "crucial", "underscores",
  "highlights", "symbolizing", "evolving", "landscape", "multifaceted", "robust",
  "holistic", "synergy", "paradigm", "innovative", "cutting-edge", "intricate",
  "meticulous", "comprehensive", "spearhead", "foster", "elevate", "harness",
  "delve", "tapestry", "leverage", "underscore", "alchemy", "navigate",
  "catalyze", "pioneering", "groundbreaking", "transformative", "resonate",
]);

const INFLATED_PHRASES = [
  "marks a pivotal", "is a testament", "serves as a", "stands as a reminder",
  "key turning point", "deeply rooted", "focal point", "indelible mark",
  "reflects broader", "setting the stage", "a testament to", "underscores the",
  "highlights the importance", "representing a shift", "marking a new era",
  "shape the future of", "in the realm of", "on a global scale",
];

const CHATBOT_PHRASES = [
  "as an ai", "i'm here to help", "let me know", "i'd be happy to",
  "feel free to", "don't hesitate to", "i hope this helps",
  "here's what i found", "here's a breakdown", "sure,",
  "absolutely,", "great question", "excellent question",
];

const FILLER_PHRASES = [
  "it's important to note that", "it is important to note that",
  "it's worth mentioning that", "it should be noted that",
  "that being said,", "with that said,", "moving forward,",
];

export interface HumanizeResult {
  text: string;
  original: string;
  patterns_found: number;
  fixes: Array<{ pattern: string; line: number; issue: string }>;
}
export function humanize(text: string): HumanizeResult {
  const original = text;
  const fixes: HumanizeResult["fixes"] = [];
  const lines = text.split("\n");

  // Stock AI words
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    for (const w of STOCK_WORDS) {
      if (lower.includes(w)) fixes.push({ pattern: "stock-word", line: i + 1, issue: `"${w}" is an AI stock word` });
    }
  }

  // Inflated phrases
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    for (const p of INFLATED_PHRASES) {
      if (lower.includes(p)) fixes.push({ pattern: "inflated-phrase", line: i + 1, issue: `"${p}" inflated claim` });
    }
  }

  // Chatbot artifacts
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    for (const p of CHATBOT_PHRASES) {
      if (lower.includes(p)) fixes.push({ pattern: "chatbot-artifact", line: i + 1, issue: `"${p}" chatbot artifact` });
    }
  }

  // Filler phrases
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    for (const p of FILLER_PHRASES) {
      if (lower.includes(p)) fixes.push({ pattern: "filler", line: i + 1, issue: `"${p}" filler` });
    }
  }

  // Em-dash overuse (>2 per line)
  for (let i = 0; i < lines.length; i++) {
    const d = (lines[i].match(/ — /g) || []).length;
    if (d > 2) fixes.push({ pattern: "em-dash-overuse", line: i + 1, issue: `${d} em-dashes on one line` });
  }

  // "-ing" sentence openings
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (/^[A-Z][a-z]+ing\b/.test(t)) fixes.push({ pattern: "ing-opening", line: i + 1, issue: `"${t.split(/\s+/)[0]}" weak -ing opening` });
  }

  // Sentence length variety
  const sents = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  const lens = sents.map(s => s.split(/\s+/).length);
  if (lens.length >= 3) {
    const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
    const outliers = lens.filter(s => Math.abs(s - avg) / avg > 0.6).length;
    if (outliers < lens.length * 0.2) fixes.push({ pattern: "even-cadence", line: 0, issue: "Sentences suspiciously uniform in length" });
  }

  // Clean worst offenders
  let cleaned = text;
  cleaned = cleaned.replace(/\bit(?:'s| is) (?:important|worth) to note that\b/gi, "");
  cleaned = cleaned.replace(/\bit should be noted that\b/gi, "");
  cleaned = cleaned.replace(/\bas an ai\b[^.!?]*[.!?]/gi, "");
  cleaned = cleaned.replace(/\blet me know if\b[^.!?]*[.!?]/gi, "");
  cleaned = cleaned.replace(/\bdon'?t hesitate to\b[^.!?]*[.!?]/gi, "");
  cleaned = cleaned.replace(/\bi'?m here to help\b[^.!?]*[.!?]/gi, "");
  cleaned = cleaned.replace(/  +/g, " ").replace(/\n \n/g, "\n\n");

  return { text: cleaned.trim(), original, patterns_found: fixes.length, fixes };
}

// Apply humanizer recursively to any data structure
export function humanizeResult(data: any): { data: any; humanizeReport: { patterns_found: number; fixes: Array<{ pattern: string; line: number; issue: string }> } } {
  if (typeof data === "string") {
    const r = humanize(data);
    return { data: r.text, humanizeReport: { patterns_found: r.patterns_found, fixes: r.fixes } };
  }
  if (Array.isArray(data)) {
    let total = 0;
    const allFixes: any[] = [];
    const mapped = data.map(item => {
      const r = humanizeResult(item);
      total += r.humanizeReport.patterns_found;
      allFixes.push(...r.humanizeReport.fixes);
      return r.data;
    });
    return { data: mapped, humanizeReport: { patterns_found: total, fixes: allFixes } };
  }
  if (typeof data === "object" && data !== null) {
    let total = 0;
    const allFixes: any[] = [];
    const mapped: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      const r = humanizeResult(val);
      mapped[key] = r.data;
      total += r.humanizeReport.patterns_found;
      allFixes.push(...r.humanizeReport.fixes);
    }
    return { data: mapped, humanizeReport: { patterns_found: total, fixes: allFixes } };
  }
  return { data, humanizeReport: { patterns_found: 0, fixes: [] } };
}
// Eval engine — run agents against test cases, score outputs.
// Works offline (client-side). Supabase slot ready for persistence.

import { humanize } from "./humanizer";

export interface TestCase {
  id: string;
  name: string;
  agent: string;
  command: string;
  expected_signals: string[];  // keywords that must appear
  expected_structure?: string[]; // keys/sections that must appear in JSON
  max_humanize_patterns?: number; // fail if humanizer finds more
}

export interface EvalResult {
  test_id: string;
  test_name: string;
  agent: string;
  command: string;
  passed: boolean;
  score: number; // 0-100
  breakdown: {
    humanize: number;
    structure: number;
    keywords: number;
    latency: number;
  };
  details: string[];
  timestamp: string;
}

// Default test suite
export const DEFAULT_SUITE: TestCase[] = [
  { id: "t1", name: "Hooks generation", agent: "hooks", command: "10 hooks for agency OS", expected_signals: ["hook", "agency"], max_humanize_patterns: 5 },
  { id: "t2", name: "Launch plan", agent: "launch", command: "launch Quartermaster", expected_signals: ["plan", "teaser", "announcement"], max_humanize_patterns: 3 },
  { id: "t3", name: "Research scan", agent: "research", command: "research AI agencies", expected_signals: ["competitor", "finding"], max_humanize_patterns: 5 },
  { id: "t4", name: "Commander diagnostic", agent: "commander_frame", command: "diagnose my marketing", expected_signals: ["pain", "value"], max_humanize_patterns: 5 },
  { id: "t5", name: "Bio optimization", agent: "bio", command: "optimize my bio", expected_signals: ["bio", "twitter"], max_humanize_patterns: 5 },
  { id: "t6", name: "Repurpose content", agent: "repurpose", command: "repurpose I built 19 agents", expected_signals: ["source_idea", "pieces"], max_humanize_patterns: 5 },
  { id: "t7", name: "Finance tracking", agent: "finance", command: "finance", expected_signals: ["revenue", "expenses"], max_humanize_patterns: 5 },
  { id: "t8", name: "Community engagement", agent: "community", command: "community", expected_signals: ["platform", "members"], max_humanize_patterns: 5 },
  { id: "t9", name: "Grid preview", agent: "grid", command: "grid preview", expected_signals: ["posts", "theme"], max_humanize_patterns: 5 },
  { id: "t10", name: "Outreach lever", agent: "outreach", command: "outreach for scaling operations", expected_signals: ["lever", "score"], max_humanize_patterns: 5 },
];

function scoreOutput(output: string, test: TestCase): EvalResult["breakdown"] & { details: string[] } {
  const details: string[] = [];

  // Humanizer score (lower patterns = better)
  const h = humanize(output);
  const humanizeScore = Math.max(0, 100 - h.patterns_found * 10);
  if (h.patterns_found > 0) details.push(`Humanizer: ${h.patterns_found} AI patterns found`);

  // Structure score (JSON keys present)
  let structureScore = 100;
  if (test.expected_structure) {
    try {
      const parsed = JSON.parse(output);
      const missing = test.expected_structure.filter(k => !(k in parsed));
      structureScore = Math.max(0, 100 - missing.length * 20);
      if (missing.length > 0) details.push(`Missing keys: ${missing.join(", ")}`);
    } catch {
      structureScore = 50; // not JSON, partial credit
    }
  }

  // Keyword score
  const lower = output.toLowerCase();
  const found = test.expected_signals.filter(s => lower.includes(s.toLowerCase()));
  const keywordScore = Math.round((found.length / test.expected_signals.length) * 100);
  if (found.length < test.expected_signals.length) {
    details.push(`Keywords: ${found.length}/${test.expected_signals.length} found`);
  }

  // Latency bonus (faster = better, but less weight)
  const latencyScore = 100; // neutral by default

  return { humanize: humanizeScore, structure: structureScore, keywords: keywordScore, latency: latencyScore, details };
}

export async function runEval(
  agent: string,
  command: string,
  test: TestCase,
  executeFn: (cmd: string) => Promise<{ data: any; humanize_report: any; latency_ms: number }>
): Promise<EvalResult> {
  const start = Date.now();
  try {
    const result = await executeFn(command);
    const output = typeof result.data === "string" ? result.data : JSON.stringify(result.data);
    const scores = scoreOutput(output, test);

    const avgScore = Math.round(
      (scores.humanize * 0.3 + scores.structure * 0.3 + scores.keywords * 0.4)
    );

    const passed = avgScore >= 60 &&
      (test.max_humanize_patterns == null || (result.humanize_report?.patterns_found || 0) <= test.max_humanize_patterns);

    return {
      test_id: test.id,
      test_name: test.name,
      agent,
      command,
      passed,
      score: avgScore,
      breakdown: scores,
      details: scores.details,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      test_id: test.id,
      test_name: test.name,
      agent,
      command,
      passed: false,
      score: 0,
      breakdown: { humanize: 0, structure: 0, keywords: 0, latency: 0 },
      details: [`Error: ${err.message}`],
      timestamp: new Date().toISOString(),
    };
  }
}

export async function runSuite(
  tests: TestCase[],
  executeFn: (cmd: string) => Promise<{ data: any; humanize_report: any; latency_ms: number }>
): Promise<{ results: EvalResult[]; summary: { total: number; passed: number; failed: number; avg_score: number } }> {
  const results: EvalResult[] = [];
  for (const test of tests) {
    const r = await runEval(test.agent, test.command, test, executeFn);
    results.push(r);
  }
  const passed = results.filter(r => r.passed).length;
  const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / (results.length || 1));
  return {
    results,
    summary: { total: results.length, passed, failed: results.length - passed, avg_score: avgScore },
  };
}
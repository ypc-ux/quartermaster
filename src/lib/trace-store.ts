// Trace store — localStorage-based agent execution logging.
// Works offline. Supabase slot ready for when keys are added.
import { generateDemoTraces } from "./demo-traces";

export interface Trace {
  id: string;
  timestamp: string;
  agent: string;
  command: string;
  input: string;
  output: string;
  humanize_report: { patterns_found: number; fixes: string[] };
  latency_ms: number;
  score?: number;
  tags?: string[];
}

const STORAGE_KEY = "qb_traces";
const SEED_KEY = "qb_demo_seeded";
const MAX_TRACES = 500;

function getStore(): Trace[] {
  if (typeof window === "undefined") return [];
  try {
    let traces: Trace[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    // Seed demo traces once when store is empty (fresh judge browser)
    if (traces.length === 0 && !localStorage.getItem(SEED_KEY)) {
      traces = generateDemoTraces();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(traces));
      localStorage.setItem(SEED_KEY, "1");
    }
    return traces;
  } catch { return []; }
}

function saveStore(traces: Trace[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(traces.slice(-MAX_TRACES)));
}

export function logTrace(trace: Omit<Trace, "id" | "timestamp">): Trace {
  const entry: Trace = {
    ...trace,
    id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  const store = getStore();
  store.push(entry);
  saveStore(store);
  return entry;
}

export function getTraces(filter?: { agent?: string; since?: string; limit?: number }): Trace[] {
  let traces = getStore();
  if (filter?.agent) traces = traces.filter(t => t.agent === filter.agent);
  if (filter?.since) traces = traces.filter(t => t.timestamp >= filter.since!);
  traces.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  if (filter?.limit) traces = traces.slice(0, filter.limit);
  return traces;
}

export function getTraceStats() {
  const traces = getStore();
  const agents = [...new Set(traces.map(t => t.agent))];
  const avgScore = traces.filter(t => t.score != null).reduce((s, t) => s + (t.score || 0), 0) / (traces.filter(t => t.score != null).length || 1);
  const avgLatency = traces.reduce((s, t) => s + t.latency_ms, 0) / (traces.length || 1);
  const avgHumanize = traces.reduce((s, t) => s + t.humanize_report.patterns_found, 0) / (traces.length || 1);
  return {
    total: traces.length,
    agents_used: agents.length,
    avg_score: Math.round(avgScore * 10) / 10,
    avg_latency_ms: Math.round(avgLatency),
    avg_humanize_patterns: Math.round(avgHumanize * 10) / 10,
    last_trace: traces[traces.length - 1]?.timestamp || null,
  };
}

export function clearTraces() {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
}
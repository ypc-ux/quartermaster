"use client";
import { useState, useEffect } from "react";
import { DEFAULT_SUITE, runEval, type EvalResult } from "@/lib/eval-engine";

interface EvalRun {
  id: string;
  timestamp: string;
  results: EvalResult[];
  summary: { total: number; passed: number; failed: number; avg_score: number };
}

const STORAGE_KEY = "eval_history";
const MAX_HISTORY = 10;

function loadHistory(): EvalRun[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveRun(run: EvalRun) {
  const h = loadHistory();
  h.push(run);
  if (h.length > MAX_HISTORY) h.splice(0, h.length - MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
}
const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#050810", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" },
  nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(5,8,16,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,229,255,0.1)", padding: "0.8rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "0.75rem" },
  badge: { fontSize: "0.7rem", fontFamily: "monospace", padding: "0.25rem 0.75rem", borderRadius: 100, background: "rgba(0,229,255,0.1)", color: "#00e5ff", border: "1px solid rgba(0,229,255,0.2)" },
  btn: { fontSize: "0.85rem", fontWeight: 700, background: "#00e5ff", color: "#050810", border: "none", borderRadius: 10, padding: "0.5rem 1.25rem", cursor: "pointer", transition: "all 0.15s" },
  btnAlt: { fontSize: "0.8rem", fontWeight: 600, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "0.5rem 1rem", cursor: "pointer", transition: "all 0.15s" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  statCard: { background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 12, padding: "1.25rem", textAlign: "center" as const },
  statLabel: { fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "0.5rem" },
  statValue: { fontSize: "2rem", fontWeight: 800 },
  section: { background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap" as const, gap: "0.5rem" },
  sectionTitle: { fontSize: "0.8rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.1em", margin: 0 },
  sectionMeta: { fontSize: "0.7rem", color: "#64748b" },
  empty: { textAlign: "center" as const, padding: "3rem 1rem" },
  filterBtn: { fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: 100, background: "transparent", border: "1px solid rgba(100,116,139,0.2)", color: "#64748b", cursor: "pointer", transition: "all 0.15s" },
  filterBtnActive: { background: "rgba(0,229,255,0.15)", border: "1px solid rgba(0,229,255,0.3)", color: "#00e5ff" },
  resultRow: { display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 1rem", borderRadius: 10, transition: "background 0.1s" },
  statusDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  testName: { fontSize: "0.82rem", fontWeight: 600, color: "#e2e8f0", width: 140, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  scoreBar: { flex: 1, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" },
  scorePct: { fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 700, width: 40, textAlign: "right" as const },
  detailTag: { fontSize: "0.7rem", color: "#64748b", width: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  historyRow: { display: "flex", alignItems: "center", gap: "1rem", padding: "0.5rem 0.75rem", borderRadius: 8, background: "rgba(0,229,255,0.02)", border: "1px solid rgba(0,229,255,0.05)" },
};



export default function EvalPage() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<EvalRun | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [history, setHistory] = useState<EvalRun[]>([]);
  const [rerunning, setRerunning] = useState(false);

  useEffect(() => { setHistory(loadHistory()); }, []);

  async function executeFn(cmd: string): Promise<{ data: any; humanize_report: any; latency_ms: number }> {
    const res = await fetch("/api/command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command: cmd }) });
    const data = await res.json();
    return { data: data.data, humanize_report: data.humanize, latency_ms: data.took_ms };
  }

  async function runSuite() {
    setRunning(true);
    setResults(null);
    const allResults: EvalResult[] = [];
    for (let i = 0; i < DEFAULT_SUITE.length; i++) {
      setProgress({ done: i, total: DEFAULT_SUITE.length });
      const test = DEFAULT_SUITE[i];
      try {
        const r = await runEval(test.agent, test.command, test, executeFn);
        allResults.push(r);
      } catch (e: any) {
        allResults.push({ test_id: test.id, test_name: test.name, agent: test.agent, command: test.command, passed: false, score: 0, breakdown: { humanize: 0, structure: 0, keywords: 0, latency: 0 }, details: [e.message], timestamp: new Date().toISOString() });
      }
    }
    const passed = allResults.filter(r => r.passed).length;
    const avgScore = Math.round(allResults.reduce((s, r) => s + r.score, 0) / (allResults.length || 1));
    const run: EvalRun = { id: `run_${Date.now()}`, timestamp: new Date().toISOString(), results: allResults, summary: { total: allResults.length, passed, failed: allResults.length - passed, avg_score: avgScore } };
    setResults(run);
    setProgress({ done: DEFAULT_SUITE.length, total: DEFAULT_SUITE.length });
    saveRun(run);
    setHistory(loadHistory());
    setRunning(false);
  }

  async function rerunFailed() {
    if (!results) return;
    const failedTests = results.results.filter(r => !r.passed);
    if (failedTests.length === 0) return;
    setRerunning(true);
    const prevPassed = results.results.filter(r => r.passed);
    const newResults: EvalResult[] = [];
    for (let i = 0; i < failedTests.length; i++) {
      setProgress({ done: i, total: failedTests.length });
      const test = DEFAULT_SUITE.find(t => t.id === failedTests[i].test_id) || { id: failedTests[i].test_id, name: failedTests[i].test_name, agent: failedTests[i].agent, command: failedTests[i].command, expected_signals: [], max_humanize_patterns: 5 };
      try {
        const r = await runEval(test.agent, test.command, test, executeFn);
        newResults.push(r);
      } catch (e: any) {
        newResults.push({ ...failedTests[i], score: 0, passed: false, details: [e.message], timestamp: new Date().toISOString() });
      }
    }
    const allResults = [...prevPassed, ...newResults];
    const passed = allResults.filter(r => r.passed).length;
    const avgScore = Math.round(allResults.reduce((s, r) => s + r.score, 0) / (allResults.length || 1));
    const run: EvalRun = { id: `run_${Date.now()}`, timestamp: new Date().toISOString(), results: allResults, summary: { total: allResults.length, passed, failed: allResults.length - passed, avg_score: avgScore } };
    setResults(run);
    saveRun(run);
    setHistory(loadHistory());
    setRerunning(false);
  }

  const displayed = selectedAgent ? results?.results.filter(r => r.agent === selectedAgent) : results?.results;
  const prevRun = history.length >= 2 ? history[history.length - 2] : null;
  const prevMap = new Map(prevRun?.results.map(r => [r.test_id, r.score]) || []);
  const agents = results ? [...new Set(results.results.map(r => r.agent))].sort() : [];

  const s = styles;

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <a href="/" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>Home</a>
          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#00e5ff" }}>Eval Runner</span>
          <span style={s.badge}>{DEFAULT_SUITE.length} test cases</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={runSuite} disabled={running || rerunning} style={{ ...s.btn, ...(running || rerunning ? { opacity: 0.4, cursor: "not-allowed" } : {}) }}>
            {running ? `Running ${progress.done}/${progress.total}...` : "Run Full Suite"}
          </button>
          {results && results.results.some(r => !r.passed) && (
            <button onClick={rerunFailed} disabled={running || rerunning} style={{ ...s.btnAlt, ...(running || rerunning ? { opacity: 0.4, cursor: "not-allowed" } : {}) }}>
              {rerunning ? `Re-running ${progress.done}/${progress.total}...` : "Re-run Failed"}
            </button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {results && (
          <>
            <div style={s.statsGrid}>
              {[
                { l: "Total Tests", v: results.summary.total, c: "#00e5ff" },
                { l: "Passed", v: results.summary.passed, c: "#00ff88" },
                { l: "Failed", v: results.summary.failed, c: results.summary.failed > 0 ? "#ef4444" : "#00ff88" },
                { l: "Avg Score", v: `${results.summary.avg_score}%`, c: results.summary.avg_score >= 80 ? "#00ff88" : results.summary.avg_score >= 60 ? "#c9a227" : "#ef4444" },
              ].map((st, i) => (
                <div key={i} style={s.statCard}>
                  <div style={s.statLabel}>{st.l}</div>
                  <div style={{ ...s.statValue, color: st.c }}>{st.v}</div>
                </div>
              ))}
            </div>
            <div style={s.section}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>Results</h2>
                <div style={{ display: "flex", gap: "0.25rem", marginLeft: "auto", flexWrap: "wrap" as const }}>
                  <button onClick={() => setSelectedAgent(null)} style={{ ...s.filterBtn, ...(selectedAgent === null ? s.filterBtnActive : {}) }}>All</button>
                  {agents.map(a => (
                    <button key={a} onClick={() => setSelectedAgent(a)} style={{ ...s.filterBtn, ...(selectedAgent === a ? s.filterBtnActive : {}) }}>{a}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                {(displayed || results.results).map((r, i) => {
                  const prevScore = prevMap.get(r.test_id);
                  const delta = prevScore != null ? r.score - prevScore : null;
                  return (
                    <div key={i} style={s.resultRow}>
                      <span style={{ ...s.statusDot, background: r.passed ? "#00ff88" : "#ef4444" }} />
                      <span style={s.testName}>{r.test_name}</span>
                      <div style={s.scoreBar}><div style={{ height: "100%", borderRadius: 99, transition: "width 0.5s", width: `${r.score}%`, background: r.score >= 80 ? "#00ff88" : r.score >= 60 ? "#c9a227" : "#ef4444" }} /></div>
                      <span style={{ ...s.scorePct, color: r.score >= 80 ? "#00ff88" : r.score >= 60 ? "#c9a227" : "#ef4444" }}>{r.score}%</span>
                      {delta != null && <span style={{ fontSize: "0.7rem", fontFamily: "monospace", fontWeight: 600, width: 48, textAlign: "right" as const, color: delta > 0 ? "#00ff88" : delta < 0 ? "#ef4444" : "#64748b" }}>{delta > 0 ? "\u25B2" : delta < 0 ? "\u25BC" : "\u2014"}{delta !== 0 ? Math.abs(delta) : ""}</span>}
                      <span style={s.detailTag}>{r.details[0] || "\u2014"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {history.length > 1 && (
              <div style={s.section}>
                <div style={s.sectionHeader}>
                  <h2 style={s.sectionTitle}>Run History</h2>
                  <span style={s.sectionMeta}>{history.length} runs saved</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  {history.slice().reverse().slice(0, 10).map((run) => (
                    <div key={run.id} style={s.historyRow}>
                      <span style={{ fontSize: "0.78rem", color: "#94a3b8", width: 140 }}>{new Date(run.timestamp).toLocaleString()}</span>
                      <span style={{ fontSize: "0.78rem", color: "#00e5ff", width: 40 }}>{run.summary.total}T</span>
                      <span style={{ fontSize: "0.78rem", color: "#00ff88", width: 40 }}>{run.summary.passed}P</span>
                      <span style={{ fontSize: "0.78rem", color: run.summary.failed > 0 ? "#ef4444" : "#64748b", width: 40 }}>{run.summary.failed}F</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: run.summary.avg_score >= 80 ? "#00ff88" : run.summary.avg_score >= 60 ? "#c9a227" : "#ef4444" }}>{run.summary.avg_score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {!results && !running && (
          <div style={s.empty}>
            <p style={{ fontSize: "1.25rem", color: "#94a3b8", marginBottom: "0.5rem" }}>No eval run yet</p>
            <p style={{ fontSize: "0.9rem", color: "#64748b" }}>Click "Run Full Suite" to score {DEFAULT_SUITE.length} agents against test cases.</p>
          </div>
        )}
      </div>
    </div>
  );
}
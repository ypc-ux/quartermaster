"use client";
import { useState, useRef } from "react";
import Link from "next/link";

interface EvalResult {
  test_id: string; test_name: string; agent: string; command: string;
  passed: boolean; score: number;
  breakdown: { humanize: number; structure: number; keywords: number; latency: number };
  details: string[];
}

interface SuiteResult { results: EvalResult[]; summary: { total: number; passed: number; failed: number; avg_score: number } }

export default function EvalPage() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<SuiteResult | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  async function runSuite() {
    setRunning(true);
    setResults(null);
    const tests = [
      { agent: "hooks", command: "10 hooks for agency OS" },
      { agent: "launch", command: "launch Quartermaster" },
      { agent: "research", command: "research AI agencies" },
      { agent: "commander_frame", command: "diagnose my marketing" },
      { agent: "bio", command: "optimize my bio" },
      { agent: "repurpose", command: "repurpose I built 19 agents" },
      { agent: "finance", command: "finance" },
      { agent: "community", command: "community" },
      { agent: "grid", command: "grid preview" },
      { agent: "outreach", command: "outreach for scaling operations" },
      { agent: "trends", command: "trend AI agents" },
      { agent: "analytics", command: "analytics" },
      { agent: "digest", command: "digest" },
      { agent: "site", command: "build my website" },
    ];
    const allResults: any[] = [];
    for (let i = 0; i < tests.length; i++) {
      setProgress({ done: i, total: tests.length });
      try {
        const res = await fetch("/api/command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command: tests[i].command }) });
        const data = await res.json();
        const signals = ["hook", "plan", "competitor", "pain", "bio", "source_idea", "revenue", "platform", "posts", "lever", "trend", "analytics", "briefing", "hero"];
        const output = JSON.stringify(data.data || "").toLowerCase();
        const found = signals.filter(s => output.includes(s));
        const score = Math.min(100, Math.round((found.length / 3) * 100) + (data.humanize?.patterns_found < 3 ? 20 : 0));
        allResults.push({ test_id: `t${i}`, test_name: tests[i].agent, agent: tests[i].agent, command: tests[i].command, passed: score >= 60, score, breakdown: { humanize: Math.max(0, 100 - (data.humanize?.patterns_found || 0) * 15), keywords: Math.round((found.length / 3) * 100) }, details: [`Keywords: ${found.length}/3`, `Humanize: ${data.humanize?.patterns_found || 0} patterns`] });
      } catch (e: any) {
        allResults.push({ test_id: `t${i}`, test_name: tests[i].agent, agent: tests[i].agent, command: tests[i].command, passed: false, score: 0, breakdown: { humanize: 0, keywords: 0 }, details: [e.message] });
      }
    }
    const passed = allResults.filter(r => r.passed).length;
    const avg = Math.round(allResults.reduce((s, r) => s + r.score, 0) / allResults.length);
    setResults({ results: allResults, summary: { total: allResults.length, passed, failed: allResults.length - passed, avg_score: avg } });
    setProgress({ done: tests.length, total: tests.length });
    setRunning(false);
  }

  const displayed = selectedAgent ? results?.results.filter(r => r.agent === selectedAgent) : results?.results;

  return (
    <main className="min-h-screen bg-navy text-white">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-navy/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="text-gold text-sm hover:underline">← Home</Link>
          <h1 className="text-lg font-semibold" style={{ fontFamily: "Instrument Serif, serif" }}>Eval Runner</h1>
          <span className="text-xs text-slate-500">Score agents against test cases</span>
          <div className="ml-auto flex gap-2">
            <button onClick={runSuite} disabled={running} className="px-4 py-2 rounded-lg bg-gold text-navy text-sm font-semibold hover:bg-gold/90 disabled:opacity-40 transition">
              {running ? `Running ${progress.done}/${progress.total}...` : "Run Full Suite"}
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {results && (
          <>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { l: "Total Tests", v: results.summary.total },
                { l: "Passed", v: results.summary.passed, cls: "text-emerald" },
                { l: "Failed", v: results.summary.failed, cls: results.summary.failed > 0 ? "text-red" : "text-emerald" },
                { l: "Avg Score", v: `${results.summary.avg_score}%` },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{s.l}</p>
                  <p className={`text-2xl font-semibold ${s.cls || "text-white"}`} style={{ fontFamily: "Instrument Serif, serif" }}>{s.v}</p>
                </div>
              ))}
            </section>
            <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Results</h2>
                <div className="flex gap-1 ml-auto">
                  <button onClick={() => setSelectedAgent(null)} className={`text-[10px] px-2 py-0.5 rounded-full ${!selectedAgent ? "bg-gold/20 text-gold" : "text-slate-500 hover:text-white"}`}>All</button>
                  {[...new Set(results.results.map(r => r.agent))].map(a => (
                    <button key={a} onClick={() => setSelectedAgent(a)} className={`text-[10px] px-2 py-0.5 rounded-full ${selectedAgent === a ? "bg-gold/20 text-gold" : "text-slate-500 hover:text-white"}`}>{a}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {(displayed || results.results).map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02]">
                    <span className={`w-2 h-2 rounded-full ${r.passed ? "bg-emerald" : "bg-red"}`} />
                    <span className="text-sm font-medium text-white w-28 truncate">{r.test_name}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${r.score}%`, background: r.score >= 80 ? "#10b981" : r.score >= 60 ? "#c9a227" : "#ef4444" }} />
                    </div>
                    <span className="text-[10px] font-mono w-10 text-right text-slate-300">{r.score}%</span>
                    <span className="text-[10px] text-slate-500 w-20 truncate">{r.details[0] || "—"}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
        {!results && !running && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg mb-2">No eval run yet.</p>
            <p className="text-slate-600 text-sm">Click "Run Full Suite" to score all 14 agents against test cases.</p>
          </div>
        )}
      </div>
    </main>
  );
}
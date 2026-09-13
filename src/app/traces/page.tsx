"use client";
import { useState } from "react";
import Link from "next/link";

interface Trace {
  id: string; timestamp: string; agent: string; command: string;
  humanize_report: { patterns_found: number; fixes: string[] };
  latency_ms: number; score?: number;
}

const STORAGE_KEY = "qb_traces";

function getTraces(): Trace[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export default function TracesPage() {
  const [traces, setTraces] = useState<Trace[]>(() => getTraces());
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Trace | null>(null);

  const agents = [...new Set(traces.map(t => t.agent))];
  const filtered = filter === "all" ? traces : traces.filter(t => t.agent === filter);
  const sorted = [...filtered].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const avgLatency = traces.length ? Math.round(traces.reduce((s, t) => s + t.latency_ms, 0) / traces.length) : 0;
  const avgHumanize = traces.length ? (traces.reduce((s, t) => s + t.humanize_report.patterns_found, 0) / traces.length).toFixed(1) : "0";

  return (
    <main className="min-h-screen bg-navy text-white">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-navy/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="text-gold text-sm hover:underline">← Home</Link>
          <h1 className="text-lg font-semibold" style={{ fontFamily: "Instrument Serif, serif" }}>Traces</h1>
          <span className="text-xs text-slate-500">{traces.length} executions logged</span>
          <div className="ml-auto flex gap-2">
            <select value={filter} onChange={e => setFilter(e.target.value)} className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-slate-300">
              <option value="all">All agents</option>
              {agents.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "Total Traces", v: traces.length, s: "executions logged" },
            { l: "Avg Latency", v: `${avgLatency}ms`, s: "per command" },
            { l: "Avg Humanize", v: avgHumanize, s: "patterns per run" },
            { l: "Agents Used", v: agents.length, s: "unique agents" },
          ].map((st, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{st.l}</p>
              <p className="text-2xl font-semibold text-gold" style={{ fontFamily: "Instrument Serif, serif" }}>{st.v}</p>
              <p className="text-xs text-slate-400 mt-1">{st.s}</p>
            </div>
          ))}
        </section>
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Recent Traces</h2>
          {sorted.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No traces yet. Run commands in the Command Center to see them here.</p>
          ) : (
            <div className="space-y-2">
              {sorted.slice(0, 50).map(t => (
                <div key={t.id} onClick={() => setSelected(selected?.id === t.id ? null : t)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-emerald" />
                  <span className="text-sm font-medium text-white w-32 truncate">{t.agent}</span>
                  <span className="text-sm text-slate-400 flex-1 truncate">{t.command}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold/10 text-gold">{t.humanize_report.patterns_found}p</span>
                  <span className="text-[10px] text-slate-500 w-12 text-right">{t.latency_ms}ms</span>
                  <span className="text-[10px] text-slate-600">{new Date(t.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </section>
        {selected && (
          <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Trace Detail</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><span className="text-xs text-slate-500">Agent:</span> <span className="text-sm text-white">{selected.agent}</span></div>
              <div><span className="text-xs text-slate-500">Command:</span> <span className="text-sm text-white">{selected.command}</span></div>
              <div><span className="text-xs text-slate-500">Latency:</span> <span className="text-sm text-white">{selected.latency_ms}ms</span></div>
              <div><span className="text-xs text-slate-500">Humanize:</span> <span className="text-sm text-gold">{selected.humanize_report.patterns_found} patterns</span></div>
              <div><span className="text-xs text-slate-500">Time:</span> <span className="text-sm text-white">{new Date(selected.timestamp).toLocaleString()}</span></div>
              {selected.score != null && <div><span className="text-xs text-slate-500">Score:</span> <span className="text-sm text-gold">{selected.score}%</span></div>}
            </div>
            {selected.humanize_report.fixes.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Humanizer fixes:</p>
                <div className="space-y-1">
                  {selected.humanize_report.fixes.slice(0, 5).map((f, i) => (
                    <p key={i} className="text-xs text-slate-400 font-mono">• {f}</p>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
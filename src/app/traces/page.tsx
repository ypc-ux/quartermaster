"use client";
import { useState, useEffect } from "react";
import { getTraces as getStoreTraces, clearTraces, type Trace } from "@/lib/trace-store";

type TimeRange = "all" | "24h" | "7d";
type StatusFilter = "all" | "pass" | "fail" | "demo";

function traceStatus(t: Trace): "pass" | "fail" | "demo" {
  if (t.tags?.includes("demo")) return "demo";
  if (t.score != null) return t.score >= 60 ? "pass" : "fail";
  return t.humanize_report.patterns_found <= 3 ? "pass" : "fail";
}

export default function TracesPage() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [agentFilter, setAgentFilter] = useState("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Trace | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setTraces(getStoreTraces()); }, []);

  const agents = [...new Set(traces.map(t => t.agent))].sort();

  const now = Date.now();
  const timeCutoff = timeRange === "24h" ? now - 86400000 : timeRange === "7d" ? now - 604800000 : 0;
  const timeFiltered = timeCutoff ? traces.filter(t => new Date(t.timestamp).getTime() >= timeCutoff) : traces;

  const filtered = timeFiltered.filter(t => {
    if (agentFilter !== "all" && t.agent !== agentFilter) return false;
    if (statusFilter !== "all" && traceStatus(t) !== statusFilter) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const passCount = traces.filter(t => traceStatus(t) === "pass").length;
  const failCount = traces.filter(t => traceStatus(t) === "fail").length;
  const passRate = traces.length ? Math.round((passCount / traces.length) * 100) : 0;
  const avgLatency = traces.length ? Math.round(traces.reduce((s, t) => s + t.latency_ms, 0) / traces.length) : 0;
  const latencies = traces.map(t => t.latency_ms).sort((a, b) => a - b);
  const p95Latency = latencies.length ? latencies[Math.floor(latencies.length * 0.95)] : 0;
  const avgHumanize = traces.length ? (traces.reduce((s, t) => s + t.humanize_report.patterns_found, 0) / traces.length).toFixed(1) : "0";
  const agentStats = agents.map(a => {
    const at = traces.filter(t => t.agent === a);
    return { agent: a, avgPatterns: at.reduce((s, t) => s + t.humanize_report.patterns_found, 0) / at.length };
  }).sort((a, b) => b.avgPatterns - a.avgPatterns);

  function copyTrace(t: Trace) {
    navigator.clipboard.writeText(JSON.stringify(t, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const s = styles;

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <a href="/" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>Home</a>
          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#00e5ff" }}>Traces</span>
          <span style={s.badge}>{traces.length} logged</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <select value={timeRange} onChange={e => setTimeRange(e.target.value as TimeRange)} style={s.select}>
            <option value="all">All time</option>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
          </select>
          <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} style={s.select}>
            <option value="all">All agents</option>
            {agents.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} style={s.select}>
            <option value="all">All status</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
            <option value="demo">Demo</option>
          </select>
          <button onClick={() => { clearTraces(); setTraces([]); setSelected(null); }} style={s.clearBtn}>Clear</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={s.statsGrid}>
          {[
            { l: "Total Traces", v: traces.length, sub: `${sorted.length} shown`, c: "#00e5ff" },
            { l: "Pass Rate", v: `${passRate}%`, sub: `${passCount} pass / ${failCount} fail`, c: passRate >= 80 ? "#00ff88" : passRate >= 60 ? "#c9a227" : "#ef4444" },
            { l: "Avg Latency", v: `${avgLatency}ms`, sub: `p95: ${p95Latency}ms`, c: "#a855f7" },
            { l: "AI Patterns", v: avgHumanize, sub: agentStats[0] ? `worst: ${agentStats[0].agent}` : "\u2014", c: "#00e5ff" },
          ].map((st, i) => (
            <div key={i} style={s.statCard}>
              <div style={s.statLabel}>{st.l}</div>
              <div style={{ ...s.statValue, color: st.c }}>{st.v}</div>
              <div style={s.statSub}>{st.sub}</div>
            </div>
          ))}
        </div>

        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Recent Traces</h2>
            <span style={s.sectionMeta}>{sorted.length} results</span>
          </div>
          {sorted.length === 0 ? (
            <div style={s.empty}>
              <p style={{ fontSize: "1rem", color: "#94a3b8", marginBottom: "0.5rem" }}>No traces found</p>
              <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Run commands in the Command Center, or adjust your filters.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {sorted.slice(0, 100).map(t => {
                const status = traceStatus(t);
                const statusColor = status === "pass" ? "#00ff88" : status === "fail" ? "#ef4444" : "#c9a227";
                const isSelected = selected?.id === t.id;
                return (
                  <div key={t.id} style={{ ...s.traceRow, ...(isSelected ? { borderColor: "rgba(0,229,255,0.3)", background: "rgba(0,229,255,0.03)" } : {}) }} onClick={() => setSelected(isSelected ? null : t)}>
                    <span style={{ ...s.statusDot, background: statusColor }} />
                    <span style={s.agentName}>{t.agent}</span>
                    <span style={s.commandText}>{t.command}</span>
                    <span style={s.latencyTag}>{t.latency_ms}ms</span>
                    <span style={s.patternTag}>{t.humanize_report.patterns_found}p</span>
                    {t.score != null && <span style={{ ...s.scoreTag, color: t.score >= 80 ? "#00ff88" : t.score >= 60 ? "#c9a227" : "#ef4444" }}>{t.score}%</span>}
                    <span style={s.timeTag}>{new Date(t.timestamp).toLocaleTimeString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {selected && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>Trace Detail</h2>
              <button onClick={() => copyTrace(selected)} style={s.copyBtn}>{copied ? "Copied" : "Copy JSON"}</button>
            </div>
            <div style={s.detailGrid}>
              {[
                { l: "Agent", v: selected.agent },
                { l: "Command", v: selected.command },
                { l: "Latency", v: `${selected.latency_ms}ms` },
                { l: "AI Patterns", v: String(selected.humanize_report.patterns_found), color: selected.humanize_report.patterns_found <= 3 ? "#00ff88" : "#ef4444" },
                { l: "Status", v: traceStatus(selected).toUpperCase(), color: traceStatus(selected) === "pass" ? "#00ff88" : traceStatus(selected) === "fail" ? "#ef4444" : "#c9a227" },
                { l: "Time", v: new Date(selected.timestamp).toLocaleString() },
                ...(selected.score != null ? [{ l: "Score", v: `${selected.score}%`, color: selected.score >= 80 ? "#00ff88" : selected.score >= 60 ? "#c9a227" : "#ef4444" }] : []),
              ].map((d, i) => (
                <div key={i} style={s.detailItem}>
                  <span style={s.detailLabel}>{d.l}</span>
                  <span style={{ ...s.detailValue, ...(d.color ? { color: d.color } : {}) }}>{d.v}</span>
                </div>
              ))}
            </div>
            {selected.output && (
              <div style={{ marginTop: "1rem" }}>
                <p style={s.detailLabel}>Output</p>
                <div style={s.outputBox}>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "0.8rem", color: "#e2e8f0", lineHeight: 1.5 }}>
                    {selected.output.length > 400 ? selected.output.slice(0, 400) + "\u2026" : selected.output}
                  </pre>
                </div>
              </div>
            )}
            {selected.humanize_report.fixes.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <p style={s.detailLabel}>Humanizer Fixes ({selected.humanize_report.fixes.length})</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.5rem" }}>
                  {selected.humanize_report.fixes.map((f, i) => (
                    <p key={i} style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>{"\u2022 "}{f}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#050810", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" },
  nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(5,8,16,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,229,255,0.1)", padding: "0.8rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "0.75rem" },
  badge: { fontSize: "0.7rem", fontFamily: "monospace", padding: "0.25rem 0.75rem", borderRadius: 100, background: "rgba(0,229,255,0.1)", color: "#00e5ff", border: "1px solid rgba(0,229,255,0.2)" },
  select: { fontSize: "0.78rem", background: "#0A0E1A", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 8, padding: "0.4rem 0.6rem", color: "#e2e8f0", outline: "none", cursor: "pointer" },
  clearBtn: { fontSize: "0.75rem", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 8, padding: "0.4rem 0.75rem", cursor: "pointer" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  statCard: { background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 12, padding: "1.25rem", textAlign: "center" as const },
  statLabel: { fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "0.5rem" },
  statValue: { fontSize: "2rem", fontWeight: 800 },
  statSub: { fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" },
  section: { background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" },
  sectionTitle: { fontSize: "0.8rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.1em", margin: 0 },
  sectionMeta: { fontSize: "0.7rem", color: "#64748b" },
  empty: { textAlign: "center" as const, padding: "3rem 1rem" },
  traceRow: { display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: 10, border: "1px solid transparent", cursor: "pointer", transition: "all 0.15s" },
  statusDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  agentName: { fontSize: "0.85rem", fontWeight: 600, color: "#e2e8f0", width: 120, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  commandText: { fontSize: "0.85rem", color: "#94a3b8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  latencyTag: { fontSize: "0.7rem", fontFamily: "monospace", color: "#a855f7", background: "rgba(168,85,247,0.1)", padding: "0.15rem 0.5rem", borderRadius: 100 },
  patternTag: { fontSize: "0.7rem", fontFamily: "monospace", color: "#00e5ff", background: "rgba(0,229,255,0.1)", padding: "0.15rem 0.5rem", borderRadius: 100 },
  scoreTag: { fontSize: "0.7rem", fontFamily: "monospace", fontWeight: 600, width: 36, textAlign: "right" as const },
  timeTag: { fontSize: "0.7rem", color: "#475569", width: 80, textAlign: "right" as const },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" },
  detailItem: { display: "flex", flexDirection: "column" as const, gap: "0.2rem" },
  detailLabel: { fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  detailValue: { fontSize: "0.9rem", color: "#e2e8f0" },
  copyBtn: { fontSize: "0.75rem", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "#00e5ff", borderRadius: 8, padding: "0.35rem 0.75rem", cursor: "pointer" },
  outputBox: { background: "#0A0E1A", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 10, padding: "1rem", marginTop: "0.5rem", maxHeight: 200, overflow: "auto" },
};
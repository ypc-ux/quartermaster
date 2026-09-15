"use client";
import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const AppHeader = dynamic(() => import("@/components/AppHeader"), { ssr: false });
const ChatPanel = dynamic(() => import("@/components/ChatPanel"), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });
const ResultRenderer = dynamic(() => import("@/components/ResultRenderer"), { ssr: false });

const QUICK_COMMANDS = [
  "build my website", "10 hooks", "launch QuarterBack", "carousel ad",
  "lead score", "research AI", "story sequence", "video ad 30s",
];

export default function CommandCenter() {
  const [command, setCommand] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"execute" | "chat">("execute");
  const [version] = useState(() => typeof window !== "undefined" && window.location.hostname.includes("green") ? "green" : "blue");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [learnStep, setLearnStep] = useState(() => {
    if (typeof window !== "undefined" && localStorage.getItem("qb_learned")) return 4;
    return 0;
  });

  const LEARN_STEPS = [
    { cmd: "Give me 3 hooks for a GPU pricing tool", desc: "The hooks agent generates social hooks — provocation, curiosity, stat-driven.", tag: "Hooks" },
    { cmd: "Research GPU cloud providers", desc: "The research agent scans competitors and trends using live search.", tag: "Research" },
    { cmd: "Diagnose my marketing", desc: "The commander agent runs a 6-stage diagnostic on your marketing.", tag: "Commander" },
  ];

  function completeLearn() {
    setLearnStep(4);
    try { localStorage.setItem("qb_learned", "1"); } catch {}
  }

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  async function handleExecute(cmd?: string) {
    const c = (cmd || command).trim();
    if (!c) return;
    setLoading(true); setError(null); setResult(null);
    const isShip = /ship|deploy site|push site|create repo|create site/i.test(c);
    const endpoint = isShip ? "/api/ship" : "/api/command";
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command: c }) });
      const data = await res.json();
      if (!res.ok || (data.success === false && data.error)) setError(data.error || "Command failed");
      else {
        setResult(data);
        // Auto-advance learn flow
        if (learnStep >= 0 && learnStep < 3) setLearnStep(learnStep + 1);
        else if (learnStep === 3) completeLearn();
        if (isShip) {
          showToast(`✓ Repo created → ${data.repo_url} (${data.files_created} files)`);
          // Also log to command history
          try {
            const traces = JSON.parse(localStorage.getItem("qb_traces") || "[]");
            traces.push({ id: `t_${Date.now()}`, timestamp: new Date().toISOString(), agent: "ship", command: c, humanize_report: { patterns_found: 0, fixes: [] }, latency_ms: 0 });
            localStorage.setItem("qb_traces", JSON.stringify(traces.slice(-500)));
          } catch {}
        } else {
          showToast(`✓ ${data.agent?.name?.replace(/_/g, " ")} · ${data.agent?.points || 0}pts · humanized ${data.humanize?.patterns_found || 0}`);
        }
      }
    } catch (e: any) { setError(e.message || "Network error"); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-navy text-white">
      <AppHeader version={version} />
      <CommandPalette onExecute={() => {}} />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-[100] rounded-xl border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm font-medium text-emerald backdrop-blur-sm shadow-lg animate-[slideIn_0.2s_ease-out]">{toastMsg}</div>
      )}
      <style>{`@keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Tab toggle */}
        <div className="flex items-center gap-1 mb-2">
          <button onClick={() => setTab("execute")} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${tab === "execute" ? "bg-gold/15 text-gold border border-gold/30" : "text-slate-400 border border-transparent hover:text-white"}`}>Execute</button>
          <button onClick={() => setTab("chat")} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${tab === "chat" ? "bg-gold/15 text-gold border border-gold/30" : "text-slate-400 border border-transparent hover:text-white"}`}>Chat</button>
          <span className="ml-auto text-[10px] text-slate-500">{version === "green" ? "iteration build" : "customer stable"}</span>
        </div>

        {tab === "execute" ? (
          learnStep < 4 ? (
          /* ── Learn Flow (Twitter-style: teach concept by concept) ── */
          <section style={{ background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 16, padding: "2rem" }}>
            {learnStep === 0 ? (
              /* Welcome */
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚡</div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#e2e8f0", marginBottom: "0.5rem" }}>This is the Command Center</h2>
                <p style={{ color: "#94a3b8", fontSize: "0.95rem", maxWidth: 420, margin: "0 auto 2rem", lineHeight: 1.6 }}>22 agents, one input. Each one does something specific for your agency. Let's try 3 of them.</p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                  <button onClick={() => setLearnStep(1)} style={{ background: "#00e5ff", color: "#050810", border: "none", borderRadius: 10, padding: "0.8rem 2rem", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Start Tutorial</button>
                  <button onClick={completeLearn} style={{ background: "transparent", color: "#64748b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "0.8rem 1.5rem", fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>Skip</button>
                </div>
              </div>
            ) : (
              /* Steps 1-3 */
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < learnStep ? "#00ff88" : i === learnStep ? "#00e5ff" : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                  <button onClick={completeLearn} style={{ background: "transparent", border: "none", color: "#64748b", fontSize: "0.75rem", cursor: "pointer" }}>Skip tutorial</button>
                </div>
                {(() => {
                  const step = LEARN_STEPS[learnStep - 1];
                  return (
                    <div>
                      <div style={{ display: "inline-block", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "#00e5ff", padding: "0.25rem 0.75rem", borderRadius: 100, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1rem" }}>Step {learnStep}/3 — {step.tag}</div>
                      <p style={{ color: "#e2e8f0", fontSize: "1rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>{step.desc}</p>
                      <button
                        onClick={() => { setCommand(step.cmd); handleExecute(step.cmd); }}
                        disabled={loading}
                        style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.25)", color: "#00e5ff", borderRadius: 10, padding: "0.75rem 1.5rem", fontSize: "0.9rem", fontWeight: 600, cursor: loading ? "wait" : "pointer", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: "0.5rem" }}
                      >
                        {loading ? "Running…" : `Try: "${step.cmd}"`}
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
            {/* Result panel (shared between learn flow and normal UI) */}
            {(result || error) && (
              <div style={{ marginTop: "1.5rem", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", padding: "1.25rem" }}>
                {error ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#ef4444" }}><StatusDot status="error" /><p style={{ fontSize: "0.85rem" }}>{error}</p></div>
                ) : result ? (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <StatusDot status="running" />
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e2e8f0" }}>{result.agent?.name?.replace(/_/g, " ")}</span>
                        <span style={{ fontSize: "0.65rem", fontFamily: "monospace", textTransform: "uppercase", padding: "0.15rem 0.5rem", borderRadius: 100, background: "rgba(0,255,136,0.1)", color: "#00ff88" }}>complete</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.75rem", color: "#64748b" }}>
                        <span style={{ padding: "0.15rem 0.5rem", borderRadius: 100, background: "rgba(201,162,39,0.1)", color: "#c9a227" }}>{result.agent?.points} pts</span>
                        <span>{result.took_ms}ms</span>
                        <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(result.data, null, 2)); }} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.75rem" }} title="Copy all">📋 Copy</button>
                      </div>
                    </div>
                    <div><ResultRenderer data={result.data} agent={result.agent?.name || ""} /></div>
                  </div>
                ) : null}
              </div>
            )}
          </section>
          ) : (
          /* ── Normal Execute UI (after learn flow complete) ── */
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-amber-400 flex items-center justify-center shrink-0"><span className="text-navy font-bold text-lg">Q</span></div>
            <input type="text" value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleExecute()}
              placeholder="launch QuarterBack, 10 hooks, research AI, build my website…"
              className="flex-1 bg-transparent border-none text-white placeholder:text-slate-600 text-lg focus:outline-none" />
            <button onClick={() => handleExecute()} disabled={loading || !command.trim()} className="px-6 py-3 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.98]">
              {loading ? "Running…" : "Execute"}
            </button>
          </div>
          {/* Quick-command chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {QUICK_COMMANDS.map(cmd => (
              <button key={cmd} onClick={() => { setCommand(cmd); handleExecute(cmd); }} disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-slate-400 hover:text-gold hover:border-gold/30 transition active:scale-[0.97]">
                {cmd}
              </button>
            ))}
          </div>
          {/* Result panel */}
          {(result || error) && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              {error ? (
                <div className="flex items-center gap-2 text-red-400"><StatusDot status="error" /><p className="text-sm">{error}</p></div>
              ) : result ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <StatusDot status="running" />
                      <span className="text-sm font-semibold text-white">{result.agent?.name?.replace(/_/g, " ")}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald/10 text-emerald">complete</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold">{result.agent?.points} pts</span>
                      <span>{result.took_ms}ms</span>
                      <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(result.data, null, 2)); }} className="text-slate-500 hover:text-gold transition text-xs" title="Copy all">📋 Copy raw</button>
                      <button onClick={() => setResult(null)} className="text-slate-500 hover:text-white">×</button>
                    </div>
                  </div>
                  <div className="mt-2"><ResultRenderer data={result.data} agent={result.agent?.name || ""} /></div>
                </div>
              ) : null}
            </div>
          )}
        </section>
          )
        ) : (
          <div className="h-[600px] rounded-2xl border border-white/5 bg-white/[0.02]"><ChatPanel onResult={(r) => setResult(r)} /></div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ l: "Active Agents", v: "22", s: "running" },{ l: "Challenge Points", v: "345", s: "22 agents stacked" },{ l: "Instagram", v: "14.8K", s: "followers" },{ l: "Email Digest", v: "live", s: "auto-sends at 5+" }].map((st, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-gold/10 transition"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{st.l}</p><p className="text-2xl font-semibold text-gold" style={{ fontFamily: "Instrument Serif, serif" }}>{st.v}</p><p className="text-xs text-slate-400 mt-1">{st.s}</p></div>
          ))}
        </section>

        {/* Placeholder agent grid + tasks */}
        <section><h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Projects & Repos</h2><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">{[
          { n: "Agency OS", s: "deployed" },{ n: "PayScope", s: "deployed" },{ n: "Quartermaster", s: "deployed" },{ n: "Smooth Operator", s: "deployed" },
        ].map(p => <div key={p.n} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 transition"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-white">{p.n}</span><span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border text-emerald border-emerald/20">{p.s}</span></div></div>)}</div></section>
      </div>
    </main>
  );
}

function StatusDot({ status }: { status: string }) {
  const c: Record<string, string> = { running: "bg-emerald", idle: "bg-slate-500", error: "bg-red" };
  return <span className={`w-2 h-2 rounded-full inline-block ${c[status] || "bg-slate-500"} ${status === "running" ? "animate-pulse" : ""}`} />;
}

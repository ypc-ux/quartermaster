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

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  async function handleExecute(cmd?: string) {
    const c = (cmd || command).trim();
    if (!c) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command: c }) });
      const data = await res.json();
      if (!res.ok || !data.success) setError(data.error || "Command failed");
      else {
        setResult(data);
        showToast(`✓ ${data.agent?.name?.replace(/_/g, " ")} · ${data.agent?.points || 0}pts · humanized ${data.humanize?.patterns_found || 0}`);
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

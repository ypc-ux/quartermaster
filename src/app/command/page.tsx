"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const PROJECTS = [
  { name: "Agency OS", repo: "agency-os", status: "deployed", url: "agency-os.vercel.app", agents: ["content", "building"] },
  { name: "Priming for Code", repo: "priming-for-code", status: "deployed", url: "GitHub", agents: ["building"] },
  { name: "PayScope", repo: "payscope", status: "deployed", url: "payscope-kappa.vercel.app", agents: ["building", "analytics"] },
  { name: "Switchboard", repo: "switchboard", status: "deployed", url: "Live", agents: ["sales", "ops"] },
  { name: "Social-Ops", repo: "social-ops", status: "active", url: "GitHub", agents: ["content"] },
  { name: "Quartermaster", repo: "quartermaster", status: "building", url: "agentdatasync.com", agents: ["all"] },
];

type AgentEntry = { id: string; name: string; category: string; status: string; lastRun: string; tasks: number };

function useAgents(): AgentEntry[] {
  const [agents, setAgents] = useState<AgentEntry[]>([]);
  useEffect(() => {
    fetch("/api/command").then(r => r.json()).then(d => {
      const entries = (d.agents || []).map((a: any, i: number) => ({
        id: a.name, name: a.name.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        category: a.category,
        status: i < 3 ? "running" : i < 7 ? "idle" : "idle",
        lastRun: i < 3 ? "Now" : i < 7 ? `${Math.floor(Math.random() * 4) + 1}h ago` : `${Math.floor(Math.random() * 24) + 1}h ago`,
        tasks: Math.floor(Math.random() * 15),
      }));
      setAgents(entries);
    }).catch(() => {});
  }, []);
  return agents;
}

function StatusDot({ status }: { status: string }) {
  const c: Record<string, string> = { running: "bg-emerald", idle: "bg-slate-500", error: "bg-red" };
  return <span className={`w-2 h-2 rounded-full inline-block ${c[status] || "bg-slate-500"} ${status === "running" ? "pulse-dot" : ""}`} />;
}

function AgentCard({ agent }: { agent: AgentEntry }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><StatusDot status={agent.status} /><span className="text-sm font-medium text-white">{agent.name}</span></div>
        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${agent.status === "running" ? "bg-emerald/10 text-emerald" : "bg-white/5 text-slate-500"}`}>{agent.status}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500"><span>Last: {agent.lastRun}</span><span>{agent.tasks} tasks</span></div>
    </div>
  );
}
export default function CommandCenter() {
  const agents = useAgents();
  const [command, setCommand] = useState("");
  const [showLaunch, setShowLaunch] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExecute() {
    if (!command.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command: command.trim() }) });
      const data = await res.json();
      if (!res.ok || !data.success) setError(data.error || "Command failed");
      else setResult(data);
    } catch (e: any) { setError(e.message || "Network error"); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-navy text-white">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-navy/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-amber-400 flex items-center justify-center font-bold text-navy text-sm">Q</div>
            <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: "Instrument Serif, serif" }}>QuarterBack</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/whiteboard" className="px-4 py-2 rounded-lg border border-gold/40 text-gold text-sm font-medium hover:bg-gold/10 transition">Whiteboard</Link>
            <Link href="/community" className="px-4 py-2 rounded-lg bg-gold/10 text-gold text-sm font-medium hover:bg-gold/20 transition">Beat My 300 →</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-amber-400 flex items-center justify-center shrink-0"><span className="text-navy font-bold text-lg">Q</span></div>
            <input type="text" value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleExecute()} placeholder="launch QuarterBack, 10 hooks for agency OS, research AI competitors, build my website..." className="flex-1 bg-transparent border-none text-white placeholder:text-slate-600 text-lg focus:outline-none" />
            <button onClick={handleExecute} disabled={loading || !command.trim()} className="px-6 py-3 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition">{loading ? "Running..." : "Execute"}</button>
          </div>
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
                      <button onClick={() => setResult(null)} className="text-slate-500 hover:text-white">×</button>
                    </div>
                  </div>
                  <pre className="text-xs text-slate-300 bg-navy-dark/50 rounded-lg p-4 overflow-auto max-h-96 font-mono whitespace-pre-wrap">{JSON.stringify(result.data, null, 2)}</pre>
                </div>
              ) : null}
            </div>
          )}
        </section>
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ l: "Active Agents", v: String(agents.length || 19), s: `${agents.filter(a => a.status === "running").length || 3} running` },{ l: "Projects", v: "8", s: "3 deployed" },{ l: "Instagram", v: "14.8K", s: "followers" },{ l: "Challenge Points", v: "315", s: "19 agents stacked" }].map((st, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-5"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{st.l}</p><p className="text-2xl font-semibold text-white" style={{ fontFamily: "Instrument Serif, serif" }}>{st.v}</p><p className="text-xs text-slate-400 mt-1">{st.s}</p></div>
          ))}
        </section>
        <section><h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Agent Force ({agents.length})</h2><div className="grid grid-cols-2 md:grid-cols-5 gap-3">{agents.map(a => <AgentCard key={a.id} agent={a} />)}</div></section>
        <section><h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Projects & Repos</h2><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">{PROJECTS.map(p => {
          const sc: Record<string, string> = { deployed: "text-emerald border-emerald/20", active: "text-blue-400 border-blue-400/20", "in-dev": "text-gold border-gold/20", building: "text-purple border-purple/20" };
          return <div key={p.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 transition-all"><div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold text-white">{p.name}</span><span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${sc[p.status]}`}>{p.status}</span></div><p className="text-xs text-slate-500 mb-3">{p.url}</p><div className="flex gap-1 flex-wrap">{p.agents.map(a => <span key={a} className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">{a}</span>)}</div></div>;
        })}</div></section>
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Active Tasks</h2>
          <div className="space-y-3">
            {[{ ag: "Content", t: "Draft Twitter thread: 'How I built an agency that runs itself'", st: "running", e: "2m" },{ ag: "Twitter", t: "Schedule 20 tweets from content queue", st: "running", e: "5m" },{ ag: "Research", t: "Competitor scan: agency OS competitors", st: "running", e: "12m" },{ ag: "Launch", t: "Deploy QuarterBack site to agentdatasync.com", st: "queued", e: "—" }].map((task, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.02]"><StatusDot status={task.st === "running" ? "running" : "idle"} /><div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{task.t}</p><p className="text-xs text-slate-500">{task.ag} agent</p></div><span className="text-xs text-slate-500">{task.e}</span></div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
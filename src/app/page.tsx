"use client";
import { useState } from "react";

const AGENTS = [
  { id: "research", name: "Research", status: "idle", lastRun: "2h ago", tasks: 3 },
  { id: "positioning", name: "Positioning", status: "idle", lastRun: "1h ago", tasks: 1 },
  { id: "content", name: "Content", status: "running", lastRun: "Now", tasks: 7 },
  { id: "twitter", name: "Twitter", status: "running", lastRun: "Now", tasks: 24 },
  { id: "email", name: "Email", status: "idle", lastRun: "30m ago", tasks: 5 },
  { id: "building", name: "Building", status: "idle", lastRun: "4h ago", tasks: 2 },
  { id: "sales", name: "Sales", status: "idle", lastRun: "15m ago", tasks: 0 },
  { id: "analytics", name: "Analytics", status: "running", lastRun: "Now", tasks: 1 },
  { id: "ops", name: "Ops", status: "idle", lastRun: "6h ago", tasks: 4 },
  { id: "culture", name: "Culture", status: "idle", lastRun: "1d ago", tasks: 0 },
];

const PROJECTS = [
  { name: "Agency OS", repo: "agency-os", status: "deployed", url: "agency-os.vercel.app", agents: ["content", "building", "sales"] },
  { name: "Priming for Code", repo: "priming-for-code", status: "deployed", url: "GitHub", agents: ["building", "content"] },
  { name: "PayScope", repo: "payscope", status: "deployed", url: "payscope-kappa.vercel.app", agents: ["building", "analytics"] },
  { name: "Switchboard", repo: "switchboard", status: "deployed", url: "Live", agents: ["sales", "ops"] },
  { name: "Social-Ops", repo: "social-ops", status: "active", url: "GitHub", agents: ["content", "twitter"] },
  { name: "Commander Frame", repo: "—", status: "in-dev", url: "Q4 2026", agents: ["positioning", "content"] },
  { name: "Brainwash OS", repo: "—", status: "in-dev", url: "Q4 2026", agents: ["culture", "content"] },
  { name: "Quartermaster", repo: "quartermaster", status: "building", url: "Local", agents: ["all"] },
];

function StatusDot({ status }: { status: string }) {
  const c: Record<string, string> = { running: "bg-emerald", idle: "bg-slate-500", error: "bg-red" };
  return <span className={`w-2 h-2 rounded-full inline-block ${c[status] || "bg-slate-500"} ${status === "running" ? "pulse-dot" : ""}`} />;
}

function AgentCard({ agent }: { agent: typeof AGENTS[0] }) {
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

function ProjectCard({ project }: { project: typeof PROJECTS[0] }) {
  const sc: Record<string, string> = { deployed: "text-emerald border-emerald/20", active: "text-blue-400 border-blue-400/20", "in-dev": "text-gold border-gold/20", building: "text-purple border-purple/20" };
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold text-white">{project.name}</span><span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${sc[project.status]}`}>{project.status}</span></div>
      <p className="text-xs text-slate-500 mb-3">{project.url}</p>
      <div className="flex gap-1 flex-wrap">{project.agents.map(a => <span key={a} className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">{a}</span>)}</div>
    </div>
  );
}


export default function Home() {
  const [command, setCommand] = useState("");
  const [showLaunch, setShowLaunch] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExecute() {
    if (!command.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: command.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Command failed");
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="min-h-screen bg-navy text-white">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-navy/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-amber-400 flex items-center justify-center font-bold text-navy text-sm">Q</div><span className="text-lg font-semibold tracking-tight" style={{ fontFamily: "Instrument Serif, serif" }}>Quartermaster</span></div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald pulse-dot"></span>3 agents running</div>
            <a href="/whiteboard" className="px-4 py-2 rounded-lg border border-gold/40 text-gold text-sm font-medium hover:bg-gold/10 transition">Whiteboard</a>
            <a href="/community" className="px-4 py-2 rounded-lg bg-gold/10 text-gold text-sm font-medium hover:bg-gold/20 transition">Beat My 300 →</a>
            <button onClick={() => setShowLaunch(true)} className="px-4 py-2 rounded-lg bg-gold text-navy font-semibold text-sm hover:bg-gold/90 transition">+ Launch</button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-amber-400 flex items-center justify-center shrink-0"><span className="text-navy font-bold text-lg">Q</span></div>
            <input type="text" value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleExecute()} placeholder="research agency OS competitors, launch Quartermaster, 10 hooks, write newsletter..." className="flex-1 bg-transparent border-none text-white placeholder:text-slate-600 text-lg focus:outline-none" />
            <button onClick={handleExecute} disabled={loading || !command.trim()} className="px-6 py-3 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition">{loading ? "Running..." : "Execute"}</button>
          </div>
          {(result || error) && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              {error ? (
                <div className="flex items-center gap-2 text-red-400">
                  <StatusDot status="error" />
                  <p className="text-sm">{error}</p>
                </div>
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
          {[{ l: "Active Agents", v: "10", s: "3 running" },{ l: "Projects", v: "8", s: "3 deployed" },{ l: "Twitter", v: "14.2K", s: "18 tweets today" },{ l: "Engagement", v: "4.2%", s: 'Top: "Your AI code..."' }].map((st, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-5"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{st.l}</p><p className="text-2xl font-semibold text-white" style={{ fontFamily: "Instrument Serif, serif" }}>{st.v}</p><p className="text-xs text-slate-400 mt-1">{st.s}</p></div>
          ))}
        </section>
        <section><h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Agent Force</h2><div className="grid grid-cols-2 md:grid-cols-5 gap-3">{AGENTS.map(a => <AgentCard key={a.id} agent={a} />)}</div></section>
        <section><h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Projects & Repos</h2><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">{PROJECTS.map(p => <ProjectCard key={p.name} project={p} />)}</div></section>
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Active Tasks</h2>
          <div className="space-y-3">
            {[{ ag: "Content", t: "Draft Twitter thread: 'How I built an agency that runs itself'", st: "running", e: "2m" },{ ag: "Twitter", t: "Schedule 20 tweets from content queue", st: "running", e: "5m" },{ ag: "Research", t: "Competitor scan: agency OS competitors", st: "running", e: "12m" },{ ag: "Building", t: "Deploy Agency OS v2 with Stripe checkout", st: "queued", e: "—" }].map((task, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.02]"><StatusDot status={task.st === "running" ? "running" : "idle"} /><div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{task.t}</p><p className="text-xs text-slate-500">{task.ag} agent</p></div><span className="text-xs text-slate-500">{task.e}</span></div>
            ))}
          </div>
        </section>
      </div>
      {showLaunch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-6">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-navy-light p-8">
            <h2 className="text-2xl font-light mb-2" style={{ fontFamily: "Instrument Serif, serif" }}>Launch New Project</h2>
            <p className="text-sm text-slate-400 mb-6">Describe what you want to build. The agent force will handle the rest.</p>
            <textarea className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-gold/50 resize-none mb-4" placeholder="I want to build a $299 agency operating system..." />
            <div className="flex gap-3"><button className="flex-1 py-3 rounded-lg bg-gold text-navy font-semibold hover:bg-gold/90 transition">Launch</button><button onClick={() => setShowLaunch(false)} className="px-6 py-3 rounded-lg border border-white/10 text-white font-medium hover:bg-white/5 transition">Cancel</button></div>
          </div>
        </div>
      )}
    </main>
  );
}


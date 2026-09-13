"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "qb_skill_configs";

interface SkillConfig {
  agent: string;
  category: string;
  description: string;
  templates: string[];
  notes: string;
}

const DEFAULT_AGENTS: SkillConfig[] = [
  { agent: "hooks", category: "content", description: "Hook generation for social posts", templates: ["Most people think {topic} is about X. It's actually about Y.", "{topic} is broken. Here's how to fix it.", "The {topic} playbook nobody's sharing."], notes: "" },
  { agent: "launch", category: "strategy", description: "7-day launch plans", templates: ["teaser", "announcement", "deep_dive", "social_proof", "urgency", "last_chance", "post_launch"], notes: "" },
  { agent: "outreach", category: "strategy", description: "Cold outreach engine", templates: ["Loss Aversion", "Social Proof", "Authority", "Reciprocity", "Scarcity", "Curiosity Gap", "Contrarian", "Pain Amplification"], notes: "" },
  { agent: "research", category: "strategy", description: "Competitor/market scans", templates: ["competitor_scan", "market_research", "trend_analysis"], notes: "" },
  { agent: "content", category: "content", description: "Long-form content generation", templates: ["blog_post", "newsletter", "case_study"], notes: "" },
  { agent: "twitter", category: "content", description: "Twitter thread generation", templates: ["Hot take: {topic}", "I've been experimenting with {topic}", "Stop sleeping on {topic}"], notes: "" },
  { agent: "repurpose", category: "content", description: "1 idea → 6 platforms", templates: ["twitter", "linkedin", "newsletter", "blog", "tiktok", "email"], notes: "" },
  { agent: "commander_frame", category: "strategy", description: "6-stage marketing diagnostic", templates: ["pain_diagnosis", "value_equation", "attribution_check", "voice_match", "lever_selection", "objection_preemption"], notes: "" },
  { agent: "brainwash_os", category: "strategy", description: "7-layer culture audit", templates: ["Mind", "Exposure", "Practices", "Artifacts", "Protagonists", "Aesthetics", "Conflict"], notes: "" },
];

export default function SkillsPage() {
  const [configs, setConfigs] = useState<SkillConfig[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || DEFAULT_AGENTS; } catch { return DEFAULT_AGENTS; }
  });
  const [selected, setSelected] = useState<SkillConfig | null>(null);
  const [editText, setEditText] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  function saveConfig(agent: string, updates: Partial<SkillConfig>) {
    setConfigs(prev => {
      const next = prev.map(c => c.agent === agent ? { ...c, ...updates } : c);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function testAgent(agent: string, command: string) {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command }) });
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) { setTestResult({ error: e.message }); }
    finally { setTesting(false); }
  }

  const categories = { strategy: configs.filter(c => c.category === "strategy"), content: configs.filter(c => c.category === "content"), ops: configs.filter(c => c.category === "ops") };

  return (
    <main className="min-h-screen bg-navy text-white">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-navy/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="text-gold text-sm hover:underline">← Home</Link>
          <h1 className="text-lg font-semibold" style={{ fontFamily: "Instrument Serif, serif" }}>Skill Editor</h1>
          <span className="text-xs text-slate-500">{configs.length} agent configs</span>
          <div className="ml-auto flex gap-2 text-xs">
            <Link href="/eval" className="px-3 py-1.5 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition">Eval Runner</Link>
            <Link href="/traces" className="px-3 py-1.5 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition">Traces</Link>
          </div>
        </div>
      </header>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Agent list */}
        <div className="w-72 border-r border-white/5 overflow-y-auto p-4 space-y-6">
          {(["strategy", "content", "ops"] as const).map(cat => (
            <div key={cat}>
              <h3 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">{cat}</h3>
              <div className="space-y-1">
                {categories[cat].map(c => (
                  <button key={c.agent} onClick={() => { setSelected(c); setEditText(c.templates.join("\n")); setTestResult(null); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${selected?.agent === c.agent ? "bg-gold/10 text-gold" : "text-slate-400 hover:text-white hover:bg-white/[0.03]"}`}>
                    {c.agent.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Editor */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selected ? (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-2xl font-light" style={{ fontFamily: "Instrument Serif, serif" }}>{selected.agent.replace(/_/g, " ")}</h2>
                <p className="text-sm text-slate-400 mt-1">{selected.description}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Templates / Rules (one per line)</label>
                <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={10}
                  className="w-full mt-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-gold/50 resize-none" />
                <button onClick={() => saveConfig(selected.agent, { templates: editText.split("\n").filter(l => l.trim()) })}
                  className="mt-2 px-4 py-2 rounded-lg bg-gold text-navy text-sm font-semibold hover:bg-gold/90 transition">Save Templates</button>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Notes</label>
                <textarea value={selected.notes} onChange={e => saveConfig(selected.agent, { notes: e.target.value })} rows={3}
                  className="w-full mt-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-gold/50 resize-none" />
              </div>
              <div>
                <button onClick={() => testAgent(selected.agent, `test ${selected.agent}`)} disabled={testing}
                  className="px-4 py-2 rounded-lg border border-gold/40 text-gold text-sm font-medium hover:bg-gold/10 disabled:opacity-40 transition">
                  {testing ? "Testing..." : "Test This Agent →"}
                </button>
                {testResult && (
                  <pre className="mt-3 text-xs text-slate-300 bg-navy-dark/50 rounded-lg p-4 overflow-auto max-h-48 font-mono whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">Select an agent to edit</div>
          )}
        </div>
      </div>
    </main>
  );
}
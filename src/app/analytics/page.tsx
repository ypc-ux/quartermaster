"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";

interface AgentStats {
  agents: { name: string; category: string; description: string; points: number }[];
  total: number;
  live_search: boolean;
  serpapi: boolean;
  llm: boolean;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [posthogUrl, setPosthogUrl] = useState<string>("");

  useEffect(() => {
    fetch("/api/command")
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const categories = stats?.agents.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <main className="min-h-screen bg-navy text-white">
      <AppHeader />
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald/10 border border-emerald/20 text-emerald text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
            Live analytics flowing to PostHog
          </div>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: "Instrument Serif, serif" }}>
            System Analytics
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Real-time metrics from the QuarterBack operating system.
            Every command executed, every agent invoked, every site shipped — tracked and visualized.
          </p>
        </div>

        {/* Stat cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Agents", value: stats?.total || "—", sub: "connected to orchestrator" },
            { label: "Strategy", value: categories.strategy || "—", sub: "diagnostic + research agents" },
            { label: "Content", value: categories.content || "—", sub: "creation + repurpose agents" },
            { label: "Operations", value: categories.operations || "—", sub: "digest + tracking agents" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-5 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">{s.label}</p>
              <p className="text-3xl font-semibold text-gold" style={{ fontFamily: "Instrument Serif, serif" }}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </section>

        {/* Integration status */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Live Integrations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: "SerpAPI", active: stats?.serpapi || false, desc: "Google Trends + Search" },
              { name: "Serper", active: stats?.live_search || false, desc: "Live search enrichment" },
              { name: "PostHog", active: true, desc: "Page views + command tracking" },
              { name: "Resend", active: true, desc: "Email digest pipeline" },
              { name: "Slack", active: true, desc: "Command notifications" },
              { name: "GitHub", active: true, desc: "Code writer + Pages deploy" },
            ].map((int, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01]">
                <span className={`w-2 h-2 rounded-full ${int.active ? "bg-emerald" : "bg-slate-600"}`} />
                <div>
                  <p className="text-sm font-medium text-white">{int.name}</p>
                  <p className="text-[10px] text-slate-500">{int.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PostHog dashboard link */}
        <section className="rounded-2xl border border-gold/20 bg-gold/[0.03] p-6 text-center space-y-3">
          <h2 className="text-sm font-semibold text-gold uppercase tracking-wider">PostHog Dashboard</h2>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            View page views, command_executed breakdowns by agent, and ship funnels.
            Create a public dashboard in PostHog and paste the link below.
          </p>
          <div className="flex items-center gap-2 justify-center">
            <input
              type="text"
              value={posthogUrl}
              onChange={e => setPosthogUrl(e.target.value)}
              placeholder="https://app.posthog.com/shared/..."
              className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-600 w-80"
            />
            {posthogUrl && (
              <a href={posthogUrl} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 bg-gold text-navy text-xs font-semibold rounded-lg hover:bg-gold/90 transition">
                Open Dashboard →
              </a>
            )}
          </div>
        </section>

        {/* Quick links */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link href="/command" className="text-gold hover:underline">Command Center</Link>
          <span>·</span>
          <Link href="/eval" className="text-gold hover:underline">Eval Runner</Link>
          <span>·</span>
          <Link href="/traces" className="text-gold hover:underline">Traces</Link>
          <span>·</span>
          <Link href="/whiteboard" className="text-gold hover:underline">Whiteboard</Link>
        </div>
      </div>
    </main>
  );
}

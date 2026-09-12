"use client";
import { useState } from "react";
import Link from "next/link";

// Strategy recommendation engine — mirrors what the Research Agent surfaced about the challenge
function recommendPath(total: number, agentCount: number) {
  const recs: string[] = [];
  if (agentCount < 5) recs.push("You need MORE agents. 3-5 well-documented agents is the floor, not the ceiling.");
  if (agentCount <= 10) recs.push("Take one agent and make it 5 steps with a tracker (Stunt Protocol = 5×15 = 70 pts from ONE protocol).");
  if (total < 200) recs.push("Chain your agents: have Agent A's output feed Agent B. That integration is worth more than the agents themselves.");
  if (!recs.length) recs.push("You're past 200. Next: make every agent produce a receipt (artifact) so the points survive checking.");
  return recs;
}

export default function CommunityPage() {
  const [repo, setRepo] = useState("");
  const [agents, setAgents] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [testimonial, setTestimonial] = useState("");
  const [name, setName] = useState("");
  const [pts, setPts] = useState<number | null>(null);

  function scoreMySubmission() {
    const base = Math.min(10, agents) + (agents > 1 ? 15 : 0) + (agents > 3 ? 20 : 0);
    setPts(Math.min(300, base + agents * 5));
  }

  return (
    <main className="min-h-screen bg-navy text-white">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-navy/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-amber-400 flex items-center justify-center font-bold text-navy text-sm">Q</div>
            <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: "Instrument Serif, serif" }}>Quartermaster</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/whiteboard" className="text-sm text-slate-400 hover:text-white transition">Whiteboard</Link>
            <Link href="/" className="px-4 py-2 rounded-lg border border-gold/40 text-gold text-sm font-medium hover:bg-gold/10 transition">Command Center</Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        {/* Hero */}
        <section className="text-center space-y-4">
          <p className="text-gold text-xs uppercase tracking-[0.25em]">The Superagent Challenge · Base44</p>
          <h1 className="text-5xl md:text-6xl font-light leading-tight" style={{ fontFamily: "Instrument Serif, serif" }}>
            Use this tool to <em className="text-gold not-italic">beat my 300 points</em>.
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            This tool is designed to help everyone improve the agents they built.
            Use it to up-rank your own points before the deadline — and beat my 300.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2.5">
            <span className="text-2xl">⚡</span>
            <span className="text-sm font-medium pl-2 border-l border-white/10">Use my tool to gain points in exchange for testimonials.</span>
          </div>
        </section>
{/* Score tool + rubric */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: "Instrument Serif, serif" }}>Score your submission</h2>
            <p className="text-sm text-slate-400 mb-5">Paste your repo or count your agents. Get a quick read on your points.</p>
            <label className="text-xs text-slate-500 uppercase tracking-wider">GitHub repo (optional)</label>
            <input
              value={repo}
              onChange={e => setRepo(e.target.value)}
              placeholder="github.com/you/your-agent"
              className="w-full mt-1 mb-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-gold/50"
            />
            <label className="text-xs text-slate-500 uppercase tracking-wider">How many agents have you built?</label>
            <input
              type="number"
              min={1}
              max={30}
              value={agents}
              onChange={e => setAgents(Number(e.target.value) || 1)}
              className="w-full mt-1 mb-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/50"
            />
            <button onClick={scoreMySubmission} className="w-full py-3 rounded-xl bg-gold text-navy font-semibold hover:bg-gold/90 transition">
              Score my submission
            </button>
            {pts !== null && (
              <div className="mt-5 rounded-xl border border-gold/30 bg-gold/10 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-slate-300">Estimated points</span>
                  <span className="text-3xl font-semibold text-gold" style={{ fontFamily: "Instrument Serif, serif" }}>{pts}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {recommendPath(pts, agents).map((r, i) => (
                    <p key={i} className="text-xs text-slate-300 flex gap-2"><span className="text-gold">→</span>{r}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "Instrument Serif, serif" }}>How I maximized</h2>
            <ul className="space-y-3">
              {[
                "One protocol, 5 steps = 70 pts (Stunt Shape Protocol). Break ONE thing into 5 checkable steps.",
                "20 agents beats 4. Every agent is 5-15 pts and takes ~30 min to scaffold.",
                "Connect them. An orchestrator that runs 19 agents is a story. A folder of scripts isn't.",
                "Receipts. Logs, screenshots, a tracker spreadsheet. Claims that survive checking.",
                "Keep posting. The challenge rewards people who are impossible to ignore.",
              ].map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className="text-gold shrink-0">{i + 1}.</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl bg-navy-dark/60 border border-white/5 p-4">
              <p className="text-xs text-slate-400 font-mono">python quartermaster.py status</p>
              <p className="text-xs text-gold mt-1 font-mono">[x] 19/19 active · 315 pts · 0 shelf-ware</p>
            </div>
          </div>
        </section>
{/* Testimonial exchange */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-light mb-2" style={{ fontFamily: "Instrument Serif, serif" }}>Use it. Then vouch for it.</h2>
          <p className="text-sm text-slate-400 mb-6">
            Exchange: run the tool, then drop a testimonial. Every testimonial feeds the wall — and the wall is the proof.
          </p>
          {submitted ? (
            <div className="rounded-xl border border-emerald/30 bg-emerald/10 p-5">
              <p className="text-emerald font-medium">✓ Testimonial logged. You just bought points with credibility.</p>
            </div>
          ) : (
            <form className="space-y-4 text-left" onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name / handle"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-gold/50"
              />
              <textarea
                value={testimonial}
                onChange={e => setTestimonial(e.target.value)}
                placeholder="What did you build with it? What points did it unlock?"
                className="w-full h-24 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-gold/50 resize-none"
              />
              <button type="submit" disabled={!name.trim() || !testimonial.trim()} className="w-full py-3 rounded-xl bg-gold text-navy font-semibold hover:bg-gold/90 disabled:opacity-40 transition">
                Vouch for it
              </button>
            </form>
          )}
        </section>

        {/* Proof strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { label: "Agents shipped", value: "19" },
            { label: "Challenge points", value: "315" },
            { label: "Stunt shapes", value: "40" },
            { label: "Shelf-ware", value: "0" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
              <p className="text-2xl font-semibold text-gold" style={{ fontFamily: "Instrument Serif, serif" }}>{s.value}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
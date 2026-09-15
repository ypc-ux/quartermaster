"use client";
import { useState } from "react";

interface Rec {
  gpu: string; provider: string; pool: string; price_hr: number;
  deal_score: number; score_label: string; vram_gb: number | null;
  use_cases: string[]; why: string;
}

interface MatchResult {
  workload: string; task_type: string; vram_needed: number;
  input_summary: string; recommendations: Rec[];
}

export default function MatchPage() {
  const [mode, setMode] = useState<"repo" | "text">("repo");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState("");

  async function handleMatch() {
    if (!input.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const body = mode === "repo" ? { repo_url: input } : { description: input };
      const res = await fetch("/api/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      setResult(data);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  const sc = (s: number) => s >= 8 ? "#00ff88" : s >= 6 ? "#c9a227" : "#ef4444";

  return (
    <div style={{ minHeight: "100vh", background: "#050810", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(5,8,16,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,229,255,0.1)", padding: "0.8rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#00e5ff" }}>&#9889; GPU Matchmaker</div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <a href="/gpu.html" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>Live Prices</a>
          <a href="/audit.html" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>Free Audit</a>
        </div>
      </nav>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "4rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-block", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "#00e5ff", padding: "0.35rem 1rem", borderRadius: 100, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1.5rem" }}>What GPU Do You Need?</div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem" }}>
            <span style={{ background: "linear-gradient(127deg, #00E5FF 0%, #A855F7 60%, #00FF88 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tell us what you're building.</span><br /><span style={{ color: "#e2e8f0" }}>We'll find your GPU.</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>Paste a GitHub repo or describe your project. We match you with the cheapest GPUs that can actually handle it.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginBottom: "2rem" }}>
          {(["repo", "text"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setInput(""); setResult(null); }}
              style={{ padding: "0.75rem 1.5rem", borderRadius: 12, border: mode === m ? "1px solid rgba(0,229,255,0.4)" : "1px solid rgba(255,255,255,0.1)", background: mode === m ? "rgba(0,229,255,0.08)" : "transparent", color: mode === m ? "#00e5ff" : "#94a3b8", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
              {m === "repo" ? "\uD83D\uDD17 Paste a GitHub repo" : "\u270D\uFE0F Describe your project"}
            </button>
          ))}
        </div>
        <div style={{ background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 16, padding: "1.5rem", marginBottom: "2rem" }}>
          {mode === "repo" ? (
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleMatch()} placeholder="https://github.com/owner/repo"
              style={{ width: "100%", background: "#0A0E1A", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 12, padding: "1rem 1.25rem", color: "#e2e8f0", fontFamily: "'Inter', sans-serif", fontSize: "1.1rem", outline: "none" }} />
          ) : (
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={3} placeholder="I'm fine-tuning a 7B language model on 50K customer support conversations."
              style={{ width: "100%", background: "#0A0E1A", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 12, padding: "1rem 1.25rem", color: "#e2e8f0", fontFamily: "'Inter', sans-serif", fontSize: "1rem", outline: "none", resize: "vertical" }} />
          )}
          <button onClick={handleMatch} disabled={loading || !input.trim()}
            style={{ marginTop: "1rem", width: "100%", background: "#00e5ff", color: "#050810", border: "none", borderRadius: 12, padding: "1rem", fontSize: "1.1rem", fontWeight: 700, cursor: loading ? "wait" : "pointer", fontFamily: "'Inter', sans-serif", opacity: (!input.trim() || loading) ? 0.5 : 1 }}>
            {loading ? "Finding your GPU\u2026" : "Find My GPU \u2192"}
          </button>
        </div>
        {error && <p style={{ color: "#ef4444", textAlign: "center", marginBottom: "1rem" }}>{error}</p>}


        {result && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Workload: <span style={{ color: "#00e5ff", fontWeight: 600 }}>{result.task_type}</span> &middot; VRAM: <span style={{ color: "#00e5ff", fontWeight: 600 }}>{result.vram_needed}GB+</span></p>
              <p style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.25rem" }}>Based on: {result.input_summary}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {result.recommendations.map((r, i) => (
                <div key={i} style={{ background: "rgba(0,229,255,0.03)", border: i === 0 ? "1px solid rgba(0,229,255,0.3)" : "1px solid rgba(0,229,255,0.1)", borderRadius: 16, padding: "1.5rem", position: "relative" }}>
                  {i === 0 && <div style={{ position: "absolute", top: -10, left: 20, background: "#00e5ff", color: "#050810", padding: "0.2rem 0.75rem", borderRadius: 100, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Best Match</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" as const, gap: "1rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#e2e8f0", marginBottom: "0.3rem" }}>{r.gpu}</h3>
                      <p style={{ color: "#64748b", fontSize: "0.82rem" }}>{r.provider.toUpperCase()} &middot; {r.pool} &middot; {r.vram_gb ? `${r.vram_gb}GB` : "VRAM varies"}</p>
                    </div>
                    <div style={{ textAlign: "right" as const }}>
                      <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#00e5ff" }}>${r.price_hr.toFixed(2)}<span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 400 }}>/hr</span></div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: sc(r.deal_score) }}>{r.deal_score}/10 {r.score_label}</div>
                    </div>
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.75rem", marginBottom: "0.5rem" }}>{r.why}</p>
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0.4rem" }}>
                    {r.use_cases.map((uc, j) => (
                      <span key={j} style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: 100, background: "rgba(0,229,255,0.08)", color: "#00e5ff", border: "1px solid rgba(0,229,255,0.15)" }}>{uc}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center" as const, marginTop: "2rem", padding: "1.5rem", background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 16 }}>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "0.75rem" }}>Want us to manage these GPUs for you?</p>
              <a href="/audit.html" style={{ display: "inline-block", background: "#00e5ff", color: "#050810", padding: "0.75rem 2rem", borderRadius: 10, fontSize: "0.95rem", fontWeight: 700, textDecoration: "none" }}>Get a Free Audit \u2192</a>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div style={{ textAlign: "center" as const, padding: "2rem", color: "#64748b" }}>
            <p style={{ fontSize: "0.9rem" }}>
              Try: {[
                { label: "fine-tuning a 7B model", text: "I'm fine-tuning a 7B model for customer support chat" },
                { label: "Stable Diffusion XL", text: "Running Stable Diffusion XL for image generation, about 10 hours a week" },
                { label: "70B LLM inference", text: "Serving a 70B LLM as an API for my startup, need low latency" },
              ].map((ex, i) => (
                <span key={i}>{i > 0 && " \u00B7 "}<button onClick={() => { setMode("text"); setInput(ex.text); }} style={{ background: "none", border: "none", color: "#00e5ff", cursor: "pointer", fontSize: "0.9rem", textDecoration: "underline" }}>{ex.label}</button></span>
              ))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

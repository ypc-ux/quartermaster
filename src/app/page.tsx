"use client";
import { useState } from "react";

interface Rec {
  gpu: string; provider: string; pool: string; price_hr: number;
  deal_score: number; score_label: string; vram_gb: number | null;
  use_cases: string[]; why: string;
}

export default function HomePage() {
  const [mode, setMode] = useState<"repo" | "text">("text");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Rec[] | null>(null);
  const [taskType, setTaskType] = useState("");
  const [error, setError] = useState("");

  async function handleMatch() {
    if (!input.trim()) return;
    setLoading(true); setError(""); setRecs(null);
    try {
      const body = mode === "repo" ? { repo_url: input } : { description: input };
      const res = await fetch("/api/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      setRecs(data.recommendations || []);
      setTaskType(data.task_type || "");
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  const sc = (s: number) => s >= 8 ? "#00ff88" : s >= 6 ? "#c9a227" : "#ef4444";

  return (
    <div style={{ minHeight: "100vh", background: "#050810", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(5,8,16,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,229,255,0.1)", padding: "0.8rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#00e5ff" }}>&#9889; GPU Trust</div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <a href="/gpu.html" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>Live Prices</a>
          <a href="/calculator.html" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>Calculator</a>
          <a href="/audit.html" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>Free Audit</a>
          <a href="/match" style={{ color: "#00e5ff", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>Matchmaker</a>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "5rem 2rem 3rem", textAlign: "center" as const }}>
        <div style={{ display: "inline-block", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "#00e5ff", padding: "0.35rem 1rem", borderRadius: 100, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: "1.5rem" }}>152 live offers &middot; 84 GPU models &middot; Free</div>
        <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 800, lineHeight: 1.08, marginBottom: "1rem" }}>
          <span style={{ background: "linear-gradient(127deg,#00E5FF 0%,#A855F7 60%,#00FF88 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GPU prices are broken.</span><br/><span style={{ color: "#e2e8f0" }}>We tell you the truth.</span>
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: 520, margin: "0 auto 2.5rem", lineHeight: 1.6 }}>The same H100 costs $6/hr on AWS and $2/hr on RunPod. We track every price, score every deal, and tell you which GPU fits your project &mdash; for free.</p>

        <div style={{ background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 16, padding: "1.5rem", maxWidth: 600, margin: "0 auto 2rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1rem" }}>
            {(["text","repo"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setInput(""); setRecs(null); }}
                style={{ padding: "0.5rem 1rem", borderRadius: 10, border: mode===m?"1px solid rgba(0,229,255,0.4)":"1px solid rgba(255,255,255,0.1)", background: mode===m?"rgba(0,229,255,0.08)":"transparent", color: mode===m?"#00e5ff":"#64748b", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
                {m==="text"?"Describe your project":"\uD83D\uDD17 Paste a repo"}
              </button>
            ))}
          </div>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&handleMatch()}
            placeholder={mode==="text"?"I'm fine-tuning a 7B model for customer support...":"https://github.com/owner/repo"}
            style={{ width: "100%", background: "#0A0E1A", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 12, padding: "0.9rem 1.25rem", color: "#e2e8f0", fontFamily: "'Inter',sans-serif", fontSize: "1rem", outline: "none" }} />
          <button onClick={handleMatch} disabled={loading||!input.trim()}
            style={{ marginTop: "0.75rem", width: "100%", background: "#00e5ff", color: "#050810", border: "none", borderRadius: 12, padding: "0.85rem", fontSize: "1rem", fontWeight: 700, cursor: loading?"wait":"pointer", fontFamily: "'Inter',sans-serif", opacity: (!input.trim()||loading)?0.5:1 }}>
            {loading?"Finding your GPU\u2026":"Find My GPU \u2192"}
          </button>
          {error && <p style={{ color: "#ef4444", textAlign: "center", marginTop: "0.75rem", fontSize: "0.85rem" }}>{error}</p>}
        </div>
      </div>

      {/* Results */}
      {recs && recs.length > 0 && (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 2rem 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Workload: <span style={{ color: "#00e5ff", fontWeight: 600 }}>{taskType}</span></p>
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: "1rem" }}>
            {recs.map((r, i) => (
              <div key={i} style={{ background: "rgba(0,229,255,0.03)", border: i===0?"1px solid rgba(0,229,255,0.3)":"1px solid rgba(0,229,255,0.1)", borderRadius: 14, padding: "1.25rem 1.5rem", position: "relative" as const }}>
                {i===0 && <div style={{ position: "absolute", top: -9, left: 18, background: "#00e5ff", color: "#050810", padding: "0.15rem 0.65rem", borderRadius: 100, fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" as const }}>Best Match</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" as const, flexWrap: "wrap" as const, gap: "0.75rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#e2e8f0", marginBottom: "0.2rem" }}>{r.gpu}</h3>
                    <p style={{ color: "#64748b", fontSize: "0.78rem" }}>{r.provider.toUpperCase()} &middot; {r.pool} &middot; {r.vram_gb?`${r.vram_gb}GB`:"VRAM varies"}</p>
                  </div>
                  <div style={{ textAlign: "right" as const }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#00e5ff" }}>${r.price_hr.toFixed(2)}<span style={{ fontSize: "0.8rem", color: "#64748b" }}>/hr</span></div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: sc(r.deal_score) }}>{r.deal_score}/10 {r.score_label}</div>
                  </div>
                </div>
                <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginTop: "0.5rem", marginBottom: "0.4rem" }}>{r.why}</p>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0.3rem" }}>
                  {r.use_cases.slice(0,3).map((uc,j) => (
                    <span key={j} style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem", borderRadius: 100, background: "rgba(0,229,255,0.08)", color: "#00e5ff" }}>{uc}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center" as const, marginTop: "1.5rem" }}>
            <a href="/audit.html" style={{ display: "inline-block", background: "#00e5ff", color: "#050810", padding: "0.7rem 2rem", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>Get a Free Audit \u2192</a>
          </div>
        </div>
      )}

      {/* Trust Stats */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "1rem", marginBottom: "3rem" }}>
          {[{v:"152",l:"Live Offers"},{v:"84",l:"GPU Models"},{v:"30-60%",l:"Avg Savings"},{v:"1-10",l:"Deal Scores"}].map((s,i) => (
            <div key={i} style={{ background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 12, padding: "1rem", textAlign: "center" as const }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#00e5ff" }}>{s.v}</div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.2rem" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
        {/* Free Tools */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1rem", marginBottom: "3rem" }}>
          {[
            { icon: "\uD83D\uDCCA", title: "Live Price Index", desc: "Cheapest GPUs right now, scored 1-10", href: "/gpu.html" },
            { icon: "\uD83E\uDDF0", title: "Cost Calculator", desc: "How much to train your AI model?", href: "/calculator.html" },
            { icon: "\uD83D\uDD0D", title: "GPU Matchmaker", desc: "Describe your project, get GPU recs", href: "/match" },
            { icon: "\uD83D\uDCE8", title: "Free Audit", desc: "We'll find where you're overpaying", href: "/audit.html" },
          ].map((t,i) => (
            <a key={i} href={t.href} style={{ background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 14, padding: "1.25rem", textDecoration: "none", color: "#e2e8f0" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{t.icon}</div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e2e8f0", marginBottom: "0.3rem" }}>{t.title}</h3>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.4 }}>{t.desc}</p>
            </a>
          ))}
        </div>

        {/* How it works */}
        <div style={{ background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 16, padding: "2rem", textAlign: "center" as const, marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e2e8f0", marginBottom: "1.5rem" }}>How it works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1.5rem" }}>
            {[
              { step: "1", title: "Describe", desc: "Paste a repo or tell us what you're building" },
              { step: "2", title: "We match", desc: "We find the cheapest GPUs that fit your workload" },
              { step: "3", title: "You save", desc: "Get a free audit and cut your bill 30-60%" },
            ].map((s,i) => (
              <div key={i}>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#00e5ff", marginBottom: "0.5rem" }}>{s.step}</div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "0.3rem" }}>{s.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.4 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      {/* Footer */}
      <div style={{ textAlign: "center" as const, padding: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <p style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: "0.4rem" }}><span style={{ color: "#00ff88" }}>&#9679;</span> powered by VoltageIndex</p>
        <p style={{ fontSize: "0.75rem", color: "#475569" }}>Prices live from Vast.ai and RunPod. Deal scores are deterministic, not vibes.</p>
      </div>
    </div>
  );
}
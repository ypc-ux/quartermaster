"use client";
import { useState } from "react";

const EXAMPLES = [
  { prompt: "A pricing card with 3 tiers", component: "pricing-cards" },
  { prompt: "A hero section with gradient text", component: "hero-gradient" },
  { prompt: "A feature grid with icons", component: "feature-grid" },
  { prompt: "A testimonial carousel", component: "testimonial" },
  { prompt: "A dashboard stats strip", component: "stats-strip" },
];

export default function UIGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  function generate(p: string) {
    setPrompt(p);
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1500);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050810", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(5,8,16,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,229,255,0.1)", padding: "0.8rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#00e5ff" }}>UI Generator</div>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a href="/home.html" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>Home</a>
          <a href="https://github.com/ypc-ux/quartermaster" target="_blank" style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "#00e5ff", padding: "0.35rem 0.9rem", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}>⭐ Star on GitHub</a>
        </div>
      </nav>

      <div style={{ textAlign: "center", padding: "4rem 2rem 2rem", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "#00e5ff", padding: "0.35rem 1rem", borderRadius: 100, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1.5rem" }}>Describe in English → Get shadcn component</div>
        <h1 style={{ fontSize: "clamp(2.5rem,6vw,4rem)", fontWeight: 800, lineHeight: 1.05, marginBottom: "1rem" }}>
          <span style={{ background: "linear-gradient(127deg, #00E5FF 0%, #7C3AED 35%, #A855F7 55%, #00FF88 100%)", backgroundSize: "300% 300%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Describe it.</span><br/><span style={{ color: "#e2e8f0" }}>Ship it.</span>
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#94a3b8", maxWidth: 500, margin: "0 auto" }}>Describe any UI component in plain English. Get production-ready shadcn/ui code.</p>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 2rem" }}>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A pricing card with 3 tiers: Basic $19/mo, Pro $59/mo, Agency $199/mo. Highlight the Pro tier." style={{ width: "100%", minHeight: 120, background: "#0A0E1A", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 12, padding: "1.25rem", color: "#e2e8f0", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", lineHeight: 1.6, resize: "vertical", outline: "none" }} />
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button onClick={() => generate(prompt)} disabled={!prompt.trim() || generating} style={{ background: prompt.trim() ? "#00e5ff" : "#1e293b", color: prompt.trim() ? "#050810" : "#475569", padding: "0.85rem 2.5rem", borderRadius: 8, fontWeight: 700, fontSize: "1rem", border: "none", cursor: prompt.trim() ? "pointer" : "not-allowed" }}>
            {generating ? "Generating..." : "Generate Component"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "3rem auto", padding: "0 2rem" }}>
        <div style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem", textAlign: "center" }}>Or try a preset</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {EXAMPLES.map((ex) => (
            <button key={ex.component} onClick={() => generate(ex.prompt)} style={{ background: "#0A0E1A", border: "1px solid rgba(0,229,255,0.08)", borderRadius: 10, padding: "1rem", color: "#e2e8f0", fontSize: "0.85rem", textAlign: "left", cursor: "pointer" }}>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem", color: "#00e5ff", fontSize: "0.75rem" }}>{ex.component}</div>
              <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{ex.prompt}</div>
            </button>
          ))}
        </div>
      </div>

      {generating && (
        <div style={{ maxWidth: 800, margin: "2rem auto", padding: "0 2rem", textAlign: "center" }}>
          <div style={{ background: "#0A0E1A", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 12, padding: "2rem" }}>
            <div style={{ color: "#00e5ff", fontWeight: 700, marginBottom: "0.5rem" }}>Generating component...</div>
            <div style={{ color: "#64748b", fontSize: "0.85rem" }}>Analyzing → mapping to shadcn primitives → building</div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 800, margin: "3rem auto", padding: "2rem", background: "linear-gradient(128deg, rgba(0,229,255,0.04), rgba(0,255,136,0.04) 60%, rgba(168,85,247,0.04))", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 20, textAlign: "center" }}>
        <div style={{ fontSize: "0.7rem", color: "#00e5ff", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Join the waitlist</div>
        <div style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>Get early access to the full generator</div>
        <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Full shadcn component generation. Export as React code. Free during beta.</div>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          <input type="email" placeholder="your@email.com" style={{ background: "#0A0E1A", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 8, padding: "0.75rem 1rem", color: "#e2e8f0", fontSize: "0.9rem", minWidth: 250, outline: "none" }} />
          <button style={{ background: "#00e5ff", color: "#050810", padding: "0.75rem 1.5rem", borderRadius: 8, fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(0,229,255,0.3)" }}>Join Waitlist</button>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <a href="https://github.com/ypc-ux/quartermaster" target="_blank" style={{ color: "#64748b", fontSize: "0.8rem", textDecoration: "none" }}>⭐ Star us on GitHub — it helps more than you think</a>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "2rem", color: "#64748b", fontSize: "0.8rem", borderTop: "1px solid rgba(0,229,255,0.06)", maxWidth: 800, margin: "0 auto" }}>
        <p><span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "#8b5cf6", padding: "0.3rem 0.7rem", borderRadius: 100, fontSize: "0.7rem", fontWeight: 500 }}><span style={{ width: 6, height: 6, background: "#8b5cf6", borderRadius: "50%", display: "inline-block" }}></span> powered by CATALYST</span></p>
        <p style={{ marginTop: "0.5rem" }}><a href="https://agentdatasync.com" style={{ color: "#00e5ff", textDecoration: "none" }}>agentdatasync.com</a></p>
      </div>
    </div>
  );
}
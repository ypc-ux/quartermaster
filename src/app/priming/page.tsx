"use client";
import { useState } from "react";

interface Fix {
  pattern: string;
  line: number;
  issue: string;
}

export default function PrimingPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ patterns: number; fixes: Fix[]; cleaned: string } | null>(null);
  const [scoring, setScoring] = useState(false);

  function score() {
    if (!text.trim()) return;
    setScoring(true);
    const stockWords = ["pivotal","testament","vital","significant","crucial","underscores","highlights","symbolizing","evolving","landscape","multifaceted","robust","holistic","synergy","paradigm","innovative","cutting-edge","intricate","meticulous","comprehensive","spearhead","foster","elevate","harness","delve","tapestry","leverage","underscore","alchemy","navigate","catalyze","pioneering","groundbreaking","transformative","resonate"];
    const chatbotPhrases = ["as an ai","i'm here to help","let me know","i'd be happy to","feel free to","don't hesitate to","i hope this helps","here's what i found","here's a breakdown","sure,","absolutely,","great question","excellent question"];
    const fillerPhrases = ["it's important to note that","it is important to note that","it's worth mentioning that","it should be noted that","that being said,","with that said,","moving forward,"];
    const lines = text.split("\n");
    const fixes: Fix[] = [];
    lines.forEach((line, i) => {
      const lower = line.toLowerCase();
      stockWords.forEach((w) => { if (lower.includes(w)) fixes.push({ pattern: "stock-word", line: i + 1, issue: `"${w}" is an AI stock word` }); });
      chatbotPhrases.forEach((p) => { if (lower.includes(p)) fixes.push({ pattern: "chatbot", line: i + 1, issue: `"${p}" sounds like a chatbot` }); });
      fillerPhrases.forEach((p) => { if (lower.includes(p)) fixes.push({ pattern: "filler", line: i + 1, issue: `"${p}" is filler` }); });
    });
    let cleaned = text;
    [...chatbotPhrases, ...fillerPhrases].forEach((p) => {
      cleaned = cleaned.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "");
    });
    setResult({ patterns: fixes.length, fixes, cleaned });
    setScoring(false);
  }

  const grade = result ? result.patterns === 0 ? "A" : result.patterns <= 3 ? "B" : result.patterns <= 7 ? "C" : result.patterns <= 12 ? "D" : "F" : null;
  const gradeColor = grade === "A" ? "#22c55e" : grade === "B" ? "#c9a227" : grade === "C" ? "#f97316" : "#ef4444";

  return (
    <div style={{ minHeight: "100vh", background: "#050810", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(5,8,16,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,229,255,0.1)", padding: "0.8rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#00e5ff" }}>Priming</div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <a href="/home.html" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>Home</a>
          <a href="/gpu.html" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>Price Index</a>
        </div>
      </nav>

      <div style={{ textAlign: "center", padding: "4rem 2rem 2rem", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "#00e5ff", padding: "0.35rem 1rem", borderRadius: 100, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1.5rem" }}>Paste → Score → Fix → Ship</div>
        <h1 style={{ fontSize: "clamp(2.5rem,6vw,4rem)", fontWeight: 800, lineHeight: 1.05, marginBottom: "1rem" }}>
          <span style={{ background: "linear-gradient(127deg, #00E5FF 0%, #7C3AED 35%, #A855F7 55%, #00FF88 100%)", backgroundSize: "300% 300%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Score your copy.</span><br/><span style={{ color: "#e2e8f0" }}>Kill the AI slop.</span>
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#94a3b8", maxWidth: 500, margin: "0 auto" }}>Paste your email, ad, post, or page copy. 37 AI patterns scored. Ship human, not robotic.</p>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 2rem" }}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your copy here..." style={{ width: "100%", minHeight: 200, background: "#0A0E1A", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 12, padding: "1.25rem", color: "#e2e8f0", fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", lineHeight: 1.6, resize: "vertical", outline: "none" }} />
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button onClick={score} disabled={!text.trim() || scoring} style={{ background: text.trim() ? "#00e5ff" : "#1e293b", color: text.trim() ? "#050810" : "#475569", padding: "0.85rem 2.5rem", borderRadius: 8, fontWeight: 700, fontSize: "1rem", border: "none", cursor: text.trim() ? "pointer" : "not-allowed", boxShadow: text.trim() ? "0 0 30px rgba(0,229,255,0.3)" : "none" }}>
            {scoring ? "Scoring..." : "Score My Copy"}
          </button>
        </div>
      </div>

      {result && (
        <div style={{ maxWidth: 800, margin: "3rem auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 80, height: 80, borderRadius: "50%", fontSize: "2rem", fontWeight: 800, background: grade === "A" ? "rgba(34,197,94,0.15)" : grade === "B" ? "rgba(201,162,39,0.15)" : grade === "C" ? "rgba(249,115,22,0.15)" : "rgba(239,68,68,0.15)", color: gradeColor, border: `2px solid ${gradeColor}` }}>{grade}</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, marginTop: "0.5rem", color: gradeColor }}>
              {grade === "A" ? "CLEAN — Ship it" : grade === "B" ? "GOOD — minor fixes" : grade === "C" ? "FAIR — needs work" : grade === "D" ? "RISKY — rewrite weak sections" : "FAIL — rewrite from scratch"}
            </div>
            <div style={{ color: "#64748b", fontSize: "0.85rem" }}>{result.patterns} patterns found</div>
          </div>

          {result.fixes.length > 0 && (
            <div style={{ background: "#0A0E1A", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: 700, marginBottom: "1rem", color: "#e2e8f0" }}>AI Patterns Found</div>
              {result.fixes.slice(0, 20).map((f, i) => (
                <div key={i} style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "1rem", alignItems: "baseline" }}>
                  <span style={{ color: "#64748b", fontSize: "0.75rem", minWidth: 40 }}>L{f.line}</span>
                  <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{f.issue}</span>
                  <span style={{ color: "#00e5ff", fontSize: "0.7rem", marginLeft: "auto" }}>{f.pattern}</span>
                </div>
              ))}
              {result.fixes.length > 20 && <div style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.5rem" }}>+{result.fixes.length - 20} more</div>}
            </div>
          )}

          <div style={{ background: "#0A0E1A", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 12, padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 700, color: "#e2e8f0" }}>Cleaned Version</div>
              <button onClick={() => navigator.clipboard.writeText(result.cleaned)} style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", color: "#00e5ff", padding: "0.3rem 0.75rem", borderRadius: 6, fontSize: "0.75rem", cursor: "pointer" }}>📋 Copy</button>
            </div>
            <pre style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{result.cleaned}</pre>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", padding: "3rem 2rem", color: "#64748b", fontSize: "0.8rem", borderTop: "1px solid rgba(0,229,255,0.06)", maxWidth: 800, margin: "0 auto" }}>
        <p><span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "#8b5cf6", padding: "0.3rem 0.7rem", borderRadius: 100, fontSize: "0.7rem", fontWeight: 500 }}><span style={{ width: 6, height: 6, background: "#8b5cf6", borderRadius: "50%", display: "inline-block" }}></span> powered by CATALYST</span></p>
        <p style={{ marginTop: "1rem" }}><a href="https://agentdatasync.com" style={{ color: "#00e5ff", textDecoration: "none" }}>agentdatasync.com</a></p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.7rem" }}>37 AI writing patterns detected. Deterministic scoring. No LLM calls.</p>
      </div>
    </div>
  );
}
"use client";

import GatewayFlow from "@/components/ui/gateway-flow";

export default function GatewayDemoPage() {
  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw", overflow: "hidden", background: "#000" }}>
      <GatewayFlow className="h-full w-full" />
      
      {/* Hero overlay content */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        pointerEvents: "none",
        textAlign: "center",
        padding: "2rem",
      }}>
        <div style={{
          display: "inline-block",
          background: "rgba(0,229,255,0.1)",
          border: "1px solid rgba(0,229,255,0.2)",
          color: "#00e5ff",
          padding: "0.4rem 1.2rem",
          borderRadius: "100px",
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: "2rem",
        }}>
          Live GPU Prices · Updated Hourly · Free Forever
        </div>

        <h1 style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "clamp(2.5rem, 6.5vw, 5rem)",
          fontWeight: 800,
          lineHeight: 1.05,
          maxWidth: 850,
          marginBottom: "1.5rem",
        }}>
          <span style={{
            background: "linear-gradient(135deg, #00e5ff 0%, #a855f7 50%, #00ff88 100%)",
            backgroundSize: "300% 300%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            GPU prices are broken.
          </span>
          <br />
          <span style={{ color: "#e2e8f0" }}>We fix them.</span>
        </h1>

        <p style={{
          fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
          color: "#94a3b8",
          maxWidth: 560,
          lineHeight: 1.7,
          marginBottom: "2.5rem",
        }}>
          The same H100 costs $6/hr on AWS and $2/hr on RunPod.
          We show you the cheapest GPUs live — with a score that tells you if it&apos;s actually a good deal.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", pointerEvents: "all" }}>
          <a
            href="/gpu.html"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#00e5ff",
              color: "#050810",
              padding: "0.9rem 2rem",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              boxShadow: "0 0 30px rgba(0,229,255,0.3)",
            }}
          >
            See live prices →
          </a>
          <a
            href="/calculator.html"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "transparent",
              color: "#94a3b8",
              padding: "0.9rem 2rem",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: "1rem",
              textDecoration: "none",
              border: "1px solid rgba(148,163,184,0.2)",
            }}
          >
            Calculate your cost
          </a>
        </div>

        <div style={{ display: "flex", gap: "3rem", marginTop: "4rem" }}>
          {[
            { val: "152", label: "Live Offers" },
            { val: "73", label: "GPU Models" },
            { val: "60%", label: "Avg Savings" },
            { val: "362", label: "Data Points" },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#00e5ff" }}>{val}</div>
              <div style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "0.25rem" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
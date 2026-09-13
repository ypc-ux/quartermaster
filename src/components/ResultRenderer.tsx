"use client";
import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handle() { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  return <button onClick={handle} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-slate-400 hover:text-gold hover:bg-white/[0.08] transition">{copied ? "✓" : "📋"}</button>;
}

function StatRow({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="text-right"><span className="text-sm font-medium text-white">{value}</span>{hint && <span className="text-[10px] text-slate-500 ml-2">{hint}</span>}</div>
    </div>
  );
}

export default function ResultRenderer({ data, agent }: { data: any; agent: string }) {
  if (!data) return null;
  const a = agent.toLowerCase().replace(/\s+/g, "_");

  // ─── HOOKS ───
  if (a === "hooks" && data?.hooks) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-slate-500 mb-3">{data.count} hooks for &quot;{data.topic}&quot; · Top {data.top_5?.length || 5} highlighted</p>
        {data.hooks.map((h: any, i: number) => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${h.score >= 25 ? "bg-gold/5 border border-gold/10" : "bg-white/[0.01] border border-white/5"}`}>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 shrink-0">{h.type}</span>
            <span className="text-sm text-white flex-1">{h.hook}</span>
            <span className="text-[10px] text-slate-500 w-8 text-right">{h.score}/30</span>
            <CopyButton text={h.hook} />
          </div>
        ))}
      </div>
    );
  }

  // ─── LAUNCH ───
  if (a === "launch" && data?.plan) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-white">{data.product}</span>
          <span className="text-[10px] text-slate-500">· {data.total_pieces} pieces · {data.emailSequence?.length || 0} emails</span>
        </div>
        {data.plan.map((p: any, i: number) => (
          <div key={i} className="rounded-lg border border-white/5 bg-white/[0.01] p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gold">Day {p.day}</span>
              <span className="text-xs font-medium text-white capitalize">{p.phase}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {p.pieces.map((pc: any, j: number) => (
                <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-400">{pc.type}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  // ─── CAROUSEL AD ───
  if (a === "ad_creative" && data?.format === "carousel" && data?.slides) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple/20 text-purple">carousel</span>
          <span className="text-[10px] text-slate-500">· {data.slides.length} slides · {data.platform}</span>
        </div>
        {data.slides.map((s: any, i: number) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.01] p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-purple/20 text-purple text-[10px] font-bold flex items-center justify-center">{s.slide}</span>
              <span className="text-xs font-medium text-white capitalize">{s.type}</span>
            </div>
            <p className="text-sm text-slate-300 mb-2">{s.text}</p>
            <p className="text-[10px] text-slate-500 italic">Visual: {s.visual}</p>
            {s.cta && <p className="text-xs text-gold mt-2">→ {s.cta}</p>}
          </div>
        ))}
        <div className="rounded-lg bg-gold/5 border border-gold/10 p-3">
          <p className="text-[10px] text-slate-400 mb-1">Caption</p>
          <p className="text-sm text-slate-300">{data.caption}</p>
          <CopyButton text={data.caption} />
        </div>
      </div>
    );
  }

  // ─── VIDEO AD ───
  if (a === "ad_creative" && data?.format === "video" && data?.script) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red/20 text-red-400">video {data.duration}</span>
          <span className="text-[10px] text-slate-500">· {data.total_shots} shots · {data.platform}</span>
        </div>
        {data.script.map((s: any, i: number) => (
          <div key={i} className="rounded-lg border border-white/5 bg-white/[0.01] p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-emerald">{s.time}</span>
              <span className="text-xs text-slate-400">{s.shot}</span>
            </div>
            <p className="text-sm text-white mb-1">"{s.line}"</p>
            <p className="text-[10px] text-slate-500 italic">{s.visual}</p>
          </div>
        ))}
      </div>
    );
  }

  // ─── STATIC AD ───
  if (a === "ad_creative" && data?.format === "static") {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gold/30 bg-gradient-to-br from-navy to-navy-dark p-8 text-center">
        <p className="text-[10px] uppercase tracking-wider text-gold mb-4">Preview · {data.platform} · {data.dimensions}</p>
        <h3 className="text-2xl font-light mb-3" style={{ fontFamily: "Instrument Serif, serif" }}>{data.headline}</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">{data.body}</p>
        <button className="px-8 py-3 rounded-xl bg-gold text-navy font-semibold">{data.cta}</button>
        <p className="text-[10px] text-slate-600 mt-4 italic">{data.visual}</p>
      </div>
    );
  }
  // ─── OUTREACH ───
  if (a === "outreach" && data?.action === "select_lever") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg font-light text-gold" style={{ fontFamily: "Instrument Serif, serif" }}>{data.result?.lever?.name}</span>
          <span className="text-xs text-slate-500">· Score: {data.result?.score}/10</span>
        </div>
        <p className="text-sm text-slate-300 mb-2">{data.result?.lever?.desc}</p>
        <p className="text-xs text-slate-500 mb-2">When to use: {data.result?.lever?.when}</p>
        <p className="text-xs text-slate-400 italic">{data.result?.reason}</p>
      </div>
    );
  }

  // ─── STORY SEQUENCE ───
  if (a === "story_sequence" && data?.action === "sequence" && data?.sequence) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${data.lead?.classification === "hot" ? "bg-emerald/20 text-emerald" : data.lead?.classification === "warm" ? "bg-gold/20 text-gold" : "bg-slate-500/20 text-slate-400"}`}>{data.lead?.classification}</span>
          <span className="text-[10px] text-slate-500">· Score: {data.lead?.score}/100 · {data.lead?.next_action}</span>
        </div>
        {data.sequence.map((s: any, i: number) => (
          <div key={i} className="rounded-lg border border-white/5 bg-white/[0.01] p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-gold">Day {s.day}</span>
              <span className="text-xs text-slate-400 capitalize">{s.channel}</span>
              <span className="text-[10px] text-slate-500 capitalize">· {s.phase}</span>
            </div>
            <p className="text-sm font-medium text-white mb-1">Subject: {s.subject}</p>
            <p className="text-xs text-slate-300 mb-2 whitespace-pre-wrap">{s.body}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-emerald">→ {s.cta}</p>
              <CopyButton text={s.body} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── RESEARCH ───
  if (a === "research" && data?.scans) {
    return (
      <div className="space-y-3">
        {data.live_results?.length > 0 && (
          <div className="rounded-lg border border-emerald/10 bg-emerald/5 p-4 mb-2">
            <p className="text-xs text-emerald mb-2">✓ Live search results</p>
            {data.live_results.map((r: any, i: number) => (
              <a key={i} href={r.url} target="_blank" rel="noopener" className="block text-xs text-blue-400 hover:underline mb-1">{r.title}</a>
            ))}
          </div>
        )}
        {data.scans.map((s: any, i: number) => (
          <div key={i} className="rounded-lg border border-white/5 bg-white/[0.01] p-3">
            <p className="text-sm font-medium text-white mb-1">{s.competitor}</p>
            <p className="text-xs text-slate-400 mb-1">{s.positioning}</p>
            <p className="text-xs text-slate-500">{s.notes}</p>
          </div>
        ))}
        {data.key_findings?.length > 0 && (
          <div className="rounded-lg bg-gold/5 border border-gold/10 p-3">
            <p className="text-xs text-gold mb-2">Key Findings</p>
            {data.key_findings.map((f: string, i: number) => <p key={i} className="text-xs text-slate-300 mb-1">→ {f}</p>)}
          </div>
        )}
      </div>
    );
  }

  // ─── BIO ───
  if (a === "bio" && data?.bios) {
    return (
      <div className="space-y-2">
        {Object.entries(data.bios).map(([platform, bio]: [string, any]) => (
          <div key={platform} className="rounded-lg border border-white/5 bg-white/[0.01] p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-white capitalize">{platform}</span>
              <span className="text-[10px] text-slate-500">{data.char_counts?.[platform]} chars</span>
            </div>
            <p className="text-sm text-slate-300 mb-2">{bio}</p>
            <CopyButton text={bio} />
          </div>
        ))}
      </div>
    );
  }
  // ─── REPURPOSE ───
  if (a === "repurpose" && data?.pieces) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-slate-500 mb-2">Source: &quot;{data.source_idea}&quot;</p>
        {Object.entries(data.pieces).map(([platform, content]: [string, any]) => (
          <div key={platform} className="rounded-lg border border-white/5 bg-white/[0.01] p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-white capitalize">{platform}</span>
            </div>
            <p className="text-xs text-slate-300 mb-2 whitespace-pre-wrap">{typeof content === "string" ? content : JSON.stringify(content).slice(0, 200)}</p>
            <CopyButton text={typeof content === "string" ? content : JSON.stringify(content)} />
          </div>
        ))}
      </div>
    );
  }

  // ─── FINANCE ───
  if (a === "finance" && data?.summary) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            { l: "Revenue", v: `$${data.summary.total_revenue?.toLocaleString()}` },
            { l: "Expenses", v: `$${data.summary.total_expenses?.toLocaleString()}` },
            { l: "Net Profit", v: `$${data.summary.profit?.toLocaleString()}` },
            { l: "Margin", v: `${data.summary.margin_pct}%` },
          ].map((s, i) => (
            <div key={i} className="rounded-lg border border-white/5 bg-white/[0.01] p-3 text-center">
              <p className="text-[10px] text-slate-500 mb-1">{s.l}</p>
              <p className="text-lg font-semibold text-gold" style={{ fontFamily: "Instrument Serif, serif" }}>{s.v}</p>
            </div>
          ))}
        </div>
        {data.insights?.map((ins: string, i: number) => <p key={i} className="text-xs text-slate-400">→ {ins}</p>)}
      </div>
    );
  }

  // ─── ANALYTICS / DIGEST ───
  if ((a === "analytics" || a === "digest") && data?.metrics) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-slate-500 mb-2">{data.period || data.date}</p>
        {(data.metrics || []).map((m: any, i: number) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded bg-white/[0.02]">
            <span className="text-xs text-white w-24">{m.metric || m.kpi}</span>
            <span className="text-sm font-mono text-gold">{m.current || m.value}</span>
            {m.trend && <span className={`text-[10px] ${m.trend === "up" ? "text-emerald" : m.trend === "down" ? "text-red-400" : "text-slate-400"}`}>{m.trend === "up" ? "↑" : m.trend === "down" ? "↓" : "→"}</span>}
          </div>
        ))}
        {data.insights?.map((ins: string, i: number) => <p key={i} className="text-xs text-slate-400 mt-2">→ {ins}</p>)}
      </div>
    );
  }

  // ─── COMMANDER / BRAINWASH ───
  if ((a === "commander_frame" || a === "commander frame") && data?.pain) {
    return (
      <div className="space-y-3">
        {[
          { l: "Pain", v: `${data.pain?.surface} → ${data.pain?.real}` },
          { l: "Weakest", v: `${data.value_equation?.weakest} (${data.value_equation?.score})` },
          { l: "Attribution", v: data.attribution?.verdict },
          { l: "Voice", v: data.voice },
        ].map((row, i) => <StatRow key={i} label={row.l} value={row.v} />)}
      </div>
    );
  }

  if (a === "brainwash_os" && data?.layers) {
    return (
      <div className="space-y-3">
        <div className="text-center mb-2">
          <span className="text-3xl font-light text-gold" style={{ fontFamily: "Instrument Serif, serif" }}>{data.total}/{data.max}</span>
          <span className="text-xs text-slate-500 ml-2">({data.pct}%)</span>
        </div>
        {data.layers.map((l: any, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-24">{l.layer}</span>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gold rounded-full" style={{ width: `${(l.score / 10) * 100}%` }} /></div>
            <span className="text-xs text-slate-300 w-6 text-right">{l.score}</span>
          </div>
        ))}
        <p className="text-xs text-gold mt-2">Fix first: {data.fix_first}</p>
      </div>
    );
  }

  // ─── SITE ───
  if (a === "site" && data?.sections) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-gold/20 bg-gold/5 p-4">
          <p className="text-sm text-gold">✓ Site spec generated</p>
          <p className="text-xs text-slate-400 mt-1">View it live at <a href="/" className="text-blue-400 underline">/</a></p>
        </div>
        <StatRow label="Hero" value={data.sections.hero?.headline?.split("\n")[0]?.slice(0, 50) || ""} />
        <StatRow label="Arsenal" value={`${data.sections.arsenal?.agents?.length || 0} agents`} />
        <StatRow label="Pricing tiers" value={`${data.sections.pricing?.tiers?.length || 0}`} />
        <StatRow label="BTS steps" value={`${data.sections.bts?.steps?.length || 0}`} />
      </div>
    );
  }

  // ─── DEFAULT: RAW JSON WITH COPY ───
  const json = JSON.stringify(data, null, 2);
  return (
    <div className="relative">
      <div className="absolute top-2 right-2"><CopyButton text={json} /></div>
      <pre className="text-xs text-slate-300 bg-navy-dark/50 rounded-lg p-4 overflow-auto max-h-72 font-mono whitespace-pre-wrap">{json}</pre>
    </div>
  );
}
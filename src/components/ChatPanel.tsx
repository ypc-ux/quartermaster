"use client";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "agent"; content: string; agent?: string; humanize?: number; points?: number };

export default function ChatPanel({ onResult }: { onResult?: (r: any) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: text.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessages(prev => [...prev, { role: "agent", content: `Error: ${data.error || "Command failed"}` }]);
      } else {
        const summary = formatResponse(data);
        setMessages(prev => [...prev, {
          role: "agent", content: summary,
          agent: data.agent?.name?.replace(/_/g, " "),
          humanize: data.humanize?.patterns_found || 0,
          points: data.agent?.points,
        }]);
        onResult?.(data);
        // Log trace to localStorage
        try {
          const traces = JSON.parse(localStorage.getItem("qb_traces") || "[]");
          traces.push({
            id: `t_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
            timestamp: new Date().toISOString(),
            agent: data.agent?.name || "unknown",
            command: text.trim(),
            humanize_report: data.humanize || { patterns_found: 0, fixes: [] },
            latency_ms: data.took_ms || 0,
          });
          localStorage.setItem("qb_traces", JSON.stringify(traces.slice(-500)));
        } catch {}
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "agent", content: `Network error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }
  function formatResponse(d: any): string {
    const a = (d.agent?.name || "agent").replace(/_/g, " ");
    const v = d.data;
    if (a === "hooks" && v?.hooks) return `**${a}** ${v.count} hooks:\n${v.hooks.slice(0, 5).map((h: any, i: number) => `${i + 1}. ${h.hook}`).join("\n")}${v.hooks.length > 5 ? "\n..." : ""}`;
    if (a === "launch" && v?.plan) return `**${a}** ${v.product}:\n${v.plan.map((p: any) => `D${p.day}: ${p.phase} (${p.pieces.length}p)`).join("\n")}\n+${v.emailSequence?.length || 0} emails`;
    if (a === "site" && v?.sections) return `**${a}** site spec ready:\n• "${v.sections.hero?.headline?.split("\n")[0]}"\n• ${v.sections.arsenal?.agents?.length || 0} agents\n• ${v.sections.pricing?.tiers?.length || 0} tiers\n→ Live at /`;
    if (a === "research" && v?.scans) return `**${a}** ${v.query}:\n${v.scans.map((s: any) => `• ${s.competitor}: ${s.notes || s.positioning}`).join("\n")}`;
    if (a === "commander frame") return `**${a}** done.\nPain: ${v?.pain?.surface}\nWeakest: ${v?.value_equation?.weakest}\nVerdict: ${v?.attribution?.verdict}`;
    if (a === "brainwash os") return `**${a}** ${v?.total}/${v?.max} (${v?.pct}%)\nWeakest: ${v?.weakest_layer}\nFix: ${v?.fix_first}`;
    return `**${a}** executed.\n${JSON.stringify(v, null, 2).slice(0, 350)}${JSON.stringify(v).length > 350 ? "..." : ""}`;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-12 space-y-2">
            <p className="text-gold text-xs uppercase tracking-wider">QuarterBack Chat</p>
            <p>Type a command. Agents execute in real time.</p>
            <p className="text-slate-600 text-xs mt-4">Try: &quot;10 hooks for agency OS&quot; · &quot;research AI competitors&quot; · &quot;build my website&quot;</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-gold text-navy font-medium" : "bg-white/[0.03] border border-white/10 text-white"}`}>
              {msg.role === "agent" && msg.agent && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                  <span className="w-2 h-2 rounded-full bg-emerald pulse-dot" />
                  <span className="text-xs font-mono text-emerald">{msg.agent}</span>
                  {msg.points && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-gold/10 text-gold">{msg.points}pts</span>}
                  {msg.humanize !== undefined && msg.humanize > 0 && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald/10 text-emerald">humanized: {msg.humanize} patterns</span>}
                </div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-400 animate-pulse">Executing agent...</div></div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={e => { e.preventDefault(); send(input); }} className="p-4 border-t border-white/5">
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="10 hooks · research · build my website..." className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-gold/50" disabled={loading} />
          <button type="submit" disabled={loading || !input.trim()} className="px-5 py-3 rounded-xl bg-gold text-navy font-semibold hover:bg-gold/90 disabled:opacity-40 transition">{loading ? "..." : "Send"}</button>
        </div>
      </form>
    </div>
  );
}
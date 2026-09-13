"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";

export default function CommandPalette({ onExecute }: { onExecute?: (cmd: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(prev => !prev); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  async function execute(cmd: string) {
    if (!cmd.trim() || loading) return;
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch("/api/command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command: cmd.trim() }) });
      const data = await res.json();
      if (data.success) {
        toast(`✓ ${data.agent?.name?.replace(/_/g, " ")} · ${data.agent?.points || 0}pts · humanized ${data.humanize?.patterns_found || 0}`, "success");
        onExecute?.(cmd);
      } else {
        toast(`✗ ${data.error || "Command failed"}`, "error");
      }
    } catch (e: any) { toast(`✗ ${e.message}`, "error"); }
    finally { setLoading(false); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[20vh] bg-navy/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-navy-light shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-4">
          <span className="text-gold text-sm">⌘K</span>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && execute(query)}
            placeholder="Type a command — build my website, 10 hooks, research AI…"
            className="flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none text-lg" />
          {loading && <span className="text-gold text-xs animate-pulse">Running…</span>}
        </div>
        <div className="border-t border-white/5 px-5 py-3 flex flex-wrap gap-2">
          {["build my website", "10 hooks", "launch QuarterBack", "carousel ad", "research AI", "lead score", "story sequence"].map(cmd => (
            <button key={cmd} onClick={() => execute(cmd)} disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-slate-400 hover:text-gold hover:border-gold/30 transition">
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
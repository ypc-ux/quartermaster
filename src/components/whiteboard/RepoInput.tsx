"use client";
import { useState } from "react";

interface Props {
  onSubmit: (value: string) => void;
  loading: boolean;
  value: string;
  onChange: (v: string) => void;
}

export default function RepoInput({ onSubmit, loading, value, onChange }: Props) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(value); }}
      className="flex items-center gap-3 w-full"
    >
      <div className="flex-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 focus-within:border-gold/50 transition">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-slate-400 shrink-0">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="github.com/owner/repo or owner/repo"
          className="flex-1 bg-transparent text-white placeholder:text-slate-500 text-sm focus:outline-none"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="px-5 py-3 rounded-xl bg-gold text-navy font-semibold hover:bg-gold/90 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
      >
        {loading ? "Loading…" : "Visualize"}
      </button>
    </form>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/command", label: "Command" },
  { href: "/whiteboard", label: "Whiteboard" },
  { href: "/skills", label: "Skills" },
  { href: "/eval", label: "Eval" },
  { href: "/traces", label: "Traces" },
  { href: "/analytics", label: "Analytics" },
  { href: "/community", label: "Community" },
];

export default function AppHeader({ version }: { version?: string }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-navy/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-5">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold to-amber-400 flex items-center justify-center text-navy text-xs font-bold">Q</div>
          <span className="text-sm font-semibold tracking-tight hidden sm:inline" style={{ fontFamily: "Instrument Serif, serif" }}>QuarterBack</span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${pathname === n.href ? "bg-gold/15 text-gold" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {version && <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${version === "green" ? "bg-emerald/15 text-emerald border border-emerald/20" : "bg-blue-400/15 text-blue-400 border border-blue-400/20"}`}>{version === "green" ? "🟢 GREEN" : "🔵 BLUE"}</span>}
          <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-[9px] text-slate-500">
            <span>⌘</span>K
          </kbd>
        </div>
      </div>
    </header>
  );
}
"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };
const GROUP_COLORS: Record<string, string> = { strategy: "#a855f7", content: "#10b981", ops: "#22d3ee" };

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-navy text-white overflow-x-hidden">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />
        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 max-w-4xl mx-auto space-y-6">
          <motion.p variants={fadeUp} className="text-gold text-xs uppercase tracking-[0.3em]">Agent Data Sync Presents</motion.p>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95]" style={{ fontFamily: "Instrument Serif, serif" }}>
            Stop wearing every hat.<br /><em className="text-gold not-italic">Start running your business.</em>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
            The operating system that runs your agency without you. 19 connected agents. One command center. Zero shelf-ware.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/command" className="px-8 py-3.5 rounded-xl bg-gold text-navy font-semibold hover:bg-gold/90 transition text-lg">Enter the Command Center</Link>
            <a href="#arsenal" className="px-8 py-3.5 rounded-xl border border-gold/40 text-gold font-medium hover:bg-gold/10 transition text-lg">See the Arsenal ↓</a>
          </motion.div>
        </motion.div>
        <div className="absolute bottom-8 animate-bounce text-gold/50 text-2xl">↓</div>
      </section>

      {/* PROBLEM */}
      <section className="py-28 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="max-w-3xl mx-auto space-y-8">
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-light" style={{ fontFamily: "Instrument Serif, serif" }}>
            You built the agency. <em className="text-gold not-italic">Now it runs you.</em>
          </motion.h2>
          <motion.ul variants={stagger} className="space-y-4">
            {["You do sales, ops, content, finance, analytics — solo.", "Every new client means more hats, not more systems.", "Your competitors are shipping 3x faster with half the team.", "You don't need another tool. You need an operating system."].map((b, i) => (
              <motion.li key={i} variants={fadeUp} className="flex gap-3 text-slate-300 text-lg"><span className="text-gold shrink-0 mt-1">→</span><span>{b}</span></motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </section>
{/* SOLUTION */}
      <section className="py-28 px-6 bg-white/[0.01]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-light" style={{ fontFamily: "Instrument Serif, serif" }}>One command. Every agent executes.</motion.h2>
            <motion.p variants={fadeUp} className="text-slate-300 text-lg max-w-2xl mx-auto">QuarterBack runs 19 connected agents from a single command center. Research, content, launches, analytics, finance — all wired together.</motion.p>
          </div>
          <motion.div variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "⚡", title: "Command Center", desc: "Type what you want built. Agents execute." },
              { icon: "🎯", title: "Stunt Protocol", desc: "5-step PR engine: finds, generates, logs, pitches." },
              { icon: "📊", title: "Ops Digest", desc: "One morning read. Everything that happened overnight." },
              { icon: "💡", title: "Content Engine", desc: "1 idea → 6 platforms. Hooks, threads, blogs — auto." },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-gold/20 transition">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ARSENAL */}
      <section id="arsenal" className="py-28 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-light" style={{ fontFamily: "Instrument Serif, serif" }}>The Agent Arsenal</motion.h2>
            <motion.p variants={fadeUp} className="text-slate-300 text-lg">19 connected agents. 315 challenge points. Zero shelf-ware.</motion.p>
          </div>
          <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[
              { name: "Stunt Protocol", pts: 70, group: "strategy", desc: "5-step PR engine" },
              { name: "Commander Frame", pts: 15, group: "strategy", desc: "6-stage diagnostic" },
              { name: "Brainwash OS", pts: 15, group: "strategy", desc: "7-layer culture" },
              { name: "Research", pts: 15, group: "strategy", desc: "Market scans" },
              { name: "Trend Adapter", pts: 10, group: "strategy", desc: "Trends → brand" },
              { name: "Launch Mode", pts: 15, group: "strategy", desc: "7-day plans" },
              { name: "Twitter Agent", pts: 15, group: "content", desc: "10-50 tweets/day" },
              { name: "Content Engine", pts: 15, group: "content", desc: "All channels" },
              { name: "Brand Vault", pts: 15, group: "content", desc: "1 → 6 platforms" },
              { name: "Hook Workroom", pts: 10, group: "content", desc: "20+ hooks" },
              { name: "Batch Planner", pts: 10, group: "content", desc: "Batch days" },
              { name: "Bio Optimizer", pts: 5, group: "content", desc: "Optimize bios" },
              { name: "Grid Preview", pts: 5, group: "content", desc: "IG grid" },
              { name: "Ops Digest", pts: 10, group: "ops", desc: "Daily briefing" },
              { name: "Analytics", pts: 15, group: "ops", desc: "KPI tracking" },
              { name: "Finance", pts: 10, group: "ops", desc: "Revenue/expenses" },
              { name: "Collab Tracker", pts: 10, group: "ops", desc: "Partnerships" },
              { name: "Community", pts: 10, group: "ops", desc: "Engagement" },
              { name: "Sunday Reset", pts: 5, group: "ops", desc: "Weekly review" },
            ].map((a, i) => (
              <motion.div key={i} variants={fadeUp} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:border-gold/20 transition group">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: GROUP_COLORS[a.group] }} />
                  <span className="text-sm font-medium text-white truncate">{a.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-1">{a.desc}</p>
                <span className="text-[10px] font-mono text-gold">{a.pts} pts</span>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center"><span className="inline-block px-6 py-2 rounded-full border border-gold/30 bg-gold/10 text-gold font-mono text-sm">Total: 315 points</span></div>
        </motion.div>
      </section>
{/* BTS */}
      <section className="py-28 px-6 bg-white/[0.01]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-light" style={{ fontFamily: "Instrument Serif, serif" }}>The Marketing That Sells It</motion.h2>
            <motion.p variants={fadeUp} className="text-slate-300 text-lg">Every move is public. The strategy, the stunts, the receipts.</motion.p>
          </div>
          <motion.div variants={stagger} className="grid md:grid-cols-4 gap-5">
            {[
              { step: "1", title: "Score", desc: "Paste any repo → instant rubric breakdown." },
              { step: "2", title: "Stunt", desc: "40 campaign shapes → 20 ideas → artifacts." },
              { step: "3", title: "Stack", desc: "Build connected agents. Each scores points." },
              { step: "4", title: "Ship", desc: "Post the demo. Let the tool do the talking." },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center">
                <div className="text-2xl font-light text-gold mb-2" style={{ fontFamily: "Instrument Serif, serif" }}>{s.step}</div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: "Repos Scored", value: "42" },
              { label: "Testimonials", value: "3" },
              { label: "Repos Visualized", value: "87" },
              { label: "Challenge Points", value: "315" },
            ].map((k, i) => (
              <motion.div key={i} variants={fadeUp} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
                <p className="text-2xl font-semibold text-gold" style={{ fontFamily: "Instrument Serif, serif" }}>{k.value}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{k.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>
{/* PRICING */}
      <section className="py-28 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="max-w-5xl mx-auto space-y-12">
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-light text-center" style={{ fontFamily: "Instrument Serif, serif" }}>Choose your operating system</motion.h2>
          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Solo", price: "$99", period: "/mo", features: ["1 user", "All 19 agents", "Command Center", "Whiteboard", "Ops Digest"], featured: false },
              { name: "Agency", price: "$299", period: "/mo", features: ["5 users", "Everything in Solo", "Client dashboards", "Brand Vault", "Launch Mode"], featured: true },
              { name: "Studio", price: "$999", period: "/mo", features: ["Unlimited users", "Everything in Agency", "White-label", "Priority support", "Custom agents"], featured: false },
            ].map((tier, i) => (
              <motion.div key={i} variants={fadeUp} className={`rounded-2xl border p-6 ${tier.featured ? "border-gold/50 bg-gold/5 ring-1 ring-gold/20" : "border-white/5 bg-white/[0.02]"}`}>
                {tier.featured && <div className="text-xs text-gold uppercase tracking-wider mb-3 font-medium">Most popular</div>}
                <h3 className="text-xl font-semibold mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-4xl font-light" style={{ fontFamily: "Instrument Serif, serif" }}>{tier.price}</span>
                  <span className="text-slate-500 text-sm">{tier.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {tier.features.map((f, j) => <li key={j} className="flex gap-2 text-sm text-slate-300"><span className="text-gold">✓</span>{f}</li>)}
                </ul>
                <button className={`w-full py-3 rounded-xl font-semibold transition ${tier.featured ? "bg-gold text-navy hover:bg-gold/90" : "border border-gold/40 text-gold hover:bg-gold/10"}`}>Start {tier.name}</button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>
{/* FINAL CTA */}
      <section className="py-28 px-6 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="max-w-3xl mx-auto space-y-6">
          <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-light" style={{ fontFamily: "Instrument Serif, serif" }}>
            Your agency should run <em className="text-gold not-italic">without you.</em>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-300 text-lg">Type one command. Watch 19 agents execute.</motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/command" className="inline-block px-10 py-4 rounded-xl bg-gold text-navy font-semibold text-lg hover:bg-gold/90 transition">Enter the Command Center →</Link>
          </motion.div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-xs text-slate-500 space-y-2">
        <p>QuarterBack by Agent Data Sync</p>
        <div className="flex items-center justify-center gap-4">
          <a href="https://github.com/ypc-ux/quartermaster" className="hover:text-gold transition">GitHub</a>
          <a href="/community" className="hover:text-gold transition">Community</a>
          <a href="/whiteboard" className="hover:text-gold transition">Whiteboard</a>
          <a href="/command" className="hover:text-gold transition">Command Center</a>
        </div>
      </footer>
    </main>
  );
}
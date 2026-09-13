// Site builder agent — generates a one-pager marketing site spec.

import type { AgentResult } from "./strategy";

function time<T>(agent: string, fn: () => T): AgentResult {
  const t0 = Date.now();
  return { ok: true, agent, data: fn(), took_ms: Date.now() - t0 };
}

export function site(args: { product?: string; tagline?: string; audience?: string } = {}) {
  const product = args.product || "QuarterBack";
  const tagline = args.tagline || "The operating system that runs your agency without you.";
  const audience = args.audience || "agency owners";

  return time("site", () => ({
    meta: { title: `${product} by Agent Data Sync`, description: tagline, domain: "agentdatasync.com" },
    sections: {
      hero: {
        type: "hero",
        badge: "Agent Data Sync Presents",
        headline: "Stop wearing every hat.\nStart running your business.",
        subheadline: tagline,
        cta: { label: "Enter the Command Center", href: "/command" },
        cta2: { label: "See the Arsenal ↓", href: "#arsenal" },
      },
      problem: {
        type: "problem",
        headline: "You built the agency. Now it runs you.",
        bullets: [
          "You do sales, ops, content, finance, analytics — solo.",
          "Every new client means more hats, not more systems.",
          "Your competitors are shipping 3x faster with half the team.",
          "You don't need another tool. You need an operating system.",
        ],
        cta: "There's a better way.",
      },
      solution: {
        type: "solution",
        headline: "One command. Every agent executes.",
        subheadline: `${product} runs 19 connected agents from a single command center.`,
        features: [
          { icon: "⚡", title: "Command Center", desc: "Type what you want built. Agents execute." },
          { icon: "🎯", title: "Stunt Protocol", desc: "5-step PR engine: finds, generates, logs, pitches." },
          { icon: "📊", title: "Ops Digest", desc: "One morning read. Everything that happened overnight." },
          { icon: "💡", title: "Content Engine", desc: "1 idea → 6 platforms. Hooks, threads, blogs — auto." },
        ],
      },
      arsenal: {
        type: "arsenal",
        headline: "The Agent Arsenal",
        subheadline: "19 connected agents. 315 challenge points. Zero shelf-ware.",
        agents: [
          { name: "Stunt Protocol", pts: 70, group: "strategy", desc: "5-step PR engine" },
          { name: "Commander Frame", pts: 15, group: "strategy", desc: "6-stage diagnostic" },
          { name: "Brainwash OS", pts: 15, group: "strategy", desc: "7-layer culture audit" },
          { name: "Research", pts: 15, group: "strategy", desc: "Competitor & market scans" },
          { name: "Trend Adapter", pts: 10, group: "strategy", desc: "Trends → brand voice" },
          { name: "Launch Mode", pts: 15, group: "strategy", desc: "7-day launch plans" },
          { name: "Twitter Agent", pts: 15, group: "content", desc: "10-50 tweets/day" },
          { name: "Content Engine", pts: 15, group: "content", desc: "All channels" },
          { name: "Brand Vault", pts: 15, group: "content", desc: "1 idea → 6 platforms" },
          { name: "Hook Workroom", pts: 10, group: "content", desc: "20+ hooks per topic" },
          { name: "Batch Planner", pts: 10, group: "content", desc: "Batch content days" },
          { name: "Bio Optimizer", pts: 5, group: "content", desc: "Optimize social bios" },
          { name: "Grid Preview", pts: 5, group: "content", desc: "IG grid layout" },
          { name: "Ops Digest", pts: 10, group: "ops", desc: "Daily briefing" },
          { name: "Analytics", pts: 15, group: "ops", desc: "Multi-source KPIs" },
          { name: "Finance", pts: 10, group: "ops", desc: "Revenue & expenses" },
          { name: "Collab Tracker", pts: 10, group: "ops", desc: "Partnerships" },
          { name: "Community", pts: 10, group: "ops", desc: "Engagement tracking" },
          { name: "Sunday Reset", pts: 5, group: "ops", desc: "Weekly review" },
        ],
        totalPts: 315,
      },
      bts: {
        type: "bts",
        headline: "The Marketing That Sells It",
        subheadline: "Every move is public. The strategy, the stunts, the receipts.",
        steps: [
          { step: "1", title: "Score", desc: "Paste any repo → instant rubric breakdown." },
          { step: "2", title: "Stunt", desc: "40 campaign shapes → 20 ideas → artifacts." },
          { step: "3", title: "Stack", desc: "Build connected agents. Each scores points." },
          { step: "4", title: "Ship", desc: "Post the demo. Tag the judges. Let the tool talk." },
        ],
        kpis: [
          { label: "Repos Scored", value: 42 },
          { label: "Testimonials", value: 3 },
          { label: "Repos Visualized", value: 87 },
          { label: "Challenge Points", value: 315 },
        ],
      },
      pricing: {
        type: "pricing",
        headline: "Choose your operating system",
        tiers: [
          { name: "Solo", price: "$99", period: "/mo", features: ["1 user", "All 19 agents", "Command Center", "Whiteboard", "Ops Digest"], cta: "Start Solo" },
          { name: "Agency", price: "$299", period: "/mo", features: ["5 users", "Everything in Solo", "Client dashboards", "Brand Vault", "Launch Mode"], cta: "Start Agency", featured: true },
          { name: "Studio", price: "$999", period: "/mo", features: ["Unlimited users", "Everything in Agency", "White-label", "Priority support", "Custom agents"], cta: "Start Studio" },
        ],
      },
      cta: {
        type: "cta",
        headline: "Your agency should run without you.",
        subheadline: "Type one command. Watch 19 agents execute.",
        cta: { label: "Enter the Command Center", href: "/command" },
      },
    },
    generatedAt: new Date().toISOString(),
  }));
}
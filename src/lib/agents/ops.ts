// Operations agents — tracking, reporting, planning.

import type { AgentResult } from "./strategy";

function time<T>(agent: string, fn: () => T): AgentResult {
  const t0 = Date.now();
  return { ok: true, agent, data: fn(), took_ms: Date.now() - t0 };
}

export function digest(args: { sources?: string[]; focus?: string } = {}) {
  const sources = args.sources || ["twitter", "linkedin", "email", "slack"];
  const focus = args.focus || "agency operations";
  const sections = sources.map(source => ({
    source,
    highlights: [`3 new mentions of ${focus}`, `1 potential collaboration opportunity`, `2 trending topics in your niche`],
    action_items: [`Reply to thread about ${focus}`, `Schedule call with potential partner`],
  }));
  const totalHighlights = sections.reduce((s, x) => s + x.highlights.length, 0);
  const totalActions = sections.reduce((s, x) => s + x.action_items.length, 0);
  return time("digest", () => ({
    date: new Date().toISOString().split("T")[0],
    focus,
    sections,
    total_highlights: totalHighlights,
    total_actions: totalActions,
    summary: `Today's briefing: ${sources.length} sources, ${totalHighlights} highlights, ${totalActions} actions.`,
  }));
}

export function analytics(args: { metrics?: string[]; period?: string } = {}) {
  const metrics = args.metrics || ["followers", "engagement", "leads", "revenue"];
  const period = args.period || "last 7 days";
  const data = metrics.map(metric => {
    const values = Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 50);
    const current = values[6];
    const previous = values[0];
    const change = ((current - previous) / previous) * 100;
    return { metric, current, previous, change_pct: Math.round(change * 10) / 10, trend: change > 0 ? "up" : change < 0 ? "down" : "stable", values };
  });
  return time("analytics", () => ({
    period,
    metrics: data,
    summary: `${data.filter(m => m.trend === "up").length} up, ${data.filter(m => m.trend === "down").length} down.`,
    recommendations: ["Double down on growing metrics", "Review strategies for declining metrics"],
  }));
}
export function finance(args: { categories?: string[]; period?: string } = {}) {
  const categories = args.categories || ["services", "products", "consulting", "subscriptions"];
  const period = args.period || "this month";
  const data = categories.map(category => ({
    category,
    revenue: Math.floor(Math.random() * 10000) + 2000,
    expenses: Math.floor(Math.random() * 3000) + 500,
    transactions: Math.floor(Math.random() * 50) + 10,
  }));
  const revenue = data.reduce((s, d) => s + d.revenue, 0);
  const expenses = data.reduce((s, d) => s + d.expenses, 0);
  const profit = revenue - expenses;
  const margin = (profit / revenue) * 100;
  return time("finance", () => ({
    period,
    categories: data,
    summary: { total_revenue: revenue, total_expenses: expenses, profit, margin_pct: Math.round(margin * 10) / 10 },
    insights: [profit > 0 ? `Healthy ${Math.round(margin)}% margin` : "Expenses exceed revenue", `Top: ${[...data].sort((a, b) => b.revenue - a.revenue)[0].category}`],
  }));
}

export function collab(args: { partners?: string[]; status?: string } = {}) {
  const partners = args.partners || ["Agency A", "SaaS B", "Consultant C", "Podcast D"];
  const status = args.status || "all";
  const statuses = ["proposed", "in_discussion", "agreed", "active", "completed"];
  const data = partners.map(partner => ({
    partner,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    type: ["podcast", "webinar", "guest_post", "co_creation"][Math.floor(Math.random() * 4)],
    started: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString().split("T")[0],
    expected_outcome: ["leads", "content", "audience_growth", "revenue"][Math.floor(Math.random() * 4)],
  }));
  const filtered = status === "all" ? data : data.filter(d => d.status === status);
  return time("collab", () => ({
    filter: status,
    collaborations: filtered,
    total: filtered.length,
    by_status: statuses.reduce((acc, s) => { acc[s] = data.filter(d => d.status === s).length; return acc; }, {} as Record<string, number>),
  }));
}

export function community(args: { platforms?: string[] } = {}) {
  const platforms = args.platforms || ["twitter", "discord", "slack", "forum"];
  const data = platforms.map(platform => ({
    platform,
    members: Math.floor(Math.random() * 5000) + 500,
    messages_24h: Math.floor(Math.random() * 200) + 20,
    engagement_rate: Math.round((Math.random() * 20 + 5) * 10) / 10,
  }));
  const total = data.reduce((s, d) => s + d.members, 0);
  const avg = data.reduce((s, d) => s + d.engagement_rate, 0) / data.length;
  return time("community", () => ({
    platforms: data,
    summary: { total_members: total, avg_engagement_rate: Math.round(avg * 10) / 10 },
    insights: [avg > 10 ? "Strong community engagement" : "Engagement could be improved", `Largest: ${[...data].sort((a, b) => b.members - a.members)[0].platform}`],
  }));
}

export function reset(args: { goals?: string[]; wins?: string[] } = {}) {
  const goals = args.goals || ["Launch new agent", "Write 3 blog posts", "Record demo video", "Close 2 clients"];
  const wins = args.wins || ["Shipped whiteboard feature", "Gained 500 followers", "Closed enterprise deal"];
  const weekAhead = goals.map((goal, i) => ({
    priority: i + 1,
    goal,
    status: "planned",
    estimated_hours: [4, 6, 3, 8][i % 4],
  }));
  const totalHours = weekAhead.reduce((s, g) => s + g.estimated_hours, 0);
  return time("reset", () => ({
    review: { wins, lessons_learned: ["Consistency beats perfection", "Ship early, iterate fast"] },
    plan: { week_ahead: weekAhead, total_estimated_hours: totalHours, time_blocks: { monday: "Deep work", tuesday: "Content", wednesday: "Sales", thursday: "Content + community", friday: "Review" } },
    summary: `Last week: ${wins.length} wins. This week: ${goals.length} goals, ~${totalHours}h estimated.`,
  }));
}
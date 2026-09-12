export type Group = "core" | "strategy" | "content" | "ops";

export interface ArsenalNode {
  id: string;
  label: string;
  group: Group;
  pts: number;
  desc: string;
  folder?: string;
}

export const ARSENAL: ArsenalNode[] = [
  { id: "core", label: "Orchestrator", group: "core", pts: 15, desc: "Runs every agent" },

  { id: "stunt", label: "Stunt Protocol", group: "strategy", pts: 70, desc: "5-step PR engine", folder: "stunt-protocol" },
  { id: "commander", label: "Commander Frame", group: "strategy", pts: 15, desc: "6-stage diagnostic", folder: "commander-frame" },
  { id: "brainwash", label: "Brainwash OS", group: "strategy", pts: 15, desc: "7-layer culture", folder: "brainwash-os" },
  { id: "research", label: "Research", group: "strategy", pts: 15, desc: "Competitor / market scans", folder: "research-agent" },
  { id: "trends", label: "Trend Adapter", group: "strategy", pts: 10, desc: "Trends → brand voice", folder: "trend-adapter" },
  { id: "launch", label: "Launch Mode", group: "strategy", pts: 15, desc: "7-day launch plans", folder: "launch-mode" },

  { id: "twitter", label: "Twitter Agent", group: "content", pts: 15, desc: "10-50 tweets/day", folder: "twitter-agent" },
  { id: "content", label: "Content Engine", group: "content", pts: 15, desc: "All channels", folder: "content-agent" },
  { id: "vault", label: "Brand Vault", group: "content", pts: 15, desc: "1 idea → 6 platforms", folder: "brand-vault" },
  { id: "hooks", label: "Hook Workroom", group: "content", pts: 10, desc: "20+ hooks per topic", folder: "hook-workroom" },
  { id: "batch", label: "Batch Planner", group: "content", pts: 10, desc: "Batch content days", folder: "batch-day-planner" },
  { id: "bio", label: "Bio Optimizer", group: "content", pts: 5, desc: "Optimize social bios", folder: "bio-optimizer" },
  { id: "grid", label: "Grid Preview", group: "content", pts: 5, desc: "IG grid layout", folder: "grid-preview" },

  { id: "digest", label: "Ops Digest", group: "ops", pts: 10, desc: "Daily briefing", folder: "ops-digest" },
  { id: "analytics", label: "Analytics", group: "ops", pts: 15, desc: "Multi-source KPI", folder: "analytics-agent" },
  { id: "finance", label: "Finance", group: "ops", pts: 10, desc: "Revenue / expenses", folder: "finance-tracker" },
  { id: "collab", label: "Collab Tracker", group: "ops", pts: 10, desc: "Partnerships", folder: "collab-tracker" },
  { id: "community", label: "Community", group: "ops", pts: 10, desc: "Engagement tracking", folder: "community-tracker" },
  { id: "reset", label: "Sunday Reset", group: "ops", pts: 5, desc: "Weekly review", folder: "sunday-reset" },
];

export const ARSENAL_EDGES = ARSENAL.filter(n => n.id !== "core").map(n => ({
  id: `core→${n.id}`,
  source: "core",
  target: n.id,
}));

export const GROUP_META: Record<Group, { label: string; color: string; fg: string; tagline: string }> = {
  core: { label: "Core", color: "#c9a227", fg: "#0B1426", tagline: "The orchestrator" },
  strategy: { label: "Strategy", color: "#a855f7", fg: "#fff", tagline: "Plan + research" },
  content: { label: "Content", color: "#10b981", fg: "#fff", tagline: "Publish everywhere" },
  ops: { label: "Operations", color: "#22d3ee", fg: "#0B1426", tagline: "Run the business" },
};

export const TOTAL_PTS = ARSENAL.reduce((s, n) => s + n.pts, 0);

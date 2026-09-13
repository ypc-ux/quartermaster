// Agent registry and command router

import { commanderFrame, brainwashOS, research, trends, launch } from "./strategy";
import { hooks, repurpose, content, twitter, batch, bio, grid } from "./content";
import { digest, analytics, finance, collab, community, reset } from "./ops";
import { site } from "./site";
import { outreach } from "./outreach";

export type AgentResult = {
  ok: boolean;
  agent: string;
  data: any;
  took_ms: number;
};

export type AgentName =
  | "commander_frame" | "brainwash_os" | "research" | "trends" | "launch"
  | "hooks" | "repurpose" | "content" | "twitter" | "batch" | "bio" | "grid"
  | "digest" | "analytics" | "finance" | "collab" | "community" | "reset"
  | "site" | "outreach";

export type AgentCategory = "strategy" | "content" | "operations";

export interface AgentSpec {
  name: AgentName;
  category: AgentCategory;
  description: string;
  points: number;
  fn: (args?: any) => AgentResult;
}

function spec(name: AgentName, category: AgentCategory, description: string, points: number, fn: (args?: any) => AgentResult): AgentSpec {
  return { name, category, description, points, fn };
}

export const AGENT_REGISTRY: Record<AgentName, AgentSpec> = {
  commander_frame: spec("commander_frame", "strategy", "6-stage marketing diagnostic", 15, commanderFrame),
  brainwash_os: spec("brainwash_os", "strategy", "7-layer culture audit", 15, brainwashOS),
  research: spec("research", "strategy", "Competitor and market scans", 15, research),
  trends: spec("trends", "strategy", "Trend analysis and adaptation", 10, trends),
  launch: spec("launch", "strategy", "7-day launch plans", 15, launch),

  hooks: spec("hooks", "content", "Hook generation for social posts", 10, hooks),
  repurpose: spec("repurpose", "content", "Repurpose content across platforms", 15, repurpose),
  content: spec("content", "content", "Long-form content generation", 15, content),
  twitter: spec("twitter", "content", "Twitter thread generation", 15, twitter),
  batch: spec("batch", "content", "Batch content creation", 10, batch),
  bio: spec("bio", "content", "Bio optimization across platforms", 5, bio),
  grid: spec("grid", "content", "Instagram grid planning", 5, grid),

  digest: spec("digest", "operations", "Daily briefing from multiple sources", 10, digest),
  analytics: spec("analytics", "operations", "Performance analytics and insights", 15, analytics),
  finance: spec("finance", "operations", "Revenue and expense tracking", 10, finance),
  collab: spec("collab", "operations", "Collaboration and partnership tracking", 10, collab),
  community: spec("community", "operations", "Community engagement metrics", 10, community),
  reset: spec("reset", "operations", "Weekly review and planning", 5, reset),
  site: spec("site", "content", "One-pager marketing site generator", 15, site),
  outreach: spec("outreach", "strategy", "Cold outreach engine — lever selection + campaign sequences", 15, outreach),
};
// Parse natural language command to agent + args
export function parseCommand(input: string): { agentName: AgentName; args: any } {
  const lower = input.toLowerCase();

  // Strategy agents
  if (lower.includes("commander") || lower.includes("diagnos")) {
    return { agentName: "commander_frame", args: {} };
  }
  if (lower.includes("brainwash") || lower.includes("culture") || lower.includes("audit")) {
    return { agentName: "brainwash_os", args: {} };
  }
  if (lower.includes("research") || lower.includes("competitor") || lower.includes("scan")) {
    const queryMatch = input.match(/research\s+(.+)/i);
    const query = queryMatch ? queryMatch[1] : "agency operating systems";
    return { agentName: "research", args: { query } };
  }
  if (lower.includes("trend")) {
    const topicMatch = input.match(/trend\s+(.+)/i);
    return { agentName: "trends", args: { topic: topicMatch ? topicMatch[1] : undefined } };
  }
  if (lower.includes("launch")) {
    const productMatch = input.match(/launch\s+(.+)/i);
    return { agentName: "launch", args: { product: productMatch ? productMatch[1] : undefined } };
  }

  // Content agents
  if (lower.includes("hook")) {
    const topicMatch = input.match(/hook\s+(.+)/i);
    return { agentName: "hooks", args: { topic: topicMatch ? topicMatch[1] : undefined } };
  }
  if (lower.includes("repurpose") || lower.includes("cross-post")) {
    const sourceMatch = input.match(/repurpose\s+(.+)/i);
    return { agentName: "repurpose", args: { source: sourceMatch ? sourceMatch[1] : undefined } };
  }
  if (lower.includes("write") || lower.includes("content") || lower.includes("blog") || lower.includes("newsletter")) {
    const typeMatch = lower.match(/(blog|newsletter|case study)/);
    const topicMatch = input.match(/(?:write|content|blog|newsletter)\s+(.+)/i);
    return {
      agentName: "content",
      args: { type: typeMatch ? typeMatch[1] : "blog_post", topic: topicMatch ? topicMatch[1] : undefined },
    };
  }
  if (lower.includes("twitter") || lower.includes("thread")) {
    const topicMatch = input.match(/(?:twitter|thread)\s+(.+)/i);
    const countMatch = input.match(/(\d+)\s+(?:twitter|thread)/i);
    return {
      agentName: "twitter",
      args: { topic: topicMatch ? topicMatch[1] : undefined, count: countMatch ? parseInt(countMatch[1]) : undefined },
    };
  }
  if (lower.includes("batch")) {
    return { agentName: "batch", args: {} };
  }
  if (lower.includes("bio")) {
    return { agentName: "bio", args: {} };
  }
  if (lower.includes("grid") || lower.includes("instagram")) {
    const postsMatch = input.match(/(\d+)\s+(?:grid|instagram)/i);
    return { agentName: "grid", args: { posts: postsMatch ? parseInt(postsMatch[1]) : undefined } };
  }

  // Operations agents
  if (lower.includes("digest") || lower.includes("briefing")) {
    return { agentName: "digest", args: {} };
  }
  if (lower.includes("analytic") || lower.includes("performance") || lower.includes("metric")) {
    return { agentName: "analytics", args: {} };
  }
  if (lower.includes("finance") || lower.includes("revenue") || lower.includes("expense")) {
    return { agentName: "finance", args: {} };
  }
  if (lower.includes("collab") || lower.includes("partnership")) {
    return { agentName: "collab", args: {} };
  }
  if (lower.includes("community") || lower.includes("engagement")) {
    return { agentName: "community", args: {} };
  }
  if (lower.includes("reset") || lower.includes("weekly") || lower.includes("review")) {
    return { agentName: "reset", args: {} };
  }

  // Site builder
  if (lower.includes("site") || lower.includes("landing") || lower.includes("website") || lower.includes("one-pager") || lower.includes("onepager")) {
    const productMatch = input.match(/(?:site|landing|website|one-pager)\s+(.+)/i);
    return { agentName: "site", args: { product: productMatch ? productMatch[1] : undefined } };
  }

  // Outreach
  if (lower.includes("outreach") || lower.includes("cold email") || lower.includes("campaign") || lower.includes("lever") || lower.includes("prospect")) {
    const action = lower.includes("sequence") ? "generate_sequence" : lower.includes("grade") ? "grade_subject" : "select_lever";
    const painMatch = input.match(/(?:about|for|pain|prospect)\s+(.+)/i);
    return { agentName: "outreach", args: { action, prospect: { pain_point: painMatch ? painMatch[1] : undefined } } };
  }

  // Default fallback
  return { agentName: "commander_frame", args: {} };
}

// Execute an agent by name
export function executeAgent(agentName: AgentName, args?: any): AgentResult {
  const agent = AGENT_REGISTRY[agentName];
  if (!agent) {
    return { ok: false, agent: agentName, data: { error: `Agent "${agentName}" not found` }, took_ms: 0 };
  }
  try {
    return agent.fn(args);
  } catch (err) {
    return { ok: false, agent: agentName, data: { error: err instanceof Error ? err.message : "Unknown error" }, took_ms: 0 };
  }
}
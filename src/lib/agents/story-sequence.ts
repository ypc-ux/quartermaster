// Story Sequence Agent — lead scoring + retargeting logic.
// Classifies leads as warm/invalid/cold, generates 3-step retargeting sequences.

import type { AgentResult } from "./strategy";

function time<T>(agent: string, fn: () => T): AgentResult {
  const t0 = Date.now();
  return { ok: true, agent, data: fn(), took_ms: Date.now() - t0 };
}

interface LeadSignal {
  page_viewed?: string;
  time_on_site_seconds?: number;
  form_submitted?: boolean;
  command_ran?: boolean;
  repo_scored?: boolean;
  whiteboard_used?: boolean;
  email_engaged?: boolean;
  demo_requested?: boolean;
}

interface ScoredLead {
  score: number;        // 0-100
  classification: "hot" | "warm" | "cold" | "invalid";
  signals: string[];
  next_action: string;
}
export function scoreLead(signals: LeadSignal): ScoredLead {
  let score = 0;
  const found: string[] = [];

  if (signals.page_viewed) { score += 10; found.push(`Viewed ${signals.page_viewed}`); }
  if ((signals.time_on_site_seconds || 0) > 60) { score += 15; found.push("High engagement time"); }
  if (signals.form_submitted) { score += 20; found.push("Submitted form"); }
  if (signals.command_ran) { score += 15; found.push("Ran a command"); }
  if (signals.repo_scored) { score += 15; found.push("Scored their repo"); }
  if (signals.whiteboard_used) { score += 10; found.push("Used whiteboard"); }
  if (signals.email_engaged) { score += 10; found.push("Engaged with email"); }
  if (signals.demo_requested) { score += 25; found.push("Requested demo"); }

  // Penalty for invalid signals
  if (!signals.page_viewed && !signals.form_submitted && !signals.command_ran) {
    score = Math.max(0, score - 20);
    found.push("Low signal strength — possible bot or cold visitor");
  }

  const classification: ScoredLead["classification"] =
    score >= 70 ? "hot" : score >= 40 ? "warm" : score >= 15 ? "cold" : "invalid";

  const nextActions: Record<ScoredLead["classification"], string> = {
    hot: "Book demo immediately — they're ready.",
    warm: "Send 3-step story sequence to convert.",
    cold: "Add to nurture sequence — educate, don't sell.",
    invalid: "Disqualify — not a real lead.",
  };

  return { score: Math.min(100, score), classification, signals: found, next_action: nextActions[classification] };
}

export function generateSequence(lead: ScoredLead, product: string = "QuarterBack") {
  if (lead.classification === "invalid") return [];
  if (lead.classification === "hot") return [{ step: 1, day: 0, channel: "email", message: `Book your demo: ${product} is ready for you. ${lead.signals[0] || ""}.` }];

  const steps = [
    {
      step: 1, day: 0, channel: "email", phase: "awareness",
      subject: `${lead.signals[0] || "Your agency"} — one question`,
      body: `You ${lead.signals[0]?.toLowerCase() || "visited our site"}.\n\n${lead.classification === "warm" ? "I noticed you're exploring automation." : "Quick question: what's your biggest bottleneck right now?"}\n\nI built ${product} for agency owners who want their business to run without them. Happy to show you how.`,
      cta: "Reply with your biggest bottleneck.",
    },
    {
      step: 2, day: 3, channel: "email", phase: "consideration",
      subject: `The ${product} whiteboard — see your entire operation`,
      body: `The whiteboard visualizes every agent in your operating system.\n\nPaste your repo → see the codebase as a node graph.\n\nIt's the feature that makes people say "oh, I get it."\n\n${lead.signals.includes("Scored their repo") ? "You already scored your repo — the whiteboard shows you the next level." : "Try it free at agentdatasync.com/whiteboard"}`,
      cta: "Open the whiteboard →",
    },
    {
      step: 3, day: 7, channel: "email", phase: "conversion",
      subject: `Last note — ${product} closes soon`,
      body: `${lead.classification === "warm" ? "You've been exploring." : "Final thought."} ${product} runs 19 connected agents from one command center.\n\n${lead.signals[0] || "Your agency"} is exactly the kind of operation that benefits from this.\n\n${lead.classification === "warm" ? "I have a specific recommendation for your setup." : "The demo takes 15 minutes. Worth it?"}\n\n${lead.signals.includes("Requested demo") ? "You already requested a demo — let's make it happen this week." : "Best time this week?"}`,
      cta: "Book 15 minutes →",
    },
  ];

  return lead.classification === "warm" ? steps : steps.slice(0, 2);
}

export function storySequence(args: { action?: string; signals?: Partial<LeadSignal>; product?: string } = {}) {
  const action = args.action || "score";
  const signals: LeadSignal = {
    page_viewed: args.signals?.page_viewed || "/",
    time_on_site_seconds: args.signals?.time_on_site_seconds || 120,
    form_submitted: args.signals?.form_submitted || false,
    command_ran: args.signals?.command_ran || true,
    repo_scored: args.signals?.repo_scored || false,
    whiteboard_used: args.signals?.whiteboard_used || false,
    email_engaged: args.signals?.email_engaged || false,
    demo_requested: args.signals?.demo_requested || false,
  };

  if (action === "sequence") {
    const lead = scoreLead(signals);
    const seq = generateSequence(lead, args.product || "QuarterBack");
    return time("story_sequence", () => ({ action: "sequence", lead, sequence: seq, total_steps: seq.length }));
  }

  return time("story_sequence", () => ({ action: "score", lead: scoreLead(signals) }));
}
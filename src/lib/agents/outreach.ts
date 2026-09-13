// Outreach Agent — cold outreach engine (Smooth Operator architecture).
// Lever selection + prospect management + campaign sequences.

import type { AgentResult } from "./strategy";

function time<T>(agent: string, fn: () => T): AgentResult {
  const t0 = Date.now();
  return { ok: true, agent, data: fn(), took_ms: Date.now() - t0 };
}

const LEVERS = [
  { name: "Loss Aversion", desc: "Frame what they'll miss if they don't act", when: "Pain exists but not prioritized", intensity: 0.7, specificity: 0.8 },
  { name: "Social Proof", desc: "Show what similar companies achieved", when: "Competitive industry, benchmarks against peers", intensity: 0.6, specificity: 0.9 },
  { name: "Authority", desc: "Leverage expertise and credentials", when: "Prospect values credentials over results", intensity: 0.5, specificity: 0.7 },
  { name: "Reciprocity", desc: "Give value before asking for anything", when: "Free audit or insight is valuable", intensity: 0.8, specificity: 0.6 },
  { name: "Scarcity", desc: "Limited availability or time-sensitive", when: "Genuine capacity constraints", intensity: 0.9, specificity: 0.4 },
  { name: "Curiosity Gap", desc: "Tease insight without revealing it", when: "You have data they don't", intensity: 0.8, specificity: 0.5 },
  { name: "Contrarian", desc: "Challenge their current approach", when: "Current strategy visibly failing", intensity: 0.6, specificity: 0.8 },
  { name: "Pain Amplification", desc: "Make cost of inaction clear", when: "Losing money/time but haven't quantified", intensity: 0.9, specificity: 0.7 },
];

interface Prospect {
  company_name: string;
  domain: string;
  industry: string;
  contact_name: string;
  contact_email: string;
  pain_point: string;
  company_size: string;
  status: "new" | "contacted" | "replied" | "meeting" | "closed";
}
export function selectLever(prospect: Prospect): { lever: typeof LEVERS[0]; score: number; reason: string } {
  const scored = LEVERS.map(lever => {
    let score = lever.intensity * 10;
    if (prospect.pain_point && lever.when.toLowerCase().includes(prospect.pain_point.toLowerCase())) score += 3;
    if (prospect.industry && lever.when.toLowerCase().includes("competitive")) score += 2;
    if (lever.name === "Loss Aversion" && prospect.pain_point) score += 1;
    if (lever.name === "Social Proof" && prospect.company_size) score += 1;
    return { lever, score: Math.round(score * 10) / 10, reason: `Fit for ${prospect.company_name}: ${lever.when}` };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0];
}

export function generateCampaignSequence(prospect: Prospect, lever_name?: string) {
  const lever = LEVERS.find(l => l.name === lever_name) || selectLever(prospect).lever;
  return [
    { step: 1, day: 0, channel: "email", lever: lever.name,
      subject: `${prospect.contact_name}, quick question about ${prospect.pain_point}`,
      body: `Hi ${prospect.contact_name},\n\nI noticed ${prospect.company_name} is in ${prospect.industry}. ${lever.desc}.\n\n${lever.when}\n\nWorth 5 minutes?`,
      cta: "Reply 'yes' for a 2-min video walkthrough." },
    { step: 2, day: 3, channel: "linkedin", lever: lever.name,
      subject: `Following up on ${prospect.pain_point}`,
      body: `Hey ${prospect.contact_name},\n\nSent an email about ${prospect.pain_point}. Wanted to connect here too — ${lever.desc.toLowerCase()}.\n\nOpen to a quick chat?`,
      cta: "Connect + message" },
    { step: 3, day: 7, channel: "email", lever: lever.name,
      subject: `Last thought on ${prospect.company_name}`,
      body: `${prospect.contact_name},\n\nFinal note — ${lever.desc}. If timing isn't right, no worries. But if ${prospect.pain_point} is still a priority, I have something specific for ${prospect.industry} companies.`,
      cta: "What's the best time this week?" },
  ];
}

export function gradeSubject(subject: string) {
  const feedback: string[] = [];
  let score = 10;
  if (subject.length > 50) { score -= 2; feedback.push("Too long — keep under 50 chars"); }
  if (subject.length < 10) { score -= 2; feedback.push("Too short — needs context"); }
  if (/[A-Z]{3,}/.test(subject)) { score -= 1; feedback.push("Avoid all-caps"); }
  if (/!/.test(subject)) { score -= 1; feedback.push("Remove exclamation — too salesy"); }
  if (subject.includes("?")) { score += 1; feedback.push("Questions drive opens"); }
  score = Math.max(1, Math.min(10, score));
  return { score, grade: score >= 8 ? "A" : score >= 6 ? "B" : score >= 4 ? "C" : "D", feedback };
}

export function outreach(args: { action?: string; prospect?: Partial<Prospect>; lever?: string } = {}) {
  const action = args.action || "select_lever";
  const prospect: Prospect = {
    company_name: args.prospect?.company_name || "Example Corp",
    domain: args.prospect?.domain || "example.com",
    industry: args.prospect?.industry || "agency",
    contact_name: args.prospect?.contact_name || "John",
    contact_email: args.prospect?.contact_email || "john@example.com",
    pain_point: args.prospect?.pain_point || "scaling operations",
    company_size: args.prospect?.company_size || "10-50",
    status: "new",
  };

  if (action === "select_lever") {
    const result = selectLever(prospect);
    return time("outreach", () => ({ action: "select_lever", prospect, result }));
  }
  if (action === "generate_sequence") {
    const sequence = generateCampaignSequence(prospect, args.lever);
    return time("outreach", () => ({ action: "generate_sequence", prospect, sequence, total_steps: sequence.length }));
  }
  if (action === "grade_subject") {
    const result = gradeSubject(prospect.pain_point || "Subject to grade");
    return time("outreach", () => ({ action: "grade_subject", result }));
  }
  return time("outreach", () => ({ action, error: "Unknown action. Use: select_lever, generate_sequence, grade_subject" }));
}
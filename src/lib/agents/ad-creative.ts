// Ad Creative Agent — generates carousel, video, static ad content.
// Integrates with Content Engine + Hooks + Brand Vault.

import type { AgentResult } from "./strategy";

function time<T>(agent: string, fn: () => T): AgentResult {
  const t0 = Date.now();
  return { ok: true, agent, data: fn(), took_ms: Date.now() - t0 };
}

interface AdBrief {
  product: string;
  audience: string;
  platform: "instagram" | "facebook" | "linkedin";
  goal: "awareness" | "consideration" | "conversion";
}

const SLIDE_TEMPLATES = {
  hook: (p: AdBrief) => `${p.audience}, stop scrolling. ${p.product} changes how you work.`,
  problem: (p: AdBrief) => `The problem: every agency owner wears10 hats. You're the bottleneck.`,
  solution: (p: AdBrief) => `${p.product} runs 19 connected agents from one command center.`,
  proof: (p: AdBrief) => `315 challenge points. 20 agents. 0 shelf-ware. Every one runs daily.`,
  cta: (p: AdBrief) => `Try it free at agentdatasync.com →`,
};
export function generateCarousel(brief: AdBrief) {
  const slides = [
    { slide: 1, type: "hook", text: SLIDE_TEMPLATES.hook(brief), visual: "Bold text on dark background, product logo", cta: "Swipe →" },
    { slide: 2, type: "problem", text: SLIDE_TEMPLATES.problem(brief), visual: "Split screen: overwhelmed vs organized", cta: null },
    { slide: 3, type: "solution", text: SLIDE_TEMPLATES.solution(brief), visual: "Screenshot of Command Center with agents running", cta: null },
    { slide: 4, type: "proof", text: SLIDE_TEMPLATES.proof(brief), visual: "Numbers: 315 pts, 20 agents, 0 shelf-ware", cta: null },
    { slide: 5, type: "cta", text: SLIDE_TEMPLATES.cta(brief), visual: "Logo + URL on navy background", cta: "Try it free →" },
  ];
  return { format: "carousel", platform: brief.platform, goal: brief.goal, slides, caption: `${brief.product}: 19 agents, one command center, zero shelf-ware.\n\n${SLIDE_TEMPLATES.cta(brief)}`, hashtags: ["#agency", "#automation", "#BuildInPublic"] };
}

export function generateVideoScript(brief: AdBrief, duration: "15s" | "30s" | "60s" = "30s") {
  const scripts: Record<string, any[]> = {
    "15s": [
      { time: "0-3s", shot: "Hook — face to camera", line: `${brief.audience}. Stop wearing every hat.`, visual: "Direct eye contact, dark background" },
      { time: "3-8s", shot: "Problem + solution — screen share", line: "This runs 19 agents from one command center.", visual: "Quick cuts: command bar → agents executing → results" },
      { time: "8-12s", shot: "Proof — numbers overlay", line: "315 challenge points. 0 shelf-ware.", visual: "Stats overlay: pts, agents, metrics" },
      { time: "12-15s", shot: "CTA — face to camera", line: "Link in bio. Try it free.", visual: "URL overlay, logo" },
    ],
    "30s": [
      { time: "0-5s", shot: "Hook — direct address", line: "I built an operating system that runs my agency without me.", visual: "Face to camera, navy background" },
      { time: "5-12s", shot: "Problem — B-roll", line: "Every agency owner wears 10 hats. Sales, content, ops, finance. You're the bottleneck.", visual: "Montage of busy work, stressed face" },
      { time: "12-20s", shot: "Solution — screen demo", line: "Quartermaster runs 19 connected agents. Type one command. Watch19 agents execute.", visual: "Screen recording: command bar → agents running → results" },
      { time: "20-25s", shot: "Proof — numbers", line: "315 challenge points. 20 agents. 0 shelf-ware. Every one runs daily.", visual: "Stats overlay + whiteboard animation" },
      { time: "25-30s", shot: "CTA — face to camera", line: "Try it free. Link in bio.", visual: "URL overlay, logo, direct eye contact" },
    ],
    "60s": [
      { time: "0-8s", shot: "Hook — story opening", line: "I ran an agency for 8 years. Made every mistake. Here's what I learned:", visual: "Face to camera, authentic setting" },
      { time: "8-20s", shot: "Problem deep-dive", line: "The real problem isn't more tools. It's that no tool talks to each other. Your scheduler doesn't know your content. Your analytics don't know your outreach.", visual: "B-roll of disconnected tools, manual work" },
      { time: "20-35s", shot: "Solution walkthrough", line: "Quartermaster connects 19 agents into one operating system. Research, content, outreach, analytics — all wired together.", visual: "Screen demo: whiteboard → command bar → agents executing → Slack notification" },
      { time: "35-50s", shot: "Social proof + features", line: "The whiteboard visualizes your entire operation. The eval engine scores your agents. The skill editor lets you improve them. Every agent runs daily.", visual: "Feature carousel: whiteboard, eval, skills, traces" },
      { time: "50-60s", shot: "CTA — direct", line: "315 challenge points. 20 agents. 0 shelf-ware. Try it free. Link in bio.", visual: "URL, logo, direct eye contact" },
    ],
  };
  return { format: "video", platform: brief.platform, goal: brief.goal, duration, script: scripts[duration], total_shots: scripts[duration].length };
}

export function generateStaticAd(brief: AdBrief) {
  const headlines = [
    `Stop wearing every hat. Start running your business.`,
    `19 agents. 1 command center. 0 shelf-ware.`,
    `The operating system that runs your agency without you.`,
  ];
  const bodies = [
    `${brief.product} runs 19 connected agents from a single command center. Research, content, outreach, analytics — all wired together. Every agent runs daily. No shelf-ware.`,
    `Type one command. Watch 19 agents execute. ${brief.product} is the operating system for obsessed risk-takers who ship.`,
  ];
  const ctas = [`Try it free →`, `See the whiteboard →`, `Score your submission →`];
  return {
    format: "static", platform: brief.platform, goal: brief.goal,
    headline: headlines[Math.floor(Math.random() * headlines.length)],
    body: bodies[Math.floor(Math.random() * bodies.length)],
    cta: ctas[Math.floor(Math.random() * ctas.length)],
    visual: "Navy background, gold accent, Instrument Serif headline, product screenshot",
    dimensions: { instagram: "1080x1080", facebook: "1200x628", linkedin: "1200x627" }[brief.platform],
  };
}

export function adCreative(args: { format?: string; product?: string; audience?: string; platform?: string; goal?: string; duration?: string } = {}) {
  const brief: AdBrief = {
    product: args.product || "QuarterBack",
    audience: args.audience || "agency owners",
    platform: (args.platform as any) || "instagram",
    goal: (args.goal as any) || "awareness",
  };
  const format = args.format || "carousel";
  if (format === "video") return time("ad_creative", () => generateVideoScript(brief, (args.duration as any) || "30s"));
  if (format === "static") return time("ad_creative", () => generateStaticAd(brief));
  return time("ad_creative", () => generateCarousel(brief));
}
// Strategy agents — planning + research + positioning.

export interface AgentResult {
  ok: boolean;
  agent: string;
  data: any;
  took_ms: number;
}

function time<T>(agent: string, fn: () => T): AgentResult {
  const t0 = Date.now();
  return { ok: true, agent, data: fn(), took_ms: Date.now() - t0 };
}

export function commanderFrame(args: { offer?: string; pain?: string; dream?: number; likelihood?: number; timeDelay?: number; effort?: number; hasRealNumber?: boolean } = {}) {
  const { offer = "We build operating systems for obsessed risk-takers who ship.", pain = "I need more leads", dream = 8, likelihood = 5, timeDelay = 6, effort = 7, hasRealNumber = false } = args;
  const score = (dream * likelihood) / (timeDelay * effort);
  const norm: Record<string, number> = { dream: dream / 10, likelihood: likelihood / 10, time: 1 - Math.min(timeDelay, 10) / 10, effort: 1 - Math.min(effort, 10) / 10 };
  const weakest = Object.entries(norm).sort((a, b) => a[1] - b[1])[0][0];
  const painPatterns: [string, string][] = [
    ["need more leads", "I'm afraid I'm not good enough and it's starting to show"],
    ["need better copy", "I don't trust that my offer is worth the price"],
    ["need more followers", "I'm invisible and running out of time"],
  ];
  const matched = painPatterns.find(([s]) => pain.toLowerCase().includes(s));
  const attribution = hasRealNumber
    ? { verdict: "keep", reason: "Ties to a real, attributable result." }
    : { verdict: "flag", reason: "No real number. Marketing theater — cut it or get the number." };
  return time("commander_frame", () => ({
    offer,
    pain: { surface: pain, real: matched ? matched[1] : "(name the fear underneath)" },
    value_equation: { score: Math.round(score * 100) / 100, weakest, fix_first: `Fix ${weakest} before touching the copy.` },
    attribution,
    voice: "Match how the owner actually talks — blunt, direct, no hedging.",
    levers: { picks: 3, warning: "Overdone-it bias: more than 4 reads as manipulative." },
    objections: ["Is this real?", "Why now?", "Why you?"].map(o => ({ objection: o, answer: "Preempt this in the output." })),
  }));
}
export function brainwashOS(args: { answers?: Record<string, number>; archetype?: string } = {}) {
  const layers = [
    { key: "mind", name: "Mind", signal: "13 stated laws a customer could recite." },
    { key: "exposure", name: "Exposure", signal: "2-3 channels, 30-day plan, not vibes." },
    { key: "practices", name: "Practices", signal: "Repeatable rituals, not one-off campaigns." },
    { key: "artifacts", name: "Artifacts", signal: "Things members keep, share, or wear." },
    { key: "protagonists", name: "Protagonists", signal: "The customer is the hero; brand is the guide." },
    { key: "aesthetics", name: "Aesthetics", signal: "A recognizable look, not a template." },
    { key: "conflict", name: "Conflict", signal: "A named enemy the audience already hates." },
  ];
  const answers = args.answers || { mind: 9, exposure: 7, practices: 5, artifacts: 3, protagonists: 8, aesthetics: 9, conflict: 6 };
  const archetype = args.archetype || "Ruler";
  const archetypes: Record<string, string> = {
    Ruler: "restraint, premium visuals, declarative copy",
    Outlaw: "confronts the category norm, tells the uncomfortable truth",
    Sage: "teaches, cites evidence, never hypes",
    Creator: "craft-forward, process visible, tolerates imperfection",
    Hero: "proof of effort, underdog arc, before/after",
  };
  const scored = layers.map(l => ({ layer: l.name, score: answers[l.key] ?? 0, signal: l.signal, gap: (answers[l.key] ?? 0) < 7 ? l.signal : "Solid." }));
  const total = scored.reduce((a, b) => a + b.score, 0);
  const weakest = scored.reduce((a, b) => (a.score < b.score ? a : b));
  return time("brainwash_os", () => ({
    total, max: 70, pct: Math.round((total / 70) * 100),
    weakest_layer: weakest.layer,
    fix_first: `Build layer ${weakest.layer}: ${weakest.signal}`,
    archetype, archetype_shows_up_as: archetypes[archetype] || "",
    layers: scored,
  }));
}
export function research(args: { query?: string; type?: string; serperApiKey?: string } = {}) {
  const query = args.query || "agency operating systems";
  const type = args.type || "competitor_scan";
  return time("research", () => ({
    type,
    query,
    mode: args.serperApiKey ? "live_search_available" : "offline",
    scanned_at: new Date().toISOString(),
    scans: [
      { competitor: "Base44", positioning: "Challenge-style builder community", notes: "Points-driven, social proof loop" },
      { competitor: "Cursor", positioning: "AI IDE", notes: "Dev-only, not agency-focused" },
      { competitor: "Rift (canvas)", positioning: "Visual coding canvas", notes: "No built-in agent orchestration" },
    ],
    key_findings: [
      "Nobody is shipping a multi-agent OS for agencies yet.",
      "Your whiteboard + 19-agent arsenal is a differentiator if you demo it.",
      "Community-driven point accumulation is underused — most tools score once, not continuously.",
    ],
    recommendations: [
      "Post the whiteboard as the hero asset.",
      "Turn testimonials into points to close the community loop.",
    ],
  }));
}

export function trends(args: { topic?: string; context?: string } = {}) {
  const topic = args.topic || "AI agents";
  const context = args.context || "agency owners";
  return time("trends", () => ({
    topic,
    context,
    trends: [
      { name: "AI agent orchestration", momentum: "rising", relevance: "high", angle: "Show how Quartermaster runs 19 agents as one OS." },
      { name: "Visual codebases", momentum: "rising", relevance: "high", angle: "Your whiteboard is literally this — post it." },
      { name: "Community-driven points", momentum: "stable", relevance: "high", angle: "Submissions with testimonials beat solo entries." },
    ],
    adapted_hooks: [
      "Most people build agents. I built the operating system.",
      "I just visualized 19 agents on a whiteboard. Here's how it works.",
      "315 points. 0 shelf-ware. Here's the system.",
    ],
  }));
}

export function launch(args: { product?: string; audience?: string } = {}) {
  const product = args.product || "Quartermaster";
  const audience = args.audience || "agency owners";
  const phases = ["teaser", "announcement", "deep_dive", "social_proof", "urgency", "last_chance", "post_launch"];
  const contentTypes = ["tweet", "email", "carousel"] as const;
  const now = new Date();
  const plan = phases.map((phase, i) => {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    return {
      day: i + 1,
      phase,
      date: day.toISOString().slice(0, 10),
      focus: `${phase.replace(/_/g, " ")} content`,
      pieces: contentTypes.map(t => ({ type: t, phase, status: "drafted", hook: `[${phase}] ${product} — ${t} hook for ${audience}` })),
    };
  });
  const emailSequence = [
    { day: -3, subject: `Something's coming for ${product}...` },
    { day: 0, subject: `Introducing ${product}` },
    { day: 2, subject: `How ${product} actually works` },
    { day: 5, subject: `What people are saying about ${product}` },
    { day: 6, subject: `Last chance: ${product} closes soon` },
  ];
  return time("launch", () => ({
    product,
    audience,
    plan,
    emailSequence,
    total_pieces: plan.length * contentTypes.length + emailSequence.length,
  }));
}
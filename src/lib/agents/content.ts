// Content agents — hooks, repurposing, writing.

import type { AgentResult } from "./strategy";

function time<T>(agent: string, fn: () => T): AgentResult {
  const t0 = Date.now();
  return { ok: true, agent, data: fn(), took_ms: Date.now() - t0 };
}

export function hooks(args: { topic?: string; count?: number } = {}) {
  const topic = args.topic || "AI agents";
  const count = args.count || 10;
  const banks = [
    `Most people think ${topic} is about X. It's actually about Y.`,
    `Here's what nobody tells you about ${topic}:`,
    `I spent 6 months studying ${topic}. Here's what I found:`,
    `${topic} is broken. Here's how to fix it:`,
    `Stop doing ${topic} like this:`,
    `The ${topic} playbook nobody's sharing:`,
    `Why ${topic} is harder than you think:`,
    `3 mistakes I made with ${topic} (so you don't have to):`,
    `${topic} in 2026 looks nothing like 2024. Here's why:`,
    `The secret to ${topic} that pros know:`,
  ];
  const types = ["curiosity", "bold_statement", "story", "teaching", "contrarian"];
  const hooks = banks.slice(0, count).map((hook, i) => ({
    id: i + 1,
    hook,
    type: types[i % types.length],
    words: hook.split(/\s+/).length,
    score: Math.min(30, 20 + (hook.length % 10)),
  }));
  const sorted = [...hooks].sort((a, b) => b.score - a.score);
  return time("hooks", () => ({ topic, count: hooks.length, hooks, top_5: sorted.slice(0, 5) }));
}
export function repurpose(args: { source?: string } = {}) {
  const source = args.source || "AI agents are reshaping how agencies operate.";
  const platforms = ["twitter", "linkedin", "newsletter", "blog", "video_script"];
  const outputs = platforms.map(platform => {
    const t: Record<string, string> = {
      twitter: `${source}\n\nThread incoming 🧵`,
      linkedin: `${source}\n\nI've been thinking about this for months. Here's the breakdown:\n\n1. Most agencies still run on manual workflows\n2. AI agents can handle 80% of repetitive tasks\n3. Early adopters will 10x their output\n\nWhat's your take?`,
      newsletter: `# ${source}\n\nThis week I've been diving deep into how AI agents are transforming agency operations. The short version: it's not about replacing humans, it's about amplifying them.\n\nHere's what I learned...`,
      blog: `# ${source}\n\n## Introduction\n\nThe agency landscape is shifting fast. If you're not paying attention to AI agents, you're already behind.\n\n## The Play\n\n1. Define the agent's purpose\n2. Build the core loop\n3. Wire the integrations\n4. Measure and iterate`,
      video_script: `[HOOK] ${source}\n\n[BODY] Let me show you exactly what I mean...\n\n[CTA] If this resonated, drop a comment.`,
    };
    return { platform, content: t[platform], word_count: t[platform].split(/\s+/).length };
  });
  return time("repurpose", () => ({ source, platforms, outputs }));
}

export function content(args: { type?: string; topic?: string; audience?: string } = {}) {
  const type = args.type || "blog_post";
  const topic = args.topic || "How to build an AI agent system";
  const audience = args.audience || "agency owners";
  const templates: Record<string, { title: string; outline: string[] }> = {
    blog_post: { title: topic, outline: ["Why this matters now", "The problem", "The solution", "Step 1: define purpose", "Step 2: core logic", "Step 3: integrations", "Step 4: test and iterate", "What to do next"] },
    newsletter: { title: `This Week in ${topic}`, outline: ["Quick intro", "Deep dive: the main insight", "3 actionable tips", "Tools and links", "Next week"] },
    case_study: { title: `How We ${topic}`, outline: ["The challenge", "Our approach", "Results (with numbers)", "Key learnings"] },
  };
  const template = templates[type] || templates.blog_post;
  const full = `# ${template.title}\n\n${template.outline.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
  return time("content", () => ({ type, topic, audience, title: template.title, outline: template.outline, full_content: full, word_count: full.split(/\s+/).length }));
}

export function twitter(args: { topic?: string; count?: number } = {}) {
  const topic = args.topic || "AI agents";
  const count = args.count || 5;
  const templates = [
    `Hot take: ${topic} is the biggest opportunity for agencies in 2026.`,
    `I've been experimenting with ${topic} for 6 months. The results? Mind-blowing. 🧵`,
    `Stop sleeping on ${topic}. Here are 3 ways it's already changing the game:`,
    `${topic} isn't the future. It's the present. And most agencies are asleep at the wheel.`,
    `Unpopular opinion: ${topic} will replace 50% of agency tasks by 2027. Agree or disagree?`,
  ];
  const tweets = templates.slice(0, count).map((tweet, i) => ({ id: i + 1, tweet, char_count: tweet.length }));
  return time("twitter", () => ({ topic, count: tweets.length, tweets }));
}

export function batch(args: { tasks?: string[] } = {}) {
  const tasks = args.tasks || ["Write 5 tweets", "Draft newsletter", "Create blog outline", "Record video script", "Update case study"];
  const prioritized = tasks.map((task, i) => ({
    priority: i + 1, task,
    estimated_minutes: [15, 30, 20, 45, 25][i % 5],
    complexity: ["low", "medium", "low", "high", "medium"][i % 5],
    time_block: `${9 + Math.floor(i * 1.5)}:00-${9 + Math.floor(i * 1.5) + 1}:00`,
  }));
  const total = prioritized.reduce((s, t) => s + t.estimated_minutes, 0);
  return time("batch", () => ({ tasks: prioritized, total_tasks: prioritized.length, total_minutes: total, estimated_hours: Math.round((total / 60) * 10) / 10 }));
}

export function bio(args: { role?: string; expertise?: string; personality?: string } = {}) {
  const role = args.role || "AI consultant";
  const expertise = args.expertise || "building AI agent systems for agencies";
  const personality = args.personality || "direct, no-BS, results-focused";
  const bios = {
    twitter: `${role} helping agencies 10x with AI agents. ${expertise}. ${personality}. DM for collabs.`,
    linkedin: `${role} | ${expertise} | I help agencies automate 80% of repetitive tasks with AI agents. ${personality}. Let's talk.`,
    instagram: `${role}\n🤖 ${expertise}\n💡 ${personality}\n📩 DM for consulting`,
  };
  return time("bio", () => ({ role, expertise, personality, bios, char_counts: { twitter: bios.twitter.length, linkedin: bios.linkedin.length, instagram: bios.instagram.length } }));
}

export function grid(args: { posts?: number; theme?: string } = {}) {
  const posts = args.posts || 9;
  const theme = args.theme || "minimalist tech";
  const types = ["quote", "tip", "case_study", "question", "announcement"];
  const generated = Array.from({ length: posts }, (_, i) => ({ id: i + 1, type: types[i % types.length], visual_style: theme, caption_template: "[Hook]\n[Value]\n[CTA]" }));
  return time("grid", () => ({
    total_posts: generated.length,
    theme,
    posts: generated,
    layout: { row_1: "announcement|quote|tip", row_2: "case_study|question|announcement", row_3: "tip|quote|case_study" },
  }));
}
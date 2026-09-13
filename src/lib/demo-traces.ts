// Demo traces — seeded when store is empty so judges see populated /traces
import type { Trace } from "./trace-store";

export function generateDemoTraces(): Trace[] {
  const now = Date.now();
  const h = (n: number) => new Date(now - n * 3600_000).toISOString();
  const m = (n: number) => new Date(now - n * 60_000).toISOString();
  const t = (id: string, ts: string, agent: string, cmd: string, out: string,
    pats: number, fixes: string[], ms: number, score: number): Trace => ({
    id, timestamp: ts, agent, command: cmd, input: cmd, output: out,
    humanize_report: { patterns_found: pats, fixes }, latency_ms: ms, score, tags: ["demo"],
  });
  return [
    t("d01", m(12),  "hooks",     "10 hooks for agency OS launch",  "10 hooks scored 6-9/10 across provocation, curiosity, and stat-driven types.", 1, ["Replaced 'utilize' with 'use'"], 320, 88),
    t("d02", m(45),  "launch",    "launch QuarterBack",             "7-day plan: teaser → BTS → early access → launch. Social + email + PR cadence.", 2, ["Simplified 'comprehensive solution'", "Removed 'leverage'"], 680, 82),
    t("d03", m(90),  "research",  "research AI agencies",           "8 competitors found. Gaps: mid-market pricing, most lack real agent orchestration.", 1, ["Replaced 'cutting-edge' with 'working'"], 1450, 76),
    t("d04", h(2.5), "commander_frame", "diagnose my marketing",   "6-stage diagnostic: pain points (no ICP, weak social proof), value props underserved.", 2, ["Removed 'holistic approach'", "Simplified sentence"], 540, 91),
    t("d05", h(4),   "bio",       "optimize my bio for Julius",    "Optimized bios for Twitter (158 chars + CTA), LinkedIn (headline + about), IG.", 0, [], 180, 94),
    t("d06", h(5),   "ad_creative", "carousel ad for fitness brand","5-slide carousel: hook → problem → solution → proof → CTA. Copy per slide.", 1, ["Replaced 'transform your body' with 'show up consistently'"], 720, 85),
    t("d07", h(7),   "outreach",  "outreach for scaling operations","Referral Lever selected. 3 cold emails + 2 follow-ups + 1 breakup. Lead: warm.", 2, ["Removed 'synergy'", "Shortened P.S."], 890, 79),
    t("d08", h(10),  "repurpose", "repurpose I built 22 agents into a full OS", "6 pieces: Twitter thread, LinkedIn post, IG carousel, newsletter, blog, YT desc.", 3, ["Removed 'game-changer'", "Replaced 'leverage'", "Shortened hook"], 410, 87),
    t("d09", h(14),  "finance",   "finance",                         "Revenue: $12,400 MRR. Expenses: $3,200. Margin: 74%. YoY: +320%.", 0, [], 95, 96),
    t("d10", h(18),  "community", "community",                       "IG: 14.8K followers (+340 week). Engagement 4.2%. Top: carousel 2.1K likes.", 1, ["Replaced 'thriving' with numbers"], 110, 92),
    t("d11", h(20),  "grid",      "grid preview",                    "3x3 grid: quote/carousel/single pattern. Navy + gold palette.", 0, [], 150, 90),
    t("d12", h(26),  "site",      "build my website",                "One-pager: Hero + CTA, Features, Pricing, Testimonials, Footer.", 1, ["Simplified hero copy"], 560, 84),
    t("d13", h(30),  "twitter",   "twitter thread on building in public", "10-tweet thread: hook, story, lesson, proof, CTA. Engagement hooks at 3, 6, 9.", 2, ["Removed emoji spam", "Made hook punchier"], 380, 86),
    t("d14", h(36),  "digest",    "digest",                          "Morning brief: 3 agents ran, 12 hooks, 2 campaigns active, IG +340.", 0, [], 85, 93),
    t("d15", h(42),  "story_sequence", "lead score for startup CTOs","8 leads scored: 3 hot, 4 warm, 1 cold. Hot leads get DM, case study, offer.", 1, ["Replaced 'nurture' with 'next steps'"], 650, 81),
  ];
}

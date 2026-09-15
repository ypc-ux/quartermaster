/**
 * Weekly GPU Price Report Generator.
 * Live prices + scores → LLM writes weekly analysis for X/LinkedIn/blog.
 */

import { llmComplete } from '../llm';
import { fetchAllOffers } from './providers';
import { calculateDealScore, scoreToLabel, type ScoredOffer } from './deal-score';

export interface WeeklyReport {
  title: string;
  summary: string;
  twitter_thread: string;
  linkedin_post: string;
  blog_markdown: string;
  stats: { total_offers: number; models: number; cheapest_gpu: string; cheapest_price: number; best_deal: string; best_score: number };
  generated_at: string;
  source: 'llm' | 'template';
}

const SYSTEM_PROMPT = `You are a GPU market analyst writing a weekly price report for VoltageIndex. Write for AI engineers and ML practitioners.
RULES: Direct, no fluff. 6th-grade language. No AI slop. Lead with the most interesting finding. Include real prices and GPU names.
End every piece with: "Check live prices: agentdatasync.com/gpu.html | Free audit: agentdatasync.com/audit.html"
Twitter thread: 5-7 tweets, each under 280 chars, numbered 1/ through N/. LinkedIn: 150-200 words. Blog: 300-400 words with headers.`;

function buildPrompt(scored: ScoredOffer[]): string {
  const top20 = scored.slice(0, 20);
  const byModel: Record<string, ScoredOffer[]> = {};
  for (const o of top20) { if (!byModel[o.gpu_name]) byModel[o.gpu_name] = []; byModel[o.gpu_name].push(o); }
  const models = Object.entries(byModel).map(([n, offers]) => {
    const c = offers.reduce((a, b) => a.price_hr < b.price_hr ? a : b);
    return `- ${n}: cheapest $${c.price_hr.toFixed(2)}/hr (${c.provider}/${c.pool})`;
  }).join('\n');
  const steals = scored.filter(o => o.deal_score >= 9).slice(0, 5).map(o =>
    `- ${o.gpu_name} on ${o.provider}: $${o.price_hr.toFixed(2)}/hr, ${o.deal_score}/10 STEAL`
  ).join('\n');
  return `DATA: ${scored.length} offers, ${new Set(scored.map(o => o.gpu_name)).size} models.\n\nTOP MODELS:\n${models}\n\nSTEAL DEALS:\n${steals || 'None this week.'}\n\nWrite the weekly report.`;
}

export async function generateWeeklyReport(): Promise<WeeklyReport> {
  const ts = new Date().toISOString();
  const { offers } = await fetchAllOffers();
  const scored: ScoredOffer[] = offers.map(o => ({ ...o, ...calculateDealScore(o) }));
  scored.sort((a, b) => b.deal_score - a.deal_score || a.price_hr - b.price_hr);

  const cheapest = scored[scored.length - 1] || scored[0];
  const bestDeal = scored[0];
  const models = new Set(scored.map(o => o.gpu_name)).size;
  const stats = {
    total_offers: scored.length, models,
    cheapest_gpu: cheapest?.gpu_name || 'N/A', cheapest_price: cheapest?.price_hr || 0,
    best_deal: bestDeal ? `${bestDeal.gpu_name} (${bestDeal.provider})` : 'N/A',
    best_score: bestDeal?.deal_score || 0,
  };

  const llm = await llmComplete([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildPrompt(scored) },
  ], { max_tokens: 2048, temperature: 0.4 });

  const weekOf = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (llm.ok && llm.text.length > 100) {
    const text = llm.text;
    const tm = text.match(/(?:Twitter|X)\s*(?:thread|post)[:\s]*\n([\s\S]*?)(?=\n(?:LinkedIn|Blog|$))/i);
    const lm = text.match(/LinkedIn[:\s]*\n([\s\S]*?)(?=\n(?:Blog|$))/i);
    const bm = text.match(/Blog[:\s]*\n([\s\S]*?)$/i);
    return {
      title: `GPU Price Report \u2014 Week of ${weekOf}`,
      summary: text.split('\n')[0],
      twitter_thread: tm?.[1]?.trim() || text.slice(0, 1400),
      linkedin_post: lm?.[1]?.trim() || text.slice(0, 800),
      blog_markdown: bm?.[1]?.trim() || text,
      stats, generated_at: ts, source: 'llm',
    };
  }

  const top5 = scored.slice(0, 5);
  const deals = top5.map((o, i) => `${i + 1}. ${o.gpu_name} \u2014 $${o.price_hr.toFixed(2)}/hr (${o.provider}), ${o.deal_score}/10 ${o.score_label}`).join('\n');
  return {
    title: `GPU Price Report \u2014 Week of ${weekOf}`,
    summary: `${scored.length} offers tracked. Cheapest: ${cheapest?.gpu_name} at $${cheapest?.price_hr.toFixed(2)}/hr.`,
    twitter_thread: `1/ GPU Price Report \u2014 ${weekOf}\n\n${scored.length} offers, ${models} models.\n\nTop deals:\n${deals}\n\n2/ Cheapest: ${cheapest?.gpu_name} at $${cheapest?.price_hr.toFixed(2)}/hr on ${cheapest?.provider}.\n\n3/ Best score: ${bestDeal?.gpu_name} \u2014 ${bestDeal?.deal_score}/10.\n\n4/ agentdatasync.com/gpu.html | agentdatasync.com/audit.html`,
    linkedin_post: `GPU Price Report \u2014 ${weekOf}\n\n${scored.length} live offers across ${models} models.\n\nTop 3:\n${top5.slice(0, 3).map(o => `\u2022 ${o.gpu_name}: $${o.price_hr.toFixed(2)}/hr (${o.provider}) \u2014 ${o.deal_score}/10`).join('\n')}\n\nagentdatasync.com/gpu.html | agentdatasync.com/audit.html`,
    blog_markdown: `# GPU Price Report \u2014 ${weekOf}\n\n## Summary\n\n${scored.length} offers across ${models} models.\n\n## Top Deals\n\n${top5.map(o => `- **${o.gpu_name}** on ${o.provider}: $${o.price_hr.toFixed(2)}/hr \u2014 ${o.deal_score}/10 ${o.score_label}`).join('\n')}\n\n## Cheapest\n\n${cheapest?.gpu_name} at $${cheapest?.price_hr.toFixed(2)}/hr.\n\n[Price Index](https://agentdatasync.com/gpu.html) | [Calculator](https://agentdatasync.com/calculator.html) | [Free Audit](https://agentdatasync.com/audit.html)`,
    stats, generated_at: ts, source: 'template',
  };
}
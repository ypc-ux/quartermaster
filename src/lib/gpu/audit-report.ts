/**
 * Audit Report Engine — personalized GPU savings reports.
 * Lead data + live prices → LLM-drafted report. Template fallback.
 */

import { llmComplete } from '../llm';
import { fetchAllOffers } from './providers';
import { calculateDealScore, scoreToLabel, type ScoredOffer } from './deal-score';

export interface AuditLead {
  email: string;
  monthly_spend?: string;
  provider?: string;
  gpu_type?: string;
}

export interface AuditReport {
  subject: string;
  html: string;
  plain: string;
  generated_at: string;
  source: 'llm' | 'template';
  model?: string;
  latency_ms?: number;
}

const SYSTEM_PROMPT = `You are a GPU cost analyst for VoltageIndex. Write a personalized savings report.
RULES: Be direct. Use real numbers. 6th-grade language. No AI slop (no "leverage", "comprehensive", "holistic").
Structure: Current Situation → Where You're Overpaying → Recommended Switches → Savings Estimate → Next Step.
Under 300 words. End with: "Reply to this email or visit agentdatasync.com/offer.html to get started."`;

function buildUserPrompt(lead: AuditLead, topOffers: ScoredOffer[]): string {
  const spendMap: Record<string, string> = { 'under-1k': 'under $1K/mo', '1k-10k': '$1K-$10K/mo', '10k-50k': '$10K-$50K/mo', '50k-plus': '$50K+/mo' };
  const provMap: Record<string, string> = { aws: 'AWS', gcp: 'Google Cloud', azure: 'Azure', runpod: 'RunPod', vast: 'Vast.ai', other: 'Other' };
  const spend = spendMap[lead.monthly_spend || ''] || 'unknown';
  const provider = provMap[lead.provider || ''] || 'unknown';
  const gpuType = lead.gpu_type || 'not specified';
  const relevant = gpuType !== 'not specified' ? topOffers.filter(o => o.gpu_name.toLowerCase().includes(gpuType.toLowerCase())).slice(0, 5) : [];
  const general = topOffers.slice(0, 10);
  const offerLines = [...new Set([...relevant, ...general])].slice(0, 12).map(o =>
    `- ${o.gpu_name} (${o.provider}/${o.pool}): $${o.price_hr.toFixed(2)}/hr, score ${o.deal_score}/10 ${o.score_label}, ${o.vram_gb || '?'}GB`
  ).join('\n');
  return `LEAD: ${lead.email} | Spend: ${spend} | Provider: ${provider} | GPU: ${gpuType}\n\nLIVE DEALS:\n${offerLines}\n\nWrite the savings report. Address "Hi". Be specific about switches and savings.`;
}

function wrapInEmailTemplate(text: string): string {
  const paragraphs = text.split('\n').filter(p => p.trim()).map(p => {
    const t = p.trim();
    if (t.startsWith('- ') || t.startsWith('• ')) return `<li style="color:#94a3b8;font-size:0.9rem;line-height:1.6;margin-bottom:0.3rem;">${t.slice(2)}</li>`;
    if (t.match(/^(Current|Where|Recommended|Savings|Next|The )/i)) return `<h3 style="color:#00e5ff;font-size:1rem;margin:1.2rem 0 0.4rem;">${t}</h3>`;
    return `<p style="color:#e2e8f0;font-size:0.92rem;line-height:1.6;margin-bottom:0.6rem;">${t}</p>`;
  }).join('');
  return `<div style="font-family:Inter,Arial,sans-serif;background:#050810;color:#e2e8f0;padding:2rem;border-radius:12px;max-width:600px;">
  <h2 style="color:#00e5ff;margin-bottom:1rem;">Your GPU Savings Report</h2>
  ${paragraphs}
  <hr style="border:none;border-top:1px solid rgba(0,229,255,0.1);margin:1.5rem 0;">
  <p style="color:#64748b;font-size:0.78rem;">VoltageIndex — We track GPU prices so you don't overpay.<br>
  <a href="https://agentdatasync.com/gpu.html" style="color:#00e5ff;">Live Prices</a> · <a href="https://agentdatasync.com/calculator.html" style="color:#00e5ff;">Calculator</a> · <a href="https://agentdatasync.com/offer.html" style="color:#00e5ff;">Managed GPU</a></p>
</div>`;
}

/**
 * Generate a personalized audit report. Tries LLM first; template fallback.
 */
export async function generateAuditReport(lead: AuditLead): Promise<AuditReport> {
  const ts = new Date().toISOString();
  const { offers } = await fetchAllOffers();
  const scored: ScoredOffer[] = offers.map(o => ({ ...o, ...calculateDealScore(o) }));
  scored.sort((a, b) => b.deal_score - a.deal_score || a.price_hr - b.price_hr);

  const prompt = buildUserPrompt(lead, scored);
  const llm = await llmComplete([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ], { max_tokens: 1024, temperature: 0.3 });

  if (llm.ok && llm.text.length > 50) {
    return {
      subject: 'Your GPU Savings Report \u2014 VoltageIndex',
      html: wrapInEmailTemplate(llm.text),
      plain: llm.text,
      generated_at: ts, source: 'llm',
      model: llm.model, latency_ms: llm.latency_ms,
    };
  }

  const top3 = scored.slice(0, 3);
  const deals = top3.map(o => `- ${o.gpu_name} on ${o.provider} (${o.pool}): $${o.price_hr.toFixed(2)}/hr \u2014 ${o.deal_score}/10 ${o.score_label}`).join('\n');
  const tpl = `Hi,\n\nYour GPU savings report based on ${scored.length} live offers:\n\n${deals}\n${lead.gpu_type ? `\nYou mentioned ${lead.gpu_type}. ` : ''}${lead.provider ? `Your current provider (${lead.provider}) typically charges 2-3x these rates.` : 'Most cloud providers charge 2-3x these rates.'}\n\nReply with your current GPU, hours/month, and price for exact savings.\n\nagentdatasync.com/offer.html | $19-$199/mo managed GPU\n\n\u2014 VoltageIndex`;

  return {
    subject: 'Your GPU Savings Report \u2014 VoltageIndex',
    html: wrapInEmailTemplate(tpl),
    plain: tpl,
    generated_at: ts, source: 'template',
  };
}
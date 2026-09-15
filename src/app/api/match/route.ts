/**
 * POST /api/match — GPU Matchmaker.
 * GitHub repo or project description → GPU recommendations.
 */
import { NextRequest, NextResponse } from 'next/server';
import { llmSimple } from '@/lib/llm';
import { fetchAllOffers } from '@/lib/gpu/providers';
import { calculateDealScore, type ScoredOffer } from '@/lib/gpu/deal-score';

interface Rec {
  gpu: string; provider: string; pool: string; price_hr: number;
  deal_score: number; score_label: string; vram_gb: number | null;
  use_cases: string[]; why: string;
}

const GPU_USE_CASES: Record<string, string[]> = {
  'H100': ['LLM training 70B+', 'Fine-tuning large models', 'Research clusters'],
  'H200': ['Next-gen LLM training', 'Massive inference'],
  'B200': ['Blackwell training', 'Largest models'],
  'B300': ['Blackwell Ultra', 'Frontier AI research'],
  'A100': ['Fine-tuning 7B-70B', 'LLM inference', 'ML training'],
  'RTX 4090': ['Stable Diffusion', 'Fine-tuning 7B-13B', 'Local inference'],
  'RTX 3090': ['Budget fine-tuning', 'SDXL training', 'Local LLM'],
  'RTX 5090': ['Next-gen rendering', 'Video generation'],
  'RTX 5080': ['Inference', 'Fine-tuning small models'],
  'L4': ['Inference server', 'Vision models', 'TTS/STT'],
  'L40': ['Inference', 'Video processing', '3D rendering'],
  'L40S': ['Inference', 'Mixed precision training'],
  'T4': ['Budget inference', 'Colab replacement', 'Small model serving'],
  'A40': ['Inference', 'Rendering', 'VRAM-heavy tasks'],
  'MI300': ['AMD alternative', 'Large model inference'],
};

function getUseCases(name: string): string[] {
  for (const [k, v] of Object.entries(GPU_USE_CASES)) { if (name.includes(k)) return v; }
  return ['General GPU compute'];
}

async function classifyFromText(desc: string) {
  const resp = await llmSimple(
    'Respond with ONLY valid JSON: {"task":"<type>","vram":<number>,"gpu_class":"budget|mid|pro|ultra"}',
    `Classify: "${desc.slice(0, 300)}"\nTask types: fine-tune-small, fine-tune-large, inference-small, inference-large, training, stable-diffusion, image-gen, video-gen, rendering, colab-replacement, general-ml`,
    { max_tokens: 100, temperature: 0.1 }
  );
  try { const m = resp.match(/\{[^}]+\}/); if (m) return JSON.parse(m[0]); } catch {}
  const l = desc.toLowerCase();
  if (l.includes('train') || l.includes('fine-tun')) return l.includes('70b') || l.includes('large') ? { task: 'fine-tune-large', vram: 80, gpu_class: 'pro' } : { task: 'fine-tune-small', vram: 24, gpu_class: 'mid' };
  if (l.includes('stable') || l.includes('diffusion') || l.includes('sdxl')) return { task: 'stable-diffusion', vram: 24, gpu_class: 'mid' };
  if (l.includes('video') || l.includes('render')) return { task: 'rendering', vram: 16, gpu_class: 'mid' };
  if (l.includes('inference') || l.includes('serve')) return { task: 'inference-small', vram: 16, gpu_class: 'mid' };
  return { task: 'general-ml', vram: 16, gpu_class: 'mid' };
}

async function classifyFromRepo(tree: string) {
  const l = tree.toLowerCase();
  const has = (s: string) => l.includes(s);
  if (has('.ipynb') || has('finetune') || has('peft') || has('lora'))
    return has('70b') || has('llama-3') ? { task: 'fine-tune-large', vram: 80, gpu_class: 'pro' } : { task: 'fine-tune-small', vram: 24, gpu_class: 'mid' };
  if (has('stable') || has('diffusion') || has('sdxl') || has('comfyui')) return { task: 'stable-diffusion', vram: 24, gpu_class: 'mid' };
  if (has('requirements.txt') && (has('torch') || has('tensorflow') || has('jax'))) return { task: 'training', vram: 24, gpu_class: 'mid' };
  if (has('dockerfile') && has('cuda')) return { task: 'inference-small', vram: 16, gpu_class: 'mid' };
  return { task: 'general-ml', vram: 16, gpu_class: 'budget' };
}

function filterByClass(scored: ScoredOffer[], cls: string, vram: number): ScoredOffer[] {
  const min = Math.max(vram * 0.8, 8);
  return scored.filter(o => {
    if ((o.vram_gb ?? 0) < min) return false;
    if (cls === 'budget') return o.price_hr <= 0.15;
    if (cls === 'mid') return o.price_hr <= 0.50;
    if (cls === 'pro') return o.price_hr <= 2.00;
    return true;
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const repoUrl = body.repo_url?.trim();
    const description = body.description?.trim();
    if (!repoUrl && !description) return NextResponse.json({ error: 'Provide repo_url or description' }, { status: 400 });

    let classification: { task: string; vram: number; gpu_class: string };
    let inputSummary: string;

    if (repoUrl) {
      const m = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!m) return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
      const [, owner, repo] = m;
      const treeRes = await fetch(`${req.nextUrl.origin}/api/repo?owner=${owner}&repo=${repo}`);
      const treeData = await treeRes.json();
      const treeText = (treeData.tree || []).map((e: { path: string }) => e.path).join('\n');
      classification = await classifyFromRepo(treeText);
      inputSummary = `GitHub: ${owner}/${repo}`;
    } else {
      classification = await classifyFromText(description);
      inputSummary = description.slice(0, 200);
    }

    const { offers } = await fetchAllOffers();
    const scored: ScoredOffer[] = offers.map(o => ({ ...o, ...calculateDealScore(o) }));
    scored.sort((a, b) => b.deal_score - a.deal_score || a.price_hr - b.price_hr);

    const filtered = filterByClass(scored, classification.gpu_class, classification.vram);
    const final = filtered.length >= 3 ? filtered.slice(0, 3) : scored.filter(o => (o.vram_gb ?? 0) >= 8).slice(0, 3);

    return NextResponse.json({
      workload: classification.task,
      task_type: classification.task.replace(/-/g, ' '),
      vram_needed: classification.vram,
      input_summary: inputSummary,
      recommendations: final.map(o => ({
        gpu: o.gpu_name, provider: o.provider, pool: o.pool,
        price_hr: o.price_hr, deal_score: o.deal_score, score_label: o.score_label,
        vram_gb: o.vram_gb, use_cases: getUseCases(o.gpu_name),
        why: o.deal_score >= 8 ? 'Great deal \u2014 high score, low price' : o.deal_score >= 6 ? 'Solid option \u2014 good balance' : 'Available \u2014 check details',
      })),
    }, { headers: { 'Cache-Control': 'public, s-maxage=300' } });
  } catch (err) {
    console.error('Match error:', err);
    return NextResponse.json({ error: 'Failed to match' }, { status: 500 });
  }
}
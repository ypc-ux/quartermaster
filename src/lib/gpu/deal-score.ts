/**
 * GPU Deal Score Engine — deterministic scoring, no AI slop.
 * Ported from gpu-broker/deal_score.py.
 *
 * 5 checks, 100 points total → 1-10 scale:
 * 1. Cheap   (30pts) — price vs median for this GPU model
 * 2. Trusted (25pts) — seller reliability/verification
 * 3. Stable  (20pts) — will it kick you off?
 * 4. Fast    (15pts) — internet speed + egress costs
 * 5. Strong  (10pts) — can it do AI work?
 */

const MODERN_GPUS = ['H100', 'A100', 'RTX 4090', 'RTX 3090', 'MI300', 'MI250', 'B200', 'B300', 'H200'];

export interface RawOffer {
  id?: string | number;
  reliability?: number;
  verification?: string;
  rentable?: boolean;
  rented?: boolean;
  inet_up?: number;
  inet_down?: number;
  inet_up_cost?: number;
  inet_down_cost?: number;
  pool?: string;
  [key: string]: unknown;
}

export interface GpuOffer {
  provider: 'vast' | 'runpod';
  offer_id: string;
  gpu_name: string;
  vram_gb: number | null;
  num_gpus: number;
  price_hr: number;
  pool: string;
  region: string;
  raw?: RawOffer;
}

export interface DealScore {
  deal_score: number;
  score_label: string;
  breakdown: { cheap: number; trusted: number; stable: number; fast: number; strong: number };
  total_raw: number;
}

export type ScoredOffer = GpuOffer & DealScore;

function scoreCheap(priceHr: number, medianPrice?: number | null): number {
  if (!medianPrice || medianPrice === 0) return 15;
  const ratio = priceHr / medianPrice;
  if (ratio <= 0.70) return 30;
  if (ratio <= 0.85) return 25;
  if (ratio <= 1.00) return 20;
  if (ratio <= 1.15) return 15;
  if (ratio <= 1.30) return 10;
  return 5;
}

function scoreTrusted(provider: string, raw?: RawOffer): number {
  if (provider === 'vast') {
    const reliability = raw?.reliability ?? 0;
    const verification = raw?.verification ?? 'unverified';
    let score = 0;
    if (reliability >= 0.95) score += 15;
    else if (reliability >= 0.90) score += 10;
    else if (reliability >= 0.80) score += 5;
    if (verification === 'verified') score += 10;
    else score += 3;
    return Math.min(score, 25);
  }
  return (raw?.pool === 'secure') ? 20 : 12;
}

function scoreStable(provider: string, raw?: RawOffer): number {
  if (provider === 'vast') {
    const rentable = raw?.rentable ?? false;
    const rented = raw?.rented ?? false;
    const reliability = raw?.reliability ?? 0;
    let score = 0;
    if (rentable && !rented) score += 10;
    else if (rentable) score += 5;
    score += Math.floor(reliability * 10);
    return Math.min(score, 20);
  }
  return (raw?.pool === 'secure') ? 18 : 10;
}

function scoreFastData(provider: string, raw?: RawOffer): number {
  if (provider === 'vast') {
    const inetUp = raw?.inet_up ?? 0;
    const inetDown = raw?.inet_down ?? 0;
    const upCost = raw?.inet_up_cost ?? 0;
    const downCost = raw?.inet_down_cost ?? 0;
    let score = 0;
    if (inetUp >= 500) score += 5;
    else if (inetUp >= 100) score += 3;
    if (inetDown >= 500) score += 5;
    else if (inetDown >= 100) score += 3;
    if (upCost > 10) score -= 3;
    if (downCost > 10) score -= 2;
    return Math.max(0, Math.min(score, 15));
  }
  return 10;
}

function scoreStrong(gpuName: string, vramGb: number | null, numGpus = 1): number {
  const vram = vramGb ?? 0;
  let score = 0;
  if (vram >= 80) score += 4;
  else if (vram >= 40) score += 3;
  else if (vram >= 16) score += 2;
  else if (vram >= 8) score += 1;
  if (numGpus >= 2) score += 3;
  else if (numGpus >= 1) score += 2;
  if (MODERN_GPUS.some(m => gpuName.includes(m))) score += 3;
  return Math.min(score, 10);
}

export function scoreToLabel(score: number): string {
  if (score >= 9) return 'STEAL';
  if (score >= 7) return 'GOOD';
  if (score >= 5) return 'FAIR';
  if (score >= 3) return 'RISKY';
  return 'TRAP';
}

export function calculateDealScore(
  offer: GpuOffer,
  medianPrices?: Record<string, number>,
): DealScore {
  const median = medianPrices?.[offer.gpu_name] ?? null;
  const raw = offer.raw;
  const cheap = scoreCheap(offer.price_hr, median);
  const trusted = scoreTrusted(offer.provider, raw);
  const stable = scoreStable(offer.provider, raw);
  const fast = scoreFastData(offer.provider, raw);
  const strong = scoreStrong(offer.gpu_name, offer.vram_gb, offer.num_gpus);
  const total = cheap + trusted + stable + fast + strong;
  const deal_score = Math.max(1, Math.min(10, Math.round(total / 10)));
  return {
    deal_score,
    score_label: scoreToLabel(deal_score),
    breakdown: { cheap, trusted, stable, fast, strong },
    total_raw: total,
  };
}
/**
 * GET /api/gpu — Live GPU price feed.
 * Fetches Vast.ai + RunPod, scores with deal-score, caches 1 hour.
 * Falls back to static snapshot when API keys are missing.
 */

import { NextResponse } from 'next/server';
import { fetchAllOffers } from '@/lib/gpu/providers';
import { calculateDealScore, scoreToLabel, type ScoredOffer } from '@/lib/gpu/deal-score';

// Cache entire response for 1 hour (Vercel ISR)
export const revalidate = 3600;

export async function GET() {
  try {
    const { offers, stats, source } = await fetchAllOffers();

    // Score every offer
    const scored: ScoredOffer[] = offers.map(offer => {
      const score = calculateDealScore(offer);
      return { ...offer, ...score };
    });

    // Sort: best deals first
    scored.sort((a, b) => b.deal_score - a.deal_score || a.price_hr - b.price_hr);

    // Group by GPU model for the calculator (cheapest per model)
    const byModel: Record<string, { price_hr: number; vram_gb: number | null; provider: string; deal_score: number; score_label: string }> = {};
    for (const o of scored) {
      const existing = byModel[o.gpu_name];
      if (!existing || o.price_hr < existing.price_hr) {
        byModel[o.gpu_name] = {
          price_hr: o.price_hr,
          vram_gb: o.vram_gb,
          provider: o.provider,
          deal_score: o.deal_score,
          score_label: o.score_label,
        };
      }
    }

    return NextResponse.json({
      offers: scored.slice(0, 80),        // top 80 deals (keeps payload reasonable)
      by_model: byModel,                  // cheapest per model (for calculator)
      stats: {
        ...stats,
        total_scored: scored.length,
        steal_count: scored.filter(o => o.deal_score >= 9).length,
        good_count: scored.filter(o => o.deal_score >= 7 && o.deal_score < 9).length,
      },
      source,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    // Last-resort: serve static fallback on any error
    const { default: fallback } = await import('@/lib/gpu/fallback.json');
    return NextResponse.json({ ...fallback, source: 'static-error' }, { status: 200 });
  }
}
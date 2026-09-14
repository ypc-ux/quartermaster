/**
 * GPU Provider API clients — Vast.ai + RunPod.
 * Each returns normalized GpuOffer[].
 * Falls back gracefully when keys are missing.
 */

import type { GpuOffer, RawOffer } from './deal-score';
import fallbackData from './fallback.json';

const VAST_URL = 'https://cloud.vast.ai/api/v0/bundles/';
const RUNPOD_URL = 'https://api.runpod.io/v2/catalog/gpus';
const TIMEOUT = 8000;

export type GpuResponse = {
  offers: GpuOffer[];
  stats: { total_offers: number; models: number; providers: string[]; updated_at: string };
  source: 'live' | 'static' | 'partial';
};

export async function fetchAllOffers(): Promise<GpuResponse> {
  const vastKey = process.env.VAST_API_KEY;
  const runpodKey = process.env.RUNPOD_API_KEY;

  // If no keys at all, return static fallback
  if (!vastKey && !runpodKey) {
    const offers = (fallbackData.offers as Record<string, unknown>[]).map((o, i) => ({
      provider: (String(o.provider ?? 'vast') === 'runpod' ? 'runpod' : 'vast') as 'vast' | 'runpod',
      offer_id: String(o.offer_id ?? `static-${i}`),
      gpu_name: String(o.gpu_name ?? 'unknown'),
      vram_gb: (o.vram_gb as number) ?? null,
      num_gpus: (o.num_gpus as number) ?? 1,
      price_hr: (o.price_hr as number) ?? 0,
      pool: String(o.pool ?? 'unknown'),
      region: String(o.region ?? ''),
    }));
    return {
      offers,
      stats: fallbackData.stats as GpuResponse['stats'],
      source: 'static',
    };
  }

  const [vastOffers, runpodOffers] = await Promise.all([
    vastKey ? fetchVast(vastKey).catch(() => []) : Promise.resolve<GpuOffer[]>([]),
    runpodKey ? fetchRunpod(runpodKey).catch(() => []) : Promise.resolve<GpuOffer[]>([]),
  ]);

  const allOffers = [...vastOffers, ...runpodOffers];

  // If all failed, fall back
  if (allOffers.length === 0) {
    const offers = (fallbackData.offers as Record<string, unknown>[]).map((o, i) => ({
      provider: (String(o.provider ?? 'vast') === 'runpod' ? 'runpod' : 'vast') as 'vast' | 'runpod',
      offer_id: String(o.offer_id ?? `static-${i}`),
      gpu_name: String(o.gpu_name ?? 'unknown'),
      vram_gb: (o.vram_gb as number) ?? null,
      num_gpus: (o.num_gpus as number) ?? 1,
      price_hr: (o.price_hr as number) ?? 0,
      pool: String(o.pool ?? 'unknown'),
      region: String(o.region ?? ''),
    }));
    return {
      offers,
      stats: fallbackData.stats as GpuResponse['stats'],
      source: 'static',
    };
  }

  const models = new Set(allOffers.map(o => o.gpu_name));
  const providers = [...new Set(allOffers.map(o => o.provider))];
  const isPartial = vastOffers.length === 0 || runpodOffers.length === 0;

  return {
    offers: allOffers,
    stats: {
      total_offers: allOffers.length,
      models: models.size,
      providers,
      updated_at: new Date().toISOString(),
    },
    source: isPartial ? 'partial' : 'live',
  };
}

async function fetchVast(apiKey: string): Promise<GpuOffer[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const params = new URLSearchParams({
      q: JSON.stringify({ order: [['dph_total', 'asc']], type: 'on-demand' }),
    });
    const res = await fetch(`${VAST_URL}?${params}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`Vast ${res.status}`);
    const data = await res.json();
    const offers: GpuOffer[] = (data.offers ?? []).slice(0, 120).map((o: RawOffer) => ({
      provider: 'vast' as const,
      offer_id: String(o.id ?? ''),
      gpu_name: String(o.gpu_name ?? 'unknown'),
      vram_gb: o.gpu_ram ? Math.round((o.gpu_ram as number) / 1024 * 10) / 10 : null,
      num_gpus: (o.num_gpus as number) ?? 1,
      price_hr: Math.round((o.dph_total as number ?? 0) * 10000) / 10000,
      pool: 'on-demand',
      region: String(o.geolocation ?? ''),
      raw: o,
    }));
    return offers;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchRunpod(apiKey: string): Promise<GpuOffer[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(RUNPOD_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`RunPod ${res.status}`);
    const data = await res.json();
    const offers: GpuOffer[] = [];
    for (const gpu of (data.gpus ?? [])) {
      const price = gpu.price ?? {};
      const dcs = ((gpu.dataCenters ?? []) as { name: string }[]).slice(0, 3).map(d => d.name).join(', ');
      const maxCount = gpu.maxCount ?? {};
      if (price.community && price.community > 0) {
        offers.push({
          provider: 'runpod',
          offer_id: `${gpu.id}-community`,
          gpu_name: gpu.name ?? 'unknown',
          vram_gb: gpu.memory ?? null,
          num_gpus: maxCount.community ?? 1,
          price_hr: Math.round(price.community * 10000) / 10000,
          pool: 'community',
          region: dcs,
          raw: { ...gpu, pool: 'community' } as RawOffer,
        });
      }
      if (price.secure && price.secure > 0) {
        offers.push({
          provider: 'runpod',
          offer_id: `${gpu.id}-secure`,
          gpu_name: gpu.name ?? 'unknown',
          vram_gb: gpu.memory ?? null,
          num_gpus: maxCount.secure ?? 1,
          price_hr: Math.round(price.secure * 10000) / 10000,
          pool: 'secure',
          region: dcs,
          raw: { ...gpu, pool: 'secure' } as RawOffer,
        });
      }
    }
    return offers;
  } finally {
    clearTimeout(timer);
  }
}
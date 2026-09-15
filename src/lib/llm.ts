/**
 * LLM provider abstraction — OpenRouter first (ONE key per .clinerules).
 * Falls back gracefully when key is missing.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4o-mini'; // cheap, fast, good for structured output
const TIMEOUT = 30_000;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LlmOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  timeout?: number;
}

interface LlmResult {
  text: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  ok: boolean;
  error?: string;
}

/**
 * Send a prompt to the LLM and get a response.
 * Returns structured result — never throws.
 */
export async function llmComplete(
  messages: Message[],
  opts: LlmOptions = {},
): Promise<LlmResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { text: '', model: 'none', tokens_in: 0, tokens_out: 0, latency_ms: 0, ok: false, error: 'OPENROUTER_API_KEY not set' };
  }

  const model = opts.model || process.env.LLM_MODEL || DEFAULT_MODEL;
  const timeout = opts.timeout || TIMEOUT;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const t0 = Date.now();

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://agentdatasync.com',
        'X-Title': 'VoltageIndex',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: opts.max_tokens || 2048,
        temperature: opts.temperature ?? 0.3,
      }),
      signal: controller.signal,
    });

    const latency_ms = Date.now() - t0;
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { text: '', model, tokens_in: 0, tokens_out: 0, latency_ms, ok: false, error: `LLM ${res.status}: ${body.slice(0, 200)}` };
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const usage = data.usage || {};

    return {
      text,
      model,
      tokens_in: usage.prompt_tokens || 0,
      tokens_out: usage.completion_tokens || 0,
      latency_ms,
      ok: true,
    };
  } catch (err: unknown) {
    const latency_ms = Date.now() - t0;
    const msg = err instanceof Error ? err.message : String(err);
    return { text: '', model, tokens_in: 0, tokens_out: 0, latency_ms, ok: false, error: msg };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Convenience: single prompt in, text out. Returns empty string on failure.
 */
export async function llmSimple(systemPrompt: string, userMessage: string, opts?: LlmOptions): Promise<string> {
  const result = await llmComplete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ], opts);
  return result.text;
}
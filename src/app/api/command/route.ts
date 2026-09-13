import { NextRequest, NextResponse } from 'next/server';
import { parseCommand, executeAgent, AGENT_REGISTRY } from '@/lib/agents';
import { humanizeResult } from '@/lib/humanizer';
import { getPostHogServer } from '@/lib/posthog-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const command = body.command?.trim();

    if (!command) {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      );
    }

    // Parse the command
    const { agentName, args } = parseCommand(command);

    // Execute the agent
    const result = executeAgent(agentName, args);

    // If research agent + Serper key present, enrich with live search results
    const serperKey = process.env.SERPER_API_KEY;
    if (agentName === 'research' && serperKey && typeof serperKey === 'string' && serperKey.length > 10) {
      try {
        const query = args?.query || 'agency operating systems';
        const serperRes = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: query, num: 8 }),
          next: { revalidate: 300 },
        });
        if (serperRes.ok) {
          const serperData = await serperRes.json();
          result.data = {
            ...result.data,
            mode: 'live_search',
            query,
            live_results: (serperData.organic || []).map((r: any) => ({
              title: r.title,
              url: r.link,
              snippet: r.snippet,
            })),
            knowledge: serperData.knowledgeGraph || null,
          };
        }
      } catch {
        // Keep offline result if live search fails
      }
    }

    // SerpAPI enrichment: Google Trends for trends agent, Google Search for research fallback
    const serpApiKey = process.env.SERPAPI_API_KEY;
    if (serpApiKey && typeof serpApiKey === 'string' && serpApiKey.length > 10) {
      try {
        if (agentName === 'trends' && args?.topic) {
          // Google Trends TIMESERIES
          const trendsUrl = `https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(args.topic)}&data_type=TIMESERIES&date=today+12-m&api_key=${serpApiKey}`;
          const trendsRes = await fetch(trendsUrl, { next: { revalidate: 3600 } });
          if (trendsRes.ok) {
            const trendsData = await trendsRes.json();
            const timeline = (trendsData.interest_over_time?.timeline_data || []).slice(-12).map((p: any) => ({
              date: p.date,
              value: p.values?.[0]?.extracted_value || 0,
            }));
            result.data = {
              ...result.data,
              mode: 'live_trends',
              topic: args.topic,
              timeline,
              latest_value: timeline[timeline.length - 1]?.value || 0,
              peak: Math.max(...timeline.map((t: any) => t.value)),
            };
          }
        } else if (agentName === 'research' && args?.query && !serperKey) {
          // SerpAPI Google Search as fallback when no Serper key
          const searchUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(args.query)}&num=8&api_key=${serpApiKey}`;
          const searchRes = await fetch(searchUrl, { next: { revalidate: 300 } });
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            result.data = {
              ...result.data,
              mode: 'live_search',
              query: args.query,
              live_results: (searchData.organic_results || []).map((r: any) => ({
                title: r.title,
                url: r.link,
                snippet: r.snippet,
              })),
            };
          }
        }
      } catch {
        // Keep offline result if SerpAPI fails
      }
    }

    // Get agent metadata
    const agentSpec = AGENT_REGISTRY[agentName];

    // Apply humanizer to all text outputs
    const humanized = humanizeResult(result.data);

    // Log to digest queue (fire-and-forget)
    try {
      const digestUrl = new URL('/api/digest', req.url).toString();
      fetch(digestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: agentName,
          command,
          summary: JSON.stringify(humanized.data).slice(0, 200),
          points: agentSpec?.points || 0,
        }),
      }).catch(() => {});
    } catch {}

    // Notify Slack (fire-and-forget, when token is present)
    if (process.env.SLACK_BOT_TOKEN) {
      try {
        const notifyUrl = new URL('/api/notify', req.url).toString();
        fetch(notifyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent: agentName,
            command,
            summary: JSON.stringify(humanized.data).slice(0, 300),
            points: agentSpec?.points || 0,
            humanize_patterns: humanized.humanizeReport?.patterns_found || 0,
          }),
        }).catch(() => {});
      } catch {}
    }

    // PostHog: track command execution (fire-and-forget)
    const ph = getPostHogServer()
    ph?.capture({
      distinctId: 'quarterback-app',
      event: 'command_executed',
      properties: {
        agent: agentName,
        command,
        ok: result.ok,
        took_ms: result.took_ms,
        category: agentSpec?.category || 'unknown',
        points: agentSpec?.points || 0,
      },
    })

    return NextResponse.json({
      success: result.ok,
      agent: {
        name: agentName,
        category: agentSpec?.category || 'unknown',
        description: agentSpec?.description || '',
        points: agentSpec?.points || 0,
      },
      command,
      args,
      data: humanized.data,
      took_ms: result.took_ms,
      humanize: humanized.humanizeReport,
    });
  } catch (err) {
    console.error('Command execution error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // List all available agents
  const agents = Object.entries(AGENT_REGISTRY).map(([name, spec]) => ({
    name,
    category: spec.category,
    description: spec.description,
    points: spec.points,
  }));

  return NextResponse.json({
    agents,
    total: agents.length,
    live_search: !!(process.env.SERPER_API_KEY || process.env.SERPAPI_API_KEY),
    serpapi: !!process.env.SERPAPI_API_KEY,
    llm: !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY),
  });
}
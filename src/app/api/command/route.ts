import { NextRequest, NextResponse } from 'next/server';
import { parseCommand, executeAgent, AGENT_REGISTRY } from '@/lib/agents';

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

    // Get agent metadata
    const agentSpec = AGENT_REGISTRY[agentName];

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
      data: result.data,
      took_ms: result.took_ms,
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
    live_search: !!process.env.SERPER_API_KEY,
    llm: !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY),
  });
}
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slackToken = process.env.SLACK_BOT_TOKEN;
    const channel = process.env.SLACK_CHANNEL || '#quarterback';

    if (!slackToken) {
      return NextResponse.json({ ok: false, error: 'SLACK_BOT_TOKEN not set' }, { status: 500 });
    }

    // Format the message
    const agent = body.agent || 'System';
    const command = body.command || '';
    const summary = body.summary || '';
    const points = body.points || 0;
    const humanize = body.humanize_patterns || 0;

    const blocks = [
      {
        type: 'header',
        text: { type: 'plain_text', text: `🤖 ${agent} executed` }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Command:*\n${command}` },
          { type: 'mrkdwn', text: `*Points:*\n${points}` },
          { type: 'mrkdwn', text: `*Humanize:*\n${humanize} patterns` },
          { type: 'mrkdwn', text: `*Time:*\n${new Date().toLocaleTimeString()}` },
        ]
      },
      ...(summary ? [{
        type: 'section',
        text: { type: 'mrkdwn', text: `*Summary:*\n${summary.slice(0, 300)}` }
      }] : []),
    ];

    // Send to Slack
    const slackRes = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        blocks,
        text: `${agent}: ${command} (${points}pts)`,
      }),
    });

    const slackData = await slackRes.json();

    if (!slackData.ok) {
      return NextResponse.json({ ok: false, error: slackData.error || 'Slack API error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ts: slackData.ts, channel: slackData.channel });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Unknown error' }, { status: 500 });
  }
}
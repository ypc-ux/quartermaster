import { NextRequest, NextResponse } from 'next/server';

// In-memory digest queue (persists per serverless cold start)
// Supabase/DB upgrade later when keys are configured
const queue: Array<{
  id: string;
  timestamp: string;
  agent: string;
  command: string;
  summary: string;
  points?: number;
  sent: boolean;
}> = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = {
      id: `d_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      agent: body.agent || 'unknown',
      command: body.command || '',
      summary: body.summary || JSON.stringify(body.data || {}).slice(0, 200),
      points: body.points,
      sent: false,
    };
    queue.push(entry);

    // Auto-send digest when queue hits 5 items or daily threshold
    if (queue.filter(e => !e.sent).length >= 5) {
      await sendDigest();
    }

    return NextResponse.json({ ok: true, queued: entry.id, queue_size: queue.length });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to queue' }, { status: 500 });
  }
}

export async function GET() {
  // Return current queue (what would be in the digest email)
  const pending = queue.filter(e => !e.sent);
  const today = queue.filter(e => e.timestamp.startsWith(new Date().toISOString().slice(0, 10)));

  return NextResponse.json({
    pending: pending.length,
    today: today.length,
    total: queue.length,
    items: pending.map(e => ({
      id: e.id,
      agent: e.agent,
      command: e.command,
      summary: e.summary,
      points: e.points,
      time: e.timestamp,
    })),
    last_digest: queue.filter(e => e.sent).slice(-1)[0]?.timestamp || null,
  });
}

async function sendDigest() {
  const unsent = queue.filter(e => !e.sent);
  if (unsent.length === 0) return;

  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.DIGEST_EMAIL || 'youngprivatecapital@gmail.com';

  if (resendKey) {
    try {
      const html = `
        <h2>QuarterBack Daily Digest</h2>
        <p>${unsent.length} agent runs queued:</p>
        <ul>
          ${unsent.map(e => `<li><strong>${e.agent}</strong>: ${e.summary.slice(0, 100)}${e.points ? ` (${e.points}pts)` : ''}</li>`).join('')}
        </ul>
        <p>Total points today: ${unsent.reduce((s, e) => s + (e.points || 0), 0)}</p>
      `;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'QuarterBack <digest@agentdatasync.com>',
          to: [toEmail],
          subject: `QuarterBack Digest — ${unsent.length} runs`,
          html,
        }),
      });
      // Mark as sent
      unsent.forEach(e => { e.sent = true; });
    } catch {
      // Leave unsent for next attempt
    }
  }
  // If no Resend key, items stay queued (user can GET /api/digest to view)
}
/**
 * POST /api/audit — VoltageIndex lead capture + email notifications.
 * GET  /api/audit?deployed=1 — sends "page is live" notification to Julius.
 */
import { NextRequest, NextResponse } from 'next/server';

const RESEND_URL = 'https://api.resend.com/emails';

async function sendEmail(to: string | string[], subject: string, html: string, from?: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: from || 'VoltageIndex <audit@agentdatasync.com>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email as string)?.trim();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const spendMap: Record<string, string> = { 'under-1k': 'Under $1K/mo', '1k-10k': '$1K-$10K/mo', '10k-50k': '$10K-$50K/mo', '50k-plus': '$50K+/mo' };
    const provMap: Record<string, string> = { aws: 'AWS', gcp: 'Google Cloud', azure: 'Azure', runpod: 'RunPod', vast: 'Vast.ai', other: 'Other' };
    const spend = spendMap[body.monthly_spend] || body.monthly_spend || 'Not specified';
    const provider = provMap[body.provider] || body.provider || 'Not specified';
    const gpuType = body.gpu_type || 'Not specified';
    const ts = new Date().toISOString();

    // Confirmation email to the lead
    await sendEmail(email, 'We got your GPU audit request \u26A1 VoltageIndex',
      `<div style="font-family:Inter,Arial,sans-serif;background:#050810;color:#e2e8f0;padding:2rem;border-radius:12px;">
        <h2 style="color:#00e5ff;margin-bottom:1rem;">Your GPU audit is on the way</h2>
        <p style="color:#94a3b8;line-height:1.6;">We received your request. Here's what happens next:</p>
        <ol style="color:#94a3b8;line-height:2;">
          <li>We compare your setup against <strong style="color:#00e5ff;">152+ live GPU offers</strong></li>
          <li>Every deal scored 1-10 (cheap, trusted, stable, fast, strong)</li>
          <li>You get a report showing exactly where to save</li>
        </ol>
        <p style="color:#94a3b8;margin-top:1rem;">Expect your report within <strong style="color:#00ff88;">24 hours</strong>.</p>
        <hr style="border:none;border-top:1px solid rgba(0,229,255,0.1);margin:1.5rem 0;">
        <p style="color:#64748b;font-size:0.8rem;">VoltageIndex \u2014 We track GPU prices so you don't overpay.</p>
      </div>`);

    // Notification email to Julius
    const digestEmail = process.env.DIGEST_EMAIL || 'youngprivatecapital@gmail.com';
    await sendEmail(digestEmail, `\u26A1 New GPU Audit Lead: ${email}`,
      `<div style="font-family:Inter,Arial,sans-serif;background:#050810;color:#e2e8f0;padding:2rem;border-radius:12px;">
        <h2 style="color:#00e5ff;">New Audit Request</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:1rem;">
          <tr><td style="padding:0.5rem 1rem;color:#64748b;border-bottom:1px solid rgba(0,229,255,0.1);">Email</td>
              <td style="padding:0.5rem 1rem;color:#e2e8f0;border-bottom:1px solid rgba(0,229,255,0.1);">${email}</td></tr>
          <tr><td style="padding:0.5rem 1rem;color:#64748b;border-bottom:1px solid rgba(0,229,255,0.1);">Spend</td>
              <td style="padding:0.5rem 1rem;color:#e2e8f0;border-bottom:1px solid rgba(0,229,255,0.1);">${spend}</td></tr>
          <tr><td style="padding:0.5rem 1rem;color:#64748b;border-bottom:1px solid rgba(0,229,255,0.1);">Provider</td>
              <td style="padding:0.5rem 1rem;color:#e2e8f0;border-bottom:1px solid rgba(0,229,255,0.1);">${provider}</td></tr>
          <tr><td style="padding:0.5rem 1rem;color:#64748b;border-bottom:1px solid rgba(0,229,255,0.1);">GPU</td>
              <td style="padding:0.5rem 1rem;color:#e2e8f0;border-bottom:1px solid rgba(0,229,255,0.1);">${gpuType}</td></tr>
          <tr><td style="padding:0.5rem 1rem;color:#64748b;">Time</td>
              <td style="padding:0.5rem 1rem;color:#e2e8f0;">${ts}</td></tr>
        </table>
      </div>`);

    return NextResponse.json({ ok: true, message: 'Audit request received' });
  } catch {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const deployed = req.nextUrl.searchParams.get('deployed');
  if (deployed === '1') {
    const digestEmail = process.env.DIGEST_EMAIL || 'youngprivatecapital@gmail.com';
    await sendEmail(digestEmail, '\uD83D\uDE80 VoltageIndex Audit Page is LIVE',
      `<div style="font-family:Inter,Arial,sans-serif;background:#050810;color:#e2e8f0;padding:2rem;border-radius:12px;">
        <h2 style="color:#00ff88;">Audit page deployed \u2705</h2>
        <p style="color:#94a3b8;">VoltageIndex audit landing page is live at:</p>
        <p style="margin:1rem 0;"><a href="https://agentdatasync.com/audit.html" style="color:#00e5ff;font-size:1.1rem;">agentdatasync.com/audit.html</a></p>
        <p style="color:#94a3b8;">Leads \u2192 /api/audit \u2192 Resend emails (confirm to lead + notify to you).</p>
        <hr style="border:none;border-top:1px solid rgba(0,229,255,0.1);margin:1.5rem 0;">
        <p style="color:#64748b;font-size:0.8rem;">Also live: <a href="https://agentdatasync.com/offer.html" style="color:#00e5ff;">offer.html</a></p>
      </div>`);
    return NextResponse.json({ ok: true, deployed: true });
  }
  return NextResponse.json({ ok: true, endpoint: '/api/audit', methods: ['POST', 'GET?deployed=1'] });
}
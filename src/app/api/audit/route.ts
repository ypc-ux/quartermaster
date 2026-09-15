/**
 * POST /api/audit — VoltageIndex lead capture + auto-generated audit report + email notifications.
 * GET  /api/audit?deployed=1 — sends "page is live" notification to Julius.
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateAuditReport, type AuditLead } from '@/lib/gpu/audit-report';
import { getPostHogServer } from '@/lib/posthog-server';
import { getSupabaseServer } from '@/lib/supabase-server';

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

    // Generate audit report (LLM + live data, template fallback)
    const lead: AuditLead = { email, monthly_spend: body.monthly_spend, provider: body.provider, gpu_type: body.gpu_type };
    const report = await generateAuditReport(lead);

    // Send the actual report to the lead
    await sendEmail(email, report.subject, report.html);

    // Persist the lead + report (best-effort — a DB hiccup must never block the lead's email)
    try {
      const supabase = getSupabaseServer();
      if (supabase) {
        await supabase.from('audit_leads').insert({
          email,
          monthly_spend: body.monthly_spend ?? null,
          provider: body.provider ?? null,
          gpu_type: body.gpu_type ?? null,
          report_source: report.source,
          report_text: report.plain,
        });
      }
    } catch {
      // swallow — lead persistence is not on the critical path
    }

    // Notification email to Julius with report details
    const digestEmail = process.env.DIGEST_EMAIL || 'youngprivatecapital@gmail.com';
    await sendEmail(digestEmail, `\u26A1 New GPU Audit Lead: ${email}`,
      `<div style="font-family:Inter,Arial,sans-serif;background:#050810;color:#e2e8f0;padding:2rem;border-radius:12px;">
        <h2 style="color:#00e5ff;">New Audit Request + Report Generated</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:1rem;">
          <tr><td style="padding:0.5rem 1rem;color:#64748b;border-bottom:1px solid rgba(0,229,255,0.1);">Email</td>
              <td style="padding:0.5rem 1rem;color:#e2e8f0;border-bottom:1px solid rgba(0,229,255,0.1);">${email}</td></tr>
          <tr><td style="padding:0.5rem 1rem;color:#64748b;border-bottom:1px solid rgba(0,229,255,0.1);">Spend</td>
              <td style="padding:0.5rem 1rem;color:#e2e8f0;border-bottom:1px solid rgba(0,229,255,0.1);">${spend}</td></tr>
          <tr><td style="padding:0.5rem 1rem;color:#64748b;border-bottom:1px solid rgba(0,229,255,0.1);">Provider</td>
              <td style="padding:0.5rem 1rem;color:#e2e8f0;border-bottom:1px solid rgba(0,229,255,0.1);">${provider}</td></tr>
          <tr><td style="padding:0.5rem 1rem;color:#64748b;border-bottom:1px solid rgba(0,229,255,0.1);">GPU</td>
              <td style="padding:0.5rem 1rem;color:#e2e8f0;border-bottom:1px solid rgba(0,229,255,0.1);">${gpuType}</td></tr>
          <tr><td style="padding:0.5rem 1rem;color:#64748b;border-bottom:1px solid rgba(0,229,255,0.1);">Report Source</td>
              <td style="padding:0.5rem 1rem;color:#00ff88;border-bottom:1px solid rgba(0,229,255,0.1);">${report.source} ${report.model ? `(${report.model})` : ''} ${report.latency_ms ? `${report.latency_ms}ms` : ''}</td></tr>
          <tr><td style="padding:0.5rem 1rem;color:#64748b;">Time</td>
              <td style="padding:0.5rem 1rem;color:#e2e8f0;">${ts}</td></tr>
        </table>
        <details style="margin-top:1rem;"><summary style="color:#00e5ff;cursor:pointer;font-size:0.85rem;">View report sent to lead</summary>
          <div style="margin-top:0.5rem;padding:1rem;background:rgba(0,229,255,0.03);border-radius:8px;font-size:0.82rem;color:#94a3b8;white-space:pre-wrap;">${report.plain}</div>
        </details>
      </div>`);

    // PostHog: track audit submission
    const ph = getPostHogServer();
    ph?.capture({
      distinctId: 'voltageindex-audit',
      event: 'audit_submitted',
      properties: {
        email,
        provider: body.provider,
        monthly_spend: body.monthly_spend,
        gpu_type: body.gpu_type,
        report_source: report.source,
        report_model: report.model,
        report_latency_ms: report.latency_ms,
      },
    });

    return NextResponse.json({ ok: true, message: 'Audit request received', report_source: report.source });
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
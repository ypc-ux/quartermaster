/**
 * GET /api/weekly-report — Generate a weekly GPU price report.
 * Returns ready-to-post content for X, LinkedIn, and blog.
 */
import { NextResponse } from 'next/server';
import { generateWeeklyReport } from '@/lib/gpu/weekly-report';
import { getSupabaseServer } from '@/lib/supabase-server';

export const revalidate = 0; // always fresh

export async function GET() {
  try {
    const report = await generateWeeklyReport();

    // Persist the report (best-effort — a DB hiccup must never break the response)
    try {
      const supabase = getSupabaseServer();
      if (supabase) {
        await supabase.from('weekly_reports').insert({
          title: report.title,
          summary: report.summary,
          twitter_thread: report.twitter_thread,
          linkedin_post: report.linkedin_post,
          blog_markdown: report.blog_markdown,
          stats_json: report.stats,
          source: report.source,
        });
      }
    } catch {
      // swallow — report persistence is not on the critical path
    }

    return NextResponse.json(report, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
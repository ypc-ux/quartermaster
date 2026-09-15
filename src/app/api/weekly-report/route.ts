/**
 * GET /api/weekly-report — Generate a weekly GPU price report.
 * Returns ready-to-post content for X, LinkedIn, and blog.
 */
import { NextResponse } from 'next/server';
import { generateWeeklyReport } from '@/lib/gpu/weekly-report';

export const revalidate = 0; // always fresh

export async function GET() {
  try {
    const report = await generateWeeklyReport();
    return NextResponse.json(report, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
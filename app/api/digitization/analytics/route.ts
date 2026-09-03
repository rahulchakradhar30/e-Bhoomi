import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/digitization/analytics/analyticsService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids') ? searchParams.get('ids')!.split(',') : [];

    const analytics = AnalyticsService.getOperationalAnalytics(ids);
    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (err: any) {
    console.error('Analytics API error:', err);
    return NextResponse.json({ error: err.message || 'Analytics processing error' }, { status: 500 });
  }
}

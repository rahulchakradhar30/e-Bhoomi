import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    return NextResponse.json({
      success: true,
      jobId: id,
      message: 'Job status retrieved successfully',
      status: 'READY_FOR_AI_EXTRACTION',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Job status error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { retryStage } = body;

    return NextResponse.json({
      success: true,
      jobId: id,
      retriedStage: retryStage,
      status: 'REPROCESSING',
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Retry operation failed' }, { status: 500 });
  }
}

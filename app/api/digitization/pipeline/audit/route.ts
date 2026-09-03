import { NextRequest, NextResponse } from 'next/server';
import { AuditLedgerEngine } from '@/lib/digitization/verification/auditLedger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const digitizationId = searchParams.get('digitizationId');

    if (!digitizationId) {
      return NextResponse.json({ error: 'digitizationId query parameter is required.' }, { status: 400 });
    }

    const timeline = AuditLedgerEngine.getAuditTimeline(digitizationId);
    const isValid = AuditLedgerEngine.verifyLedgerIntegrity(digitizationId);

    return NextResponse.json({
      success: true,
      digitizationId,
      timeline,
      isLedgerTamperEvident: isValid,
    });
  } catch (err: any) {
    console.error('Audit timeline API error:', err);
    return NextResponse.json({ error: err.message || 'Audit timeline error' }, { status: 500 });
  }
}

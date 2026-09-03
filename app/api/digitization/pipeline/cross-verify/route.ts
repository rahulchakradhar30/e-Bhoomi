import { NextRequest, NextResponse } from 'next/server';
import { CrossDatabaseVerificationEngine } from '@/lib/digitization/integrations/crossDatabase/crossDatabaseVerifier';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { extractionResult, options } = body;

    const pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://127.0.0.1:8000';

    try {
      const crossRes = await fetch(`${pythonServiceUrl}/document-processing/cross-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractionResult: extractionResult || {},
          includeTestProvider: options?.includeTestProvider || false,
        }),
      });

      if (crossRes.ok) {
        const crossData = await crossRes.json();
        return NextResponse.json({
          success: true,
          verificationResult: crossData,
          verificationStatus: crossData.status || 'UNVERIFIED',
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Python Cross-Verification Service offline, executing TypeScript engine fallback:', err);
    }

    // Server-side TypeScript CrossDatabaseVerificationEngine fallback
    const engine = new CrossDatabaseVerificationEngine();
    const verificationResult = await engine.verifyRecord(extractionResult || {}, options || {});

    return NextResponse.json({
      success: true,
      verificationResult,
      verificationStatus: verificationResult.status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Cross-Verification API error:', err);
    return NextResponse.json({ error: err.message || 'Cross-database verification error' }, { status: 500 });
  }
}

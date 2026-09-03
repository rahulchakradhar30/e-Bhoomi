import { NextRequest, NextResponse } from 'next/server';
import { ValidationEngine } from '@/lib/digitization/validation/validationEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { extractionResult, documentType } = body;

    const pythonServiceUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://127.0.0.1:8000';

    try {
      const valRes = await fetch(`${pythonServiceUrl}/document-processing/validation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractionResult: extractionResult || {},
          documentType: documentType || 'ADANGAL',
        }),
      });

      if (valRes.ok) {
        const valData = await valRes.json();
        return NextResponse.json({
          success: true,
          validationResult: valData,
          validationStatus: valData.status || 'PASS',
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Python Validation Service offline, executing TypeScript validation engine fallback:', err);
    }

    // Server-side TypeScript ValidationEngine execution fallback
    const engine = new ValidationEngine();
    const validationResult = engine.validateRecord(
      extractionResult || {},
      documentType || 'ADANGAL'
    );

    return NextResponse.json({
      success: true,
      validationResult,
      validationStatus: validationResult.status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Validation API error:', err);
    return NextResponse.json({ error: err.message || 'Validation processing error' }, { status: 500 });
  }
}

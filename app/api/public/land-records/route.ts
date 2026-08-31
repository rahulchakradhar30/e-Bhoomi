import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin-init';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const districtId = searchParams.get('districtId');
    const mandalId = searchParams.get('mandalId');
    const villageId = searchParams.get('villageId');
    const surveyNumber = searchParams.get('surveyNumber');

    if (!districtId || !mandalId || !villageId || !surveyNumber) {
      return NextResponse.json(
        { code: 'validation/missing-parameters', message: 'Parameters required: districtId, mandalId, villageId, surveyNumber.' },
        { status: 400 }
      );
    }

    // Query matching records from Firestore landRecords collection
    const querySnap = await adminDb
      .collection('landRecords')
      .where('districtId', '==', districtId)
      .where('mandalOrTalukId', '==', mandalId)
      .where('villageId', '==', villageId)
      .where('surveyNumber', '==', surveyNumber)
      .get();

    if (querySnap.empty) {
      return NextResponse.json({
        success: true,
        records: [],
        message: 'No matching digitized land record found.'
      });
    }

    // Filter public viewable fields (deleting owner personal identifiers or raw logs)
    const publicRecords = querySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        recordId: doc.id,
        stateId: data.stateId || '28',
        districtId: data.districtId || '511',
        revenueDivisionId: data.revenueDivisionId || '',
        mandalOrTalukId: data.mandalOrTalukId || '',
        villageId: data.villageId || '',
        surveyNumber: data.surveyNumber || '',
        subDivisionNumber: data.subDivisionNumber || '1',
        extent: data.extent || 0,
        recordType: data.recordType || 'ROR_1B',
        status: data.status || 'ACTIVE',
        verificationStatus: data.verificationStatus || 'UNVERIFIED'
      };
    });

    return NextResponse.json({
      success: true,
      records: publicRecords
    });
  } catch (error) {
    console.error('Error during public record query:', error);
    return NextResponse.json(
      { code: 'public/search-failed', message: 'Failed to retrieve public record.' },
      { status: 500 }
    );
  }
}

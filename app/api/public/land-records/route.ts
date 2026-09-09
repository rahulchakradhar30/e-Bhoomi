import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin-init';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const districtId = searchParams.get('districtId');
    const divisionId = searchParams.get('divisionId') || searchParams.get('revenueDivisionId');
    const mandalId = searchParams.get('mandalId') || searchParams.get('mandalOrTalukId');
    const villageId = searchParams.get('villageId');
    const surveyNumber = searchParams.get('surveyNumber');
    const isSurveysLookup = searchParams.get('type') === 'surveys' || searchParams.get('surveys') === 'true';

    if (!districtId || !mandalId || !villageId) {
      return NextResponse.json(
        {
          success: false,
          code: 'validation/missing-parameters',
          message: 'Location parameters required: districtId, mandalId, villageId.'
        },
        { status: 400 }
      );
    }

    // 1. Survey Numbers Lookup for Location
    if (isSurveysLookup) {
      try {
        let queryRef = adminDb
          .collection('landRecords')
          .where('districtId', '==', districtId)
          .where('mandalOrTalukId', '==', mandalId)
          .where('villageId', '==', villageId);

        const snap = await queryRef.get();
        const surveySet = new Set<string>();

        snap.docs.forEach((doc) => {
          const data = doc.data();
          const vStatus = data.verificationStatus;
          if (
            (!vStatus || ['VERIFIED', 'FIELD_VERIFIED', 'MRO_APPROVED'].includes(vStatus)) &&
            data.surveyNumber
          ) {
            surveySet.add(data.surveyNumber);
          }
        });

        // Also check digitizationCases in case of pending or synced cases
        if (surveySet.size === 0) {
          const caseSnap = await adminDb
            .collection('digitizationCases')
            .where('districtCode', '==', districtId)
            .where('mandalCode', '==', mandalId)
            .where('villageCode', '==', villageId)
            .get();

          caseSnap.docs.forEach((doc) => {
            const data = doc.data();
            const wStatus = data.workflowStatus;
            const surv = data.extractedData?.surveyNumber?.value;
            if (['DIGITIZED', 'APPROVED', 'VERIFIED'].includes(wStatus) && surv) {
              surveySet.add(surv);
            }
          });
        }

        const surveyNumbers = Array.from(surveySet).sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true })
        );

        return NextResponse.json({
          success: true,
          surveyNumbers,
          count: surveyNumbers.length,
        });
      } catch (err) {
        console.error('Error fetching survey numbers from Firestore Admin:', err);
        return NextResponse.json({
          success: true,
          surveyNumbers: [],
          count: 0,
        });
      }
    }

    // 2. Full Land Record Search for Specific Location & Survey
    let queryRef = adminDb
      .collection('landRecords')
      .where('districtId', '==', districtId)
      .where('mandalOrTalukId', '==', mandalId)
      .where('villageId', '==', villageId);

    if (surveyNumber) {
      queryRef = queryRef.where('surveyNumber', '==', surveyNumber);
    }

    const querySnap = await queryRef.get();

    let matchingDocs = querySnap.docs.filter((doc) => {
      const data = doc.data();
      const vStatus = data.verificationStatus;
      return !vStatus || ['VERIFIED', 'FIELD_VERIFIED', 'MRO_APPROVED'].includes(vStatus);
    });

    // If landRecords collection had no match, check finalized digitizationCases
    let publicRecords: any[] = [];

    if (matchingDocs.length > 0) {
      publicRecords = matchingDocs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          recordId: doc.id,
          stateId: data.stateId || '28',
          districtId: data.districtId || '511',
          revenueDivisionId: data.revenueDivisionId || '',
          mandalOrTalukId: data.mandalOrTalukId || '',
          villageId: data.villageId || '',
          stateName: data.stateName || 'Andhra Pradesh',
          districtName: data.districtName || 'Kurnool',
          revenueDivisionName: data.revenueDivisionName || 'Kurnool Revenue Division',
          mandalName: data.mandalName || '',
          villageName: data.villageName || '',
          surveyNumber: data.surveyNumber || '',
          subdivisionNumber: data.subDivisionNumber || data.subdivisionNumber || '1',
          subDivisionNumber: data.subDivisionNumber || data.subdivisionNumber || '1',
          khataNumber: data.khataNumber || 'Not available',
          extent: data.extent || 0,
          extentAcres: data.extent ? data.extent.toString() : '0.00',
          landClassification: data.landClassification || data.landType || 'Agricultural Land (Patta)',
          landType: data.landType || data.landClassification || 'Agricultural Land (Patta)',
          recordType: data.recordType || 'ROR_1B',
          status: data.status || 'ACTIVE',
          digitizationStatus: data.digitizationStatus || 'Digitized',
          verificationStatus: 'Verified',
          lastApprovedVersion: data.currentVersionId || '2026-AP-REV-v1',
          sourceRecordReference: `LGD-AP-${data.districtId || '511'}-${data.villageId || 'VIL'}-${data.surveyNumber || '101'}`
        };
      });
    } else {
      let caseQuery = adminDb
        .collection('digitizationCases')
        .where('districtCode', '==', districtId)
        .where('mandalCode', '==', mandalId)
        .where('villageCode', '==', villageId);

      const caseSnap = await caseQuery.get();
      publicRecords = caseSnap.docs
        .filter((doc) => {
          const data = doc.data();
          const wStatus = data.workflowStatus;
          const surv = data.extractedData?.surveyNumber?.value;
          const matchesSurvey = !surveyNumber || surv === surveyNumber;
          return ['DIGITIZED', 'APPROVED', 'VERIFIED'].includes(wStatus) && matchesSurvey;
        })
        .map((doc) => {
          const data = doc.data();
          const ext = data.extractedData;
          return {
            id: doc.id,
            recordId: doc.id,
            stateId: data.stateCode || '28',
            districtId: data.districtCode || '511',
            revenueDivisionId: data.divisionCode || '',
            mandalOrTalukId: data.mandalCode || '',
            villageId: data.villageCode || '',
            stateName: 'Andhra Pradesh',
            districtName: ext?.districtName?.value || 'Kurnool',
            revenueDivisionName: ext?.revenueDivision?.value || 'Kurnool Revenue Division',
            mandalName: ext?.mandalName?.value || '',
            villageName: ext?.villageName?.value || '',
            surveyNumber: ext?.surveyNumber?.value || '',
            subdivisionNumber: ext?.subDivisionNumber?.value || '1',
            subDivisionNumber: ext?.subDivisionNumber?.value || '1',
            khataNumber: ext?.khataNumber?.value || 'Not available',
            extent: parseFloat(ext?.extentAcres?.value || '0') || 0,
            extentAcres: ext?.extentAcres?.value || '0.00',
            landClassification: ext?.landClassification?.value || 'Agricultural Land (Patta)',
            landType: ext?.landClassification?.value || 'Agricultural Land (Patta)',
            recordType: data.documentType || 'ROR_1B',
            status: 'ACTIVE',
            digitizationStatus: 'Digitized',
            verificationStatus: 'Verified',
            lastApprovedVersion: `2026-AP-CASE-${doc.id.slice(-6)}`,
            sourceRecordReference: `LGD-AP-${data.districtCode || '511'}-${data.villageCode || 'VIL'}-${ext?.surveyNumber?.value || '101'}`
          };
        });
    }

    return NextResponse.json({
      success: true,
      records: publicRecords,
      count: publicRecords.length,
      message:
        publicRecords.length === 0
          ? 'No digitized records found for the selected location.'
          : undefined,
    });
  } catch (error) {
    console.error('Error during public record query:', error);
    return NextResponse.json(
      { success: false, code: 'public/search-failed', message: 'Failed to retrieve public record.' },
      { status: 500 }
    );
  }
}

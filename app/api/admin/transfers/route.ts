import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin-init';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate and Authorize
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { code: 'auth/unauthorized', message: 'Bearer token required.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    const actorRole = decodedToken.role;
    const isAuthorized = actorRole === 'SYSTEM_ADMIN' || actorRole === 'STATE_ADMIN';

    if (!isAuthorized) {
      const adminDoc = await adminDb.collection('admins').doc(decodedToken.uid).get();
      if (!adminDoc.exists) {
        return NextResponse.json(
          { code: 'auth/forbidden', message: 'Access Denied: Administrative privileges required.' },
          { status: 403 }
        );
      }
    }

    // 2. Parse and Validate Request Payload
    const body = await request.json();
    const {
      officerId,
      stateId,
      districtId,
      revenueDivisionId,
      mandalId,
      assignedJurisdictionIds,
      reason,
    } = body as {
      officerId: string;
      stateId: string;
      districtId: string;
      revenueDivisionId?: string;
      mandalId?: string;
      assignedJurisdictionIds?: string[];
      reason: string;
    };

    if (!officerId || !stateId || !districtId || !reason) {
      return NextResponse.json(
        { code: 'validation/missing-fields', message: 'Required fields: officerId, stateId, districtId, reason.' },
        { status: 400 }
      );
    }

    // 3. Fetch current officer details
    const officerRef = adminDb.collection('officers').doc(officerId);
    const officerSnap = await officerRef.get();

    if (!officerSnap.exists) {
      return NextResponse.json(
        { code: 'officer/not-found', message: 'The targeted officer profile does not exist.' },
        { status: 404 }
      );
    }

    const officerData = officerSnap.data()!;

    // Compile previous jurisdiction summary
    const fromJurisdiction = {
      stateId: officerData.stateId || null,
      districtId: officerData.districtId || null,
      revenueDivisionId: officerData.revenueDivisionId || null,
      mandalId: officerData.mandalId || null,
      assignedJurisdictionIds: officerData.assignedJurisdictionIds || [],
    };

    const toJurisdiction = {
      stateId,
      districtId,
      revenueDivisionId: revenueDivisionId || null,
      mandalId: mandalId || null,
      assignedJurisdictionIds: assignedJurisdictionIds || [],
    };

    const now = new Date().toISOString();

    // 4. Update profiles and write transfer history in batch transaction
    const batch = adminDb.batch();

    // Update officer profile
    batch.update(officerRef, {
      stateId,
      districtId,
      revenueDivisionId: revenueDivisionId || null,
      mandalId: mandalId || null,
      assignedJurisdictionIds: assignedJurisdictionIds || [],
      transferredAt: now,
      updatedAt: now
    });

    // Write to officerTransfers collection
    const transferRef = adminDb.collection('officerTransfers').doc();
    batch.set(transferRef, {
      transferId: transferRef.id,
      officerId,
      fromJurisdiction,
      toJurisdiction,
      initiatedBy: decodedToken.uid,
      approvedBy: decodedToken.uid,
      reason,
      createdAt: now,
      effectiveAt: now,
      status: 'COMPLETED'
    });

    // Update custom claims of target officer to reflect new geographic scope
    const targetClaims = await adminAuth.getUser(officerId).then(u => u.customClaims || {});
    await adminAuth.setCustomUserClaims(officerId, {
      ...targetClaims,
      stateId,
      districtId,
    });

    // Write to auditLogs collection
    const auditRef = adminDb.collection('auditLogs').doc();
    batch.set(auditRef, {
      auditId: auditRef.id,
      actorUid: decodedToken.uid,
      actorRole: actorRole || 'SYSTEM_ADMIN',
      action: 'OFFICER_TRANSFERRED',
      targetType: 'OFFICER',
      targetId: officerId,
      oldValueSummary: JSON.stringify(fromJurisdiction),
      newValueSummary: JSON.stringify(toJurisdiction),
      reason: `Officer transfer: ${reason}`,
      timestamp: now,
      jurisdiction: districtId || '511'
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'Officer jurisdiction transfer finalized and logged successfully.',
      transferId: transferRef.id,
    });
  } catch (error) {
    console.error('Error executing officer transfer:', error);
    return NextResponse.json(
      { code: 'admin/transfer-failed', message: error instanceof Error ? error.message : 'Transfer execution failed.' },
      { status: 500 }
    );
  }
}

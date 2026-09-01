import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin-init';
import { UserRole } from '@/types/role';

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

    const actorRole = decodedToken.role as UserRole;
    
    // Parse body
    const body = await request.json();
    const {
      officerId,
      newDistrictId,
      newMandalId,
      newSachivalayamId,
      isDeputation,
    } = body;

    if (!officerId || !newDistrictId) {
      return NextResponse.json(
        { code: 'validation/missing-fields', message: 'Officer ID and New District are required.' },
        { status: 400 }
      );
    }

    // 2. Fetch the officer to verify permissions
    const officerRef = adminDb.collection('officers').doc(officerId);
    const officerDoc = await officerRef.get();
    
    if (!officerDoc.exists) {
      return NextResponse.json({ code: 'validation/not-found', message: 'Officer not found.' }, { status: 404 });
    }
    
    const officerData = officerDoc.data()!;
    const targetRole = officerData.roleId as UserRole;

    // 3. Permission Checks
    // - State Admin can transfer Collector & MROs
    // - Collector can transfer MRO & VROs
    let canTransfer = false;
    if (actorRole === 'SYSTEM_ADMIN' || actorRole === 'STATE_ADMIN') {
      canTransfer = true; // State/System Admins can transfer anyone for now
    } else if (actorRole === 'DISTRICT_COLLECTOR' || actorRole === 'DISTRICT_ADMIN') {
      if (['MRO', 'TAHSILDAR_MRO', 'FIELD_VRO', 'FIELD_OFFICER'].includes(targetRole)) {
        canTransfer = true;
      }
    }

    if (!canTransfer) {
      return NextResponse.json(
        { code: 'auth/forbidden', message: 'You do not have permission to transfer officers of this rank.' },
        { status: 403 }
      );
    }

    // 4. Update Officer Record
    const now = new Date().toISOString();
    const updatePayload: any = {
      districtId: newDistrictId,
      updatedAt: now,
      transferredAt: now,
    };
    
    if (newMandalId) updatePayload.mandalId = newMandalId;
    else if (['MRO', 'TAHSILDAR_MRO', 'FIELD_VRO', 'FIELD_OFFICER'].includes(targetRole)) updatePayload.mandalId = null;

    if (newSachivalayamId) updatePayload.sachivalayamId = newSachivalayamId;
    else if (['FIELD_VRO', 'FIELD_OFFICER'].includes(targetRole)) updatePayload.sachivalayamId = null;

    if (isDeputation) {
      updatePayload.isDeputation = true;
    } else {
      updatePayload.isDeputation = false;
    }

    const batch = adminDb.batch();
    batch.update(officerRef, updatePayload);
    
    // Also update Users collection if districtId is stored there (it isn't typically, but let's keep consistency if we want)
    const userRef = adminDb.collection('users').doc(officerId);
    batch.update(userRef, { updatedAt: now });

    // 5. Audit Log
    const auditRef = adminDb.collection('auditLogs').doc();
    batch.set(auditRef, {
      auditId: auditRef.id,
      actorUid: decodedToken.uid,
      actorRole: actorRole || 'SYSTEM_ADMIN',
      action: isDeputation ? 'OFFICER_DEPUTED' : 'OFFICER_TRANSFERRED',
      targetType: 'OFFICER',
      targetId: officerId,
      oldValueSummary: `District: ${officerData.districtId}, Mandal: ${officerData.mandalId}`,
      newValueSummary: `District: ${newDistrictId}, Mandal: ${newMandalId}, Deputation: ${isDeputation}`,
      reason: 'Administrative transfer.',
      timestamp: now,
      jurisdiction: newDistrictId,
      details: updatePayload
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: isDeputation ? 'Officer placed on deputation successfully.' : 'Officer transferred successfully.',
    });

  } catch (error: any) {
    console.error('Error transferring officer:', error);
    return NextResponse.json(
      { code: 'admin/transfer-failed', message: error.message || 'Transfer failed.' },
      { status: 500 }
    );
  }
}

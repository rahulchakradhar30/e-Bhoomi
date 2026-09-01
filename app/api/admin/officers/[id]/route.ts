import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin-init';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: officerId } = await Promise.resolve(params);

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
    const isAuthorized = actorRole === 'SYSTEM_ADMIN' || actorRole === 'STATE_ADMIN' || actorRole === 'DISTRICT_COLLECTOR' || actorRole === 'DISTRICT_ADMIN';

    if (!isAuthorized) {
      const adminDoc = await adminDb.collection('admins').doc(decodedToken.uid).get();
      if (!adminDoc.exists) {
        return NextResponse.json(
          { code: 'auth/forbidden', message: 'Access Denied: Administrative privileges required to delete officers.' },
          { status: 403 }
        );
      }
    }

    // 2. Delete from Firebase Auth
    try {
      await adminAuth.deleteUser(officerId);
    } catch (authError: any) {
      if (authError.code !== 'auth/user-not-found') {
        throw authError;
      }
      // If user not found in auth, we still want to clean up Firestore
    }

    const now = new Date().toISOString();
    const batch = adminDb.batch();

    // 3. Delete from Firestore (Users and Officers collections)
    const officerRef = adminDb.collection('officers').doc(officerId);
    const userRef = adminDb.collection('users').doc(officerId);

    batch.delete(officerRef);
    batch.delete(userRef);

    // 4. Create Audit Log
    const auditRef = adminDb.collection('auditLogs').doc();
    batch.set(auditRef, {
      auditId: auditRef.id,
      actorUid: decodedToken.uid,
      actorRole: actorRole || 'SYSTEM_ADMIN',
      action: 'OFFICER_DELETED',
      targetType: 'OFFICER',
      targetId: officerId,
      oldValueSummary: 'N/A',
      newValueSummary: 'Officer account deleted completely.',
      reason: 'Administrative deletion.',
      timestamp: now,
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'Officer account deleted successfully.',
    });

  } catch (error: any) {
    console.error('Error deleting officer account:', error);
    return NextResponse.json(
      { code: 'admin/deletion-failed', message: error.message || 'Deletion failed.' },
      { status: 500 }
    );
  }
}

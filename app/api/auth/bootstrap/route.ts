import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin-init';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { code: 'auth/unauthorized', message: 'Bearer authentication token is required.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
    if (!bootstrapEmail) {
      return NextResponse.json(
        { code: 'auth/bootstrap-disabled', message: 'BOOTSTRAP_ADMIN_EMAIL is not configured on the server.' },
        { status: 500 }
      );
    }

    if (decodedToken.email?.toLowerCase() !== bootstrapEmail.toLowerCase()) {
      return NextResponse.json(
        { code: 'auth/forbidden', message: 'This email is not authorized for administration bootstrapping.' },
        { status: 403 }
      );
    }

    // Set high-level role custom claim
    await adminAuth.setCustomUserClaims(decodedToken.uid, {
      role: 'SYSTEM_ADMIN',
      admin: true
    });

    const now = new Date().toISOString();

    // Batch write to update/create profiles in transactions
    const batch = adminDb.batch();

    const userRef = adminDb.collection('users').doc(decodedToken.uid);
    batch.set(userRef, {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      mobile: decodedToken.phone_number || null,
      role: 'SYSTEM_ADMIN',
      accountStatus: 'ACTIVE',
      mustChangePassword: false,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    }, { merge: true });

    const adminRef = adminDb.collection('admins').doc(decodedToken.uid);
    batch.set(adminRef, {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      role: 'SYSTEM_ADMIN',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    }, { merge: true });

    // Log security audit event for bootstrapping
    const auditRef = adminDb.collection('auditLogs').doc();
    batch.set(auditRef, {
      auditId: auditRef.id,
      actorUid: decodedToken.uid,
      actorRole: 'SYSTEM_ADMIN',
      action: 'SYSTEM_BOOTSTRAPPED',
      targetType: 'SYSTEM',
      targetId: 'e-bhoomi-system',
      oldValueSummary: 'N/A',
      newValueSummary: 'System admin bootstrap privileges granted.',
      reason: 'Initial system administrative provisioning workflow.',
      timestamp: now,
      jurisdiction: 'NATION'
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'System bootstrap successful. SYSTEM_ADMIN claims and profiles provisioned successfully.'
    });
  } catch (error) {
    console.error('Error during admin bootstrap:', error);
    return NextResponse.json(
      { code: 'auth/bootstrap-failed', message: error instanceof Error ? error.message : 'Bootstrap execution failed.' },
      { status: 500 }
    );
  }
}

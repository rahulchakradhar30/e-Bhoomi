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
    const isAuthorized = actorRole === 'STATE_ADMIN' || actorRole === 'SYSTEM_ADMIN';

    if (!isAuthorized) {
      return NextResponse.json(
        { code: 'auth/forbidden', message: 'Access Denied: Only State Administrators can publish statewide announcements.' },
        { status: 403 }
      );
    }

    // 2. Parse and Validate Request Payload
    const body = await request.json();
    const {
      title,
      description,
      attachmentType,
      attachmentReference,
      scope,
      stateId,
    } = body as {
      title: string;
      description: string;
      attachmentType?: string;
      attachmentReference?: string;
      scope: 'GLOBAL' | 'STATE' | 'DISTRICT';
      stateId: string;
    };

    if (!title || !description || !scope || !stateId) {
      return NextResponse.json(
        { code: 'validation/missing-fields', message: 'Required fields: title, description, scope, stateId.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const notificationId = `NOTIF-${Date.now()}`;

    // 3. Write Notification Document and Audit event in batch
    const batch = adminDb.batch();

    const notifRef = adminDb.collection('notifications').doc(notificationId);
    batch.set(notifRef, {
      notificationId,
      title,
      description,
      attachmentType: attachmentType || null,
      attachmentReference: attachmentReference || null,
      scope,
      stateId,
      createdBy: decodedToken.uid,
      createdAt: now,
      publishedAt: now,
      status: 'PUBLISHED'
    });

    const auditRef = adminDb.collection('auditLogs').doc();
    batch.set(auditRef, {
      auditId: auditRef.id,
      actorUid: decodedToken.uid,
      actorRole: actorRole || 'STATE_ADMIN',
      action: 'NOTIFICATION_PUBLISHED',
      targetType: 'NOTIFICATION',
      targetId: notificationId,
      oldValueSummary: 'N/A',
      newValueSummary: `Announcment published: "${title}"`,
      reason: 'State revenue policy update dispatch.',
      timestamp: now,
      jurisdiction: stateId || '28'
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'State notification published successfully.',
      notificationId,
    });
  } catch (error) {
    console.error('Error publishing state notification:', error);
    return NextResponse.json(
      { code: 'state/notification-failed', message: error instanceof Error ? error.message : 'Notification publication failed.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin-init';
import { sendOfficerCredentialEmail } from '@/lib/email/emailService';
import { UserRole } from '@/types/role';

// Helper: strong random temporary password (14 chars, mixed class)
function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%&*';
  const allChars = upper + lower + digits + special;

  let password = '';
  // Ensure at least one of each character class
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < 14; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

// Helper: generate Login ID  AP-[DISTRICT_CODE]-[ROLE_TAG]-[6-DIGIT-RANDOM]
function generateLoginId(districtCode: string, role: string): string {
  const st = 'AP';
  // Always use the source district code from workbook (511 for Kurnool)
  const dist = districtCode || '511';
  let roleTag = 'OFF';

  if (role === 'STATE_ADMIN') roleTag = 'ADM';
  else if (role === 'DISTRICT_ADMIN' || role === 'DISTRICT_COLLECTOR') roleTag = 'COLL';
  else if (role === 'RDO_OFFICER' || role === 'RDO') roleTag = 'RDO';
  else if (role === 'TAHSILDAR_MRO' || role === 'MRO') roleTag = 'MRO';
  else if (role === 'FIELD_VRO' || role === 'FIELD_OFFICER') roleTag = 'VRO';

  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${st}-${dist}-${roleTag}-${randomNum}`;
}

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
      name,
      designation,
      officialEmail,
      officialMobile,
      roleId,
      stateId,
      districtId,
      revenueDivisionId,
      mandalId,
      localityId,
      sachivalayamId,
      assignedJurisdictionIds,
    } = body as {
      name: string;
      designation: string;
      officialEmail: string;
      officialMobile: string;
      roleId: UserRole;
      stateId: string;
      districtId: string;
      revenueDivisionId?: string;
      mandalId?: string;
      localityId?: string;
      sachivalayamId?: string;
      assignedJurisdictionIds?: string[];
    };

    if (!name || !designation || !officialEmail || !officialMobile || !roleId || !stateId || !districtId) {
      return NextResponse.json(
        { code: 'validation/missing-fields', message: 'Required fields: name, designation, officialEmail, officialMobile, roleId, stateId, districtId.' },
        { status: 400 }
      );
    }

    // 3. Generate Credentials server-side (password NOT stored, NOT logged)
    const loginId = generateLoginId(districtId, roleId);
    const tempPassword = generateTempPassword();

    // 4. Create User in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: officialEmail,
      emailVerified: true,
      password: tempPassword,
      displayName: name,
      phoneNumber: officialMobile.startsWith('+91') ? officialMobile : `+91${officialMobile.replace(/\D/g, '')}`,
    });

    // Set custom claims for Firebase ID token
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: roleId,
      loginId,
      districtId,
      stateId,
    });

    const now = new Date().toISOString();

    // 5. Write officer profile and audit log in Firestore batch
    const batch = adminDb.batch();

    const userRef = adminDb.collection('users').doc(userRecord.uid);
    batch.set(userRef, {
      uid: userRecord.uid,
      email: officialEmail,
      mobile: officialMobile,
      role: roleId,
      accountStatus: 'ACTIVE',
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null
    });

    const officerRef = adminDb.collection('officers').doc(userRecord.uid);
    batch.set(officerRef, {
      officerId: userRecord.uid,
      authUid: userRecord.uid,
      loginId,
      name,
      designation,
      officialEmail,
      officialMobile,
      roleId,
      stateId,
      districtId,
      revenueDivisionId: revenueDivisionId || null,
      mandalId: mandalId || null,
      localityId: localityId || null,
      sachivalayamId: sachivalayamId || null,
      assignedJurisdictionIds: assignedJurisdictionIds || [],
      accountStatus: 'ACTIVE',
      mustChangePassword: true,
      createdBy: decodedToken.uid,
      createdAt: now,
      updatedAt: now,
      transferredAt: null
    });

    // Audit log — password NEVER stored here
    const auditRef = adminDb.collection('auditLogs').doc();
    batch.set(auditRef, {
      auditId: auditRef.id,
      actorUid: decodedToken.uid,
      actorRole: actorRole || 'SYSTEM_ADMIN',
      action: 'OFFICER_CREATED',
      targetType: 'OFFICER',
      targetId: userRecord.uid,
      oldValueSummary: 'N/A',
      newValueSummary: `Officer provisioned: LoginID=${loginId}, Name=${name}, Role=${roleId}`,
      reason: 'Administrative officer account creation.',
      timestamp: now,
      jurisdiction: districtId || '511'
    });

    await batch.commit();

    // 6. Deliver Credential Email — failures are handled gracefully
    const origin = request.nextUrl.origin;
    const loginUrl = `${origin}/login`;

    // Build jurisdiction string for email
    const jurisdictionParts = ['Kurnool District'];
    if (revenueDivisionId) jurisdictionParts.push(revenueDivisionId);
    if (mandalId) jurisdictionParts.push(mandalId);
    const jurisdiction = jurisdictionParts.join(' → ');

    const emailResult = await sendOfficerCredentialEmail({
      recipientEmail: officialEmail,
      recipientName: name,
      role: roleId,
      jurisdiction,
      loginId,
      temporaryPassword: tempPassword,
      loginUrl,
      initiatedBy: decodedToken.uid,
    });

    // Account is created regardless of email success/failure
    return NextResponse.json({
      success: true,
      message: 'Officer account provisioned successfully.',
      emailDelivered: emailResult.success,
      emailMode: emailResult.mode,
      emailError: emailResult.success ? undefined : emailResult.error,
      notice: emailResult.success
        ? 'Credential notification dispatched to officer email.'
        : `Account created but credential email delivery failed: ${emailResult.error}. Use the Retry Credential Email action.`,
      officer: {
        uid: userRecord.uid,
        loginId,
        name,
        roleId,
      }
    });

  } catch (error) {
    console.error('Error provisioning officer account:', error);
    return NextResponse.json(
      { code: 'admin/provisioning-failed', message: error instanceof Error ? error.message : 'Provisioning failed.' },
      { status: 500 }
    );
  }
}

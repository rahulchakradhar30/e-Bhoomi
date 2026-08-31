/**
 * e-Bhoomi — Admin Email OTP API
 *
 * POST /api/auth/admin-otp  — Verify email+password, generate OTP, send via email
 * PUT  /api/auth/admin-otp  — Verify submitted OTP against Firestore store
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin-init';
import { sendAdminOtpEmail } from '@/lib/email/emailService';

const OTP_TTL_SECONDS = 300; // 5 minutes

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — Step 1: validate email+password, issue OTP, send email
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body as { idToken: string };

    if (!idToken) {
      return NextResponse.json(
        { code: 'otp/missing-token', message: 'Firebase ID token is required.' },
        { status: 400 }
      );
    }

    // Verify the Firebase ID token (proves email+password was valid)
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Check this account is a system/state admin
    const adminSnap = await adminDb.collection('admins').doc(decoded.uid).get();
    const userSnap = await adminDb.collection('users').doc(decoded.uid).get();

    const userRole = userSnap.data()?.role;
    const isAdmin =
      adminSnap.exists ||
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'STATE_ADMIN' ||
      decoded.role === 'SYSTEM_ADMIN' ||
      decoded.role === 'STATE_ADMIN' ||
      decoded.admin === true;

    if (!isAdmin) {
      return NextResponse.json(
        { code: 'otp/forbidden', message: 'Access Denied: Not an authorized administration account.' },
        { status: 403 }
      );
    }

    const email = decoded.email;
    if (!email) {
      return NextResponse.json(
        { code: 'otp/no-email', message: 'No email address associated with this account.' },
        { status: 400 }
      );
    }

    // Generate OTP and persist it in Firestore with TTL
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString();

    await adminDb.collection('adminOtpSessions').doc(decoded.uid).set({
      uid: decoded.uid,
      email,
      otpHash: otp, // In production: store bcrypt hash. For MVP: store plaintext.
      expiresAt,
      attempts: 0,
      createdAt: new Date().toISOString(),
    });

    // Send OTP email
    await sendAdminOtpEmail({
      recipientEmail: email,
      recipientName: userSnap.data()?.name || 'System Administrator',
      otp,
      expiresMinutes: Math.round(OTP_TTL_SECONDS / 60),
      initiatedBy: decoded.uid,
    });

    return NextResponse.json({
      success: true,
      message: 'OTP dispatched to administrator email address.',
      email: email.replace(/(.{2}).+(@.+)/, '$1****$2'), // masked for response
      expiresIn: OTP_TTL_SECONDS,
    });
  } catch (error) {
    console.error('[Admin OTP] Error generating OTP:', error);
    return NextResponse.json(
      { code: 'otp/failed', message: error instanceof Error ? error.message : 'OTP generation failed.' },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT — Step 2: verify OTP, return success
// ─────────────────────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, otp } = body as { idToken: string; otp: string };

    if (!idToken || !otp) {
      return NextResponse.json(
        { code: 'otp/missing-fields', message: 'idToken and otp are required.' },
        { status: 400 }
      );
    }

    const decoded = await adminAuth.verifyIdToken(idToken);

    const sessionRef = adminDb.collection('adminOtpSessions').doc(decoded.uid);
    const sessionSnap = await sessionRef.get();

    if (!sessionSnap.exists) {
      return NextResponse.json(
        { code: 'otp/no-session', message: 'No active OTP session found. Please re-enter credentials.' },
        { status: 400 }
      );
    }

    const session = sessionSnap.data()!;

    // Check expiry
    if (new Date() > new Date(session.expiresAt)) {
      await sessionRef.delete();
      return NextResponse.json(
        { code: 'otp/expired', message: 'OTP has expired. Please re-enter credentials to request a new one.' },
        { status: 400 }
      );
    }

    // Rate limit: max 5 attempts
    if (session.attempts >= 5) {
      await sessionRef.delete();
      return NextResponse.json(
        { code: 'otp/max-attempts', message: 'Too many incorrect attempts. Please restart authentication.' },
        { status: 429 }
      );
    }

    if (session.otpHash !== otp.replace(/\s/g, '')) {
      await sessionRef.update({ attempts: (session.attempts || 0) + 1 });
      return NextResponse.json(
        { code: 'otp/invalid', message: `Incorrect OTP. ${4 - session.attempts} attempt(s) remaining.` },
        { status: 400 }
      );
    }

    // OTP valid — clean up session
    await sessionRef.delete();

    // Audit log
    const auditRef = adminDb.collection('auditLogs').doc();
    await auditRef.set({
      auditId: auditRef.id,
      actorUid: decoded.uid,
      actorRole: 'SYSTEM_ADMIN',
      action: 'ADMIN_LOGIN_2FA_SUCCESS',
      targetType: 'SESSION',
      targetId: decoded.uid,
      oldValueSummary: 'N/A',
      newValueSummary: 'Admin 2FA OTP verified successfully.',
      reason: 'Admin login two-factor authentication.',
      timestamp: new Date().toISOString(),
      jurisdiction: 'SYSTEM',
    });

    return NextResponse.json({
      success: true,
      message: 'OTP verified. Access granted.',
    });
  } catch (error) {
    console.error('[Admin OTP] Error verifying OTP:', error);
    return NextResponse.json(
      { code: 'otp/verify-failed', message: error instanceof Error ? error.message : 'OTP verification failed.' },
      { status: 500 }
    );
  }
}

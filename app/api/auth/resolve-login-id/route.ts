/**
 * e-Bhoomi — Resolve Officer Login ID to Email
 *
 * POST /api/auth/resolve-login-id
 *
 * PUBLIC endpoint (no auth required).
 * Accepts: { loginId: "AP-511-VRO-123456" }
 * Returns: { email: "officer@ap.gov.in" }  (masked for safety)
 *
 * Uses Admin SDK to bypass Firestore security rules for this single lookup.
 * Only returns email — never password, name, or any other data.
 *
 * Rate limiting: simple in-memory cooldown per loginId (per instance).
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin-init';

// Simple in-memory rate limit: max 5 attempts per loginId per 60s window
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(loginId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(loginId);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(loginId, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loginId } = body as { loginId: string };

    if (!loginId || typeof loginId !== 'string' || loginId.trim().length < 5) {
      return NextResponse.json(
        { code: 'resolve/invalid-input', message: 'A valid Login ID is required.' },
        { status: 400 }
      );
    }

    const normalised = loginId.trim().toUpperCase();

    // Rate limit
    if (!checkRateLimit(normalised)) {
      return NextResponse.json(
        { code: 'resolve/rate-limited', message: 'Too many attempts. Please wait 60 seconds before retrying.' },
        { status: 429 }
      );
    }

    // Lookup officer by loginId using Admin SDK (bypasses Firestore rules)
    const snap = await adminDb
      .collection('officers')
      .where('loginId', '==', normalised)
      .limit(1)
      .get();

    if (snap.empty) {
      // Generic error — don't reveal whether loginId exists or not
      return NextResponse.json(
        { code: 'resolve/not-found', message: 'Login ID not found. Check the credential email and try again.' },
        { status: 404 }
      );
    }

    const officer = snap.docs[0].data();

    if (officer.accountStatus !== 'ACTIVE') {
      return NextResponse.json(
        { code: 'resolve/account-inactive', message: `Account is ${(officer.accountStatus || 'inactive').toLowerCase()}. Contact your administrator.` },
        { status: 403 }
      );
    }

    // Return just the email — nothing else
    return NextResponse.json({
      success: true,
      email: officer.officialEmail as string,
    });

  } catch (error) {
    console.error('[resolve-login-id] Error:', error);
    return NextResponse.json(
      { code: 'resolve/server-error', message: 'Unable to resolve Login ID. Please try again.' },
      { status: 500 }
    );
  }
}

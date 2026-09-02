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

    if (!loginId || typeof loginId !== 'string' || loginId.trim().length < 2) {
      return NextResponse.json(
        { code: 'resolve/invalid-input', message: 'A valid Login ID or email is required.' },
        { status: 400 }
      );
    }

    const trimmed = loginId.trim();
    const upper = trimmed.toUpperCase();
    const lower = trimmed.toLowerCase();

    // Rate limit
    if (!checkRateLimit(upper)) {
      return NextResponse.json(
        { code: 'resolve/rate-limited', message: 'Too many attempts. Please wait 60 seconds before retrying.' },
        { status: 429 }
      );
    }

    // Attempt multi-field lookup in 'officers' collection
    let docData: any = null;

    const queries = [
      adminDb.collection('officers').where('loginId', '==', upper).limit(1),
      adminDb.collection('officers').where('loginId', '==', lower).limit(1),
      adminDb.collection('officers').where('loginId', '==', trimmed).limit(1),
      adminDb.collection('officers').where('officerId', '==', upper).limit(1),
      adminDb.collection('officers').where('officerId', '==', lower).limit(1),
      adminDb.collection('officers').where('officialEmail', '==', lower).limit(1),
      adminDb.collection('officers').where('email', '==', lower).limit(1),
    ];

    for (const q of queries) {
      const snap = await q.get();
      if (!snap.empty) {
        docData = snap.docs[0].data();
        break;
      }
    }

    // Fallback: search in 'users' collection
    if (!docData) {
      const userQueries = [
        adminDb.collection('users').where('loginId', '==', upper).limit(1),
        adminDb.collection('users').where('loginId', '==', lower).limit(1),
        adminDb.collection('users').where('email', '==', lower).limit(1),
      ];

      for (const uq of userQueries) {
        const snap = await uq.get();
        if (!snap.empty) {
          docData = snap.docs[0].data();
          break;
        }
      }
    }

    if (!docData) {
      return NextResponse.json(
        { code: 'resolve/not-found', message: 'Officer ID or account not found. Check credentials and try again.' },
        { status: 404 }
      );
    }

    if (docData.accountStatus && docData.accountStatus !== 'ACTIVE') {
      return NextResponse.json(
        { code: 'resolve/account-inactive', message: `Account is ${(docData.accountStatus || 'inactive').toLowerCase()}. Contact your administrator.` },
        { status: 403 }
      );
    }

    const resolvedEmail = docData.officialEmail || docData.email || docData.userEmail;

    if (!resolvedEmail) {
      return NextResponse.json(
        { code: 'resolve/no-email', message: 'No registered email address found for this Officer ID.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      email: resolvedEmail,
    });

  } catch (error) {
    console.error('[resolve-login-id] Error:', error);
    return NextResponse.json(
      { code: 'resolve/server-error', message: 'Unable to resolve Officer ID. Please try again.' },
      { status: 500 }
    );
  }
}

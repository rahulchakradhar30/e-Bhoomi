import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  ConfirmationResult,
  RecaptchaVerifier,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError,
} from 'firebase/auth';
import { auth } from '../firebase/auth';

export interface PhoneAuthSession {
  confirmationResult: ConfirmationResult;
}

/**
 * Maps Firebase Auth errors to human-readable system messaging.
 */
export function formatAuthError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'An unknown authentication error occurred.';
  const authErr = error as AuthError;
  switch (authErr.code) {
    case 'auth/operation-not-allowed':
      return 'This authentication method is not enabled in the Firebase Console. Please verify console setup.';
    case 'auth/invalid-phone-number':
      return 'The provided phone number is invalid. Ensure it includes country code (e.g., +91).';
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA verification failed. Please try again.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid authentication credentials provided.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded for Firebase Phone Auth. Please contact system administrator.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by an administrator.';
    default:
      return authErr.message || 'Authentication operation failed.';
  }
}

/**
 * Initiates Firebase Phone / SMS OTP Authentication.
 */
export async function signInWithPhone(
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  try {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
}

/**
 * Verifies Phone OTP using ConfirmationResult from Firebase Auth.
 */
export async function verifyPhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<FirebaseUser> {
  try {
    const userCredential = await confirmationResult.confirm(otpCode);
    return userCredential.user;
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
}

/**
 * Sign in using official email and password.
 */
export async function signInWithEmailPassword(
  email: string,
  pass: string
): Promise<FirebaseUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
}

/**
 * Sign in using Google OAuth popup provider.
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
}

/**
 * Sign out current Firebase Auth session.
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
}

/**
 * Get current authenticated user from Firebase Auth.
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Subscribe to Auth State Changes.
 */
export function onAuthStateChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

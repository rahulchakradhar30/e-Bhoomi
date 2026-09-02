'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ShieldCheck, CheckCircle2, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { DEFAULT_PASSWORD_POLICY } from '@/services/authService';
import { auth } from '@/lib/firebase/auth';
import { updatePassword as firebaseUpdatePassword } from 'firebase/auth';
import { updateOfficerProfile } from '@/lib/services/officerService';
import { updateUserProfile } from '@/lib/services/userService';
import { useCurrentUser } from '@/context/AuthContext';
import { signOut } from '@/lib/services/authService';

export const PasswordChangeForm: React.FC = () => {
  const router = useRouter();
  const { user, officerProfile, userProfile } = useCurrentUser();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'FORM' | 'OTP_VERIFICATION'>('FORM');
  const [idToken, setIdToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isSystemAdmin = officerProfile?.roleId === 'SYSTEM_ADMIN' || officerProfile?.roleId === 'STATE_ADMIN' || userProfile?.role === 'SYSTEM_ADMIN' || userProfile?.role === 'STATE_ADMIN';

  const handleInitiatePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < DEFAULT_PASSWORD_POLICY.minPasswordLength) {
      setError(`Password must be at least ${DEFAULT_PASSWORD_POLICY.minPasswordLength} characters long.`);
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('No active authenticated session found.');
      return;
    }

    setLoading(true);

    try {
      const token = await currentUser.getIdToken(true);
      setIdToken(token);

      if (isSystemAdmin) {
        // Dispatch 2FA OTP for System Admin fresh security verification
        const res = await fetch('/api/auth/admin-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token }),
        });

        if (!res.ok) {
          throw new Error('Security verification failed. Unable to dispatch verification code.');
        }

        setStep('OTP_VERIFICATION');
      } else {
        // Direct verified update for officer session
        await executePasswordUpdate(currentUser, token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to initiate password change.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Session expired.');

      // Verify OTP server-side
      const res = await fetch('/api/auth/admin-otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, otp: otp.replace(/\s/g, '') }),
      });

      if (!res.ok) {
        throw new Error('Invalid or expired security code.');
      }

      await executePasswordUpdate(currentUser, idToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Security verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const executePasswordUpdate = async (currentUser: typeof auth.currentUser, token: string) => {
    if (!currentUser) return;

    // 1. Update password in Firebase Auth
    await firebaseUpdatePassword(currentUser, newPassword);

    // 2. Clear mustChangePassword flag in Firestore
    const uid = currentUser.uid;
    const updates = { mustChangePassword: false, updatedAt: new Date().toISOString() };

    const promises: Promise<void>[] = [];
    if (officerProfile) promises.push(updateOfficerProfile(uid, updates));
    if (userProfile) promises.push(updateUserProfile(uid, updates));
    await Promise.all(promises);

    setSuccess(true);

    // 3. Invalidate old sessions & force fresh login
    setTimeout(async () => {
      await signOut();
      const redirectPath = isSystemAdmin ? '/admin/login' : '/login';
      router.push(redirectPath);
    }, 2000);
  };

  const handleOtpInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setOtp(digits.length > 3 ? digits.slice(0, 3) + ' ' + digits.slice(3) : digits);
  };

  return (
    <div className="simple-login-card" style={{ maxWidth: '520px' }}>
      <div className="admin-login-badge-header">
        <ShieldCheck className="w-8 h-8 text-navy flex-shrink-0" />
        <div>
          <h1 className="simple-login-title">CHANGE PASSWORD</h1>
          <p className="simple-login-subtitle">
            Update your official login credentials. Secure identity verification required.
          </p>
        </div>
      </div>

      {success && (
        <div className="generated-id-display margin-bottom-md" style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <CheckCircle2 className="w-5 h-5 text-green" />
          <span className="generated-id-text text-green">Password updated successfully! Signing out for fresh login...</span>
        </div>
      )}

      {error && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            padding: '12px',
            color: '#991b1b',
            fontSize: '14px',
            marginBottom: '16px'
          }}
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" style={{ color: '#dc2626' }} />
          <span>{error}</span>
        </div>
      )}

      {step === 'FORM' && (
        <form onSubmit={handleInitiatePasswordChange} className="simple-login-form">
          <div className="form-field-group">
            <label className="form-label">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input password-input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="password-policy-notice-box">
            <ul>
              <li>At least {DEFAULT_PASSWORD_POLICY.minPasswordLength} characters long</li>
              <li>Must contain uppercase & lowercase letters</li>
              <li>Must contain numbers and special symbols</li>
            </ul>
          </div>

          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'Processing...' : isSystemAdmin ? 'Verify & Change Password' : 'Update Password'}</span>
          </button>
        </form>
      )}

      {step === 'OTP_VERIFICATION' && (
        <form onSubmit={handleVerifyOtpAndUpdate} className="simple-login-form">
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
            padding: '16px', marginBottom: '20px'
          }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#065f46' }}>
              Security Verification Required
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#047857' }}>
              A 6-digit security code was dispatched to your registered address. Enter it below to authorize this password update.
            </p>
          </div>

          <div className="form-field-group">
            <label className="form-label">Enter 6-Digit Security Code</label>
            <input
              type="text"
              id="password-otp-input"
              inputMode="numeric"
              className="form-input mfa-code-input"
              placeholder="000 000"
              value={otp}
              onChange={(e) => handleOtpInput(e.target.value)}
              maxLength={7}
              autoComplete="one-time-code"
              required
              style={{ fontSize: '24px', letterSpacing: '6px', textAlign: 'center', fontFamily: 'monospace' }}
            />
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading || otp.replace(/\s/g, '').length !== 6}
            style={{ opacity: (loading || otp.replace(/\s/g, '').length !== 6) ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Updating password...' : 'Verify Code & Update Password'}</span>
          </button>
        </form>
      )}
    </div>
  );
};

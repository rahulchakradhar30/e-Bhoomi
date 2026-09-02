'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock, Eye, EyeOff, ShieldAlert, AlertCircle,
  Mail, ArrowLeft, RefreshCw, CheckCircle2, Shield
} from 'lucide-react';
import { signInWithEmailPassword, signOut } from '@/lib/services/authService';

type LoginStep = 'CREDENTIALS' | 'OTP_SENT' | 'SUCCESS';

export const AdminLogin: React.FC = () => {
  const router = useRouter();

  // Step tracking
  const [step, setStep] = useState<LoginStep>('CREDENTIALS');

  // Form state
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');

  // Session state (stored client-side only for the duration of login)
  const [idToken, setIdToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ──────────────────────────────────────────────────────────────────────────
  // Step 1: Validate credentials and dispatch OTP
  // ──────────────────────────────────────────────────────────────────────────
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const email = adminId.includes('@') ? adminId : `${adminId.toLowerCase()}@e-bhoomi.gov.in`;

      // Authenticate with Firebase — gets ID token proving credentials are valid
      const user = await signInWithEmailPassword(email, password);
      const token = await user.getIdToken(true);

      // Call server-side OTP dispatch route
      const res = await fetch('/api/auth/admin-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      });
      const data = await res.json();

      if (!res.ok) {
        // If account is not admin, sign out of Firebase too
        await signOut();
        throw new Error('Invalid ID or password.');
      }

      // Store token and masked email for OTP verification step
      setIdToken(token);
      setMaskedEmail(data.email || email.replace(/(.{2}).+(@.+)/, '$1****$2'));
      setStep('OTP_SENT');
      startResendCooldown();

    } catch (err) {
      setError('Invalid ID or password.');
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Step 2: Verify OTP
  // ──────────────────────────────────────────────────────────────────────────
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/admin-otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, otp: otp.replace(/\s/g, '') }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'otp/expired' || data.code === 'otp/max-attempts') {
          // Force full restart
          await signOut();
          setStep('CREDENTIALS');
          setIdToken('');
          setOtp('');
        }
        throw new Error('Invalid security code.');
      }

      // OTP verified — redirect to admin dashboard
      setStep('SUCCESS');
      setTimeout(() => router.push('/admin/dashboard'), 800);

    } catch (err) {
      setError('Invalid security code.');
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Resend OTP
  // ──────────────────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !idToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/admin-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Resend failed.');
      setOtp('');
      startResendCooldown();
    } catch (err) {
      setError('Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpInput = (val: string) => {
    // Auto-format: insert space after 3 digits
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setOtp(digits.length > 3 ? digits.slice(0, 3) + ' ' + digits.slice(3) : digits);
  };

  const handleBack = async () => {
    await signOut();
    setStep('CREDENTIALS');
    setIdToken('');
    setOtp('');
    setError(null);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="simple-login-card admin-login-card">
      <div className="admin-login-badge-header">
        <ShieldAlert className="w-8 h-8 text-navy flex-shrink-0" />
        <div>
          <h1 className="simple-login-title">SYSTEM ADMIN LOGIN</h1>
        </div>
      </div>

      {/* ── STEP 1: Credentials ───────────────────────────────────── */}
      {step === 'CREDENTIALS' && (
        <form onSubmit={handleCredentialsSubmit} className="simple-login-form">
          <div className="form-field-group">
            <label className="form-label">System Admin ID</label>
            <input
              type="text"
              id="admin-login-id"
              className="form-input"
              placeholder="Enter System Admin ID"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-field-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="admin-password"
                className="form-input password-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <ErrorBanner message={error} />}

          <button type="submit" className="login-submit-btn" disabled={loading} style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>
      )}

      {/* ── STEP 2: OTP Entry ─────────────────────────────────────── */}
      {step === 'OTP_SENT' && (
        <form onSubmit={handleOtpSubmit} className="simple-login-form">
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
            padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px'
          }}>
            <Mail className="w-5 h-5 flex-shrink-0" style={{ color: '#059669', marginTop: 2 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#065f46' }}>
                Security code sent
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#047857' }}>
                A 6-digit security code was dispatched to your registered address. It expires in 5 minutes.
              </p>
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-label">Enter 6-Digit Security Code</label>
            <input
              type="text"
              id="admin-otp-input"
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

          {error && <ErrorBanner message={error} />}

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading || otp.replace(/\s/g, '').length !== 6}
            style={{ opacity: (loading || otp.replace(/\s/g, '').length !== 6) ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            <Shield className="w-4 h-4" />
            <span>{loading ? 'Verifying code...' : 'Sign In'}</span>
          </button>

          {/* Resend + Back row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <button type="button" onClick={handleBack} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeft className="w-3 h-3" /> Back to credentials
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || loading}
              style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? '#94a3b8' : '#059669', fontSize: 13, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <RefreshCw className="w-3 h-3" />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
          </div>
        </form>
      )}

      {/* ── STEP 3: Success ───────────────────────────────────────── */}
      {step === 'SUCCESS' && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <CheckCircle2 style={{ width: 56, height: 56, color: '#059669', margin: '0 auto 16px' }} />
          <p style={{ fontWeight: 700, fontSize: 16, color: '#065f46', margin: '0 0 8px' }}>Access Granted</p>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Redirecting to Administration Console...</p>
        </div>
      )}
    </div>
  );
};

// ── Shared error banner ──────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
      borderRadius: '6px', padding: '12px', color: '#991b1b',
      fontSize: '14px', marginTop: '16px'
    }}>
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" style={{ color: '#dc2626' }} />
      <span>{message}</span>
    </div>
  );
}

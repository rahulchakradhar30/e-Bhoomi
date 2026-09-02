'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Eye, EyeOff, KeyRound, AlertCircle, Loader2, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import { resolveDashboardRoute } from '@/services/authService';
import { signInWithEmailPassword, requestPasswordReset } from '@/lib/services/authService';
import { getOfficerByAuthUid } from '@/lib/services/officerService';
import { getUserProfile } from '@/lib/services/userService';

type LoginStep = 'CREDENTIALS' | 'AUTHENTICATING';
type FormMode = 'LOGIN' | 'FORGOT_PASSWORD';

export const OfficerLogin: React.FC = () => {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>('LOGIN');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<LoginStep>('CREDENTIALS');
  const [loadingLabel, setLoadingLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Forgot password state
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep('AUTHENTICATING');

    try {
      const input = loginId.trim();
      let emailToUse: string;

      if (input.includes('@')) {
        emailToUse = input.toLowerCase();
        setLoadingLabel('Verifying credentials...');
      } else {
        setLoadingLabel('Resolving officer identity...');
        const res = await fetch('/api/auth/resolve-login-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loginId: input }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Login ID not recognised.');
        }

        emailToUse = data.email;
        setLoadingLabel('Authenticating officer...');
      }

      const user = await signInWithEmailPassword(emailToUse, password);
      setLoadingLabel('Loading officer profile...');

      let officer = await getOfficerByAuthUid(user.uid);

      if (!officer) {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          if (userProfile.mustChangePassword) {
            router.push('/auth/change-password');
            return;
          }
          router.push(resolveDashboardRoute(userProfile.role));
          return;
        }
        throw new Error('No officer profile found for this account. Contact your administrator.');
      }

      if (officer.accountStatus !== 'ACTIVE') {
        throw new Error(`Account is ${(officer.accountStatus || 'inactive').toLowerCase()}. Contact your administrator.`);
      }

      if (officer.mustChangePassword) {
        router.push('/auth/change-password');
        return;
      }

      router.push(resolveDashboardRoute(officer.roleId));

    } catch (err: any) {
      console.error('[OfficerLogin] Authentication error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg && (msg.includes('found') || msg.includes('inactive') || msg.includes('recognised') || msg.includes('profile') || msg.includes('administrator'))) {
        setError(msg);
      } else {
        setError('Invalid ID or password.');
      }
      setStep('CREDENTIALS');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetLoading(true);
    setResetSent(false);

    try {
      const input = loginId.trim();
      if (!input) {
        setError('Please enter your Officer ID.');
        setResetLoading(false);
        return;
      }

      let targetEmail = input.includes('@') ? input.toLowerCase() : '';

      if (!targetEmail) {
        const res = await fetch('/api/auth/resolve-login-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loginId: input }),
        });
        const data = await res.json();
        if (res.ok && data.email) {
          targetEmail = data.email;
        }
      }

      if (targetEmail) {
        await requestPasswordReset(targetEmail);
      }
    } catch {
      // Processed confidentially
    } finally {
      setResetLoading(false);
      setResetSent(true);
    }
  };

  const isLoading = step === 'AUTHENTICATING';

  return (
    <div className="simple-login-card">
      <div className="admin-login-badge-header">
        <ShieldCheck className="w-8 h-8 text-navy flex-shrink-0" />
        <div>
          <h1 className="simple-login-title">
            {mode === 'FORGOT_PASSWORD' ? 'FORGOT PASSWORD' : 'OFFICER LOGIN'}
          </h1>
        </div>
      </div>

      {mode === 'FORGOT_PASSWORD' ? (
        <form onSubmit={handleForgotPassword} className="simple-login-form">
          <div className="form-field-group">
            <label className="form-label">Officer ID</label>
            <input
              type="text"
              id="forgot-officer-id"
              className="form-input"
              placeholder="Enter Officer ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              autoComplete="username"
              disabled={resetLoading}
              required
            />
          </div>

          {resetSent && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 6, padding: 12, color: '#065f46',
              fontSize: 14, marginTop: 12, marginBottom: 12
            }}>
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#059669' }} />
              <span style={{ fontWeight: 600 }}>Your reset password link is sent.</span>
            </div>
          )}

          {error && !resetSent && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
              borderRadius: 6, padding: 12, color: '#991b1b',
              fontSize: 14, marginTop: 12, marginBottom: 12
            }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#dc2626', marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="login-submit-btn"
            disabled={resetLoading}
            style={{ opacity: resetLoading ? 0.7 : 1, cursor: resetLoading ? 'not-allowed' : 'pointer' }}
          >
            {resetLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Sending reset link...</span></>
            ) : (
              <><Mail className="w-4 h-4" /><span>Send Reset Link</span></>
            )}
          </button>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setError(null);
                setResetSent(false);
              }}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <ArrowLeft className="w-3 h-3" /> Back to Sign In
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="simple-login-form">
          {/* ── Login ID ─────────────────────────────────────────── */}
          <div className="form-field-group">
            <label className="form-label">Officer ID</label>
            <input
              type="text"
              id="officer-login-id"
              className="form-input"
              placeholder="Enter Officer ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              autoComplete="username"
              disabled={isLoading}
              required
            />
          </div>

          {/* ── Password ──────────────────────────────────────────── */}
          <div className="form-field-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="officer-password"
                className="form-input password-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
              <button
                type="button"
                onClick={() => {
                  setMode('FORGOT_PASSWORD');
                  setError(null);
                  setResetSent(false);
                }}
                style={{ background: 'none', border: 'none', color: '#0369a1', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* ── Status area to prevent CLS ────────────────────────────── */}
          <div style={{ minHeight: '64px', marginTop: '16px' }}>
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
                borderRadius: 6, padding: 12, color: '#991b1b',
                fontSize: 14,
              }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#dc2626', marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            {isLoading && !error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
                borderRadius: 6, padding: 12, color: '#0369a1',
                fontSize: 13,
              }}>
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                <span>Signing in...</span>
              </div>
            )}
          </div>

          {/* ── Submit ────────────────────────────────────────────── */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Signing in...</span></>
              : <><KeyRound className="w-4 h-4" /><span>Sign In</span></>
            }
          </button>
        </form>
      )}
    </div>
  );
};

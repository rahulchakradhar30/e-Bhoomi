'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Eye, EyeOff, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { resolveDashboardRoute } from '@/services/authService';
import { signInWithEmailPassword } from '@/lib/services/authService';
import { getOfficerByAuthUid } from '@/lib/services/officerService';
import { getUserProfile } from '@/lib/services/userService';

type LoginStep = 'CREDENTIALS' | 'AUTHENTICATING';

export const OfficerLogin: React.FC = () => {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<LoginStep>('CREDENTIALS');
  const [loadingLabel, setLoadingLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep('AUTHENTICATING');

    try {
      const input = loginId.trim();

      let emailToUse: string;

      if (input.includes('@')) {
        // Direct email provided (admin account or fallback)
        emailToUse = input.toLowerCase();
        setLoadingLabel('Verifying credentials...');
      } else {
        // Login ID format (e.g. AP-511-VRO-123456) — resolve to email via server
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

      // Sign in to Firebase Auth with the resolved email
      const user = await signInWithEmailPassword(emailToUse, password);

      setLoadingLabel('Loading officer profile...');

      // Fetch officer profile
      let officer = await getOfficerByAuthUid(user.uid);

      if (!officer) {
        // Fallback: check users collection (for STATE_ADMIN / SYSTEM_ADMIN)
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

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.');
      setStep('CREDENTIALS');
    }
  };

  const isLoading = step === 'AUTHENTICATING';

  return (
    <div className="simple-login-card">
      <div className="admin-login-badge-header">
        <ShieldCheck className="w-8 h-8 text-navy flex-shrink-0" />
        <div>
          <h1 className="simple-login-title">AUTHORIZED OFFICER SIGN IN</h1>
          <p className="simple-login-subtitle">
            Secure authentication portal for Field Officers, Tahsildars, RDOs, District Collectors, and State Authorities.
          </p>
        </div>
      </div>

      <form onSubmit={handleLogin} className="simple-login-form">
        {/* ── Login ID ─────────────────────────────────────────── */}
        <div className="form-field-group">
          <label className="form-label">Official Login ID</label>
          <input
            type="text"
            id="officer-login-id"
            className="form-input"
            placeholder="e.g. AP-511-VRO-123456"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            autoComplete="username"
            autoCapitalize="characters"
            disabled={isLoading}
            required
          />
          <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>
            Use the Login ID from the credential email sent by e-Bhoomi system administrator.
          </span>
        </div>

        {/* ── Password ──────────────────────────────────────────── */}
        <div className="form-field-group">
          <label className="form-label">Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="officer-password"
              className="form-input password-input"
              placeholder="Enter official credentials..."
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
        </div>

        {/* ── Error ─────────────────────────────────────────────── */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
            borderRadius: 6, padding: 12, color: '#991b1b',
            fontSize: 14, marginTop: 16,
          }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#dc2626', marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Loading state ────────────────────────────────────── */}
        {isLoading && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
            borderRadius: 6, padding: 12, color: '#0369a1',
            fontSize: 13, marginTop: 16,
          }}>
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            <span>{loadingLabel}</span>
          </div>
        )}

        {/* ── Submit ────────────────────────────────────────────── */}
        <button
          type="submit"
          className="login-submit-btn"
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
        >
          {isLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /><span>{loadingLabel || 'Authenticating...'}</span></>
            : <><KeyRound className="w-4 h-4" /><span>Authenticate &amp; Access Workspace</span></>
          }
        </button>
      </form>
    </div>
  );
};

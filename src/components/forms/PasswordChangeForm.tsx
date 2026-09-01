'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { DEFAULT_PASSWORD_POLICY, resolveDashboardRoute } from '@/services/authService';
import { auth } from '@/lib/firebase/auth';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword as firebaseUpdatePassword } from 'firebase/auth';
import { updateOfficerProfile } from '@/lib/services/officerService';
import { updateUserProfile } from '@/lib/services/userService';
import { useCurrentUser } from '@/context/AuthContext';

export const PasswordChangeForm: React.FC = () => {
  const router = useRouter();
  const { user, officerProfile, userProfile } = useCurrentUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('No authenticated user session found.');
      }

      // Re-authenticate user before password change (security requirement)
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password in Firebase Auth
      await firebaseUpdatePassword(currentUser, newPassword);

      // Update Firestore profiles
      const uid = currentUser.uid;
      const updates = { mustChangePassword: false };
      
      const promises: Promise<void>[] = [];
      if (officerProfile) {
        promises.push(updateOfficerProfile(uid, updates));
      }
      if (userProfile) {
        promises.push(updateUserProfile(uid, updates));
      }
      
      await Promise.all(promises);

      setSuccess(true);
      
      // Redirect to correct dashboard
      const userRole = officerProfile?.roleId || userProfile?.role || 'PUBLIC_USER';
      const redirectDashboard = resolveDashboardRoute(userRole);
      
      setTimeout(() => {
        router.push(redirectDashboard);
      }, 2000);
    } catch (err: any) {
      console.error('Password change error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('The current/temporary password you entered is incorrect. Please check your credential email and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simple-login-card" style={{ maxWidth: '520px' }}>
      <div className="admin-login-badge-header">
        <ShieldCheck className="w-8 h-8 text-navy flex-shrink-0" />
        <div>
          <h1 className="simple-login-title">CREDENTIAL LIFECYCLE MANAGEMENT</h1>
          <p className="simple-login-subtitle">
            Update your official password to comply with Government of India Information Security Standards.
          </p>
        </div>
      </div>

      {success && (
        <div className="generated-id-display margin-bottom-md" style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <CheckCircle2 className="w-5 h-5 text-green" />
          <span className="generated-id-text text-green">Password updated successfully! Redirecting to login...</span>
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

      <form onSubmit={handleSubmit} className="simple-login-form">
        <div className="form-field-group">
          <label className="form-label">Current / Temporary Password</label>
          <input
            type="password"
            className="form-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-field-group">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-field-group">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            className="form-input"
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
          <span>{loading ? 'Updating Credentials...' : 'Update Password & Save Credentials'}</span>
        </button>
      </form>
    </div>
  );
};

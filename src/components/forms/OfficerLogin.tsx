'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Eye, EyeOff, KeyRound, AlertCircle } from 'lucide-react';
import { resolveDashboardRoute } from '@/services/authService';
import { signInWithEmailPassword } from '@/lib/services/authService';
import { getOfficerByAuthUid } from '@/lib/services/officerService';

export const OfficerLogin: React.FC = () => {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('FIELD_VRO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Map login ID to email. If it doesn't contain '@', treat it as loginId @ e-bhoomi.gov.in
      const email = loginId.includes('@') ? loginId : `${loginId.toLowerCase()}@e-bhoomi.gov.in`;
      const user = await signInWithEmailPassword(email, password);
      
      // Resolve officer profile to find actual role
      const officer = await getOfficerByAuthUid(user.uid);
      
      if (officer?.mustChangePassword) {
        router.push('/auth/change-password');
        return;
      }

      const userRole = officer?.roleId || selectedRole;
      const route = resolveDashboardRoute(userRole);
      router.push(route);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="form-field-group">
          <label className="form-label">Official Administrative Role</label>
          <select
            className="form-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="FIELD_VRO">Village Revenue Officer (VRO) / Field Officer</option>
            <option value="TAHSILDAR_MRO">Tahsildar / Mandal Revenue Officer (MRO)</option>
            <option value="RDO_OFFICER">Revenue Divisional Officer (RDO)</option>
            <option value="DISTRICT_COLLECTOR">District Collector / Deputy Commissioner</option>
            <option value="STATE_ADMIN">State Land Record Authority</option>
          </select>
        </div>

        <div className="form-field-group">
          <label className="form-label">Official Login ID</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. AP-545-VRO-00101"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
          />
        </div>

        <div className="form-field-group">
          <label className="form-label">Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input password-input"
              placeholder="Enter official credentials..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

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
              marginTop: '16px'
            }}
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" style={{ color: '#dc2626' }} />
            <span>{error}</span>
          </div>
        )}

        <button 
          type="submit" 
          className="login-submit-btn" 
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          <KeyRound className="w-4 h-4" />
          <span>{loading ? 'Authenticating Officer...' : 'Authenticate & Access Workspace'}</span>
        </button>
      </form>
    </div>
  );
};

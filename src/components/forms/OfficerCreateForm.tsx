'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/auth';
import { getStates, getDistricts, getSubdistricts, getSachivalayams } from '@/services/administrativeDataService';
import { APP_CONFIG } from '@/config/appConfig';
import { UserRole } from '@/types';
import { UserPlus, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Mail } from 'lucide-react';

interface ProvisionResult {
  success: boolean;
  loginId: string;
  name: string;
  roleId: string;
  emailDelivered: boolean;
  emailError?: string;
}

export const OfficerCreateForm: React.FC = () => {
  const [stateCode, setStateCode] = useState(APP_CONFIG.activeStateCode);
  const [districtCode, setDistrictCode] = useState(APP_CONFIG.activeDistrictCode);
  const [revDivCode, setRevDivCode] = useState('');
  const [subdistrictCode, setSubdistrictCode] = useState('');
  const [sachivalayamCode, setSachivalayamCode] = useState('');
  const [role, setRole] = useState<UserRole>('FIELD_VRO');
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProvisionResult | null>(null);

  const states = getStates();
  const districts = getDistricts(stateCode);
  const subdistricts = getSubdistricts(stateCode, districtCode);
  const sachivalayams = getSachivalayams(subdistrictCode);

  // Reset downstream selects when parents change
  useEffect(() => { setSubdistrictCode(''); setSachivalayamCode(''); }, [districtCode]);
  useEffect(() => { setSachivalayamCode(''); }, [subdistrictCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get admin's Firebase ID token to authorize the server-side API call
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Admin session expired. Please refresh and log in again.');
      }
      const idToken = await currentUser.getIdToken(true);

      const payload = {
        name: fullName.trim(),
        designation: designation.trim(),
        officialEmail: email.trim().toLowerCase(),
        officialMobile: mobile.trim(),
        roleId: role,
        stateId: stateCode,
        districtId: districtCode || APP_CONFIG.activeDistrictCode,
        revenueDivisionId: revDivCode || undefined,
        mandalId: subdistrictCode || undefined,
        sachivalayamId: sachivalayamCode || undefined,
      };

      const res = await fetch('/api/admin/officers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Provisioning failed (${res.status}).`);
      }

      setResult({
        success: true,
        loginId: data.officer.loginId,
        name: data.officer.name,
        roleId: data.officer.roleId,
        emailDelivered: data.emailDelivered,
        emailError: data.emailError,
      });

      // Reset form
      setFullName(''); setDesignation(''); setEmail(''); setMobile('');
      setSubdistrictCode(''); setSachivalayamCode(''); setRevDivCode('');
      setRole('FIELD_VRO');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Officer provisioning failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form-grid">

      {/* ── Success banner ──────────────────────────────────────────── */}
      {result && (
        <div style={{ gridColumn: '1 / -1', marginBottom: 16 }}>
          <div className="generated-id-display" style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 className="w-5 h-5" style={{ color: '#16a34a', flexShrink: 0 }} />
              <span className="generated-id-text" style={{ color: '#15803d', fontWeight: 700 }}>
                Officer account provisioned successfully!
              </span>
            </div>
            <div style={{ paddingLeft: 28, fontSize: 13, color: '#166534', lineHeight: 1.7 }}>
              <div><strong>Name:</strong> {result.name}</div>
              <div><strong>Login ID:</strong> <code style={{ background: '#dcfce7', padding: '1px 6px', borderRadius: 4, letterSpacing: 1 }}>{result.loginId}</code></div>
              <div><strong>Role:</strong> {result.roleId}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Mail className="w-3.5 h-3.5" />
                {result.emailDelivered
                  ? <span>Credentials email dispatched to officer's mailbox.</span>
                  : <span style={{ color: '#b45309' }}>⚠ Email delivery failed: {result.emailError}. Credentials are set — use <strong>Resend Credentials</strong> from the officer profile.</span>
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Error banner ──────────────────────────────────────────────── */}
      {error && (
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-start', gap: 8, backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, padding: 12, color: '#991b1b', fontSize: 14, marginBottom: 8 }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#dc2626', marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Location ─────────────────────────────────────────────────── */}
      <div className="form-field-group">
        <label className="form-label">State</label>
        <select className="form-select" value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
          {states.map(s => (
            <option key={s.state_code} value={s.state_code}>{s.name} ({s.short_code || s.display_code})</option>
          ))}
        </select>
      </div>

      <div className="form-field-group">
        <label className="form-label">District (LGD)</label>
        <select className="form-select" value={districtCode} onChange={(e) => setDistrictCode(e.target.value)}>
          {districts.map(d => (
            <option key={d.district_code} value={d.district_code}>{d.name} (LGD: {d.district_code})</option>
          ))}
        </select>
      </div>

      <div className="form-field-group">
        <label className="form-label">Subdistrict / Mandal</label>
        <select className="form-select" value={subdistrictCode} onChange={(e) => setSubdistrictCode(e.target.value)}>
          <option value="">Select Mandal...</option>
          {subdistricts.map(sd => (
            <option key={sd.subdistrict_code} value={sd.subdistrict_code}>{sd.name} ({sd.type})</option>
          ))}
        </select>
      </div>

      <div className="form-field-group">
        <label className="form-label">Sachivalayam / Jurisdiction</label>
        <select className="form-select" value={sachivalayamCode} onChange={(e) => setSachivalayamCode(e.target.value)}>
          <option value="">Select Sachivalayam...</option>
          {sachivalayams.map(s => (
            <option key={s.sachivalayam_code} value={s.sachivalayam_code}>{s.name} ({s.area_type})</option>
          ))}
        </select>
      </div>

      {/* ── Role ──────────────────────────────────────────────────────── */}
      <div className="form-field-group">
        <label className="form-label">Official Role</label>
        <select className="form-select" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
          <option value="FIELD_VRO">Village Revenue Officer (VRO) / Field Officer</option>
          <option value="TAHSILDAR_MRO">Tahsildar / Mandal Revenue Officer (MRO)</option>
          <option value="RDO_OFFICER">Revenue Divisional Officer (RDO)</option>
          <option value="DISTRICT_COLLECTOR">District Collector / Deputy Commissioner</option>
          <option value="STATE_ADMIN">State Administrator</option>
        </select>
      </div>

      {/* ── Officer details ───────────────────────────────────────────── */}
      <div className="form-field-group">
        <label className="form-label">Full Name of Officer</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Sri Ramesh Kumar"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="form-field-group">
        <label className="form-label">Official Designation</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Senior Village Revenue Officer"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="form-field-group">
        <label className="form-label">Official Email Address</label>
        <input
          type="email"
          className="form-input"
          placeholder="officer@ap.gov.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="form-field-group">
        <label className="form-label">Mobile Number</label>
        <input
          type="tel"
          className="form-input"
          placeholder="+91 9876543210"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {/* ── Generated Login ID preview ────────────────────────────────── */}
      <div className="login-id-box-group">
        <label className="form-label">Generated Official Login ID (auto-assigned on creation)</label>
        <div className="generated-id-display">
          <ShieldCheck className="w-5 h-5 text-navy" />
          <span className="generated-id-text" style={{ color: '#64748b', fontStyle: 'italic' }}>
            AP-{districtCode || APP_CONFIG.activeDistrictCode}-{role === 'FIELD_VRO' ? 'VRO' : role === 'TAHSILDAR_MRO' ? 'MRO' : role === 'RDO_OFFICER' ? 'RDO' : role === 'DISTRICT_COLLECTOR' ? 'COLL' : 'ADM'}-XXXXXX
          </span>
          <span className="auto-gen-tag">SERVER ASSIGNED</span>
        </div>
      </div>

      <div className="password-policy-notice-box">
        <span>
          A secure temporary password will be generated server-side and emailed to the officer.
          The officer <strong>must change their password</strong> on first sign in.
          Credentials are <strong>never stored</strong> in plain text.
        </span>
      </div>

      {/* ── Submit ────────────────────────────────────────────────────── */}
      <div className="login-id-box-group margin-top-md">
        <button
          type="submit"
          className="gov-nav-btn login-btn"
          disabled={loading || !fullName || !designation || !email || !mobile}
          style={{ opacity: (loading || !fullName || !designation || !email || !mobile) ? 0.7 : 1 }}
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Provisioning Officer Account...</span></>
            : <><UserPlus className="w-4 h-4" /><span>Provision Officer Credentials</span></>
          }
        </button>
      </div>
    </form>
  );
};

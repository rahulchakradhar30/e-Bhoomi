'use client';

import React, { useState, useEffect } from 'react';
import { generateOfficerLoginId } from '@/services/authService';
import { getStates, getDistricts, getSubdistricts, getSachivalayams } from '@/services/administrativeDataService';
import { APP_CONFIG } from '@/config/appConfig';
import { UserRole } from '@/types';
import { UserPlus, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const OfficerCreateForm: React.FC = () => {
  const [stateCode, setStateCode] = useState(APP_CONFIG.activeStateCode);
  const [districtCode, setDistrictCode] = useState(APP_CONFIG.activeDistrictCode);
  const [subdistrictCode, setSubdistrictCode] = useState('');
  const [sachivalayamCode, setSachivalayamCode] = useState('');
  const [role, setRole] = useState<UserRole>('FIELD_VRO');
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [loginId, setLoginId] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const states = getStates();
  const districts = getDistricts(stateCode);
  const subdistricts = getSubdistricts(stateCode, districtCode);
  const sachivalayams = getSachivalayams(subdistrictCode);

  const currentState = states.find(s => s.state_code === stateCode);

  useEffect(() => {
    if (currentState) {
      const stateIdentifier = currentState.short_code || currentState.display_code || stateCode;
      const generated = generateOfficerLoginId(stateIdentifier, districtCode || APP_CONFIG.activeDistrictCode, role);
      setLoginId(generated);
    }
  }, [stateCode, districtCode, role, currentState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedMessage(`Officer account for ${fullName} (${loginId}) has been validated and queued for provisioning.`);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form-grid">
      {submittedMessage && (
        <div className="login-id-box-group">
          <div className="generated-id-display" style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
            <CheckCircle2 className="w-5 h-5 text-green" />
            <div className="generated-id-text text-green">{submittedMessage}</div>
          </div>
        </div>
      )}

      <div className="form-field-group">
        <label className="form-label">State</label>
        <select
          className="form-select"
          value={stateCode}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStateCode(e.target.value)}
        >
          {states.map(s => (
            <option key={s.state_code} value={s.state_code}>{s.name} ({s.short_code || s.display_code})</option>
          ))}
        </select>
      </div>

      <div className="form-field-group">
        <label className="form-label">District (LGD)</label>
        <select
          className="form-select"
          value={districtCode}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDistrictCode(e.target.value)}
        >
          {districts.map(d => (
            <option key={d.district_code} value={d.district_code}>{d.name} (LGD: {d.district_code})</option>
          ))}
        </select>
      </div>

      <div className="form-field-group">
        <label className="form-label">Subdistrict / Mandal</label>
        <select
          className="form-select"
          value={subdistrictCode}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSubdistrictCode(e.target.value)}
        >
          <option value="">Select Mandal...</option>
          {subdistricts.map(sd => (
            <option key={sd.subdistrict_code} value={sd.subdistrict_code}>{sd.name} ({sd.type})</option>
          ))}
        </select>
      </div>

      <div className="form-field-group">
        <label className="form-label">Sachivalayam / Jurisdiction</label>
        <select
          className="form-select"
          value={sachivalayamCode}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSachivalayamCode(e.target.value)}
        >
          <option value="">Select Sachivalayam...</option>
          {sachivalayams.map(s => (
            <option key={s.sachivalayam_code} value={s.sachivalayam_code}>{s.name} ({s.area_type})</option>
          ))}
        </select>
      </div>

      <div className="form-field-group">
        <label className="form-label">Official Role</label>
        <select
          className="form-select"
          value={role}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value as UserRole)}
        >
          <option value="FIELD_VRO">Village Revenue Officer (VRO) / Field Officer</option>
          <option value="TAHSILDAR_MRO">Tahsildar / Mandal Revenue Officer (MRO)</option>
          <option value="RDO_OFFICER">Revenue Divisional Officer (RDO)</option>
          <option value="DISTRICT_COLLECTOR">District Collector / Deputy Commissioner</option>
          <option value="STATE_ADMIN">State Administrator</option>
        </select>
      </div>

      <div className="form-field-group">
        <label className="form-label">Full Name of Officer</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Sri Ramesh Kumar"
          value={fullName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="form-field-group">
        <label className="form-label">Official Designation</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Senior Village Revenue Officer"
          value={designation}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDesignation(e.target.value)}
          required
        />
      </div>

      <div className="form-field-group">
        <label className="form-label">Official Email Address</label>
        <input
          type="email"
          className="form-input"
          placeholder="officer@ap.gov.in"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-field-group">
        <label className="form-label">Mobile Number</label>
        <input
          type="tel"
          className="form-input"
          placeholder="+91 9876543210"
          value={mobile}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMobile(e.target.value)}
          required
        />
      </div>

      <div className="login-id-box-group">
        <label className="form-label">Generated Official Login ID</label>
        <div className="generated-id-display">
          <ShieldCheck className="w-5 h-5 text-navy" />
          <span className="generated-id-text">{loginId}</span>
          <span className="auto-gen-tag">AUTO GENERATED</span>
        </div>
      </div>

      <div className="password-policy-notice-box">
        <span>Temporary credentials will be issued upon creation. The officer must change password on first sign in.</span>
      </div>

      <div className="login-id-box-group margin-top-md">
        <button type="submit" className="gov-nav-btn login-btn">
          <UserPlus className="w-4 h-4" />
          <span>Provision Officer Credentials</span>
        </button>
      </div>
    </form>
  );
};

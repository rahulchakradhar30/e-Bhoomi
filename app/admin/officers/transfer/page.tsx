'use client';

import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { getAllOfficers } from '@/lib/services/officerService';
import { OfficerProfile } from '@/types/officer';
import { getStates, getDistricts, getSubdistricts, getSachivalayams } from '@/services/administrativeDataService';
import { APP_CONFIG } from '@/config/appConfig';
import { auth } from '@/lib/firebase/auth';
import { Loader2, ArrowRightLeft, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TransferOfficerPage() {
  const [officers, setOfficers] = useState<OfficerProfile[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  
  const [search, setSearch] = useState('');
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  
  const [districtCode, setDistrictCode] = useState(APP_CONFIG.activeDistrictCode);
  const [subdistrictCode, setSubdistrictCode] = useState('');
  const [sachivalayamCode, setSachivalayamCode] = useState('');
  const [isDeputation, setIsDeputation] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const states = getStates();
  const stateCode = APP_CONFIG.activeStateCode;
  const districts = getDistricts(stateCode);
  const subdistricts = getSubdistricts(stateCode, districtCode);
  const sachivalayams = getSachivalayams(subdistrictCode);

  const router = useRouter();

  useEffect(() => {
    getAllOfficers()
      .then(data => setOfficers(data))
      .catch(err => console.error("Failed to load officers", err))
      .finally(() => setLoadingOfficers(false));
  }, []);

  // Reset downstream selects when parents change
  useEffect(() => { setSubdistrictCode(''); setSachivalayamCode(''); }, [districtCode]);
  useEffect(() => { setSachivalayamCode(''); }, [subdistrictCode]);

  const selectedOfficer = officers.find(o => o.officerId === selectedOfficerId);

  const filteredOfficers = officers.filter(o => 
    (o.name || '').toLowerCase().includes(search.toLowerCase()) || 
    ((o as any).loginId || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficer) return;
    
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not logged in');
      const token = await currentUser.getIdToken();

      const payload = {
        officerId: selectedOfficer.officerId,
        newDistrictId: districtCode,
        newMandalId: subdistrictCode || undefined,
        newSachivalayamId: sachivalayamCode || undefined,
        isDeputation
      };

      const res = await fetch('/api/admin/officers/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Transfer failed');
      }

      setSuccessMsg(data.message);
      
      // Update local state to reflect change
      setOfficers(prev => prev.map(o => {
        if (o.officerId === selectedOfficer.officerId) {
          return { ...o, districtId: districtCode, mandalId: subdistrictCode, sachivalayamId: sachivalayamCode, isDeputation } as any;
        }
        return o;
      }));
      
      setTimeout(() => {
        router.push(`/admin/officers/${selectedOfficer.officerId}`);
      }, 2000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'System Admin Console', href: '/admin/dashboard' }, { label: 'Officer Directory', href: '/admin/officers' }, { label: 'Transfer / Deputation' }]} />
      <WorkspaceHeader 
        title="OFFICER TRANSFER & DEPUTATION" 
        subtitle="Move officers between jurisdictions or assign them on temporary deputation." 
      />

      {successMsg && (
        <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '16px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#15803D' }}>
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMsg} Redirecting to officer profile...</span>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '16px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#991B1B' }}>
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Step 1: Select Officer */}
        <WorkspacePanel title="1. SELECT OFFICER">
          {loadingOfficers ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Search className="w-4 h-4 text-gray-400" style={{ position: 'absolute', left: 12, top: 10 }} />
                <input 
                  type="text" 
                  placeholder="Search by Name or Login ID..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px', margin: 0 }}
                />
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', maxHeight: '300px', overflowY: 'auto' }}>
                {filteredOfficers.map(officer => (
                  <div 
                    key={officer.officerId} 
                    onClick={() => setSelectedOfficerId(officer.officerId)}
                    style={{ 
                      padding: '12px', 
                      borderBottom: '1px solid #f1f5f9', 
                      cursor: 'pointer',
                      backgroundColor: selectedOfficerId === officer.officerId ? '#f0f9ff' : 'white',
                      borderLeft: selectedOfficerId === officer.officerId ? '3px solid #0284c7' : '3px solid transparent'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{officer.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{officer.designation} • {(officer as any).loginId || officer.officerId}</div>
                  </div>
                ))}
                {filteredOfficers.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No officers found.</div>}
              </div>

              {selectedOfficer && (
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Current Position</div>
                  <div style={{ color: '#0f172a' }}><strong>Role:</strong> {selectedOfficer.roleId}</div>
                  <div style={{ color: '#0f172a' }}><strong>District:</strong> {selectedOfficer.districtId}</div>
                  {(selectedOfficer as any).mandalId && <div style={{ color: '#0f172a' }}><strong>Mandal:</strong> {(selectedOfficer as any).mandalId}</div>}
                  {(selectedOfficer as any).sachivalayamId && <div style={{ color: '#0f172a' }}><strong>Sachivalayam:</strong> {(selectedOfficer as any).sachivalayamId}</div>}
                  {(selectedOfficer as any).isDeputation && <span className="case-badge" style={{ backgroundColor: '#fef3c7', color: '#92400e', marginTop: 8 }}>Currently on Deputation</span>}
                </div>
              )}
            </div>
          )}
        </WorkspacePanel>

        {/* Step 2: New Location */}
        <WorkspacePanel title="2. ASSIGN NEW JURISDICTION" guidance="Select the new location for this officer. Options are limited by their role.">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-field-group">
              <label className="form-label">District (LGD)</label>
              <select className="form-select" value={districtCode} onChange={(e) => setDistrictCode(e.target.value)} disabled={!selectedOfficer}>
                {districts.map(d => (
                  <option key={d.district_code} value={d.district_code}>{d.name} (LGD: {d.district_code})</option>
                ))}
              </select>
            </div>

            {selectedOfficer && ['FIELD_VRO', 'TAHSILDAR_MRO', 'RDO_OFFICER'].includes(selectedOfficer.roleId) && (
              <div className="form-field-group">
                <label className="form-label">Subdistrict / Mandal</label>
                <select className="form-select" value={subdistrictCode} onChange={(e) => setSubdistrictCode(e.target.value)}>
                  <option value="">Select Mandal...</option>
                  {subdistricts.map(sd => (
                    <option key={sd.subdistrict_code} value={sd.subdistrict_code}>{sd.name} ({sd.type})</option>
                  ))}
                </select>
              </div>
            )}

            {selectedOfficer && ['FIELD_VRO'].includes(selectedOfficer.roleId) && (
              <div className="form-field-group">
                <label className="form-label">Sachivalayam / Jurisdiction</label>
                <select className="form-select" value={sachivalayamCode} onChange={(e) => setSachivalayamCode(e.target.value)}>
                  <option value="">Select Sachivalayam...</option>
                  {sachivalayams.map(s => (
                    <option key={s.sachivalayam_code} value={s.sachivalayam_code}>{s.name} ({s.area_type})</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', padding: '12px', backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '6px' }}>
              <input 
                type="checkbox" 
                id="deputation" 
                checked={isDeputation} 
                onChange={(e) => setIsDeputation(e.target.checked)} 
                disabled={!selectedOfficer}
                style={{ width: '16px', height: '16px' }}
              />
              <label htmlFor="deputation" style={{ color: '#0f766e', fontWeight: 500, cursor: 'pointer', margin: 0 }}>
                Mark as Temporary Deputation
              </label>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '-8px', paddingLeft: '24px' }}>
              If checked, this officer will be marked as being on deputation at the new location. Useful when the destination is already occupied by an active officer.
            </p>

            <div style={{ marginTop: '16px' }}>
              <button
                type="submit"
                className="gov-nav-btn login-btn"
                disabled={loading || !selectedOfficer}
                style={{ width: '100%', justifyContent: 'center', opacity: (!selectedOfficer || loading) ? 0.6 : 1 }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                <span>{isDeputation ? 'Process Deputation' : 'Transfer Officer'}</span>
              </button>
            </div>
          </form>
        </WorkspacePanel>
      </div>
    </div>
  );
}

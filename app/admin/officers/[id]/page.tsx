'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { getOfficerProfile } from '@/lib/services/officerService';
import { getAuditLogsForActor } from '@/lib/services/auditService';
import { OfficerProfile } from '@/types/officer';
import { AuditLogDocument } from '@/types/audit';
import { auth } from '@/lib/firebase/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, CheckCircle2, AlertCircle, Clock, ShieldCheck, MapPin, Activity, Trash2, X } from 'lucide-react';

export default function AdminOfficerDetailPage() {
  const params = useParams();
  const officerId = params.id as string;

  const [officer, setOfficer] = useState<OfficerProfile | null>(null);
  const [logs, setLogs] = useState<AuditLogDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resetError, setResetError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    if (!officerId) return;
    
    setLoading(true);
    Promise.all([
      getOfficerProfile(officerId),
      getAuditLogsForActor(officerId)
    ])
    .then(([profileData, logsData]) => {
      setOfficer(profileData);
      setLogs(logsData);
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
  }, [officerId]);

  const handleResetPassword = async () => {
    if (!officer?.officialEmail) return;
    
    setResetStatus('loading');
    setResetError(null);
    try {
      await sendPasswordResetEmail(auth, officer.officialEmail);
      setResetStatus('success');
      setTimeout(() => setResetStatus('idle'), 8000);
    } catch (err: any) {
      setResetStatus('error');
      setResetError(err.message || 'Failed to send reset email.');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not logged in');
      const token = await currentUser.getIdToken();
      
      const res = await fetch(`/api/admin/officers/${officerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete');
      }
      router.push('/admin/officers');
    } catch (err: any) {
      alert(err.message);
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Breadcrumbs items={[{ label: 'System Admin Console', href: '/admin/dashboard' }, { label: 'Officer Directory', href: '/admin/officers' }, { label: 'Officer Details' }]} />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 className="w-8 h-8 animate-spin text-navy" />
        </div>
      </div>
    );
  }

  if (error || !officer) {
    return (
      <div>
        <Breadcrumbs items={[{ label: 'System Admin Console', href: '/admin/dashboard' }, { label: 'Officer Directory', href: '/admin/officers' }, { label: 'Officer Details' }]} />
        <WorkspacePanel>
          <EmptyState title="Officer Not Found" description={error || "The requested officer profile could not be located."} />
        </WorkspacePanel>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'System Admin Console', href: '/admin/dashboard' },
          { label: 'Officer Directory', href: '/admin/officers' },
          { label: 'Officer Profile' }
        ]}
      />
      <WorkspaceHeader 
        title="OFFICER PROFILE & ACTIVITY" 
        subtitle={`Viewing details for ${officer.name} (${(officer as any).loginId || officer.officerId})`} 
      />

      {/* Password Reset Banner */}
      {resetStatus === 'success' && (
        <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '16px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#15803D' }}>
          <CheckCircle2 className="w-5 h-5" />
          <span>A password reset link has been successfully dispatched to <strong>{officer.officialEmail}</strong>.</span>
        </div>
      )}
      {resetStatus === 'error' && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '16px', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#991B1B' }}>
          <AlertCircle className="w-5 h-5" />
          <span>{resetError}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px', alignItems: 'start' }}>
        {/* Profile Card */}
        <WorkspacePanel title="OFFICIAL DETAILS" guidance="Registered demographic and operational metadata.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Full Name</div>
              <div style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: 500 }}>{officer.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Designation</div>
              <div style={{ fontSize: '1rem', color: '#1e293b' }}>{officer.designation}</div>
              <span className="case-badge" style={{ backgroundColor: '#e2e8f0', color: '#334155', marginTop: '6px' }}>
                {officer.roleId.replace('_', ' ')}
              </span>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Contact Information</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', marginBottom: '4px' }}>
                <Mail className="w-4 h-4 text-gray-500" /> {officer.officialEmail}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <ShieldCheck className="w-4 h-4 text-gray-500" /> {officer.officialMobile}
              </div>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Jurisdiction</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', marginBottom: '4px' }}>
                <MapPin className="w-4 h-4 text-gray-500" /> District LGD: {officer.districtId}
              </div>
              {(officer as any).mandalId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                  <MapPin className="w-4 h-4 text-gray-500" /> Mandal LGD: {(officer as any).mandalId}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={handleResetPassword}
                disabled={resetStatus === 'loading'}
                className="gov-nav-btn" 
                style={{ width: '100%', justifyContent: 'center', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
              >
                {resetStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                <span>Send Password Reset Link</span>
              </button>
              
              <button 
                onClick={() => setDeleteModalOpen(true)}
                className="gov-nav-btn" 
                style={{ width: '100%', justifyContent: 'center', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B' }}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Officer Account</span>
              </button>
            </div>
          </div>
        </WorkspacePanel>

        {/* Audit Logs */}
        <WorkspacePanel title="OPERATIONAL ACTIVITY (AUDIT LOGS)" guidance="All works and actions performed by this officer in the system.">
          {logs.length === 0 ? (
            <EmptyState title="No Activity Found" description="This officer has not performed any actions logged by the system yet." icon={Activity} />
          ) : (
            <div className="table-responsive-wrapper" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="gov-data-table">
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 10 }}>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action Performed</th>
                    <th>Resource Target</th>
                    <th>Context</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500, color: '#1e293b', fontSize: '0.9rem' }}>
                        {log.action.replace(/_/g, ' ')}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        <div>{log.resourceCollection || 'System'}</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{log.resourceId || 'N/A'}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </WorkspacePanel>
      </div>

      {deleteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>Confirm Deletion</h3>
              <button onClick={() => setDeleteModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>{officer?.name}</strong>? This will instantly revoke their access and cannot be undone. Audit logs for their past actions will be preserved.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteModalOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="gov-nav-btn" style={{ padding: '8px 16px', minHeight: 'auto', backgroundColor: '#dc2626', color: 'white', border: 'none' }}>
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

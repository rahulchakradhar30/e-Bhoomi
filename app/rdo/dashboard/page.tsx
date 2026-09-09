'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { MapPin, Building2, Users, FileText, ShieldCheck, CheckCircle2, ArrowRight, Layers, Eye } from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';
import { getCasesForJurisdiction } from '@/lib/services/digitizationService';
import { DigitizationCaseDocument } from '@/types/digitizationCase';

export default function RdoDashboardPage() {
  const [cases, setCases] = useState<DigitizationCaseDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const fetched = await getCasesForJurisdiction();
        setCases(fetched);
      } catch (err) {
        console.error('Failed to load RDO cases:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const totalCases = cases.length;
  const approvedCases = cases.filter((c) => c.workflowStatus === 'DIGITIZED' || c.workflowStatus === 'FINAL_SUBMITTED').length;

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'RDO Workspace', href: '/rdo/dashboard' }, { label: 'Dashboard' }]} />

      <WorkspaceHeader
        title="REVENUE DIVISION ADMINISTRATION DASHBOARD"
        subtitle="Divisional Supervision, Appellate Disputes & Mandal Monitoring Console"
        action={
          <Link href="/rdo/cases" className="new-digitization-btn">
            <FileText className="w-4 h-4" />
            <span>Divisional Cases Registry</span>
          </Link>
        }
      />

      <div className="jurisdiction-bar">
        <MapPin className="w-4 h-4 text-navy flex-shrink-0" />
        <span className="font-bold text-navy">REVENUE DIVISION JURISDICTION:</span>
        <span className="font-semibold">Kurnool Revenue Division (RD-545-01)</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">{APP_CONFIG.activeDistrict} District (LGD: {APP_CONFIG.activeDistrictCode})</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">{APP_CONFIG.activeState}</span>
      </div>

      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">SUBORDINATE MANDALS</span>
            <Building2 className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">8</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">FIELD OFFICERS (VROs)</span>
            <Users className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">64</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">DIGITIZED RECORDS</span>
            <CheckCircle2 className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">{approvedCases}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">TOTAL PROCESSED</span>
            <FileText className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">{totalCases}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">SECURITY STATUS</span>
            <ShieldCheck className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">100%</div>
        </div>
      </div>

      <div className="operational-split-grid">
        <WorkspacePanel
          title="SUBORDINATE MANDAL REVENUE OFFICES"
          guidance="Monitoring performance across mandals under this division in Kurnool District."
        >
          <div className="dashboard-queue-list">
            {[
              { mandal: 'Kurnool Rural Mandal', code: '5102', mro: 'Tahsildar P. Venkateswarlu', records: totalCases, status: 'Active' },
              { mandal: 'Kurnool Urban Mandal', code: '5101', mro: 'Tahsildar G. Radhakrishna', records: 42, status: 'Active' },
              { mandal: 'Orvakal Mandal', code: '5103', mro: 'Tahsildar S. Chandrasekhar', records: 28, status: 'Active' },
              { mandal: 'Kallur Mandal', code: '5104', mro: 'Tahsildar K. Sudhakar', records: 56, status: 'Active' },
            ].map((m) => (
              <div key={m.code} className="dashboard-queue-card">
                <div className="dashboard-queue-info">
                  <div className="dashboard-queue-title">
                    <span>{m.mandal}</span>
                    <span className="dashboard-queue-meta-pill">LGD: {m.code}</span>
                  </div>
                  <div className="dashboard-queue-meta">
                    <span>MRO: {m.mro}</span>
                    <span>•</span>
                    <span className="text-navy font-bold">{m.records} Records Digitized</span>
                  </div>
                </div>

                <span className="table-status-pill locked">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          title="RECENT DIVISIONAL DIGITIZATIONS & ENDORSEMENTS"
          guidance="Recent land records validated across subordinate mandals."
        >
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">Loading divisional records...</div>
          ) : cases.length === 0 ? (
            <EmptyState title="No Divisional Records" description="Records digitized across mandals will appear here." />
          ) : (
            <div className="dashboard-queue-list">
              {cases.slice(0, 5).map((c) => (
                <div key={c.caseId} className="dashboard-queue-card">
                  <div className="dashboard-queue-info">
                    <div className="dashboard-queue-title">
                      <span>{c.extractedData?.ownerName?.value || 'Pattadar Record'}</span>
                      <span className="dashboard-queue-meta-pill">{c.documentType}</span>
                    </div>
                    <div className="dashboard-queue-meta">
                      <span className="text-navy font-bold">Ref: {c.caseId}</span>
                      <span>•</span>
                      <span>Sy: {c.extractedData?.surveyNumber?.value || 'N/A'}</span>
                      <span>•</span>
                      <span>Mandal: {c.extractedData?.mandalName?.value || 'Kurnool Rural'}</span>
                    </div>
                  </div>

                  <Link href={`/officer/history/${c.caseId}`} className="dashboard-action-link">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </WorkspacePanel>
      </div>
    </div>
  );
}

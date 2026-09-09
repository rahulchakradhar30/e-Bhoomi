'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { MapPin, Building2, Users, FileText, ShieldCheck, CheckCircle2, Eye, TrendingUp, Layers } from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';
import { getCasesForJurisdiction } from '@/lib/services/digitizationService';
import { DigitizationCaseDocument } from '@/types/digitizationCase';

export default function DistrictDashboardPage() {
  const [cases, setCases] = useState<DigitizationCaseDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const fetched = await getCasesForJurisdiction();
        setCases(fetched);
      } catch (err) {
        console.error('Failed to load district data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const digitizedCount = cases.filter(
    (c) => c.workflowStatus === 'DIGITIZED' || c.workflowStatus === 'FINAL_SUBMITTED'
  ).length;

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'District Workspace', href: '/district/dashboard' }, { label: 'Dashboard' }]} />

      <WorkspaceHeader
        title="KURNOOL DISTRICT LAND RECORD ADMINISTRATION DASHBOARD"
        subtitle="District-Wide Land Records Modernization & Revenue Administration Console"
        action={
          <Link href="/district/records" className="new-digitization-btn">
            <Layers className="w-4 h-4" />
            <span>District Master Registry</span>
          </Link>
        }
      />

      <div className="jurisdiction-bar">
        <MapPin className="w-4 h-4 text-navy flex-shrink-0" />
        <span className="font-bold text-navy">DISTRICT JURISDICTION:</span>
        <span className="font-semibold">{APP_CONFIG.activeDistrict} District (LGD: {APP_CONFIG.activeDistrictCode})</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">3 Revenue Divisions</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">21 Mandals</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">{APP_CONFIG.activeState}</span>
      </div>

      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">MANDALS ACTIVE</span>
            <Building2 className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">21</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">TAHSILDARS / MROs</span>
            <Users className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">21</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">DIGITIZED PARCELS</span>
            <CheckCircle2 className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">{digitizedCount}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">TOTAL REPOSITORIES</span>
            <FileText className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">{cases.length}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">AI INTEGRITY RATE</span>
            <ShieldCheck className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">98.4%</div>
        </div>
      </div>

      <div className="operational-split-grid">
        <WorkspacePanel
          title="MANDAL PERFORMANCE MONITORING"
          guidance="Progress tracking across mandal revenue offices in Kurnool District."
        >
          <div className="dashboard-queue-list">
            {[
              { mandal: 'Kurnool Rural', division: 'Kurnool RD', total: cases.length, compliance: '100%', status: 'Normal' },
              { mandal: 'Kurnool Urban', division: 'Kurnool RD', total: 42, compliance: '98%', status: 'Normal' },
              { mandal: 'Adoni Mandal', division: 'Adoni RD', total: 68, compliance: '99%', status: 'Normal' },
              { mandal: 'Nandyal Rural', division: 'Nandyal RD', total: 54, compliance: '97%', status: 'Normal' },
            ].map((item, idx) => (
              <div key={idx} className="dashboard-queue-card">
                <div className="dashboard-queue-info">
                  <div className="dashboard-queue-title">
                    <span>{item.mandal}</span>
                    <span className="dashboard-queue-meta-pill">{item.division}</span>
                  </div>
                  <div className="dashboard-queue-meta">
                    <span className="text-navy font-bold">{item.total} Parcels</span>
                    <span>•</span>
                    <span>Compliance: <strong className="text-green-700">{item.compliance}</strong></span>
                  </div>
                </div>

                <span className="table-status-pill locked">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          title="DISTRICT LAND RECORDS AUDIT STREAM"
          guidance="High-level audit monitoring for land record modifications in Kurnool."
        >
          <div className="dashboard-queue-list">
            {cases.slice(0, 4).map((c) => (
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
                    <span>{c.extractedData?.villageName?.value || 'Kurnool'}</span>
                  </div>
                </div>

                <Link href={`/officer/history/${c.caseId}`} className="dashboard-action-link">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </Link>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </div>
    </div>
  );
}

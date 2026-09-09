'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { MapPin, Building2, Users, FileText, ShieldCheck, CheckCircle2, Eye } from 'lucide-react';
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
  const approvedCases = cases.filter(
    (c) => c.workflowStatus === 'DIGITIZED' || c.workflowStatus === 'FINAL_SUBMITTED'
  ).length;

  // Extract unique mandals dynamically from genuine digitized records
  const mandalMap = new Map<string, { name: string; total: number; digitized: number; villages: Set<string> }>();
  const vroSet = new Set<string>();

  cases.forEach((c) => {
    const mandal = c.extractedData?.mandalName?.value || 'Assigned Mandal';
    const village = c.extractedData?.villageName?.value;
    const isDigi = c.workflowStatus === 'DIGITIZED' || c.workflowStatus === 'FINAL_SUBMITTED';
    if (c.createdBy) vroSet.add(c.createdBy);

    if (!mandalMap.has(mandal)) {
      mandalMap.set(mandal, { name: mandal, total: 0, digitized: 0, villages: new Set() });
    }
    const item = mandalMap.get(mandal)!;
    item.total += 1;
    if (isDigi) item.digitized += 1;
    if (village) item.villages.add(village);
  });
  const genuineMandals = Array.from(mandalMap.values());

  const sampleCase = cases.find((c) => c.extractedData?.districtName?.value);
  const districtName = sampleCase?.extractedData?.districtName?.value || APP_CONFIG.activeDistrict;

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
        <span className="font-semibold">Kurnool Revenue Division</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">{districtName} District</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">{APP_CONFIG.activeState}</span>
      </div>

      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">ACTIVE MANDALS</span>
            <Building2 className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">{genuineMandals.length}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">REPORTING VROs</span>
            <Users className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">{vroSet.size}</div>
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
            <span className="summary-card-title">AUDIT ACCURACY</span>
            <ShieldCheck className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">
            {cases.length > 0
              ? `${Math.round(
                  (cases.reduce((acc, c) => acc + (c.aiConfidenceScore || 0.9), 0) / cases.length) * 100
                )}%`
              : '100%'}
          </div>
        </div>
      </div>

      <div className="operational-split-grid">
        <WorkspacePanel
          title="SUBORDINATE MANDAL REVENUE OFFICES"
          guidance="Genuine performance across mandals under this division."
        >
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">Loading mandal metrics...</div>
          ) : genuineMandals.length === 0 ? (
            <EmptyState title="No Active Mandal Records" description="Mandal revenue offices with digitized records will appear here." />
          ) : (
            <div className="dashboard-queue-list">
              {genuineMandals.map((m) => (
                <div key={m.name} className="dashboard-queue-card">
                  <div className="dashboard-queue-info">
                    <div className="dashboard-queue-title">
                      <span>{m.name}</span>
                      <span className="dashboard-queue-meta-pill">{m.total} Records</span>
                    </div>
                    <div className="dashboard-queue-meta">
                      <span>
                        Villages: {m.villages.size > 0 ? Array.from(m.villages).join(', ') : 'Assigned Jurisdiction'}
                      </span>
                      <span>•</span>
                      <span className="text-green-700 font-bold">{m.digitized} Digitized & Locked</span>
                    </div>
                  </div>

                  <span className="table-status-pill locked">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel
          title="RECENT DIVISIONAL DIGITIZATIONS & ENDORSEMENTS"
          guidance="Recent genuine land records validated across subordinate mandals."
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
                      <span>
                        Sy: {c.extractedData?.surveyNumber?.value || 'N/A'}
                        {c.extractedData?.subDivisionNumber?.value ? `/${c.extractedData.subDivisionNumber.value}` : ''}
                      </span>
                      {c.extractedData?.villageName?.value && (
                        <>
                          <span>•</span>
                          <span>{c.extractedData.villageName.value}</span>
                        </>
                      )}
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

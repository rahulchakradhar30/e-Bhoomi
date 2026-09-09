'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { MapPin, Building2, Users, FileText, ShieldCheck, CheckCircle2, Eye, Layers } from 'lucide-react';
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

  // Extract distinct mandals and villages from genuine records
  const mandalMap = new Map<string, { name: string; total: number; digitized: number; villages: Set<string>; avgScore: number }>();
  const officerSet = new Set<string>();

  cases.forEach((c) => {
    const mandal = c.extractedData?.mandalName?.value || 'Assigned Mandal';
    const village = c.extractedData?.villageName?.value;
    const isDigi = c.workflowStatus === 'DIGITIZED' || c.workflowStatus === 'FINAL_SUBMITTED';
    const score = Math.round((c.aiConfidenceScore || 0.9) * 100);
    if (c.createdBy) officerSet.add(c.createdBy);

    if (!mandalMap.has(mandal)) {
      mandalMap.set(mandal, { name: mandal, total: 0, digitized: 0, villages: new Set(), avgScore: score });
    }
    const m = mandalMap.get(mandal)!;
    m.total += 1;
    if (isDigi) m.digitized += 1;
    if (village) m.villages.add(village);
  });
  const genuineMandals = Array.from(mandalMap.values());

  const sampleCase = cases.find((c) => c.extractedData?.districtName?.value);
  const districtName = sampleCase?.extractedData?.districtName?.value || APP_CONFIG.activeDistrict;
  const avgAccuracy =
    cases.length > 0
      ? Math.round((cases.reduce((acc, c) => acc + (c.aiConfidenceScore || 0.9), 0) / cases.length) * 100)
      : 95;

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'District Workspace', href: '/district/dashboard' }, { label: 'Dashboard' }]} />

      <WorkspaceHeader
        title={`${districtName.toUpperCase()} DISTRICT LAND RECORD ADMINISTRATION DASHBOARD`}
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
        <span className="font-semibold">{districtName} District (LGD: {APP_CONFIG.activeDistrictCode})</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">{genuineMandals.length} Active Mandals with Records</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">{APP_CONFIG.activeState}</span>
      </div>

      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">MANDALS WITH DATA</span>
            <Building2 className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">{genuineMandals.length}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">FIELD OFFICERS ACTIVE</span>
            <Users className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">{officerSet.size}</div>
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
            <span className="summary-card-title">AI ACCURACY RATE</span>
            <ShieldCheck className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">{avgAccuracy}%</div>
        </div>
      </div>

      <div className="operational-split-grid">
        <WorkspacePanel
          title="MANDAL PERFORMANCE MONITORING"
          guidance="Genuine progress tracking across mandal revenue offices in this district."
        >
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">Loading mandal analytics...</div>
          ) : genuineMandals.length === 0 ? (
            <EmptyState title="No Mandal Records" description="Mandal metrics will populate as records are digitized." />
          ) : (
            <div className="dashboard-queue-list">
              {genuineMandals.map((item) => (
                <div key={item.name} className="dashboard-queue-card">
                  <div className="dashboard-queue-info">
                    <div className="dashboard-queue-title">
                      <span>{item.name}</span>
                      <span className="dashboard-queue-meta-pill">{item.total} Total Records</span>
                    </div>
                    <div className="dashboard-queue-meta">
                      <span>
                        Villages: {item.villages.size > 0 ? Array.from(item.villages).join(', ') : 'Assigned Jurisdiction'}
                      </span>
                      <span>•</span>
                      <span className="text-green-700 font-bold">{item.digitized} Digitized & Verified</span>
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
          title="DISTRICT LAND RECORDS AUDIT STREAM"
          guidance="Live audit monitoring for digitized land records in this district."
        >
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">Loading audit stream...</div>
          ) : cases.length === 0 ? (
            <EmptyState title="No Digitized Records" description="Digitized records will stream here." />
          ) : (
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

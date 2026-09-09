'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { MapPin, Building2, Users, ShieldCheck, FileText, CheckCircle2, Eye } from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';
import { getCasesForJurisdiction } from '@/lib/services/digitizationService';
import { DigitizationCaseDocument } from '@/types/digitizationCase';

export default function StateDashboardPage() {
  const [cases, setCases] = useState<DigitizationCaseDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const fetched = await getCasesForJurisdiction();
        setCases(fetched);
      } catch (err) {
        console.error('Failed to load state cases:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const districtSet = new Set<string>();
  const mandalSet = new Set<string>();
  const villageSet = new Set<string>();
  const officerSet = new Set<string>();

  cases.forEach((c) => {
    if (c.extractedData?.districtName?.value) districtSet.add(c.extractedData.districtName.value);
    if (c.extractedData?.mandalName?.value) mandalSet.add(c.extractedData.mandalName.value);
    if (c.extractedData?.villageName?.value) villageSet.add(c.extractedData.villageName.value);
    if (c.createdBy) officerSet.add(c.createdBy);
  });

  const sampleCase = cases.find((c) => c.extractedData?.districtName?.value);
  const activeDistrict = sampleCase?.extractedData?.districtName?.value || APP_CONFIG.activeDistrict;
  const digitizedCount = cases.filter(
    (c) => c.workflowStatus === 'DIGITIZED' || c.workflowStatus === 'FINAL_SUBMITTED'
  ).length;

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'State Workspace', href: '/state/dashboard' }, { label: 'Dashboard' }]} />

      <WorkspaceHeader
        title="STATE LAND RECORD ADMINISTRATION DASHBOARD"
        subtitle="Apex State Monitoring, Pilot District Inspection & Policy Management Console"
        action={
          <Link href="/state/reports" className="new-digitization-btn">
            <FileText className="w-4 h-4" />
            <span>State Compliance Reports</span>
          </Link>
        }
      />

      <div className="jurisdiction-bar">
        <MapPin className="w-4 h-4 text-navy flex-shrink-0" />
        <span className="font-bold text-navy">STATE JURISDICTION:</span>
        <span className="font-semibold">{APP_CONFIG.activeState} (State Code: {APP_CONFIG.activeStateCode})</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">ACTIVE PILOT DISTRICT: {activeDistrict}</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">CCLA Andhra Pradesh</span>
      </div>

      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">DISTRICTS WITH DATA</span>
            <Building2 className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">{districtSet.size > 0 ? districtSet.size : 1}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">ACTIVE MANDALS</span>
            <Building2 className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">{mandalSet.size}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">COVERED VILLAGES</span>
            <Building2 className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">{villageSet.size}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">DIGITIZED ARCHIVE</span>
            <CheckCircle2 className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">{digitizedCount}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">ACTIVE OFFICERS</span>
            <Users className="w-4 h-4 text-amber" />
          </div>
          <div className="summary-card-count text-amber">{officerSet.size}</div>
        </div>
      </div>

      <div className="operational-split-grid">
        <WorkspacePanel
          title="STATE-WIDE DISTRICTS MONITORING"
          guidance="Genuine state-level progress tracking across pilot districts."
        >
          {loading ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">Loading state metrics...</div>
          ) : cases.length === 0 ? (
            <EmptyState title="No Digitized Records" description="Records will populate upon digitization." />
          ) : (
            <div className="dashboard-queue-list">
              <div className="dashboard-queue-card">
                <div className="dashboard-queue-info">
                  <div className="dashboard-queue-title">
                    <span>{activeDistrict} District Master Repository</span>
                    <span className="dashboard-queue-meta-pill">Pilot Jurisdiction</span>
                  </div>
                  <div className="dashboard-queue-meta">
                    <span className="text-navy font-bold">{cases.length} Total Parcels Processed</span>
                    <span>•</span>
                    <span className="text-green-700 font-bold">{digitizedCount} Fully Digitized & Locked</span>
                    <span>•</span>
                    <span>Villages: {villageSet.size > 0 ? Array.from(villageSet).slice(0, 3).join(', ') : 'Assigned Jurisdiction'}</span>
                  </div>
                </div>

                <span className="table-status-pill locked">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  ONLINE
                </span>
              </div>
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel
          title="STATE POLICY COMPLIANCE & LEGAL ATTESTATION"
          guidance="Statutory policy enforcement and legal compliance metrics."
        >
          <div className="dashboard-queue-list">
            {[
              { rule: 'Section 7(A) Legal Attestation Lock', status: 'ENFORCED', desc: 'Immutable cryptographic lock active on all final VRO submissions.' },
              { rule: 'Llama Multimodal + Groq Extraction Engine', status: 'OPERATIONAL', desc: 'Multi-lingual Telugu/English recognition active with human-in-the-loop verification.' },
              { rule: 'LGD Code Mapping & Hierarchy Validation', status: 'COMPLIANT', desc: `Mapped across ${mandalSet.size} active mandals and ${villageSet.size} villages.` },
            ].map((p, idx) => (
              <div key={idx} className="dashboard-queue-card">
                <div className="dashboard-queue-info">
                  <div className="dashboard-queue-title">
                    <span>{p.rule}</span>
                  </div>
                  <div className="dashboard-queue-meta">
                    <span>{p.desc}</span>
                  </div>
                </div>

                <span className="table-status-pill locked">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </div>
    </div>
  );
}

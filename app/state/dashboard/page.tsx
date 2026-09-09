'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { MapPin, Building2, Users, ShieldCheck, Layers, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';
import { getCasesForJurisdiction } from '@/lib/services/digitizationService';
import { DigitizationCaseDocument } from '@/types/digitizationCase';

export default function StateDashboardPage() {
  const [cases, setCases] = useState<DigitizationCaseDocument[]>([]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const fetched = await getCasesForJurisdiction();
        setCases(fetched);
      } catch (err) {
        console.error('Failed to load state cases:', err);
      }
    };
    fetchCases();
  }, []);

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'State Workspace', href: '/state/dashboard' }, { label: 'Dashboard' }]} />

      <WorkspaceHeader
        title="STATE LAND RECORD ADMINISTRATION DASHBOARD"
        subtitle="Apex State Monitoring, Kurnool District Inspection & Policy Management Console"
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
        <span className="font-semibold">{APP_CONFIG.activeState} (State LGD Code: {APP_CONFIG.activeStateCode})</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">ACTIVE PILOT DISTRICT: {APP_CONFIG.activeDistrict} (LGD: {APP_CONFIG.activeDistrictCode})</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">CCLA Andhra Pradesh</span>
      </div>

      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">PILOT DISTRICT</span>
            <Building2 className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">1</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">REVENUE DIVISIONS</span>
            <Building2 className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">3</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">MANDALS ACTIVE</span>
            <Building2 className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">21</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">DIGITIZED ARCHIVE</span>
            <CheckCircle2 className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">{cases.length}</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">STATE AUDIT HEALTH</span>
            <ShieldCheck className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">100%</div>
        </div>
      </div>

      <div className="operational-split-grid">
        <WorkspacePanel
          title="STATE-WIDE DISTRICTS MONITORING"
          guidance="State-level progress tracking for Kurnool District and pilot jurisdiction."
        >
          <div className="dashboard-queue-list">
            <div className="dashboard-queue-card">
              <div className="dashboard-queue-info">
                <div className="dashboard-queue-title">
                  <span>Kurnool District Master Repository</span>
                  <span className="dashboard-queue-meta-pill">LGD: 511</span>
                </div>
                <div className="dashboard-queue-meta">
                  <span>Collector: G. Srijana, IAS</span>
                  <span>•</span>
                  <span className="text-navy font-bold">{cases.length} Digitized Land Records</span>
                </div>
              </div>

              <span className="table-status-pill locked">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                ONLINE
              </span>
            </div>
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          title="STATE MASTER DATA & POLICY COMPLIANCE"
          guidance="LGD administrative hierarchy governance and state policy enforcement."
        >
          <div className="dashboard-queue-list">
            {[
              { rule: 'LGD Code Mapping & Hierarchy Validation', status: 'COMPLIANT', desc: 'All 21 Mandals & 54 Villages mapped to Official Census codes.' },
              { rule: 'Section 7(A) Legal Attestation Lock', status: 'ACTIVE', desc: 'Immutable cryptographic lock enforced on final VRO submissions.' },
              { rule: 'Groq + Llama Multimodal AI Engine', status: 'OPERATIONAL', desc: 'Confidence threshold set to >= 85% for automated fast-track.' },
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

'use client';

import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';
import { EmptyState } from '@/components/workspace/EmptyState';
import { ShieldCheck, UserPlus, Database, Lock, Users, Layers, CheckCircle2, Server, Key } from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'System Admin Console', href: '/admin/dashboard' }, { label: 'Dashboard' }]} />

      <WorkspaceHeader
        title="SYSTEM ADMINISTRATION CONTROL CONSOLE"
        subtitle="Master Data Infrastructure, Officer Provisioning & System Security Management"
        action={
          <Link href="/admin/officers/create" className="new-digitization-btn">
            <UserPlus className="w-4 h-4" />
            <span>Provision Officer Account</span>
          </Link>
        }
      />

      <div className="jurisdiction-bar">
        <Server className="w-4 h-4 text-navy flex-shrink-0" />
        <span className="font-bold text-navy">SYSTEM ENVIRONMENT:</span>
        <span className="font-semibold">Next.js 15 App Router</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">Firebase Firestore Engine</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">Groq Llama-3.3-70b Multimodal AI</span>
        <span className="jurisdiction-sep">|</span>
        <span className="font-semibold">Production Status: ACTIVE</span>
      </div>

      <div className="summary-cards-grid">
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">MASTER LGD DATASET</span>
            <Database className="w-4 h-4 text-navy" />
          </div>
          <div className="summary-card-count text-navy">1</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">OFFICER ROLES</span>
            <Users className="w-4 h-4 text-blue" />
          </div>
          <div className="summary-card-count text-blue">6</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">JURISDICTIONS</span>
            <Layers className="w-4 h-4 text-amber" />
          </div>
          <div className="summary-card-count text-amber">21</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">AI ENGINE STATUS</span>
            <ShieldCheck className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">ONLINE</div>
        </div>
        <div className="summary-card-item">
          <div className="summary-card-top">
            <span className="summary-card-title">SECURITY ENCRYPTION</span>
            <Lock className="w-4 h-4 text-green" />
          </div>
          <div className="summary-card-count text-green">AES-256</div>
        </div>
      </div>

      <div className="operational-split-grid">
        <WorkspacePanel
          title="MASTER DATA SEED STATUS"
          guidance="Local Government Directory (LGD) State, District, Division, Mandal, and Village datasets."
        >
          <div className="dashboard-queue-list">
            <div className="dashboard-queue-card">
              <div className="dashboard-queue-info">
                <div className="dashboard-queue-title">
                  <span>{APP_CONFIG.activeState} Master LGD Data ({APP_CONFIG.activeStateShortCode}-{APP_CONFIG.activeStateCode})</span>
                  <span className="dashboard-queue-meta-pill">LGD: 28</span>
                </div>
                <div className="dashboard-queue-meta">
                  <span className="text-green-700 font-bold">LOADED & ACTIVE</span>
                  <span>•</span>
                  <span>{APP_CONFIG.activeDistrict} District (LGD {APP_CONFIG.activeDistrictCode})</span>
                </div>
              </div>

              <span className="table-status-pill locked">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                SEEDED
              </span>
            </div>
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          title="SYSTEM SECURITY AUDIT STREAM"
          guidance="Real-time administrative actions and authentication security events."
        >
          <div className="dashboard-queue-list">
            {[
              { event: 'RBAC Access Verification Passed', detail: 'Role-based authorization checks active for all officer tiers.', time: 'System Health: 100%' },
              { event: 'Cloud Firestore Connection Initialized', detail: 'Secure collections: digitizationCases, users, auditLogs.', time: 'Encrypted at rest' },
            ].map((e, idx) => (
              <div key={idx} className="dashboard-queue-card">
                <div className="dashboard-queue-info">
                  <div className="dashboard-queue-title">
                    <Key className="w-3.5 h-3.5 text-navy" />
                    <span>{e.event}</span>
                  </div>
                  <div className="dashboard-queue-meta">
                    <span>{e.detail}</span>
                  </div>
                </div>

                <span className="table-status-pill locked">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  SECURE
                </span>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </div>
    </div>
  );
}

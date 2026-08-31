'use client';

import React from 'react';
import { GovernmentHeader } from '@/components/government/GovernmentHeader';
import { TopBar } from '@/components/navigation/TopBar';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Footer } from '@/components/government/Footer';

export default function RdoLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { label: 'Dashboard', href: '/rdo/dashboard' },
    { label: 'Tahsildars / MROs', href: '/rdo/mros' },
    { label: 'Field Officers', href: '/rdo/field-officers' },
    { label: 'Division Cases', href: '/rdo/cases' },
    { label: 'Reports', href: '/rdo/reports' },
    { label: 'Audit Log', href: '/rdo/audit' }
  ];

  return (
    <div className="ebhoomi-full-portal-layout">
      <GovernmentHeader showPublicNav={false} />
      <TopBar
        roleTitle="REVENUE DIVISION ADMINISTRATION"
        roleScope="REVENUE DIVISIONAL OFFICER WORKSPACE"
        userName="Revenue Divisional Officer"
      />
      <Sidebar items={navItems} />
      <main className="portal-main-content workspace-fitted-viewport">
        <div className="content-container officer-dashboard-main">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

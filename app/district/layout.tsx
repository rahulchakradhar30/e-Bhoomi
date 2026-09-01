
import React from 'react';
import { GovernmentHeader } from '@/components/government/GovernmentHeader';
import { TopBar } from '@/components/navigation/TopBar';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Footer } from '@/components/government/Footer';

export default function DistrictLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { label: 'Dashboard', href: '/district/dashboard' },
    { label: 'MRO / Tahsildars', href: '/district/mros' },
    { label: 'Field Officers', href: '/district/field-officers' },
    { label: 'District Records', href: '/district/records' },
    { label: 'Reports', href: '/district/reports' },
    { label: 'Audit Log', href: '/district/audit' }
  ];

  return (
    <div className="ebhoomi-full-portal-layout">
      <GovernmentHeader showPublicNav={false} />
      <TopBar
        roleTitle="DISTRICT LAND RECORD ADMINISTRATION"
        roleScope="DISTRICT COLLECTOR / DEPUTY COMMISSIONER WORKSPACE"
        userName="District Collector & District Magistrate"
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

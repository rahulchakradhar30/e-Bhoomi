
import React from 'react';
import { GovernmentHeader } from '@/components/government/GovernmentHeader';
import { TopBar } from '@/components/navigation/TopBar';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Footer } from '@/components/government/Footer';

export default function StateLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { label: 'Dashboard', href: '/state/dashboard' },
    { label: 'Districts', href: '/state/districts' },
    { label: 'Revenue Divisions', href: '/state/rdo' },
    { label: 'MRO / Tahsildars', href: '/state/mros' },
    { label: 'Field Officers', href: '/state/field-officers' },
    { label: 'Administrative Data', href: '/state/administrative-data' },
    { label: 'Notifications', href: '/state/notifications' },
    { label: 'Reports', href: '/state/reports' },
    { label: 'Audit Log', href: '/state/audit' },
    { label: 'Settings', href: '/state/settings' }
  ];

  return (
    <div className="ebhoomi-full-portal-layout">
      <GovernmentHeader showPublicNav={false} />
      <TopBar
        roleTitle="STATE LAND RECORD ADMINISTRATION"
        roleScope="STATE LAND RECORDS AUTHORITY WORKSPACE"
        userName="State Land Records Commissioner"
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

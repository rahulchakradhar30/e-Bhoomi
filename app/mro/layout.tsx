
import React from 'react';
import { GovernmentHeader } from '@/components/government/GovernmentHeader';
import { TopBar } from '@/components/navigation/TopBar';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Footer } from '@/components/government/Footer';

export default function MroLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { label: 'Dashboard', href: '/mro/dashboard' },
    { label: 'Field Officers', href: '/mro/field-officers' },
    { label: 'Villages', href: '/mro/villages' },
    { label: 'Pending Approvals', href: '/mro/approvals' },
    { label: 'Corrections', href: '/mro/corrections' },
    { label: 'Field Verification', href: '/mro/field-verification' },
    { label: 'Reports', href: '/mro/reports' },
    { label: 'Audit Log', href: '/mro/audit' }
  ];

  return (
    <div className="ebhoomi-full-portal-layout">
      <GovernmentHeader showPublicNav={false} />
      <TopBar
        roleTitle="MANDAL REVENUE ADMINISTRATION"
        roleScope="TAHSILDAR / MANDAL REVENUE OFFICER WORKSPACE"
        userName="Mandal Revenue Officer"
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

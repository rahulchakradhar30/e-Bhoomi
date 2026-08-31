'use client';

import React from 'react';
import { GovernmentHeader } from '@/components/government/GovernmentHeader';
import { TopBar } from '@/components/navigation/TopBar';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Footer } from '@/components/government/Footer';

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { label: 'Dashboard', href: '/officer/dashboard' },
    { label: 'New Digitization', href: '/officer/digitization/new' },
    { label: 'AI Review Queue', href: '/officer/digitization/review' },
    { label: 'My Records', href: '/officer/records' },
    { label: 'Pending Review', href: '/officer/review' },
    { label: 'Field Verification', href: '/officer/field-verification' },
    { label: 'Corrections', href: '/officer/corrections' },
    { label: 'Submitted Records', href: '/officer/submitted' }
  ];

  return (
    <div className="ebhoomi-full-portal-layout">
      <GovernmentHeader showPublicNav={false} />
      <TopBar
        roleTitle="FIELD / VILLAGE REVENUE PORTAL"
        roleScope="VILLAGE REVENUE OFFICER WORKSPACE"
        userName="Village Revenue Officer"
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

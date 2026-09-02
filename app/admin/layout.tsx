"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { GovernmentHeader } from '@/components/government/GovernmentHeader';
import { TopBar } from '@/components/navigation/TopBar';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Footer } from '@/components/government/Footer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page uses its own full-page layout — skip admin chrome entirely
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Master Data', href: '/admin/master-data' },
    { label: 'Officer Directory', href: '/admin/officers' },
    { label: 'Provision Officer', href: '/admin/officers/create' },
    { label: 'Transfer Officer', href: '/admin/officers/transfer' },
    { label: 'Jurisdictions', href: '/admin/jurisdictions' },
    { label: 'Roles & Permissions', href: '/admin/roles' },
    { label: 'Notifications', href: '/admin/notifications' },
    { label: 'Audit Trail', href: '/admin/audit' },
    { label: 'Security', href: '/admin/security' },
    { label: 'Settings', href: '/admin/settings' }
  ];

  return (
    <div className="ebhoomi-full-portal-layout">
      <GovernmentHeader showPublicNav={false} />
      <TopBar
        roleTitle="SYSTEM ADMINISTRATION"
        roleScope="HIGH-SECURITY SYSTEM CONSOLE"
        userName="System Administrator"
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

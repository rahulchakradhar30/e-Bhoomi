'use client';

import React from 'react';
import Link from 'next/link';
import { GovernmentHeader } from '@/components/government/GovernmentHeader';
import { Footer } from '@/components/government/Footer';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="ebhoomi-full-portal-layout">
      <GovernmentHeader showPublicNav={true} />
      <main className="portal-main-content flex-align-center" style={{ justifyContent: 'center', padding: '4rem 1.5rem' }}>
        <div className="table-empty-state" style={{ maxWidth: '520px', backgroundColor: '#FFFFFF', padding: '3rem 2rem' }}>
          <ShieldAlert className="w-14 h-14 text-navy margin-bottom-sm" />
          <h1 className="empty-inbox-title" style={{ fontSize: '1.5rem' }}>404 — ROUTE NOT FOUND</h1>
          <p className="empty-inbox-desc margin-bottom-md">
            The requested administrative resource, page, or jurisdiction workspace URL does not exist or has been relocated.
          </p>
          <Link href="/" className="gov-nav-btn login-btn">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to e-Bhoomi Home</span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
